
// ========================================
// BANK ACCOUNT FUNCTIONS
// ========================================
async function addBankAccount() {
const bn = document.getElementById('bank-name').value.trim();
const an = document.getElementById('bank-account-number').value.trim();
if (!bn || !an) {
showToast('Required fields missing', 'warning');
return;
}
bankAccounts.push({
id: Date.now(),
bankName: bn,
}

async function deleteBankAccount(id) {
showDeletePopup('Delete this bank account?', async () => {
bankAccounts = bankAccounts.filter(b => b.id !== id);
await saveToIndexedDB('bankAccounts', bankAccounts);
renderBankAccounts();
renderInvoiceBankPreview();
showToast('Deleted');
});
}

function renderBankAccounts() {
const list = document.getElementById('bank-accounts-list');
if (bankAccounts.length === 0) {
list.innerHTML = '<p style="color:#666;text-align:center">No bank accounts.</p>';
return;
}
list.innerHTML = bankAccounts.map(a => '<div class="bank-account-item"><div class="bank-account-info"><h5>' + a.bankName + '</h5><p>' + a.accountNumber + '</p></div><button class="btn btn-danger btn-small" onclick="deleteBankAccount(' + a.id + ')">🗑️</button></div>').join('');
}

function renderInvoiceBankPreview() {
const c = document.getElementById('invoice-bank-list');
if (bankAccounts.length === 0) {
c.innerHTML = '<p style="color:#999">No bank accounts. Add in Settings.</p>';
return;
}
c.innerHTML = bankAccounts.map(a => '<div class="bank-detail-card"><h5>' + a.bankName + '</h5>' + (a.accountName ? '<p><strong>Account:</strong> ' + a.accountName + '</p>' : '') + '<p><strong>Number:</strong> ' + a.accountNumber + '</p>' + (a.branchCode ? '<p><strong>Branch:</strong> ' + a.branchCode + '</p>' : '') + '</div>').join('');
}

// ========================================
// CUSTOMER MANAGEMENT FUNCTIONS
// ========================================
if (existing) {
existing.phone = phone || existing.phone;
existing.address = address || existing.address;
showToast('Customer updated!');
} else {
customers.push({
id: Date.now(),
name,
phone,
address,
createdDate: new Date().toISOString()
});
showToast('Customer added!');
}
await saveToIndexedDB('customers', customers);
document.getElementById('new-customer-name').value = '';
document.getElementById('new-customer-phone').value = '';
document.getElementById('new-customer-address').value = '';
renderCustomerTable();
hideCustomerForm();
}

async function saveCustomer(name, phone, address) {
if (!name) return;
const existing = customers.find(c => c.name.toLowerCase() === name.toLowerCase());
if (existing) {
existing.phone = phone || existing.phone;
existing.address = address || existing.address;
} else {
customers.push({
id: Date.now(),
name,
phone,
address,
createdDate: new Date().toISOString()
});
}
await saveToIndexedDB('customers', customers);
}

async function deleteCustomer(id) {
showDeletePopup('Delete this customer?', async () => {
customers = customers.filter(c => c.id !== id);
await saveToIndexedDB('customers', customers);
renderCustomerTable();
showToast('Customer deleted');
});
}