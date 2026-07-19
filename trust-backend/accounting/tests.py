import datetime
from decimal import Decimal
from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from members.models import Member
from accounting.models import AccountTransaction, AccountHead
from members.utils import getCurrentTaxYearRange

class FinancialRollupEngineTestCase(TestCase):
    def setUp(self):
        # Create a user for transaction entered_by field
        self.user = User.objects.create_user(username='testaccountant', password='password123')
        
        # Create an active AccountHead
        self.account_head = AccountHead.objects.create(
            name="General Kovil Fund",
            account_type="Revenue",
            is_active=True,
            created_by=self.user
        )
        
        # Create a member (defaults: annual_tax=20000.00, amount_paid=0.00)
        self.member = Member.objects.create(
            name="Murugan Swamy",
            name_ta="முருகன் சுவாமி",
            phone="9876543210",
            address="123 Temple St",
            annual_tax=Decimal("0.00"),
            amount_paid=Decimal("0.00"),
            is_family_head=True
        )

    def test_getCurrentTaxYearRange(self):
        # Test boundary dates to verify fiscal year start on August 1st and end on July 31st
        
        # Date: 2026-07-31 -> Fiscal Year: 2025-08-01 to 2026-07-31
        start, end = getCurrentTaxYearRange(datetime.date(2026, 7, 31))
        self.assertEqual(start, datetime.date(2025, 8, 1))
        self.assertEqual(end, datetime.date(2026, 7, 31))

        # Date: 2026-08-01 -> Fiscal Year: 2026-08-01 to 2027-07-31
        start, end = getCurrentTaxYearRange(datetime.date(2026, 8, 1))
        self.assertEqual(start, datetime.date(2026, 8, 1))
        self.assertEqual(end, datetime.date(2027, 7, 31))

        # Date: 2026-12-25 -> Fiscal Year: 2026-08-01 to 2027-07-31
        start, end = getCurrentTaxYearRange(datetime.date(2026, 12, 25))
        self.assertEqual(start, datetime.date(2026, 8, 1))
        self.assertEqual(end, datetime.date(2027, 7, 31))

        # Date: 2027-01-10 -> Fiscal Year: 2026-08-01 to 2027-07-31
        start, end = getCurrentTaxYearRange(datetime.date(2027, 1, 10))
        self.assertEqual(start, datetime.date(2026, 8, 1))
        self.assertEqual(end, datetime.date(2027, 7, 31))

    def test_debit_credit_rollup_on_create(self):
        # Create a DEBIT transaction of 5000 inside the 2025-08-01 to 2026-07-31 tax year
        tx_date = datetime.date(2025, 9, 15)
        debit_tx = AccountTransaction.objects.create(
            account_head=self.account_head,
            transaction_type='DEBIT',
            amount=Decimal("5000.00"),
            transaction_date=tx_date,
            payment_mode='Credit',
            member=self.member,
            entered_by=self.user
        )

        # Check if the Member's annual_tax updated immediately
        self.member.refresh_from_db()
        self.assertEqual(self.member.annual_tax, Decimal("5000.00"))
        self.assertEqual(self.member.amount_paid, Decimal("0.00"))
        self.assertEqual(self.member.amount_due, Decimal("5000.00"))

        # Create a CREDIT transaction of 3000 inside the same tax year
        credit_tx = AccountTransaction.objects.create(
            account_head=self.account_head,
            transaction_type='CREDIT',
            amount=Decimal("3000.00"),
            transaction_date=tx_date,
            payment_mode='Cash',
            member=self.member,
            entered_by=self.user
        )

        # Check if the Member's amount_paid and amount_due updated immediately
        self.member.refresh_from_db()
        self.assertEqual(self.member.annual_tax, Decimal("5000.00"))
        self.assertEqual(self.member.amount_paid, Decimal("3000.00"))
        self.assertEqual(self.member.amount_due, Decimal("2000.00"))

    def test_recalculation_on_edit_amount(self):
        tx_date = datetime.date(2025, 9, 15)
        
        # Create DEBIT transaction
        debit_tx = AccountTransaction.objects.create(
            account_head=self.account_head,
            transaction_type='DEBIT',
            amount=Decimal("5000.00"),
            transaction_date=tx_date,
            payment_mode='Credit',
            member=self.member,
            entered_by=self.user
        )

        # Verify initial state
        self.member.refresh_from_db()
        self.assertEqual(self.member.annual_tax, Decimal("5000.00"))

        # Edit transaction amount to 7500
        debit_tx.amount = Decimal("7500.00")
        debit_tx.save()

        # Check if member totals recalculated
        self.member.refresh_from_db()
        self.assertEqual(self.member.annual_tax, Decimal("7500.00"))

    def test_recalculation_on_edit_date_across_fiscal_boundary(self):
        # Transaction 1: July 31st, 2025 (Tax Year: 2024-08-01 to 2025-07-31)
        date_old_year = datetime.date(2025, 7, 31)
        
        tx_old = AccountTransaction.objects.create(
            account_head=self.account_head,
            transaction_type='DEBIT',
            amount=Decimal("4000.00"),
            transaction_date=date_old_year,
            payment_mode='Credit',
            member=self.member,
            entered_by=self.user
        )

        self.member.refresh_from_db()
        self.assertEqual(self.member.annual_tax, Decimal("4000.00"))

        # Transaction 2: August 1st, 2025 (Tax Year: 2025-08-01 to 2026-07-31)
        date_new_year = datetime.date(2025, 8, 1)
        
        tx_new = AccountTransaction.objects.create(
            account_head=self.account_head,
            transaction_type='DEBIT',
            amount=Decimal("6000.00"),
            transaction_date=date_new_year,
            payment_mode='Credit',
            member=self.member,
            entered_by=self.user
        )

        # Member totals should reflect the last saved transaction's tax year (Transaction 2 -> 6000.00)
        self.member.refresh_from_db()
        self.assertEqual(self.member.annual_tax, Decimal("6000.00"))

        # Edit tx_old (Transaction 1) to change date into the new fiscal year (2025-08-10) and amount to 3000
        tx_old.transaction_date = datetime.date(2025, 8, 10)
        tx_old.amount = Decimal("3000.00")
        tx_old.save()

        # Both the original tax year (2024-25) and new tax year (2025-26) should be clean.
        # Let's verify new year's rollup: 6000 (from tx_new) + 3000 (from edited tx_old) = 9000
        self.member.refresh_from_db()
        self.assertEqual(self.member.annual_tax, Decimal("9000.00"))

        # Let's force check the old tax year's remaining transactions (which should now be 0)
        # by manually querying or triggering recalculation for a date in the old year
        from accounting.utils import recalculate_member_financials
        recalculate_member_financials(self.member, date_old_year)
        self.member.refresh_from_db()
        self.assertEqual(self.member.annual_tax, Decimal("0.00"))

    def test_soft_delete_recalculation(self):
        tx_date = datetime.date(2025, 10, 5)
        
        tx1 = AccountTransaction.objects.create(
            account_head=self.account_head,
            transaction_type='DEBIT',
            amount=Decimal("3500.00"),
            transaction_date=tx_date,
            payment_mode='Credit',
            member=self.member,
            entered_by=self.user
        )
        tx2 = AccountTransaction.objects.create(
            account_head=self.account_head,
            transaction_type='DEBIT',
            amount=Decimal("1500.00"),
            transaction_date=tx_date,
            payment_mode='Credit',
            member=self.member,
            entered_by=self.user
        )

        self.member.refresh_from_db()
        self.assertEqual(self.member.annual_tax, Decimal("5000.00"))

        # Soft delete tx2
        tx2.is_deleted = True
        tx2.save()

        # Recalculated total should exclude soft deleted transaction: 5000 - 1500 = 3500
        self.member.refresh_from_db()
        self.assertEqual(self.member.annual_tax, Decimal("3500.00"))

    def test_hard_delete_recalculation(self):
        tx_date = datetime.date(2025, 11, 20)
        
        tx1 = AccountTransaction.objects.create(
            account_head=self.account_head,
            transaction_type='DEBIT',
            amount=Decimal("2000.00"),
            transaction_date=tx_date,
            payment_mode='Credit',
            member=self.member,
            entered_by=self.user
        )
        tx2 = AccountTransaction.objects.create(
            account_head=self.account_head,
            transaction_type='DEBIT',
            amount=Decimal("4000.00"),
            transaction_date=tx_date,
            payment_mode='Credit',
            member=self.member,
            entered_by=self.user
        )

        self.member.refresh_from_db()
        self.assertEqual(self.member.annual_tax, Decimal("6000.00"))

        # Hard delete tx2 (triggers post_delete signal)
        tx2.delete()

        # Recalculated total should exclude hard deleted transaction: 6000 - 4000 = 2000
        self.member.refresh_from_db()
        self.assertEqual(self.member.annual_tax, Decimal("2000.00"))

    def test_member_cash_credit_requires_custodian_trust_account(self):
        from accounting.serializers import AccountTransactionCreateSerializer
        from accounting.models import TrustAccount
        from rest_framework.exceptions import ValidationError

        data = {
            'account_head': self.account_head.id,
            'transaction_type': 'CREDIT',
            'amount': Decimal("1000.00"),
            'transaction_date': datetime.date(2025, 9, 15),
            'payment_mode': 'Cash',
            'member': self.member.id,
        }

        # 1. No trust account exists for the member -> should raise ValidationError
        serializer = AccountTransactionCreateSerializer(data=data)
        with self.assertRaises(ValidationError):
            serializer.is_valid(raise_exception=True)

        # 2. Create active custodian Cash Trust Account for the member
        trust_acc = TrustAccount.objects.create(
            account_name="Murugan Custodian Account",
            account_type="Cash",
            associated_entity_type="Member",
            member=self.member,
            status="Active",
            created_by=self.user
        )

        # 3. Try validating again -> should succeed and auto-populate trust_account
        serializer2 = AccountTransactionCreateSerializer(data=data)
        self.assertTrue(serializer2.is_valid())
        validated_data = serializer2.validated_data
        self.assertEqual(validated_data['trust_account'], trust_acc)

    def test_receipt_pdf_generation_html_and_fallback(self):
        from accounting.receipt_generator import generate_receipt_pdf
        from django.test import override_settings
        import tempfile
        import os

        # Create a transaction (automatically spawns a receipt in signals)
        tx = AccountTransaction.objects.create(
            account_head=self.account_head,
            transaction_type='CREDIT',
            amount=Decimal("2000.00"),
            transaction_date=datetime.date(2025, 9, 15),
            payment_mode='Credit',
            member=self.member,
            entered_by=self.user
        )

        # Verify receipt was auto-created
        self.assertTrue(hasattr(tx, 'receipt') and tx.receipt is not None)

        # 1. Test fallback to default HTML template (tax_receipt_template.html)
        pdf_bytes = generate_receipt_pdf(tx)
        self.assertTrue(pdf_bytes.startswith(b'%PDF'))

        # 2. Test with custom temporary HTML template
        with tempfile.NamedTemporaryFile(suffix='.html', delete=False, mode='w', encoding='utf-8') as tf:
            tf.write("""
            <html>
            <body>
                <h1>Custom Receipt</h1>
                <p>Number: {{ receipt_no }}</p>
                <p>Name: {{ name }}</p>
                <p>Amount: {{ amount }}</p>
                <img src="{{ custodian_signature }}" />
            </body>
            </html>
            """)
            temp_path = tf.name

        try:
            with override_settings(ACTIVE_RECEIPT_TEMPLATE=temp_path):
                pdf_bytes_custom = generate_receipt_pdf(tx)
                self.assertTrue(pdf_bytes_custom.startswith(b'%PDF'))

            # 3. Test validation safety / fallback to reportlab on bad template error
            with override_settings(ACTIVE_RECEIPT_TEMPLATE='/invalid/path/error.html'):
                # Since the path is invalid, it falls back to the default or reportlab
                pdf_bytes_fallback = generate_receipt_pdf(tx)
                self.assertTrue(pdf_bytes_fallback.startswith(b'%PDF'))
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    def test_system_settings_endpoint(self):
        from rest_framework.test import APIClient
        from django.urls import reverse
        from django.conf import settings
        import os

        # Grant accountant/staff access
        self.user.is_staff = True
        self.user.save()

        client = APIClient()
        client.force_authenticate(user=self.user)

        # 1. Test GET /accounting/settings/
        url = reverse('system-settings')
        response = client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertIn('active_receipt_template', response.data)
        self.assertIn('templates', response.data)
        self.assertIn('template_content', response.data)

        # 2. Test POST to update active template (but with non-existent template)
        response_bad = client.post(url, {'active_receipt_template': 'nonexistent.html'})
        self.assertEqual(response_bad.status_code, 404)

        # 3. Test POST to save template content
        response_save = client.post(url, {
            'action': 'save_template_content',
            'template_name': 'test_temp.html',
            'content': '<html><body>Test</body></html>'
        })
        self.assertEqual(response_save.status_code, 200)

        # 4. Test POST to update active template (now that it exists)
        response_ok = client.post(url, {'active_receipt_template': 'test_temp.html'})
        self.assertEqual(response_ok.status_code, 200)

        # Verify that it is loaded as the active template in settings
        response_after = client.get(url)
        self.assertEqual(response_after.data['active_receipt_template'], 'test_temp.html')
        self.assertEqual(response_after.data['template_content'], '<html><body>Test</body></html>')

        # Clean up created file and JSON config
        temp_file_path = os.path.join(settings.BASE_DIR, 'accounting', 'test_temp.html')
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        settings_file_path = os.path.join(settings.BASE_DIR, 'accounting', 'system_settings.json')
        if os.path.exists(settings_file_path):
            os.remove(settings_file_path)
