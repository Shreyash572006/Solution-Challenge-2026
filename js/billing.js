// ═══════════════════════════════════════════════════════════
// BILLING SYSTEM WITH GST + QR
// ═══════════════════════════════════════════════════════════
const BillingSystem = {
    KEY: null,
    lineItems: [],

    init() {
        this.KEY = 'viq_invoices_' + (Auth.getCurrentUser()?.id || 'guest');
        this.lineItems = [{ product: '', qty: 1, price: 0, gst: 18 }];
        this.renderForm();
        document.getElementById('addBillLineBtn')?.addEventListener('click', () => {
            this.lineItems.push({ product: '', qty: 1, price: 0, gst: 18 });
            this.renderForm();
        });
        document.getElementById('generateBillBtn')?.addEventListener('click', () => this.generateBill());
        this.renderHistory();
    },

    readForm() {
        this.lineItems = [];
        document.querySelectorAll('.bill-line-row').forEach(row => {
            this.lineItems.push({
                product: row.querySelector('.bl-product')?.value || '',
                qty    : parseFloat(row.querySelector('.bl-qty')?.value) || 0,
                price  : parseFloat(row.querySelector('.bl-price')?.value) || 0,
                gst    : parseFloat(row.querySelector('.bl-gst')?.value) || 18
            });
        });
    },

    calcLine(item) {
        const subtotal = item.qty * item.price;
        const gstAmt   = subtotal * item.gst / 100;
        return { subtotal, gstAmt, total: subtotal + gstAmt };
    },

    renderForm() {
        const el = document.getElementById('billLineItems');
        if (!el) return;
        el.innerHTML = this.lineItems.map((item, i) => `
            <div class="bill-line-row" style="display:grid;grid-template-columns:2fr 0.7fr 1fr 0.7fr auto;gap:0.5rem;align-items:center;margin-bottom:0.5rem">
                <input class="form-control bl-product" placeholder="Product / Service" value="${item.product}" style="height:38px">
                <input class="form-control bl-qty" type="number" placeholder="Qty" value="${item.qty}" min="1" style="height:38px">
                <input class="form-control bl-price" type="number" placeholder="Price &#x20B9;" value="${item.price}" step="0.01" style="height:38px">
                <select class="form-control bl-gst" style="height:38px">
                    ${[0,5,12,18,28].map(g => `<option value="${g}" ${g===item.gst?'selected':''}>${g}%</option>`).join('')}
                </select>
                <button onclick="BillingSystem.removeLine(${i})" class="btn btn-danger" style="padding:0.4rem 0.6rem;font-size:0.8rem;height:38px">&#x2715;</button>
            </div>`).join('');
        this.updatePreview();
    },

    removeLine(i) {
        this.readForm();
        this.lineItems.splice(i, 1);
        if (!this.lineItems.length) this.lineItems = [{ product: '', qty: 1, price: 0, gst: 18 }];
        this.renderForm();
    },

    updatePreview() {
        const previewEl = document.getElementById('billPreviewRow');
        if (!previewEl) return;
        this.readForm();
        let subtotal = 0, totalGST = 0;
        this.lineItems.forEach(item => {
            const c = this.calcLine(item);
            subtotal += c.subtotal; totalGST += c.gstAmt;
        });
        previewEl.innerHTML = `
            <div style="display:flex;justify-content:space-between;font-size:0.875rem;padding:0.5rem 0;border-top:1px solid rgba(255,255,255,0.05)"><span>Subtotal</span><strong>&#x20B9;${subtotal.toFixed(2)}</strong></div>
            <div style="display:flex;justify-content:space-between;font-size:0.875rem;padding:0.5rem 0;color:var(--text-muted)"><span>GST</span><strong>&#x20B9;${totalGST.toFixed(2)}</strong></div>
            <div style="display:flex;justify-content:space-between;font-size:1.1rem;font-weight:800;padding:0.75rem 0;border-top:1px solid rgba(255,255,255,0.1)"><span>TOTAL</span><span style="color:#10B981">&#x20B9;${(subtotal+totalGST).toFixed(2)}</span></div>`;
    },

    generateBill() {
        this.readForm();
        const customerName = document.getElementById('billCustomerName')?.value || 'Customer';
        const customerPhone = document.getElementById('billCustomerPhone')?.value || '';
        const upiId         = document.getElementById('billUpiId')?.value || '';
        const user          = Auth.getCurrentUser();

        let subtotal = 0, totalGST = 0;
        this.lineItems.forEach(item => {
            const c = this.calcLine(item); subtotal += c.subtotal; totalGST += c.gstAmt;
        });
        const grandTotal = subtotal + totalGST;
        const invoiceNo  = 'INV-' + Date.now().toString().slice(-6);
        const dateStr    = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

        // Save invoice
        const invoices = JSON.parse(localStorage.getItem(this.KEY) || '[]');
        invoices.unshift({ id: invoiceNo, customer: customerName, phone: customerPhone, total: grandTotal, gst: totalGST, items: this.lineItems, created_at: new Date().toISOString() });
        localStorage.setItem(this.KEY, JSON.stringify(invoices.slice(0, 50)));

        // Generate UPI QR string
        const upiUrl = upiId ? `upi://pay?pa=${upiId}&pn=${encodeURIComponent(user?.shopName||'Shop')}&am=${grandTotal.toFixed(2)}&cu=INR&tn=${invoiceNo}` : '';
        const qrApiUrl = upiUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(upiUrl)}` : '';

        const billHTML = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>${invoiceNo} - VENDRIXA IQ</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box} body{font-family:Arial,sans-serif;color:#222;background:#fff;padding:20px}
  .header{display:flex;justify-content:space-between;align-items:start;border-bottom:2px solid #7C3AED;padding-bottom:16px;margin-bottom:20px}
  .shop-name{font-size:1.6rem;font-weight:900;color:#7C3AED;letter-spacing:-0.05em}
  .inv-no{font-size:0.75rem;color:#666;text-align:right}
  .inv-no span{display:block;font-size:1.1rem;font-weight:700;color:#222}
  .customer-block{display:flex;justify-content:space-between;margin-bottom:20px;font-size:0.85rem}
  .label{color:#888;font-size:0.7rem;text-transform:uppercase}
  table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:0.85rem}
  thead{background:#f0ebff}
  th{padding:8px 10px;text-align:left;font-weight:700;font-size:0.75rem;text-transform:uppercase;color:#7C3AED}
  td{padding:8px 10px;border-bottom:1px solid #f5f5f5}
  .totals{display:flex;justify-content:space-between}
  .totals-table{width:260px;font-size:0.85rem}
  .totals-table td{padding:5px 0;border:none}
  .grand-total{font-size:1.3rem;font-weight:900;color:#7C3AED;border-top:2px solid #7C3AED;padding-top:6px;margin-top:4px}
  .footer{margin-top:24px;font-size:0.7rem;color:#999;text-align:center;border-top:1px solid #eee;padding-top:12px}
  .qr-block{text-align:center}
  .qr-block p{font-size:0.7rem;color:#888;margin-top:4px}
  @media print{body{padding:0}}
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="shop-name">${user?.shopName || 'VENDRIXA IQ'}</div>
      <div style="font-size:0.8rem;color:#666;margin-top:4px">${user?.name || ''}</div>
      <div style="font-size:0.75rem;color:#888">GSTIN: (Add your GSTIN)</div>
    </div>
    <div class="inv-no">
      <div class="label">Invoice Number</div>
      <span>${invoiceNo}</span>
      <div style="margin-top:8px" class="label">Date</div>
      <span style="font-size:0.85rem">${dateStr}</span>
    </div>
  </div>

  <div class="customer-block">
    <div>
      <div class="label">Bill To</div>
      <div style="font-weight:700;font-size:1rem">${customerName}</div>
      ${customerPhone ? `<div style="color:#666">&#x1F4DE; ${customerPhone}</div>` : ''}
    </div>
  </div>

  <table>
    <thead><tr><th>#</th><th>Product / Service</th><th>Qty</th><th>Unit Price</th><th>GST</th><th style="text-align:right">Total</th></tr></thead>
    <tbody>
      ${this.lineItems.map((item, i) => {
        const c = this.calcLine(item);
        return `<tr><td>${i+1}</td><td>${item.product || '—'}</td><td>${item.qty}</td><td>&#x20B9;${item.price.toFixed(2)}</td><td>${item.gst}% (&#x20B9;${c.gstAmt.toFixed(2)})</td><td style="text-align:right;font-weight:600">&#x20B9;${c.total.toFixed(2)}</td></tr>`;
      }).join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="qr-block">
      ${qrApiUrl ? `<img src="${qrApiUrl}" style="border:1px solid #eee;border-radius:8px;display:block"><p>Scan to pay via UPI</p><p style="font-weight:700;font-size:0.75rem">${upiId}</p>` : '<p style="color:#aaa;font-size:0.8rem">Add UPI ID for<br>payment QR code</p>'}
    </div>
    <table class="totals-table">
      <tr><td>Subtotal</td><td style="text-align:right">&#x20B9;${subtotal.toFixed(2)}</td></tr>
      <tr><td>GST</td><td style="text-align:right">&#x20B9;${totalGST.toFixed(2)}</td></tr>
      <tr class="grand-total"><td>GRAND TOTAL</td><td style="text-align:right">&#x20B9;${grandTotal.toFixed(2)}</td></tr>
    </table>
  </div>

  <div class="footer">Thank you for your business! &bull; Generated by VENDRIXA IQ &bull; AI-Powered Business Intelligence</div>
</body></html>`;

        const win = window.open('', '_blank');
        win.document.write(billHTML);
        win.document.close();
        setTimeout(() => { win.focus(); win.print(); }, 700);

        this.renderHistory();
        showToast(`Invoice ${invoiceNo} generated! &#x1F9FE;`, 'success');
    },

    renderHistory() {
        const el = document.getElementById('invoiceHistory');
        if (!el) return;
        const invoices = JSON.parse(localStorage.getItem(this.KEY) || '[]');
        if (!invoices.length) { el.innerHTML = '<p style="color:var(--text-muted)">No invoices generated yet.</p>'; return; }
        el.innerHTML = `<div class="table-container"><table>
            <thead><tr><th>Invoice #</th><th>Customer</th><th>Items</th><th>GST</th><th>Total</th><th>Date</th></tr></thead>
            <tbody>${invoices.slice(0, 20).map(inv => `<tr>
                <td style="color:var(--primary-light);font-weight:700">${inv.id}</td>
                <td>${inv.customer}</td>
                <td>${inv.items?.length || 0} items</td>
                <td style="color:var(--text-muted)">&#x20B9;${(inv.gst||0).toFixed(2)}</td>
                <td style="color:#10B981;font-weight:700">&#x20B9;${inv.total.toFixed(2)}</td>
                <td style="color:var(--text-muted);font-size:0.8rem">${new Date(inv.created_at).toLocaleDateString('en-IN')}</td>
            </tr>`).join('')}</tbody>
        </table></div>`;
    }
};
window.BillingSystem = BillingSystem;
