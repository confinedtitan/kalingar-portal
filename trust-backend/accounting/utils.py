from decimal import Decimal
from django.db import transaction
from django.db.models import Sum
from members.utils import getCurrentTaxYearRange

def recalculate_member_financials(member, date):
    """
    Recalculates a member's annual_tax (debit rollup) and amount_paid (credit rollup)
    for the tax year corresponding to the provided date.
    Runs inside a database transaction block with select_for_update for structural integrity.
    """
    if not member or not date:
        return

    # Import models locally to avoid circular dependencies
    from members.models import Member
    from .models import AccountTransaction

    start_date, end_date = getCurrentTaxYearRange(date)

    with transaction.atomic():
        # Lock Member record to prevent concurrent updates
        member_to_update = Member.objects.select_for_update().get(pk=member.pk)

        # Calculate sum of all DEBIT transactions in the fiscal year
        debits_sum = AccountTransaction.objects.filter(
            member=member_to_update,
            transaction_type='DEBIT',
            transaction_date__range=(start_date, end_date),
            is_deleted=False
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        # Calculate sum of all CREDIT transactions in the fiscal year
        credits_sum = AccountTransaction.objects.filter(
            member=member_to_update,
            transaction_type='CREDIT',
            transaction_date__range=(start_date, end_date),
            is_deleted=False
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        # Update member fields
        member_to_update.annual_tax = debits_sum
        member_to_update.amount_paid = credits_sum
        member_to_update.save()
