"""
PDF receipt generator using reportlab.

Generates a professional receipt PDF with trust branding for both
Donation Receipts (Income) and Payment Vouchers (Expense).
"""

import io
import os
import base64
import subprocess
import tempfile
import uuid
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


def render_pdf_with_headless_browser(html_content):
    """
    Render HTML to PDF using Headless Chromium / Edge if available.
    Returns PDF bytes on success, or None on failure/unavailable.
    This provides pixel-perfect browser display matching for Tamil Unicode fonts.
    """
    possible_paths = [
        r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
        r'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
        r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
        'google-chrome',
        'chromium-browser',
        'chromium',
        'msedge',
    ]

    browser_exe = None
    for path in possible_paths:
        if os.path.isabs(path) and os.path.exists(path):
            browser_exe = path
            break
        elif not os.path.isabs(path):
            import shutil
            if shutil.which(path):
                browser_exe = shutil.which(path)
                break

    if not browser_exe:
        return None

    temp_dir = tempfile.gettempdir()
    unique_id = uuid.uuid4().hex
    temp_html_path = os.path.join(temp_dir, f"receipt_{unique_id}.html")
    temp_pdf_path = os.path.join(temp_dir, f"receipt_{unique_id}.pdf")

    try:
        with open(temp_html_path, 'w', encoding='utf-8') as f:
            f.write(html_content)

        cmd = [
            browser_exe,
            '--headless',
            '--disable-gpu',
            '--no-pdf-header-footer',
            f'--print-to-pdf={temp_pdf_path}',
            temp_html_path
        ]

        result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        if result.returncode == 0 and os.path.exists(temp_pdf_path):
            with open(temp_pdf_path, 'rb') as pf:
                pdf_data = pf.read()
            return pdf_data
        return None
    except Exception:
        return None
    finally:
        if os.path.exists(temp_html_path):
            try:
                os.remove(temp_html_path)
            except Exception:
                pass
        if os.path.exists(temp_pdf_path):
            try:
                os.remove(temp_pdf_path)
            except Exception:
                pass


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

import logging
logger = logging.getLogger(__name__)

_REGISTERED_TAMIL_FONT_NAME = None
_REGISTERED_TAMIL_FONT_PATH = None

def register_tamil_font():
    """Register NotoSansTamil TTF font with ReportLab if available."""
    global _REGISTERED_TAMIL_FONT_NAME, _REGISTERED_TAMIL_FONT_PATH
    if _REGISTERED_TAMIL_FONT_NAME:
        return _REGISTERED_TAMIL_FONT_NAME, _REGISTERED_TAMIL_FONT_PATH

    font_path = os.path.join(settings.BASE_DIR, 'accounting', 'fonts', 'NotoSansTamil-Regular.ttf')
    if os.path.exists(font_path):
        try:
            from reportlab.pdfbase import pdfmetrics
            from reportlab.pdfbase.ttfonts import TTFont
            if 'NotoSansTamil' not in pdfmetrics.getRegisteredFontNames():
                pdfmetrics.registerFont(TTFont('NotoSansTamil', font_path))
            _REGISTERED_TAMIL_FONT_NAME = 'NotoSansTamil'
            _REGISTERED_TAMIL_FONT_PATH = font_path
        except Exception as e:
            logger.warning(f"Failed to register NotoSansTamil font in ReportLab: {e}")
            _REGISTERED_TAMIL_FONT_NAME = 'Helvetica'
            _REGISTERED_TAMIL_FONT_PATH = None
    else:
        _REGISTERED_TAMIL_FONT_NAME = 'Helvetica'
        _REGISTERED_TAMIL_FONT_PATH = None

    return _REGISTERED_TAMIL_FONT_NAME, _REGISTERED_TAMIL_FONT_PATH


def get_trust_config():
    """Return trust branding config from settings."""
    return getattr(settings, 'TRUST_CONFIG', {
        'name': 'Kalinga Temple Trust',
        'address': '',
        'logo_path': None,
    })


