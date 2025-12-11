
// ========================================
// TABLE RENDERING FUNCTIONS
// ========================================


const tbody = document.getElementById('invoice-table-body');

if (filtered.length === 0) {
tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#999">No invoices found</td></tr>';
return;
}

tbody.innerHTML = filtered.map(inv => {
const status = getInvoicePaymentStatus(inv.id);
const statusBadge = status.status === 'paid' ? 
'<span class="status-badge paid">PAID</span>' : 
status.status === 'partial' ? 
'<span class="status-badge partial">PARTIAL</span>' : 
'<span class="status-badge pending">PENDING</span>';

const hasPhone = inv.toPhone || customers.find(c => c.name.toLowerCase() === inv.toName.toLowerCase())?.phone;

return `
<tr>
<td><strong>${inv.number}</strong></td>
<td>${formatDate(inv.date)}</td>
<td>${inv.toName}</td>
<td>R${inv.total.toFixed(2)}</td>
<td>${statusBadge}</td>
<td>
<div class="action-buttons">
<button class="btn btn-primary btn-icon" onclick="previewInvoice(${inv.id})" title="Preview">👁️</button>
<button class="btn btn-success btn-icon" onclick="duplicateInvoice(${inv.id})" title="Duplicate">📋</button>
${hasPhone ? `<button class="btn btn-whatsapp btn-icon" onclick="sendInvoiceWhatsApp(${inv.id})" title="WhatsApp">📱</button>` : ''}
<button class="btn btn-danger btn-icon" onclick="deleteInvoice(${inv.id})" title="Delete">🗑️</button>
</div>
</td>
</tr>
`;
}).join('');
}

function renderQuotationTable() {
const search = document.getElementById('quotation-search')?.value.toLowerCase() || '';
const filterFrom = document.getElementById('quotation-filter-from')?.value || '';
const filterTo = document.getElementById('quotation-filter-to')?.value || '';
const filterStatus = document.getElementById('quotation-filter-status')?.value || 'all';

let filtered = quotations.filter(q => {
const matchesSearch = q.toName.toLowerCase().includes(search) || 
q.number.toLowerCase().includes(search);

const matchesDate = (!filterFrom || r.date >= filterFrom) && 
(!filterTo || r.date <= filterTo);

const matchesMethod = filterMethod === 'all' || r.paymentMethod === filterMethod;

return matchesSearch && matchesDate && matchesMethod;
});

const tbody = document.getElementById('receipt-table-body');

if (filtered.length === 0) {
tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#999">No receipts found</td></tr>';
return;
}

tbody.innerHTML = filtered.map(r => {
const hasPhone = r.toPhone || customers.find(c => c.name.toLowerCase() === r.toName.toLowerCase())?.phone;

// Check if linked invoice/quotation is fully paid
let showClearButton = false;
if (r.linkedInvoiceId) {
const invStatus = getInvoicePaymentStatus(r.linkedInvoiceId);
showClearButton = invStatus.status === 'paid';
} else if (r.linkedQuotationId) {
const quoStatus = getQuotationPaymentStatus(r.linkedQuotationId);
showClearButton = quoStatus.isPaid;
}

return `
<tr>
<td><strong>${r.number}</strong></td>
<td>${formatDate(r.date)}</td>
<td>${r.toName}</td>
<td style="color:#10b981;font-weight:bold">R${(r.amountPaid || r.total).toFixed(2)}</td>
<td>${r.paymentMethod || 'Cash'}</td>
<td>
<div class="action-buttons">
<button class="btn btn-primary btn-icon" onclick="previewReceipt(${r.id})" title="Preview">👁️</button>
${hasPhone ? `<button class="btn btn-whatsapp btn-icon" onclick="sendReceiptWhatsApp(${r.id})" title="WhatsApp">📱</button>` : ''}

<button class="btn btn-danger btn-icon" onclick="deleteReceipt(${r.id})" title="Delete">🗑️</button>
</div>
</td>
</tr>
`;
}).join('');
}

// Updated duplicate functions for all document types
function duplicateInvoice(id) {
const inv = invoices.find(i => i.id === id);
if (!inv) return;

showInvoiceForm();

document.getElementById('inv-to-name').value = inv.toName;
document.getElementById('inv-to-phone').value = inv.toPhone || '';
document.getElementById('inv-to-address').value = inv.toAddress || '';
document.getElementById('inv-date').valueAsDate = new Date();
document.getElementById('inv-due-date').value = getEndOfMonth(new Date().toISOString().split('T')[0]);
document.getElementById('inv-notes').value = inv.notes || '';

const nextNum = getNextInvoiceNumberForCustomer(inv.toName) || getNextGlobalInvoiceNumber();
document.getElementById('inv-number').value = nextNum;

const container = document.getElementById('invoice-items');
container.innerHTML = '';
inv.items.forEach(item => {
const row = createItemRowWithData(item);
container.appendChild(row);
setupItemCalculation(row);
});
if (!isFullyPaid) {
showToast('Can only clear receipts for fully paid invoices', 'warning');
return;
}

showDeletePopup('Clear this receipt? The linked invoice is fully paid.', async () => {
receipts = receipts.filter(r => r.id !== id);
await saveToIndexedDB('receipts', receipts);
renderReceiptTable();
renderInvoiceTable();
updateDashboard();
showToast('Receipt cleared successfully');
});
}

// Updated switchTab to work with removed tabs
function switchTab(tab) {
document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

const navLink = document.querySelector('[onclick="switchTab(\'' + tab + '\')"]');
if (navLink) navLink.classList.add('active');

const tabContent = document.getElementById(tab + '-tab');
if (tabContent) tabContent.classList.add('active');

document.getElementById('sidebar').classList.remove('open');

if (tab === 'dashboard') {
updateDashboard();
} else if (tab === 'receipt') {
updatePendingInvoiceDropdown();
updatePendingQuotationDropdown();
renderReceiptTable();
} else if (tab === 'invoice') {
renderInvoiceTable();
} else if (tab === 'quotation') {
renderQuotationTable();
} else if (tab === 'payslip') {
renderPayslipTable();
} else if (tab === 'customers') {
renderCustomerTable();
} else if (tab === 'settings') {
updateCompanyInfoPreview();
}
}
