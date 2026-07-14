"""
Accounting models for the Kalingar Trust Portal.

Design decisions:
- StaffProfile: Lightweight model for non-member staff (e.g. Accountants).
  Keeps the Member table clean — only actual temple members live there.
- AccountTransaction uses SOFT DELETE (is_deleted flag). Financial records are
  NEVER hard-deleted so the audit trail is preserved and receipt numbers are
  never reused, even after soft-deletion.
- change_log (JSONField) stores an append-only list of edit history entries so
  previous values are never silently overwritten.
- No approval workflow — transactions count toward totals immediately.
  An optional approval step (is_approved, approved_by) could be added later
  without schema breakage.
"""

from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils import timezone


# ---------------------------------------------------------------------------
# StaffProfile — lightweight non-member user profile (e.g. Accountant)
# ---------------------------------------------------------------------------

class StaffProfile(models.Model):
    """
    A non-member staff user such as an Accountant.

    Separate from Member so the membership table is not polluted with
    non-member records.  Admin users (is_staff=True) do NOT need a
    StaffProfile — they are identified by the Django User flag.
    """

    ROLE_CHOICES = [
        ('ACCOUNTANT', 'Accountant'),
    ]

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='staff_profile',
    )
    name = models.CharField(max_length=200, verbose_name="Full Name")
    name_ta = models.CharField(max_length=200, blank=True, default='', verbose_name="Full Name (Tamil)")
    phone = models.CharField(max_length=15, unique=True, verbose_name="Phone Number")
    role = models.CharField(
        max_length=20, choices=ROLE_CHOICES, default='ACCOUNTANT',
    )
    is_active = models.BooleanField(default=True, verbose_name="Active")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Staff Profile"
        verbose_name_plural = "Staff Profiles"

    def __str__(self):
        return f"{self.name} ({self.get_role_display()})"


# ---------------------------------------------------------------------------
# AccountHead — categories for income / expense tracking
# ---------------------------------------------------------------------------

class AccountHead(models.Model):
    """
    A category (aka "account head") under which income/expenses are recorded.

    Examples: "Kovil Kodai 2026", "Monthly Maintenance", "General Fund".
    """

    TYPE_CHOICES = [
        ('Kodai', 'Kodai'),
        ('General', 'General'),
    ]

    name = models.CharField(max_length=300, verbose_name="Account Head Name")
    name_ta = models.CharField(max_length=300, blank=True, default='', verbose_name="Account Head Name (Tamil)")
    description = models.TextField(blank=True, default='')
    description_ta = models.TextField(blank=True, default='', verbose_name="Description (Tamil)")
    head_type = models.CharField(
        max_length=20, choices=TYPE_CHOICES, blank=True, default='',
        verbose_name="Type",
    )
    ACCOUNT_TYPE_CHOICES = [
        ('Asset', 'Asset'),
        ('Liability', 'Liability'),
        ('Equity', 'Equity'),
        ('Revenue', 'Revenue'),
        ('Expense', 'Expense'),
    ]
    account_type = models.CharField(
        max_length=20, choices=ACCOUNT_TYPE_CHOICES, default='Revenue',
        verbose_name="Account Type"
    )
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='created_account_heads',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Account Head"
        verbose_name_plural = "Account Heads"

    def __str__(self):
        return self.name


# ---------------------------------------------------------------------------
# TrustAccount — manages actual liquid assets or physical vaults
# ---------------------------------------------------------------------------

import uuid

