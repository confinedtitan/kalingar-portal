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
        2: Member/plot ID hint (ignored)
        3: Tax units (float)
        4: City / address
        5: Opening balance (ignored — may be formula)
        6: Tax debit (ignored — may be formula)
        7: Amount paid (tax credit)
        8: Balance due (ignored — auto-calculated by model)
        9: Phone number (integer with 91 prefix)

    Returns a dict with keys: name, name_ta, phone, city, annual_tax, amount_paid
    or None if the row should be skipped.
    """
    # Ensure we have enough columns
    if len(row) < 10:
        # Pad with None so index access doesn't fail
        row = list(row) + [None] * (10 - len(row))

    name = row[1]
    if not name or (isinstance(name, str) and not name.strip()):
        return None

    name = str(name).strip()

    # Tax units → annual_tax
    tax_units = _safe_numeric(row[3], default=0)
    annual_tax = round(tax_units * 1500)

    city = str(row[4]).strip() if row[4] else ''
    amount_paid = _safe_numeric(row[7], default=0)
    phone = normalize_phone(row[9])

    return {
        'name': name,
        'name_ta': name,       # Excel data is Tamil — store in both fields
        'phone': phone,
        'city': city,
        'annual_tax': annual_tax,
        'amount_paid': Decimal(str(amount_paid)),
    }


def create_member_from_dict(data):
    """
    Create a Django User + Member from a parsed dict.

    Returns (member, created, reason):
        - (member, True, None)  on success
        - (None, False, reason) when skipped or errored
    """
    phone = data.get('phone')
    name = data.get('name', '')

    if not phone:
        return (None, False, f"No valid phone number for '{name}'")

    # Check for existing member with this phone
    if Member.objects.filter(phone=phone).exists():
        return (None, False, f"Phone {phone} already exists, skipping '{name}'")

    try:
        with transaction.atomic():
            member = Member(
                user=None,
                name=name,
                name_ta=data.get('name_ta', ''),
                phone=phone,
                # Required fields that aren't in the Excel — use sensible defaults
                date_of_birth='2000-01-01',
                address=data.get('city', ''),
                address_ta=data.get('city', ''),  # store city in Tamil address too
                father_name='',
                annual_tax=Decimal(str(data.get('annual_tax', 0))),
                amount_paid=data.get('amount_paid', Decimal('0')),
                password_reset_required=True,
                is_family_head=True,
                is_active=True,
                is_expired=False,
            )
            member.save()  # triggers auto-ID (KT-XXXX) and amount_due calc, and provision_credentials!
        return (member, True, None)
    except Exception as exc:
        return (None, False, str(exc))


def process_excel_workbook(wb):
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

        # Skip if no phone
        if not phone:
            errors.append({
                'row': idx + 1,  # 1-based Excel row
                'name': name,
                'reason': 'No valid phone number',
            })
            skipped += 1
            continue

        # Deduplicate within the same file
        if phone in seen_phones:
            errors.append({
                'row': idx + 1,
                'name': name,
                'reason': f'Duplicate phone {phone} in this file',
            })
            skipped += 1
            continue
        seen_phones.add(phone)

        member, was_created, reason = create_member_from_dict(parsed)
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

