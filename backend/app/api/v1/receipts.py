from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from ...core.dependencies import get_db
from ...models.payment import Payment
from ...models.customer import Customer
from ...models.user import User
from ...models.company_settings import CompanySettings

router = APIRouter(prefix="/receipts", tags=["Receipts"])

@router.get("/{payment_id}", response_class=HTMLResponse)
def get_receipt(payment_id: int, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment: raise HTTPException(status_code=404)
    customer = db.query(Customer).filter(Customer.id == payment.customer_id).first()
    cashier = db.query(User).filter(User.id == payment.collected_by).first()
    settings = db.query(CompanySettings).first()

    CO = settings.company_name if settings else "Lasani Links"
    AD = settings.address if settings else "St 22 Qila Muh....di, Ravi Road, Lahore"
    FT = settings.receipt_footer if settings else "Thank you for choosing Lasani Links!"
    CU = settings.currency_symbol if settings else "Rs."
    PK = customer.service_plan if customer else "N/A"
    EX = customer.expiry_date.strftime("%d/%m/%Y") if customer and customer.expiry_date else "N/A"
    RN = payment.receipt_number
    PD = str(payment.payment_date)
    PT = payment.created_at.strftime("%I:%M %p")
    BM = payment.billing_month
    MT = payment.payment_method.value.upper() if payment.payment_method else "CASH"
    AM = f"{payment.amount_paid:,.0f}"
    CN = cashier.full_name if cashier else "System"
    PH = customer.mobile_phone if customer else "N/A"
    UN = customer.username if customer else "N/A"

    def copy_block(kind):
        is_cust = kind == "CUSTOMER"
        sig_lbl = "Authorized Signature" if is_cust else "Customer Signature"
        sig_name = ""
        notes = '<div class="notes-box"><span class="panel-lbl-plain">Internal notes</span><div class="note-rule"></div><div class="note-rule"></div></div>' if not is_cust else ""
        contact = '<div class="contact-row"><span>JazzCash: 03071786655</span><span>EasyPaisa: 03078740993</span></div>' if is_cust else ""
        collected = f'<div class="collected">Thank you for choosing {CO}!</div>' if is_cust else ""

        return f"""<section class="copy">
<span class="paid-badge"><svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg><span>PAID</span></span>
<header class="hdr">
<div class="logo"><svg viewBox="0 0 60 60"><path d="M14 34a16 16 0 0 1 32 0" fill="none" stroke="#3D414A" stroke-width="2.4"/><path d="M19 38a11 11 0 0 1 22 0" fill="none" stroke="#55595F" stroke-width="2.4"/><path d="M24 42a6 6 0 0 1 12 0" fill="none" stroke="#3D414A" stroke-width="2.4"/><path d="M30 18 L24 46 h12 z" fill="#14161B"/><circle cx="30" cy="16" r="2.4" fill="#14161B"/></svg></div>
<div class="brand"><h1>{CO}</h1><p>Connecting You, Everywhere</p><span class="ribbon">INTERNET RENEWAL RECEIPT</span></div>
</header>
<div class="meta"><span class="chip">RECEIPT NO</span><span class="rn">{RN}</span><span class="spacer"></span><span class="date">Date {PD} · {PT}</span><span class="tag">{kind} COPY</span></div>
<div class="panels">
<div class="panel"><div class="ph blue"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c1.4-4 4-6 7.5-6s6.1 2 7.5 6"/></svg><span>CUSTOMER INFO</span></div>
<div class="pb">
<div class="ir"><span class="ic"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c1.4-4 4-6 7.5-6s6.1 2 7.5 6"/></svg></span><span class="il">Username</span><span class="iv">{UN}</span></div>
<div class="ir"><span class="ic"><svg viewBox="0 0 24 24"><path d="M5 4h3l1.5 4L7 9.5c.8 2.6 2.9 4.7 5.5 5.5l1.5-2.5 4 1.5v3c0 1.1-.9 2-2 2-7 0-13-6-13-13 0-1.1.9-2 2-2z"/></svg></span><span class="il">Phone</span><span class="iv">{PH}</span></div>
<div class="ir"><span class="ic"><svg viewBox="0 0 24 24"><path d="M4 15a8 8 0 1 1 16 0"/><path d="M12 15l4-5"/><circle cx="12" cy="15" r="1.2"/></svg></span><span class="il">Package</span><span class="iv">{PK}</span></div>
<div class="ir"><span class="ic"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 3v4M16 3v4"/></svg></span><span class="il">Expiry</span><span class="iv">{EX}</span></div>
</div></div>
<div class="panel"><div class="ph green"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.3 3.8 5.3 3.8 8.5s-1.3 6.2-3.8 8.5c-2.5-2.3-3.8-5.3-3.8-8.5S9.5 5.8 12 3.5z"/></svg><span>PAYMENT</span></div>
<div class="pb">
<div class="ir"><span class="ic"><svg viewBox="0 0 24 24"><rect x="2.5" y="6.5" width="19" height="11" rx="2"/><circle cx="12" cy="12" r="2.6"/></svg></span><span class="il">Amount</span><span class="iv"><span class="amt">{CU} {AM}</span></span></div>
<div class="ir"><span class="ic"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9.5h18"/></svg></span><span class="il">Month</span><span class="iv">{BM}</span></div>
<div class="ir"><span class="ic"><svg viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v3"/><rect x="3" y="7" width="18" height="12" rx="2"/></svg></span><span class="il">Method</span><span class="iv">{MT}</span></div>
</div></div></div>
{notes}
{contact}
<div class="footer-strip">
<div class="qr-box"><img src="https://i.ibb.co/SZmCzmm/raast-qr.png" alt="QR"></div>
<div class="thanks"><div class="thanks-script">Thank You!</div><div class="thanks-sub">{FT}</div></div>
<div class="sig-block">{sig_name}<div class="sig-rule"></div><div class="sig-lbl">{sig_lbl}</div></div>
</div>
{collected}
</section>"""

    html = f"""<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Receipt {RN}</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&family=Caveat:wght@600;700&display=swap" rel="stylesheet">
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:'Inter',Arial;background:#EAEAE7;display:flex;justify-content:center;padding:14px;color:#15171C}}
.page{{width:210mm;min-height:297mm;display:flex;flex-direction:column;padding:3mm;gap:2mm}}
@media print{{body{{background:#fff;padding:0}}@page{{size:A4;margin:6mm}}.btn{{display:none}}*{{-webkit-print-color-adjust:exact;print-color-adjust:exact}}}}
.copy{{position:relative;background:#fff;border-radius:16px;padding:3mm 5mm 2mm;border:1px solid #DEDEDA;box-shadow:0 0 0 3px #fff,0 0 0 4.5px #15171C,0 6px 18px rgba(0,0,0,.08);overflow:hidden;flex:1;display:flex;flex-direction:column}}
.paid-badge{{position:absolute;top:6mm;right:7mm;z-index:2;display:flex;align-items:center;gap:1.5mm;background:#15171C;color:#fff;font-family:'Poppins';font-weight:700;font-size:7pt;letter-spacing:1px;padding:1mm 3mm;border-radius:20px;box-shadow:0 3px 8px rgba(0,0,0,.28)}}
.paid-badge svg{{width:13px;height:13px;fill:none;stroke:#fff;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}}
.hdr{{display:flex;align-items:center;gap:2mm;padding-bottom:3mm;margin-bottom:1.5mm}}
.logo{{width:10mm;height:10mm;flex:none}}
.logo svg{{width:100%;height:100%}}
.brand h1{{font-family:'Poppins';font-weight:800;font-size:14pt;color:#14161B;line-height:1}}
.brand p{{font-family:'Poppins';font-weight:600;font-size:7pt;color:#55595F;margin-top:1mm}}
.ribbon{{display:inline-block;margin-top:2mm;background:linear-gradient(135deg,#3D414A,#14161B);color:#fff;font-family:'Poppins';font-weight:600;font-size:6pt;letter-spacing:1px;padding:1.8mm 4mm;border-radius:5px 5px 5px 0}}
.meta{{display:flex;align-items:center;gap:2.5mm;padding:2mm 0 3mm;border-bottom:1px dashed #DEDEDA;margin-bottom:1.5mm}}
.chip{{background:#14161B;color:#fff;font-family:'IBM Plex Mono';font-size:6.5pt;letter-spacing:1px;padding:1.5mm 3mm;border-radius:4px}}
.rn{{font-size:9pt;font-weight:700;color:#15171C}}
.spacer{{flex:1}}
.date{{font-size:6.5pt;font-weight:600;color:#14161B}}
.tag{{font-family:'IBM Plex Mono';font-size:6.5pt;letter-spacing:1.5px;color:#70757E;border:1px solid #DEDEDA;padding:1.5px 6px;border-radius:3px}}
.panels{{display:flex;gap:5mm;margin-bottom:1.5mm}}
.panel{{flex:1}}
.ph{{display:flex;align-items:center;gap:2mm;color:#fff;font-family:'Poppins';font-weight:600;font-size:6pt;padding:2mm 3.5mm;border-radius:6px}}
.ph.blue{{background:linear-gradient(135deg,#3D414A,#14161B)}}
.ph.green{{background:#fff;color:#15171C;border:1.5px solid #15171C}}
.ph svg{{width:12px;height:12px;fill:none;stroke:#fff;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}}
.ph.green svg{{stroke:#15171C}}
.pb{{border:1px solid #DEDEDA;border-top:none;border-radius:0 0 6px 6px;padding:1.5mm 2mm 0.5mm}}
.ir{{display:flex;align-items:center;gap:2.5mm;padding:1mm 0;border-bottom:1px solid #DEDEDA}}
.ir:last-child{{border-bottom:none}}
.ic{{width:8mm;height:8mm;flex:none;display:flex;align-items:center;justify-content:center;background:#F1F1EF;border-radius:50%;color:#3D414A}}
.ic svg{{width:11px;height:11px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}}
.il{{font-size:6pt;color:#70757E}}
.iv{{margin-left:auto;font-size:6.5pt;font-weight:700;color:#15171C;text-align:right}}
.amt{{font-family:'IBM Plex Mono';font-size:7pt;font-weight:700;background:#F1F1EF;padding:0.5mm 2mm;border-radius:3px;border:1px solid #DEDEDA}}
.notes-box{{border:1px dashed #DEDEDA;border-radius:6px;padding:2.5mm 3.5mm;margin-bottom:1.5mm}}
.panel-lbl-plain{{font-family:'Poppins';font-size:7pt;font-weight:600;letter-spacing:1px;color:#70757E;text-transform:uppercase}}
.note-rule{{border-bottom:1px dotted #DEDEDA;margin-top:3mm;min-height:5mm}}
.contact-row{{display:flex;justify-content:center;gap:8mm;padding:2mm;border:1px solid #DEDEDA;border-radius:4px;margin-bottom:2mm;font-size:7pt;font-weight:600;color:#55595F;font-family:'IBM Plex Mono'}}
.footer-strip{{display:flex;align-items:center;gap:2mm;padding-top:3mm;border-top:1px dashed #DEDEDA;margin-top:auto}}
.qr-box img{{width:12mm;height:12mm;border:1px solid #DEDEDA;border-radius:5px;padding:1mm;background:#fff}}
.thanks{{flex:1}}
.thanks-script{{font-family:'Caveat',cursive;font-weight:700;font-size:14pt;color:#14161B;line-height:1}}
.thanks-sub{{font-size:6.5pt;color:#70757E;margin-top:0.5mm}}
.sig-block{{flex:none;width:38mm;text-align:center}}
.sig-script{{font-family:'Caveat',cursive;font-weight:700;font-size:14pt;color:#14161B}}
.sig-rule{{border-bottom:1px solid #15171C;margin-top:5mm}}
.sig-lbl{{font-size:6.5pt;color:#70757E;margin-top:1mm}}
.collected{{text-align:center;font-size:6pt;color:#70757E;font-style:italic;margin-top:2mm}}
.tear{{display:flex;align-items:center;gap:2mm;color:#70757E}}
.tear .dash{{flex:1;border-top:1.5px dashed #C9C9C6}}
.tear span{{font-family:'IBM Plex Mono';font-size:7pt;letter-spacing:3px}}
.btn{{position:fixed;top:14px;right:14px;z-index:99;background:#14161B;color:#fff;border:none;padding:8px 18px;font-family:'Poppins';font-size:10px;font-weight:600;cursor:pointer;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,.18)}}
</style></head><body>
<button class="btn" onclick="window.print()">Print Receipt</button>
<div class="page">
{copy_block("OFFICE")}
<div class="tear"><div class="dash"></div><span>FOLD & TEAR HERE</span><div class="dash"></div></div>
{copy_block("CUSTOMER")}
</div></body></html>"""
    return HTMLResponse(content=html)