class TrustAccount(models.Model):
    ACCOUNT_TYPE_CHOICES = [
        ('Cash', 'Cash'),
        ('Bank', 'Bank'),
        ('Commodities', 'Commodities'),
    ]
    ENTITY_TYPE_CHOICES = [
        ('Trust_Direct', 'Trust Direct'),
        ('Member', 'Member'),
        ('Member_Family', 'Member Family'),
    ]
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
    ]

    account_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    account_name = models.CharField(max_length=255, verbose_name="Account Name")
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPE_CHOICES, verbose_name="Account Type")
    associated_entity_type = models.CharField(max_length=20, choices=ENTITY_TYPE_CHOICES, verbose_name="Associated Entity Type")
    
    member = models.ForeignKey(
        'members.Member', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='trust_accounts', verbose_name="Custodian Member"
    )
    family_member = models.ForeignKey(
        'members.Member', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='custodian_trust_accounts', verbose_name="Custodian Family Member"
    )
    
    account_number = models.CharField(max_length=100, blank=True, default='', verbose_name="Account Number")
    bank_name = models.CharField(max_length=255, blank=True, default='', verbose_name="Bank Name")
    branch_name = models.CharField(max_length=255, blank=True, default='', verbose_name="Branch Name")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active', verbose_name="Status")
    created_date = models.DateTimeField(auto_now_add=True, verbose_name="Created Date")
    deactivated_date = models.DateTimeField(null=True, blank=True, verbose_name="Deactivated Date")
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='created_trust_accounts', verbose_name="Created By"
    )

    class Meta:
        ordering = ['account_name']
        verbose_name = "Trust Account"
        verbose_name_plural = "Trust Accounts"

    def __str__(self):
        return f"{self.account_name} ({self.account_type})"

    def clean(self):
        if self.account_type == 'Bank':
            if not self.account_number or not self.bank_name or not self.branch_name:
                raise ValidationError("Bank fields (account number, bank name, branch name) are strictly mandatory for Bank account types.")


# ---------------------------------------------------------------------------
# AccountTransaction — income / expense record under an AccountHead
# ---------------------------------------------------------------------------

