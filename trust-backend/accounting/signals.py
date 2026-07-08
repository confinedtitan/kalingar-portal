"""
Django signals for the accounting app.

Auto-creates a Receipt (with PDF) whenever an AccountTransaction is saved
for the first time.

Failure policy
--------------
- Receipt *row* creation (number generation + DB insert): NOT caught here.
  Any error propagates and rolls back the enclosing transaction save.
  A transaction without a receipt number is unacceptable.
- PDF generation: caught and logged (non-fatal).  The PDF is regenerated
  on demand the first time someone hits the download endpoint, so a
  transient reportlab error should not prevent the transaction being recorded.
"""

import logging

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.files.base import ContentFile

from .models import AccountTransaction, Receipt

logger = logging.getLogger(__name__)


@receiver(post_save, sender=AccountTransaction)
def create_receipt_on_transaction_save(sender, instance, created, **kwargs):
    """
    Auto-generate a Receipt record (and PDF) when a new AccountTransaction
    is created.  Does NOT regenerate on subsequent saves / edits.

    Receipt number generation uses SELECT ... FOR UPDATE inside an atomic
    block (see Receipt.generate_receipt_number), so concurrent saves queue
    rather than collide on the sequence.

    If receipt creation fails for any reason the exception is NOT caught --
    it propagates and Django rolls back the outer save, ensuring no
    AccountTransaction ever exists without a paired Receipt.
    """
    if not created:
        return

    # --- Receipt row: must not fail silently ---
    # generate_receipt_number() runs select_for_update inside atomic(),
    # making the read-increment-write a serialised critical section.
    receipt_number = Receipt.generate_receipt_number()
    receipt = Receipt.objects.create(
        receipt_number=receipt_number,
        transaction=instance,
    )

    # --- PDF generation: non-fatal, regenerated on first download ---
    # Import inside function to avoid circular import at module level.
    try:
        from .receipt_generator import generate_receipt_pdf

        pdf_bytes = generate_receipt_pdf(instance)
        filename = f"{receipt_number.replace('/', '_')}.pdf"
        receipt.pdf_file.save(filename, ContentFile(pdf_bytes), save=True)
    except Exception as exc:
        logger.error(
            "Receipt PDF generation failed for %s (transaction id=%s): %s"
            " -- PDF will be regenerated on first download.",
            receipt_number, instance.pk, exc,
        )
