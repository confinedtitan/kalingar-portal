"""
Shared utilities for bulk Excel member import.

Used by both the management command (import_members_excel) and the
API endpoint (MemberViewSet.import_excel).
"""

import logging
from decimal import Decimal, InvalidOperation

from django.contrib.auth.models import User
from django.db import transaction

from .models import Member

logger = logging.getLogger(__name__)


def _safe_numeric(value, default=0):
    """
    Return a numeric value from a cell that might contain an Excel formula
    string, None, or a valid number.
    """
    if value is None:
        return default
    if isinstance(value, str):
        # Excel formula strings like "=F7+G7-H7" — treat as 0
        value = value.strip()
        if value.startswith('=') or not value:
            return default
        try:
            return float(value)
        except ValueError:
            return default
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def normalize_phone(raw_phone):
    """
    Normalize a phone value from Excel (integer like 919841344883) to a
    10-digit string.  Returns None if the value is unusable.
    """
    if raw_phone is None:
        return None
    try:
        phone_str = str(int(raw_phone))
    except (ValueError, TypeError):
        phone_str = str(raw_phone).strip()

    if not phone_str:
        return None

    # Strip leading 91 prefix (country code)
    if phone_str.startswith('+91'):
        phone_str = phone_str[3:]
    elif phone_str.startswith('91') and len(phone_str) == 12:
        phone_str = phone_str[2:]

    # Fallback: just take the last 10 digits
    phone_str = phone_str[-10:]

    if not phone_str.isdigit() or len(phone_str) != 10:
        return None

    return phone_str


def parse_member_row(row):
    """
    Parse a single openpyxl row (tuple of cell values, values_only=True)
    from the Tamil Excel format into a clean dict.

    Expected column layout (0-indexed):
        0: Serial number (ignored)
        1: Member name
        2: Reference ID (Column 3)
        3: Tax Count (Column 4)
        4: City / Town (Column 5)
        5: Old Balance (Column 6)
        6: Debit Amount (Column 7)
        7: Credit Amount (Column 8)
        8: Ignored / Balance due hint
        9: Phone number (Column 10, integer with 91 prefix)

    Returns a dict with parsed values or None if the row should be skipped.
    """
    # Ensure we have enough columns
    if len(row) < 10:
        row = list(row) + [None] * (10 - len(row))

    name = row[1]
    if not name or (isinstance(name, str) and not name.strip()):
        return None

    name = str(name).strip()

    # Column 3: Reference ID
    reference_id = str(row[2]).strip() if row[2] is not None else ''

    # Column 4: tax_count (float)
    tax_count = _safe_numeric(row[3], default=1.0)

    # Column 5: City
    city = str(row[4]).strip() if row[4] else ''

    # Column 6: old_balance (decimal, default 0.00 if empty)
    old_balance = _safe_numeric(row[5], default=0.00)

    # Column 7: debit_amount (to become debit transaction)
    debit_amount = _safe_numeric(row[6], default=0.00)

    # Column 8: credit_amount (to become credit transaction)
    credit_amount = _safe_numeric(row[7], default=0.00)

    # Column 10: phone (index 9)
    phone = normalize_phone(row[9])

    return {
        'name': name,
        'name_ta': name,       # Excel data is Tamil — store in both fields
        'phone': phone,
        'reference_id': reference_id,
        'tax_count': tax_count,
        'address_city': city,
        'address_city_ta': city,
        'old_balance': Decimal(str(old_balance)),
        'debit_amount': Decimal(str(debit_amount)),
        'credit_amount': Decimal(str(credit_amount)),
    }