class AccountTransaction(models.Model):
    """
    A single financial transaction — either Debit or Credit.

    See module docstring for soft-delete and audit-log rationale.
    """

    TRANSACTION_TYPE_CHOICES = [
        ('DEBIT', 'Debit'),
        ('CREDIT', 'Credit'),
    ]

    PAYMENT_MODE_CHOICES = [
        ('Cash', 'Cash'),
        ('Bank Transfer', 'Bank Transfer'),
        ('UPI', 'UPI'),
        ('Cheque', 'Cheque'),
        ('Credit', 'Credit'),
        ('Commodities', 'Commodities'),
    ]

    # Core fields
    account_head = models.ForeignKey(
        AccountHead, on_delete=models.PROTECT,
        related_name='transactions',
    )
    tax_event = models.ForeignKey(
        'members.TaxMaster', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='accounting_transactions',
        help_text="Link to the tax event this transaction relates to."
    )
    trust_account = models.ForeignKey(
        TrustAccount, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='transactions',
        verbose_name="Trust Account"
    )
    transaction_type = models.CharField(
        max_length=10, choices=TRANSACTION_TYPE_CHOICES,
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_date = models.DateField()
    payment_mode = models.CharField(
        max_length=20, choices=PAYMENT_MODE_CHOICES,
    )
    commodity_type = models.CharField(
        max_length=20, choices=[('Gold', 'Gold'), ('Silver', 'Silver'), ('Other', 'Other')],
        blank=True, default='', verbose_name="Commodity Type"
    )

    # --- Income-specific fields ---
    donor_name = models.CharField(max_length=200, blank=True, default='')
    donor_name_ta = models.CharField(max_length=200, blank=True, default='', verbose_name="Donor Name (Tamil)")
    donor_contact = models.CharField(max_length=50, blank=True, default='')
    member = models.ForeignKey(
        'members.Member', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='donation_transactions',
        help_text="Link to registered member if the donor is a member.",
    )
    purpose = models.TextField(
        blank=True, default='',
        verbose_name="Purpose / Remarks",
    )
    purpose_ta = models.TextField(
        blank=True, default='',
        verbose_name="Purpose / Remarks (Tamil)",
    )

    # --- Expense-specific fields ---
    paid_to = models.CharField(max_length=200, blank=True, default='')
    paid_to_ta = models.CharField(max_length=200, blank=True, default='', verbose_name="Paid To (Tamil)")
    purpose_description = models.TextField(blank=True, default='')
    purpose_description_ta = models.TextField(blank=True, default='', verbose_name="Purpose/Description (Tamil)")
    bill_reference = models.CharField(max_length=200, blank=True, default='')

    # Proof / documentation
    proof_document = models.FileField(
        upload_to='transaction_proofs/', blank=True, null=True,
    )

    # Tracking
    entered_by = models.ForeignKey(
        User, on_delete=models.PROTECT,
        related_name='entered_transactions',
    )

    # Soft-delete — see module docstring
    is_deleted = models.BooleanField(default=False)

    # Audit trail: JSON list of
    # {"field": ..., "old": ..., "new": ..., "at": ..., "by": ...}
    change_log = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-transaction_date', '-created_at']
        verbose_name = "Account Transaction"
        verbose_name_plural = "Account Transactions"

    def __str__(self):
        return (
            f"{self.get_transaction_type_display()} ₹{self.amount} "
            f"— {self.account_head.name}"
        )

    def clean(self):
        """Model-level validation."""
        errors = {}
        if self.amount is not None and self.amount <= 0:
            errors['amount'] = "Amount must be greater than zero."
        if self.transaction_date and self.transaction_date > timezone.now().date():
            errors['transaction_date'] = "Transaction date cannot be in the future."
        # account_head must be active (only enforce on creation)
        if not self.pk and self.account_head_id:
            try:
                head = AccountHead.objects.get(pk=self.account_head_id)
                if not head.is_active:
                    errors['account_head'] = (
                        "Cannot create a transaction under a deactivated "
                        "Account Head."
                    )
            except AccountHead.DoesNotExist:
                errors['account_head'] = "Account Head does not exist."
        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


# ---------------------------------------------------------------------------
# Receipt — auto-generated for every transaction
# ---------------------------------------------------------------------------

class Receipt(models.Model):
    """
    Receipt auto-generated for every AccountTransaction.

    receipt_number is sequential, FISCAL-year scoped, and NEVER reused
    even if the parent transaction is later soft-deleted.
    Format: TRUST/<YYYY-YY>/<NNNNN>   e.g. TRUST/2026-27/00001

    Fiscal year runs April-March:
      1-Apr-2026 to 31-Mar-2027  ->  "2026-27"
      1-Apr-2025 to 31-Mar-2026  ->  "2025-26"
    """

    receipt_number = models.CharField(
        max_length=30, unique=True, editable=False,
    )
    transaction = models.OneToOneField(
        AccountTransaction, on_delete=models.CASCADE,
        related_name='receipt',
    )
    generated_at = models.DateTimeField(auto_now_add=True)
    pdf_file = models.FileField(
        upload_to='receipts/', blank=True, null=True,
    )

    class Meta:
        ordering = ['-generated_at']
        verbose_name = "Receipt"
        verbose_name_plural = "Receipts"

    def __str__(self):
        return self.receipt_number

    @staticmethod
    def _fiscal_year_string(dt=None):
        """
        Return the fiscal-year label for *dt* (defaults to now).
        April-March cycle:  1-Apr-2026 to 31-Mar-2027  ->  "2026-27"
        """
        if dt is None:
            dt = timezone.now()
        # Jan-Mar belongs to the fiscal year that started the previous April
        start = dt.year if dt.month >= 4 else dt.year - 1
        end_short = str(start + 1)[-2:]   # last two digits of the ending year
        return f"{start}-{end_short}"

    @staticmethod
    def generate_receipt_number():
        """
        Atomically generate the next sequential receipt number for the
        current fiscal year (April-March).

        Uses SELECT ... FOR UPDATE on the last receipt row so that two
        concurrent transaction saves cannot read the same sequence value
        and produce a duplicate.  The unique=True DB constraint remains as
        a last-resort safety net.

        Format: TRUST/<YYYY-YY>/<NNNNN>
        """
        from django.db import transaction as db_transaction

        fiscal_year = Receipt._fiscal_year_string()
        prefix = f"TRUST/{fiscal_year}/"

        with db_transaction.atomic():
            # Lock the highest-sequence receipt in this fiscal year so no
            # concurrent request can read the same value before we write.
            last = (
                Receipt.objects
                .select_for_update(nowait=False)
                .filter(receipt_number__startswith=prefix)
                .order_by('-receipt_number')
                .first()
            )
            if last:
                try:
                    seq = int(last.receipt_number.split('/')[-1]) + 1
                except (ValueError, IndexError):
                    seq = 1
            else:
                seq = 1
            return f"{prefix}{seq:05d}"
