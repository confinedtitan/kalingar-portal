import datetime
from decimal import Decimal
import openpyxl
from django.test import TestCase
from django.contrib.auth.models import User
from members.models import Member
from members.utils import process_excel_workbook
from accounting.models import AccountTransaction, AccountHead

class ExcelImportEngineTestCase(TestCase):
    def setUp(self):
        # Create an admin user for running/tracking imports
        self.user = User.objects.create_user(username='admin_importer', password='password123', is_staff=True)

    def test_excel_import_mapping_and_optional_phone(self):
        # Create an in-memory workbook
        wb = openpyxl.Workbook()
        ws = wb.active
        
        # Rows 1-5: Bypassed metadata / headers
        ws.append(["Kalingar Trust Portal - Members Export"])
        ws.append([])
        ws.append(["Report Date:", "2026-07-19"])
        ws.append([])
        ws.append([])
        
        # Row 6: Table headers (Bypassed but identifies structural layout)
        ws.append([
            "வ.எண்",                 # 0: Serial number
            "உறுப்பினர் பெயர்",        # 1: Member name
            "வரிசை எண்/அடையாள எண்",  # 2: Reference ID (Column 3)
            "வரி அலகுகள்",           # 3: Tax Count (Column 4)
            "நகரம்",                # 4: City / Town (Column 5)
            "கடந்த ஆண்டு இருப்பு",    # 5: Old Balance (Column 6)
            "பற்று",                 # 6: Debit Amount (Column 7)
            "வரவு",                 # 7: Credit Amount (Column 8)
            "நிலுவை",               # 8: Balance due hint
            "கைபேசி எண்"             # 9: Phone number (Column 10)
        ])
        
        # Row 7: Member 1 - Complete information with phone number
        ws.append([
            1,
            "முருகன்",              # Name (Tamil)
            "REF-001",             # Reference ID
            1.5,                   # Tax Count
            "மதுரை",               # City
            150.50,                # Old Balance
            3000.00,               # Debit
            1000.00,               # Credit
            2000.00,               # Balance due
            "919876543210"         # Phone
        ])

        # Row 8: Member 2 - Optional/missing phone number
        ws.append([
            2,
            "கணேசன்",              # Name (Tamil)
            "REF-002",             # Reference ID
            2.0,                   # Tax Count
            "சென்னை",              # City
            "",                    # Old Balance (Empty -> should default to 0.00)
            0.00,                  # Debit
            2000.00,               # Credit
            -2000.00,              # Balance due
            None                   # Phone (Missing -> should be optional and import successfully)
        ])

        # Run parser
        results = process_excel_workbook(wb, user=self.user)
        
        # Assertions on import results
        self.assertEqual(results['created'], 2)
        self.assertEqual(results['skipped'], 0)
        self.assertEqual(len(results['errors']), 0)

        # Retrieve imported Member 1
        m1 = Member.objects.get(reference_id="REF-001")
        self.assertEqual(m1.name, "முருகன்")
        self.assertEqual(m1.name_ta, "முருகன்")
        self.assertEqual(m1.phone, "9876543210")
        self.assertEqual(m1.tax_count, 1.5)
        self.assertEqual(m1.address_city, "மதுரை")
        self.assertEqual(m1.address_city_ta, "மதுரை")
        self.assertEqual(m1.old_balance, Decimal("150.50"))
        
        # Verify rollups on Member 1
        self.assertEqual(m1.annual_tax, Decimal("3000.00"))
        self.assertEqual(m1.amount_paid, Decimal("1000.00"))
        self.assertEqual(m1.amount_due, Decimal("2000.00"))

        # Verify transactions on Member 1
        m1_txs = AccountTransaction.objects.filter(member=m1)
        self.assertEqual(m1_txs.count(), 2)
        debit_tx = m1_txs.get(transaction_type='DEBIT')
        self.assertEqual(debit_tx.amount, Decimal("3000.00"))
        self.assertEqual(debit_tx.account_head.name, "Kodai Vari")
        self.assertEqual(debit_tx.entered_by, self.user)
        
        credit_tx = m1_txs.get(transaction_type='CREDIT')
        self.assertEqual(credit_tx.amount, Decimal("1000.00"))
        self.assertEqual(credit_tx.account_head.name, "Kodai Vari")
        self.assertEqual(credit_tx.entered_by, self.user)

        # Retrieve imported Member 2
        m2 = Member.objects.get(reference_id="REF-002")
        self.assertEqual(m2.name, "கணேசன்")
        self.assertEqual(m2.phone, None)  # Phone number was missing
        self.assertEqual(m2.tax_count, 2.0)
        self.assertEqual(m2.address_city, "சென்னை")
        self.assertEqual(m2.old_balance, Decimal("0.00"))  # Defaulted from empty
        
        # Verify rollups on Member 2
        self.assertEqual(m2.annual_tax, Decimal("0.00"))
        self.assertEqual(m2.amount_paid, Decimal("2000.00"))
        self.assertEqual(m2.amount_due, Decimal("-2000.00"))

        # Verify transactions on Member 2 (only Credit should be created since debit was 0)
        m2_txs = AccountTransaction.objects.filter(member=m2)
        self.assertEqual(m2_txs.count(), 1)
        credit_tx_m2 = m2_txs.get(transaction_type='CREDIT')
        self.assertEqual(credit_tx_m2.amount, Decimal("2000.00"))
        self.assertEqual(credit_tx_m2.account_head.name, "Kodai Vari")
        self.assertEqual(credit_tx_m2.entered_by, self.user)