def create_member_from_dict(data, user=None):
    """
    Create a Django User + Member from a parsed dict.
    Also creates debit/credit transactions if amounts are specified.

    Returns (member, created, reason):
        - (member, True, None)  on success
        - (None, False, reason) when skipped or errored
    """
    from decimal import Decimal
    from accounting.models import AccountHead, AccountTransaction
    from django.utils import timezone

    phone = data.get('phone')
    name = data.get('name', '')

    # Check for existing member with this phone if phone is provided
    if phone and Member.objects.filter(phone=phone).exists():
        return (None, False, f"Phone {phone} already exists, skipping '{name}'")

    # Resolve or create fallback user
    if not user:
        user = User.objects.filter(is_superuser=True).first() or User.objects.filter(is_staff=True).first() or User.objects.first()
    if not user:
        user, _ = User.objects.get_or_create(username='system', defaults={'is_staff': True, 'is_superuser': True})

    try:
        with transaction.atomic():
            # Create member
            member = Member(
                user=None,
                name=name,
                name_ta=data.get('name_ta', ''),
                phone=phone or None,
                reference_id=data.get('reference_id', ''),
                tax_count=data.get('tax_count', 1.0),
                address_city=data.get('address_city', ''),
                address_city_ta=data.get('address_city_ta', ''),
                old_balance=data.get('old_balance', Decimal('0.00')),
                # Required fields that aren't in the Excel — use sensible defaults
                date_of_birth='2000-01-01',
                address=data.get('address_city', ''),
                address_ta=data.get('address_city_ta', ''),
                father_name='',
                annual_tax=Decimal('0.00'),  # will be recalculated by rollup
                amount_paid=Decimal('0.00'),  # will be recalculated by rollup
                password_reset_required=True,
                is_family_head=True,
                is_active=True,
                is_expired=False,
            )
            member.save()  # triggers auto-ID (KT-XXXX) and amount_due calc

            # Resolve the "Kodai Vari" account head
            account_head, _ = AccountHead.objects.get_or_create(
                name='Kodai Vari',
                defaults={
                    'name_ta': 'கொடை வரி',
                    'head_type': 'Kodai',
                    'is_active': True,
                    'account_type': 'Revenue',
                }
            )

            # Add Debit transaction if amount > 0
            debit_amt = data.get('debit_amount', Decimal('0.00'))
            if debit_amt > 0:
                AccountTransaction.objects.create(
                    account_head=account_head,
                    transaction_type='DEBIT',
                    amount=debit_amt,
                    transaction_date=timezone.now().date(),
                    payment_mode='Credit',
                    member=member,
                    donor_name=member.name,
                    donor_name_ta=member.name_ta,
                    donor_contact=member.phone or '',
                    purpose="Kodai Vari Debit (Excel Import)",
                    entered_by=user
                )

            # Add Credit transaction if amount > 0
            credit_amt = data.get('credit_amount', Decimal('0.00'))
            if credit_amt > 0:
                AccountTransaction.objects.create(
                    account_head=account_head,
                    transaction_type='CREDIT',
                    amount=credit_amt,
                    transaction_date=timezone.now().date(),
                    payment_mode='Cash',
                    member=member,
                    donor_name=member.name,
                    donor_name_ta=member.name_ta,
                    donor_contact=member.phone or '',
                    purpose="Kodai Vari Credit (Excel Import)",
                    entered_by=user
                )

            # Refresh and resave to run final rollups & ensure amount_due is perfectly computed
            member.refresh_from_db()
            member.save()

        return (member, True, None)
    except Exception as exc:
        return (None, False, str(exc))


def process_excel_workbook(wb, user=None):
    """
    Process an openpyxl Workbook and return import results.

    Returns a dict:
        {
            "created": int,
            "skipped": int,
            "errors": [{"row": int, "name": str, "reason": str}, ...]
        }
    """
    ws = wb.active
    created = 0
    skipped = 0
    errors = []
    seen_phones = set()

    for idx, row in enumerate(ws.iter_rows(values_only=True)):
        # Data starts at Excel row 7 → 0-based index 6
        if idx < 6:
            continue

        parsed = parse_member_row(row)
        if parsed is None:
            # Blank or header row — skip silently
            continue

        name = parsed.get('name', '')
        phone = parsed.get('phone')

        if phone:
            # Deduplicate phone within the same file
            if phone in seen_phones:
                errors.append({
                    'row': idx + 1,
                    'name': name,
                    'reason': f'Duplicate phone {phone} in this file',
                })
                skipped += 1
                continue
            seen_phones.add(phone)

        member, was_created, reason = create_member_from_dict(parsed, user=user)
        if was_created:
            created += 1
        else:
            skipped += 1
            errors.append({
                'row': idx + 1,
                'name': name,
                'reason': reason or 'Unknown',
            })

    return {
        'created': created,
        'skipped': skipped,
        'errors': errors,
    }


