// ========================================
// 23. INITIALIZATION & EVENT LISTENERS
// ========================================
async function init() {
await initDB();
await loadAllData();

addQuotationItem(); 
updatePendingInvoiceDropdown(); 
updatePendingQuotationDropdown(); 
renderAll(); 
updateDashboard(); 
}

document.getElementById('logo-upload-input').addEventListener('change', async function(e) { 
const file = e.target.files[0]; 
if (file) { 
const reader = new FileReader(); 
reader.onload = async function(ev) { 
companySettings.logo = ev.target.result; 
await saveToIndexedDB('settings', { key: 'companySettings', value: companySettings });
document.getElementById('logo-preview-content').innerHTML = '<img src="' + companySettings.logo + '" alt="Logo">'; 
}; 
reader.readAsDataURL(file); 
} 
});

});

document.getElementById('customer-search-overlay').addEventListener('click', function(e) { 
if (e.target === this) { 
closeCustomerSearchModal(); 
} 
});

window.addEventListener('load', async function() { 
document.getElementById('app-container').style.display = 'flex'; 
await init();
initOCREventListeners();
});