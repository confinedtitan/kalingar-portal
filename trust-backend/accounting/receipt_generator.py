"""
PDF receipt generator using reportlab.

Generates a professional receipt PDF with trust branding for both
Donation Receipts (Income) and Payment Vouchers (Expense).
"""

import io
import os
from decimal import Decimal

from django.conf import settings
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable,
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT


# ---------------------------------------------------------------------------
# Amount-to-words helper (Indian numbering: lakh / crore)
# ---------------------------------------------------------------------------

_ONES = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
    'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen',
    'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
]

_TENS = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
    'Sixty', 'Seventy', 'Eighty', 'Ninety',
]


def _number_to_words(n):
    """Convert an integer to English words (Indian numbering)."""
    if n == 0:
        return 'Zero'
    if n < 0:
        return 'Minus ' + _number_to_words(-n)

    parts = []
    if n >= 10_00_00_000:
        parts.append(_number_to_words(n // 10_00_00_000) + ' Crore')
        n %= 10_00_00_000
    if n >= 1_00_000:
        parts.append(_number_to_words(n // 1_00_000) + ' Lakh')
        n %= 1_00_000
    if n >= 1_000:
        parts.append(_number_to_words(n // 1_000) + ' Thousand')
        n %= 1_000
    if n >= 100:
        parts.append(_ONES[n // 100] + ' Hundred')
        n %= 100
    if n >= 20:
        parts.append(_TENS[n // 10])
        n %= 10
    if 0 < n < 20:
        parts.append(_ONES[n])

    return ' '.join(parts)


def amount_to_words(amount):
    """
    Convert a Decimal amount to Indian-English words.
    e.g. 1234.50 → "Rupees One Thousand Two Hundred Thirty Four and Fifty Paise Only"
    """
    amount = Decimal(str(amount))
    rupees = int(amount)
    paise = int(round((amount - rupees) * 100))

    words = f"Rupees {_number_to_words(rupees)}"
    if paise > 0:
        words += f" and {_number_to_words(paise)} Paise"
    words += " Only"
    return words


# ---------------------------------------------------------------------------
# PDF generation
# ---------------------------------------------------------------------------

def get_trust_config():
    """Return trust branding config from settings."""
    return getattr(settings, 'TRUST_CONFIG', {
        'name': 'Kalinga Temple Trust',
        'address': '',
        'logo_path': None,
    })


def generate_receipt_pdf(transaction):
    """
    Generate a receipt PDF for the given AccountTransaction instance.
    Returns the PDF content as bytes.
    """
    from .models import Receipt  # avoid circular import

    config = get_trust_config()
    receipt = transaction.receipt

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'ReceiptTitle',
        parent=styles['Heading1'],
        fontSize=18,
        alignment=TA_CENTER,
        spaceAfter=4 * mm,
        textColor=colors.HexColor('#1a1a1a'),
    )
    subtitle_style = ParagraphStyle(
        'ReceiptSubtitle',
        parent=styles['Normal'],
        fontSize=10,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#6b7280'),
        spaceAfter=6 * mm,
    )
    label_style = ParagraphStyle(
        'Label',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#6b7280'),
    )
    value_style = ParagraphStyle(
        'Value',
        parent=styles['Normal'],
        fontSize=11,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor('#1a1a1a'),
    )
    receipt_type_style = ParagraphStyle(
        'ReceiptType',
        parent=styles['Heading2'],
        fontSize=14,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#4338ca'),
        spaceAfter=4 * mm,
        spaceBefore=2 * mm,
    )
    amount_words_style = ParagraphStyle(
        'AmountWords',
        parent=styles['Normal'],
        fontSize=10,
        fontName='Helvetica-Oblique',
        textColor=colors.HexColor('#374151'),
        alignment=TA_CENTER,
        spaceBefore=2 * mm,
        spaceAfter=4 * mm,
    )

    elements = []

    # --- Header: Trust name & address ---
    sri_ramajeyam_style = ParagraphStyle(
        'SriRamajeyam',
        parent=styles['Normal'],
        fontSize=12,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#d97706'),
        spaceAfter=4 * mm,
    )
    elements.append(Paragraph("ஸ்ரீ ராமஜெயம் | Sri Ramajeyam", sri_ramajeyam_style))
    elements.append(Paragraph(config.get('name', 'Trust'), title_style))
    if config.get('address'):
        elements.append(Paragraph(config['address'], subtitle_style))

    elements.append(HRFlowable(
        width='100%', thickness=1, color=colors.HexColor('#e5e7eb'),
        spaceBefore=2 * mm, spaceAfter=4 * mm,
    ))

    # --- Receipt type ---
    receipt_label = (
        'DONATION RECEIPT' if transaction.transaction_type == 'CREDIT'
        else 'PAYMENT VOUCHER'
    )
    elements.append(Paragraph(receipt_label, receipt_type_style))

    # --- Receipt number / date row ---
    header_data = [
        [
            Paragraph(f"<b>Receipt No:</b> {receipt.receipt_number}", styles['Normal']),
            Paragraph(
                f"<b>Date:</b> {transaction.transaction_date.strftime('%d-%b-%Y')}",
                ParagraphStyle('RightAlign', parent=styles['Normal'], alignment=TA_RIGHT),
            ),
        ],
    ]
    header_table = Table(header_data, colWidths=['50%', '50%'])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 6 * mm))

    # --- Details table ---
    is_commodity = transaction.payment_mode == 'Commodities'
    detail_rows = [
        ('Account Head', transaction.account_head.name),
        ('Quantity (Weight)' if is_commodity else 'Amount', f"{transaction.amount:,.2f}" if is_commodity else f"₹ {transaction.amount:,.2f}"),
        ('Payment Mode', f"Commodities ({transaction.commodity_type})" if is_commodity else transaction.get_payment_mode_display()),
    ]

    if transaction.transaction_type == 'CREDIT':
        detail_rows.append(('Donor Name', transaction.donor_name or '—'))
        detail_rows.append(('Contact', transaction.donor_contact or '—'))
        if transaction.member:
            detail_rows.append((
                'Member',
                f"{transaction.member.name} ({transaction.member.member_id})",
            ))
        if transaction.purpose:
            detail_rows.append(('Purpose / Remarks', transaction.purpose))
    else:
        detail_rows.append(('Paid To', transaction.paid_to or '—'))
        if transaction.purpose_description:
            detail_rows.append(('Description', transaction.purpose_description))
        if transaction.bill_reference:
            detail_rows.append(('Bill Reference', transaction.bill_reference))

    # Entered by
    entered_by_name = transaction.entered_by.get_username()
    try:
        entered_by_name = transaction.entered_by.staff_profile.name
    except Exception:
        try:
            entered_by_name = transaction.entered_by.member_profile.name
        except Exception:
            pass
    detail_rows.append(('Entered By', entered_by_name))

    # Build table
    table_data = [
        [
            Paragraph(f"<b>{label}</b>", label_style),
            Paragraph(str(value), value_style),
        ]
        for label, value in detail_rows
    ]
    detail_table = Table(table_data, colWidths=[40 * mm, None])
    detail_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, colors.HexColor('#f3f4f6')),
        ('LINEBELOW', (0, -1), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
    ]))
    elements.append(detail_table)

    # --- Amount in words ---
    words = amount_to_words(transaction.amount)
    elements.append(Paragraph(f"({words})", amount_words_style))

    elements.append(Spacer(1, 15 * mm))

    # --- Signature line ---
    elements.append(HRFlowable(
        width='100%', thickness=0.5, color=colors.HexColor('#d1d5db'),
    ))
    elements.append(Spacer(1, 15 * mm))

    sig_data = [
        [
            Paragraph("Received By", ParagraphStyle(
                'SigLabel', parent=styles['Normal'],
                fontSize=9, textColor=colors.HexColor('#9ca3af'),
            )),
            Paragraph("Authorized Signatory", ParagraphStyle(
                'SigLabel', parent=styles['Normal'],
                fontSize=9, textColor=colors.HexColor('#9ca3af'),
                alignment=TA_RIGHT,
            )),
        ],
        [
            Paragraph("_" * 25, styles['Normal']),
            Paragraph(
                "_" * 25,
                ParagraphStyle('RightSig', parent=styles['Normal'], alignment=TA_RIGHT),
            ),
        ],
    ]
    sig_table = Table(sig_data, colWidths=['50%', '50%'])
    sig_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'BOTTOM'),
    ]))
    elements.append(sig_table)

    # Build PDF
    doc.build(elements)
    return buf.getvalue()
