#!/usr/bin/env python
# type: ignore
"""
CLI script to clean/reset SQLite database tables for Kalingar Trust Portal.

Usage:
    python clean_db.py                      # Interactive mode with confirmation
    python clean_db.py --force              # Force clean without prompt
    python clean_db.py --keep-heads         # Clean members & txns but preserve Account Heads & Tax Configs
    python clean_db.py --txns-only          # Clear only Transactions, Receipts, and Payments
"""

import os
import sys
import argparse
import django

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trust_portal.settings')
django.setup()

from django.db import transaction
from django.contrib.auth.models import User
from members.models import Member, MemberTax, TaxMaster
from accounting.models import (
    AccountTransaction, Receipt, AccountHead, TrustAccount, StaffProfile
)
from payments.models import Payment


def clean_database(keep_heads=False, txns_only=False, keep_superusers=True):
    """
    Deletes records in proper foreign-key order to avoid constraint violations.
    """
    print("\n==================================================")
    print("      Kalingar Portal - Database Clean Utility     ")
    print("==================================================\n")

    with transaction.atomic():
        deleted_counts = {}

        # 1. Receipts (child of AccountTransaction)
        c, _ = Receipt.objects.all().delete()
        deleted_counts['Receipts'] = c

        # 2. Account Transactions
        c, _ = AccountTransaction.objects.all().delete()
        deleted_counts['Account Transactions'] = c

        # 3. Payments
        c, _ = Payment.objects.all().delete()
        deleted_counts['Payments'] = c

        if not txns_only:
            # 4. Member Taxes
            c, _ = MemberTax.objects.all().delete()
            deleted_counts['Member Taxes'] = c

            # 5. Trust Accounts
            c, _ = TrustAccount.objects.all().delete()
            deleted_counts['Trust Accounts'] = c

            # 6. Members
            c, _ = Member.objects.all().delete()
            deleted_counts['Members'] = c

            if not keep_heads:
                # 7. Account Heads
                c, _ = AccountHead.objects.all().delete()
                deleted_counts['Account Heads'] = c

                # 8. Tax Master Configurations
                c, _ = TaxMaster.objects.all().delete()
                deleted_counts['Tax Configurations'] = c

            # 9. Non-superuser Django Users linked to members
            if keep_superusers:
                users_to_delete = User.objects.filter(is_superuser=False, is_staff=False)
            else:
                users_to_delete = User.objects.all()

            c, _ = users_to_delete.delete()
            deleted_counts['User Accounts'] = c

        print("Deletion Summary:")
        print("--------------------------------------------------")
        for model_name, count in deleted_counts.items():
            print(f"  - {model_name:28s}: {count} records deleted")
        print("--------------------------------------------------")
        print("Database cleanup completed successfully!\n")


def main():
    parser = argparse.ArgumentParser(description="Clean/reset SQLite database tables for Kalingar Trust Portal.")
    parser.add_argument('--force', '-y', action='store_true', help="Skip interactive confirmation prompt")
    parser.add_argument('--keep-heads', action='store_true', help="Keep Account Heads and Tax Configurations intact")
    parser.add_argument('--txns-only', action='store_true', help="Clear only Transactions, Receipts, and Payments")
    parser.add_argument('--delete-superusers', action='store_true', help="Delete all users including Superusers/Admin")

    args = parser.parse_args()

    if not args.force:
        print("\nWARNING: This action will permanently delete database records!")
        if args.txns_only:
            print("Scope: All Transactions, Receipts, and Payments will be cleared.")
        elif args.keep_heads:
            print("Scope: All Members, Taxes, Transactions, Receipts, Payments, and Member Users will be cleared.")
            print("       (Account Heads and Tax Configs will be PRESERVED)")
        else:
            print("Scope: All Members, Member Taxes, Transactions, Receipts, Payments, Account Heads, and Member Users will be cleared.")
        
        confirm = input("\nAre you sure you want to proceed? (type 'yes' to confirm): ").strip().lower()
        if confirm != 'yes':
            print("Database cleanup cancelled.")
            sys.exit(0)

    clean_database(
        keep_heads=args.keep_heads,
        txns_only=args.txns_only,
        keep_superusers=not args.delete_superusers
    )


if __name__ == '__main__':
    main()
