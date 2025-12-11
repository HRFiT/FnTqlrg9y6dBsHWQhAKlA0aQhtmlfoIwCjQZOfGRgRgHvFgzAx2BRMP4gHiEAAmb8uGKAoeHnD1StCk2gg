
// ========================================
// BACKUP & RESTORE FUNCTIONS
// ========================================
function downloadBackup() {
const backupData = {
version: '1.0',
exportDate: new Date().toISOString(),
data: { invoices, quotations, receipts, payslips, customers, bankAccounts, companySettings }
};
const dataStr = JSON.stringify(backupData, null, 2);
const blob = new Blob([dataStr], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'DocGenPro_Backup_' + new Date().toISOString().split('T')[0] + '.json';
document.body.appendChild(a);
a.click();
setTimeout(() => {
document.body.removeChild(a);
URL.revokeObjectURL(url);
}, 100);
showToast('Backup downloaded successfully!');
}

function triggerRestoreUpload() {
document.getElementById('restore-file-input').click();
}

async function restoreBackup(event) {
const file = event.target.files[0];
if (!file) return;
const reader = new FileReader();
reader.onload = async function(e) {
try {
const backupData = JSON.parse(e.target.result);
if (!backupData.data) {
showToast('Invalid backup file', 'error');
return;
}
showDeletePopup('This will replace ALL current data. Continue?', async () => {
invoices = backupData.data.invoices || [];
quotations = backupData.data.quotations || [];
receipts = backupData.data.receipts || [];
payslips = backupData.data.payslips || [];
customers = backupData.data.customers || [];
bankAccounts = backupData.data.bankAccounts || [];
companySettings = backupData.data.companySettings || {};

await saveToIndexedDB('invoices', invoices);
await saveToIndexedDB('quotations', quotations);
await saveToIndexedDB('receipts', receipts);
await saveToIndexedDB('payslips', payslips);
await saveToIndexedDB('customers', customers);
await saveToIndexedDB('bankAccounts', bankAccounts);
await saveToIndexedDB('settings', { key: 'companySettings', value: companySettings });

loadCompanySettings();
renderBankAccounts();
renderInvoiceBankPreview();
renderAll();
updateDashboard();
showToast('Data restored successfully!');
});
} catch (err) {
showToast('Error reading backup file', 'error');
console.error(err);
}
};
reader.readAsText(file);
event.target.value = '';
}

// ========================================
// COMPANY SETTINGS FUNCTIONS
// ========================================
function loadCompanySettings() {
document.getElementById('settings-company-name').value = companySettings.name || '';
document.getElementById('settings-company-address').value = companySettings.address || '';
document.getElementById('settings-company-email').value = companySettings.email || '';
document.getElementById('settings-company-phone').value = companySettings.phone || '';
document.getElementById('settings-company-whatsapp').value = companySettings.whatsapp || '';
document.getElementById('settings-company-website').value = companySettings.website || '';
document.getElementById('settings-company-registration').value = companySettings.registration || '';
if (companySettings.logo) document.getElementById('logo-preview-content').innerHTML = '<img src="' + companySettings.logo + '" alt="Logo">';
updateCompanyInfoPreview();
}

async function saveCompanySettings() {
companySettings.name = document.getElementById('settings-company-name').value;
companySettings.address = document.getElementById('settings-company-address').value;
companySettings.email = document.getElementById('settings-company-email').value;
companySettings.phone = document.getElementById('settings-company-phone').value;
companySettings.whatsapp = document.getElementById('settings-company-whatsapp').value;
companySettings.website = document.getElementById('settings-company-website').value;
companySettings.registration = document.getElementById('settings-company-registration').value;
await saveToIndexedDB('settings', { key: 'companySettings', value: companySettings });
updateCompanyInfoPreview();

document.getElementById('inv-number').value = getNextGlobalInvoiceNumber();
document.getElementById('quo-number').value = getNextGlobalQuotationNumber();

showToast('Settings saved! Invoice numbering updated.');
}

function updateCompanyInfoPreview() {
const container = document.getElementById('company-info-preview');
const content = document.getElementById('company-info-content');
const hasInfo = companySettings.name || companySettings.address || companySettings.email || companySettings.phone || companySettings.website;
if (!hasInfo) {
container.style.display = 'none';
return;
}
let html = '';
if (companySettings.name) html += '<div class="contact-info-item"><span class="icon">🏪</span><div class="info"><div class="info-label">Company Name</div><div class="info-value">' + companySettings.name + '</div></div></div>';
if (companySettings.address) html += '<div class="contact-info-item"><span class="icon">📍</span><div class="info"><div class="info-label">Address</div><div class="info-value">' + companySettings.address + '</div></div></div>';
if (companySettings.email) html += '<div class="contact-info-item"><span class="icon">📧</span><div class="info"><div class="info-label">Email</div><div class="info-value">' + companySettings.email + '</div></div></div>';
if (companySettings.phone) html += '<div class="contact-info-item"><span class="icon">📞</span><div class="info"><div class="info-label">Phone</div><div class="info-value">' + companySettings.phone + '</div></div></div>';
if (companySettings.whatsapp) html += '<div class="contact-info-item"><span class="icon">💬</span><div class="info"><div class="info-label">WhatsApp</div><div class="info-value">' + companySettings.whatsapp + '</div></div></div>';
if (companySettings.website) html += '<div class="contact-info-item"><span class="icon">🌐</span><div class="info"><div class="info-label">Website</div><div class="info-value">' + companySettings.website + '</div></div></div>';
if (companySettings.registration) html += '<div class="contact-info-item"><span class="icon">🔢</span><div class="info"><div class="info-label">Reg/VAT Number</div><div class="info-value">' + companySettings.registration + '</div></div></div>';
content.innerHTML = html;
container.style.display = 'block';
}

async function clearLogo() {
companySettings.logo = null;
await saveToIndexedDB('settings', { key: 'companySettings', value: companySettings });
document.getElementById('logo-preview-content').innerHTML = '<div class="logo-preview-text">📷 Upload Logo</div>';
showToast('Logo removed');
}