def generate_receipt_pdf_reportlab(transaction):
    """
    Generate a receipt PDF for the given AccountTransaction instance using ReportLab.
    Returns the PDF content as bytes.
    """
    from .models import Receipt  # avoid circular import

    font_name, _ = register_tamil_font()

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
        fontName=font_name,
        fontSize=18,
        alignment=TA_CENTER,
        spaceAfter=4 * mm,
        textColor=colors.HexColor('#1a1a1a'),
    )
    subtitle_style = ParagraphStyle(
        'ReceiptSubtitle',
        parent=styles['Normal'],
        fontName=font_name,
        fontSize=10,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#6b7280'),
        spaceAfter=6 * mm,
    )
    label_style = ParagraphStyle(
        'Label',
        parent=styles['Normal'],
        fontName=font_name,
        fontSize=10,
        textColor=colors.HexColor('#6b7280'),
    )
    value_style = ParagraphStyle(
        'Value',
        parent=styles['Normal'],
        fontName=font_name,
        fontSize=11,
        textColor=colors.HexColor('#1a1a1a'),
    )
    receipt_type_style = ParagraphStyle(
        'ReceiptType',
        parent=styles['Heading2'],
        fontName=font_name,
        fontSize=14,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#4338ca'),
        spaceAfter=4 * mm,
        spaceBefore=2 * mm,
    )
    amount_words_style = ParagraphStyle(
        'AmountWords',
        parent=styles['Normal'],
        fontName=font_name,
        fontSize=10,
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


def generate_receipt_pdf(transaction):
    """
    Generate a receipt PDF using a configuration-driven HTML template layout.
    Falls back to reportlab in case of errors.
    """
    import os
    import logging
    import io
    import base64
    from django.conf import settings
    from django.template import Template, Context
    from xhtml2pdf import pisa

    logger = logging.getLogger(__name__)

    try:
        # 1. Resolve template path
        template_path = getattr(settings, 'ACTIVE_RECEIPT_TEMPLATE', None)
        if not template_path or not os.path.exists(template_path):
            template_path = os.path.join(settings.BASE_DIR, 'accounting', 'tax_receipt_template.html')

        # 2. Read template content
        if os.path.exists(template_path):
            with open(template_path, 'r', encoding='utf-8') as f:
                html_content = f.read()
        else:
            # Fallback inline html template string if template file doesn't exist
            html_content = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: Helvetica, sans-serif; padding: 20px; }
                    .header { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
                    .field { margin: 10px 0; font-size: 14px; }
                    .sig { margin-top: 50px; text-align: right; }
                    .sig img { max-width: 150px; max-height: 50px; }
                </style>
            </head>
            <body>
                <div class="header">Receipt / Voucher</div>
                <div class="field">Receipt No: {{ receipt_no }}</div>
                <div class="field">Name: {{ name }} ({{ name_ta }})</div>
                <div class="field">Amount: ₹ {{ amount }}</div>
                {% if custodian_signature %}
                <div class="sig">
                    <p>Custodian Signature:</p>
                    <img src="{{ custodian_signature }}" />
                </div>
                {% endif %}
            </body>
            </html>
            """

        # 3. Resolve context variables
        name = ""
        name_ta = ""
        member_id = ""
        if transaction.member:
            name = transaction.member.name or ""
            name_ta = transaction.member.name_ta or ""
            member_id = transaction.member.member_id or ""
        else:
            name = transaction.donor_name or ""
            name_ta = transaction.donor_name_ta or ""

        receipt_no = ""
        if hasattr(transaction, 'receipt') and transaction.receipt:
            receipt_no = transaction.receipt.receipt_number or ""

        amount = str(transaction.amount)

        # 4. Resolve custodian signature
        sig_path = getattr(settings, 'CUSTODIAN_SIGNATURE_PATH', None)
        custodian_signature = ''
        if sig_path and os.path.exists(sig_path):
            try:
                with open(sig_path, 'rb') as sf:
                    sig_data = sf.read()
                # Determine image mimetype
                mimetype = "image/png"
                if sig_path.lower().endswith('.jpg') or sig_path.lower().endswith('.jpeg'):
                    mimetype = "image/jpeg"
                elif sig_path.lower().endswith('.gif'):
                    mimetype = "image/gif"
                custodian_signature = f"data:{mimetype};base64,{base64.b64encode(sig_data).decode('utf-8')}"
            except Exception as e:
                logger.warning(f"Failed to read custodian signature image: {e}")
                custodian_signature = ''

        if not custodian_signature:
            # Fallback generic default signature (a transparent 1x1 GIF base64 string)
            custodian_signature = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"

        # Resolve font URL for xhtml2pdf
        _, font_path = register_tamil_font()
        font_url = ""
        if font_path and os.path.exists(font_path):
            font_url = "file:///" + os.path.abspath(font_path).replace("\\", "/")

        # 5. Render context
        context_dict = {
            # Font parameters
            'font_url': font_url,
            'font_path': font_path,

            # Explicit required variables
            'name': name,
            'name_ta': name_ta,
            'receipt_no': receipt_no,
            'amount': amount,
            'custodian_signature': custodian_signature,

            # Direct models for dynamic field access
            'transaction': transaction,
            'receipt': transaction.receipt if hasattr(transaction, 'receipt') else None,
            'member_model': transaction.member if transaction.member else None,

            # Compatibility keys for tax_receipt_template.html
            'e': receipt_no,
            'account_number': member_id,
            'member': transaction.member if transaction.member else {
                'name': name,
                'name_ta': name_ta,
                'member_id': member_id,
            },
            'amount_paid': amount,
        }

        template = Template(html_content)
        context = Context(context_dict)
        html_rendered = template.render(context)

        # Ensure @font-face declaration for NotoSansTamil is embedded in HTML if font_url exists
        if font_url:
            font_css = f"""
            <style>
            @font-face {{
                font-family: 'NotoSansTamil';
                src: url('{font_url}');
            }}
            @font-face {{
                font-family: 'Noto Sans Tamil';
                src: url('{font_url}');
            }}
            body, table, td, th, p, span, div, h1, h2, h3, h4 {{
                font-family: 'NotoSansTamil', 'Noto Sans Tamil', sans-serif !important;
            }}
            </style>
            """
            if '@font-face' not in html_rendered:
                if '</head>' in html_rendered:
                    html_rendered = html_rendered.replace('</head>', f'{font_css}</head>')
                else:
                    html_rendered = font_css + html_rendered

        # 6. Primary PDF rendering engine: Headless Chromium / Edge (100% browser matching for Tamil Unicode fonts and CSS)
        headless_pdf = render_pdf_with_headless_browser(html_rendered)
        if headless_pdf:
            return headless_pdf

        # Fallback to xhtml2pdf if headless browser is unavailable
        result = io.BytesIO()
        pdf = pisa.pisaDocument(io.BytesIO(html_rendered.encode("utf-8")), result)
        if not pdf.err:
            return result.getvalue()
        else:
            raise Exception("xhtml2pdf rendering error occurred.")

    except Exception as exc:
        logger.error(f"HTML template PDF generation failed: {exc}. Falling back to ReportLab.", exc_info=True)
        return generate_receipt_pdf_reportlab(transaction)
