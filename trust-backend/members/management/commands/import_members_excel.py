"""
Django management command to bulk-import members from a Tamil Excel file.

Usage:
    python manage.py import_members_excel <path_to_excel>

The Excel file format is documented in members/utils.py.
"""

from django.core.management.base import BaseCommand, CommandError
import openpyxl

from members.utils import process_excel_workbook


class Command(BaseCommand):
    help = 'Import members from a Tamil Excel file (.xlsx)'

    def add_arguments(self, parser):
        parser.add_argument(
            'excel_file',
            type=str,
            help='Path to the .xlsx file to import',
        )

    def handle(self, *args, **options):
        filepath = options['excel_file']

        try:
            wb = openpyxl.load_workbook(filepath, data_only=True)
        except FileNotFoundError:
            raise CommandError(f'File not found: {filepath}')
        except Exception as exc:
            raise CommandError(f'Error opening Excel file: {exc}')

        self.stdout.write(f'Processing {filepath} ...\n')

        results = process_excel_workbook(wb)

        # Print summary
        self.stdout.write(self.style.SUCCESS(
            f"\nImport complete: "
            f"{results['created']} created, "
            f"{results['skipped']} skipped"
        ))

        if results['errors']:
            self.stdout.write(self.style.WARNING('\nDetails:'))
            for err in results['errors']:
                self.stdout.write(
                    f"  Row {err['row']}: {err['name']} — {err['reason']}"
                )