def get_member_and_descendants_tax(member):
    """
    Recursively sum the tax contributions of a member and their descendants
    who are not active family heads.
    """
    if member.is_family_head and member.is_active:
        return Decimal('0.0')
        
    tax = Decimal('0.0')
    if member.is_active:
        if member.gender == 'Male':
            if member.marital_status == 'Unmarried':
                tax += Decimal('0.5')
            else:
                tax += Decimal('1.0')
                
    for child in member.children_set.all():
        tax += get_member_and_descendants_tax(child)
        
    return tax


def calculate_member_tax_count(member):
    """
    Calculate the tax count multiplier for an active family head.
    Base is 1.0 for the head.
    Plus contributions from dependent unpromoted siblings and their offspring recursively.
    Plus contributions from their own unpromoted children and offspring recursively.
    """
    if not (member.is_family_head and member.is_active):
        return Decimal('0.0')
        
    tax_count = Decimal('1.0')
    
    # 1. Sibling dependencies
    if member.father:
        siblings = Member.objects.filter(father=member.father).exclude(id=member.id)
        for sibling in siblings:
            if sibling.is_family_head and sibling.is_active:
                continue
            tax_count += get_member_and_descendants_tax(sibling)
            
    # 2. Family head's own children/grandchildren
    for child in member.children_set.all():
        tax_count += get_member_and_descendants_tax(child)
        
    return tax_count


def provision_credentials(member):
    """
    Generate login credentials for a member promoted to family head.
    Username is member_id.
    """
    if member.is_family_head and not member.user:
        username = member.member_id
        if not username:
            # Save first to get member_id if missing
            member.save()
            username = member.member_id
            
        if not username:
            return None
            
        # Deduplicate username
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}_{counter}"
            counter += 1
            
        default_password = member.phone if member.phone else username
        user = User.objects.create_user(username=username, password=default_password)
        
        # Direct DB update to avoid save signals recursion
        Member.objects.filter(pk=member.pk).update(user=user, password_reset_required=True)
        member.user = user
        member.password_reset_required = True
        return user


def revoke_credentials(member):
    """
    Safely delete the login user of a demoted family head.
    """
    if member.user:
        user = member.user
        Member.objects.filter(pk=member.pk).update(user=None)
        member.user = None
        user.delete()


def trigger_succession(expired_member):
    """
    Automated succession workflow on expiration of a family head.
    Locates active children, sorts chronologically (seniority), and promotes
    the elder son (or oldest active child if no male child is found).
    """
    children = Member.objects.filter(father=expired_member, is_active=True).order_by('date_of_birth')
    
    # Seniority: Elder Son (Male)
    elder_son = children.filter(gender='Male').first()
    if not elder_son:
        elder_son = children.first()
        
    if elder_son:
        elder_son.is_family_head = True
        elder_son.save()


def getCurrentTaxYearRange(date):
    """
    Given a date or datetime object, returns (start_date, end_date) as datetime.date objects.
    Tax year starts on August 1st and ends on July 31st of the following calendar year.
    """
    import datetime
    if isinstance(date, datetime.datetime):
        date = date.date()
    elif isinstance(date, str):
        from django.utils.dateparse import parse_date
        parsed = parse_date(date)
        if parsed:
            date = parsed
        else:
            raise ValueError(f"Invalid date string: {date}")

    if date.month >= 8:
        start_date = datetime.date(date.year, 8, 1)
        end_date = datetime.date(date.year + 1, 7, 31)
    else:
        start_date = datetime.date(date.year - 1, 8, 1)
        end_date = datetime.date(date.year, 7, 31)
    return start_date, end_date


