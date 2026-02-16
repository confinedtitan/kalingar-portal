import re
from email_validator import validate_email as email_validate, EmailNotValidError

def validate_email(email):
    """Validate email format"""
    try:
        valid = email_validate(email)
        return True, valid.email
    except EmailNotValidError:
        return False, "Invalid email format"

def validate_phone(phone):
    """Validate phone number format"""
    # Remove any spaces or special characters
    clean_phone = re.sub(r'[^0-9]', '', phone)

    # Check if it's a valid Indian mobile number (10 digits)
    if len(clean_phone) == 10 and clean_phone.isdigit():
        return True, clean_phone
    elif len(clean_phone) == 11 and clean_phone.startswith('0'):
        return True, clean_phone[1:]  # Remove leading 0
    elif len(clean_phone) == 13 and clean_phone.startswith('91'):
        return True, clean_phone[2:]  # Remove country code
    else:
        return False, "Invalid phone number format"

def validate_member_data(data):
    """Validate member data"""
    errors = []

    # Required fields
    required_fields = ['memberId', 'name', 'fatherName', 'mobile', 'email', 'address', 'gender']
    for field in required_fields:
        if not data.get(field) or not str(data.get(field)).strip():
            errors.append(f'{field} is required')

    # Email validation
    if data.get('email'):
        is_valid, message = validate_email(data['email'])
        if not is_valid:
            errors.append(message)

    # Phone validation
    if data.get('mobile'):
        is_valid, message = validate_phone(data['mobile'])
        if not is_valid:
            errors.append(f"Mobile: {message}")

    # Gender validation
    if data.get('gender') and data['gender'] not in ['Male', 'Female']:
        errors.append('Gender must be either Male or Female')

    # Head of family validation
    if data.get('headOfFamily') and data['headOfFamily'] not in ['Yes', 'No']:
        errors.append('Head of family must be either Yes or No')

    return len(errors) == 0, errors

def validate_bank_account_data(data):
    """Validate bank account data"""
    errors = []

    # Required fields
    required_fields = ['accountNo', 'accountName', 'ifscCode', 'bankName', 
                      'branchName', 'branchAddress', 'contactNo']
    for field in required_fields:
        if not data.get(field) or not str(data.get(field)).strip():
            errors.append(f'{field} is required')

    # IFSC code validation (11 characters, alphanumeric)
    if data.get('ifscCode'):
        ifsc = data['ifscCode'].strip()
        if not re.match(r'^[A-Z]{4}0[A-Z0-9]{6}$', ifsc):
            errors.append('Invalid IFSC code format')

    # Account number validation (numeric, 9-18 digits)
    if data.get('accountNo'):
        acc_no = re.sub(r'[^0-9]', '', data['accountNo'])
        if not (9 <= len(acc_no) <= 18):
            errors.append('Account number must be 9-18 digits')

    # Status validation
    if data.get('status') and data['status'] not in ['Active', 'Inactive', 'Pending']:
        errors.append('Status must be Active, Inactive, or Pending')

    return len(errors) == 0, errors