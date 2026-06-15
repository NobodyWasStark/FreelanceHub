//  SIDEBAR 
function openSidebar() {
  document.getElementById("sidebar").classList.add("open");
  document.getElementById("mobile-overlay").classList.add("show");
}
function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("mobile-overlay").classList.remove("show");
}
//  PHOTO PREVIEW 
function previewPhoto(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    showToast("Image must be under 2MB.", false); return;
  }
  const reader = new FileReader();
  reader.onload = ev => {
    document.getElementById("profile-photo").src = ev.target.result;
    showToast("Profile photo updated!");
  };
  reader.readAsDataURL(file);
}
//  PAYMENT METHODS 
let payments = [
  { id: 1, type: "visa", last4: "4242", expiry: "12/26", primary: true, name: "Sarah Jenkins" }
];
let pendingRemoveId = null;

function getCardSVG(type) {
  if (type === "visa") return `<svg viewBox="0 0 38 24" width="42" height="26" xmlns="http://www.w3.org/2000/svg"><rect width="38" height="24" rx="4" fill="#1a1f71"/><path d="M14.5 7.5l-2 9h-2l2-9h2zm4.8 5.9c.8-.4 1.2-.8 1.2-1.4 0-.9-.8-1.5-2.1-1.5-1 0-1.8.2-2.3.5l.3 1.4c.4-.2 1-.4 1.7-.4.7 0 1 .3 1 .6 0 .4-.5.7-1.3.9-.9.3-2 .8-2 2 0 1 .8 1.6 2 1.6.8 0 1.5-.3 2-.6l.2.5H22l-1.5-6.7-.2 2.1zm1.2-3.4l-1.6 7.5h-1.9l1.6-7.5h1.9zm5.9 0h1.8l-2 7.5h-1.7l-.3-1c-.4.5-1 .9-1.8.9-1.4 0-2.4-1-2.4-2.8 0-2.4 1.6-4.7 4-4.7.8 0 1.4.3 1.8.7l.6-0.6zm-1.4 5.6c.4-.8.7-1.7.7-2.4 0-.7-.3-1.1-1-1.1-1.2 0-2 1.5-2 2.9 0 .8.4 1.4 1.1 1.4.6 0 1-.4 1.2-.8z" fill="white"/></svg>`;
  if (type === "mastercard") return `<svg viewBox="0 0 38 24" width="42" height="26" xmlns="http://www.w3.org/2000/svg"><rect width="38" height="24" rx="4" fill="#252525"/><circle cx="15" cy="12" r="7" fill="#EB001B"/><circle cx="23" cy="12" r="7" fill="#F79E1B"/><path d="M19 7.3a7 7 0 0 1 0 9.4A7 7 0 0 1 19 7.3z" fill="#FF5F00"/></svg>`;
  return `<svg viewBox="0 0 38 24" width="42" height="26" xmlns="http://www.w3.org/2000/svg"><rect width="38" height="24" rx="4" fill="#2E77BC"/><text x="4" y="16" font-size="10" font-weight="bold" fill="white" font-family="Arial">AMEX</text></svg>`;
}

function getCardLabel(type) {
  return { visa:"Visa", mastercard:"Mastercard", amex:"American Express" }[type] || type;
}

function renderPayments() {
  const list = document.getElementById("payment-list");
  const empty = document.getElementById("payment-empty");
  list.innerHTML = "";
  if (payments.length === 0) {
    empty.classList.remove("hidden"); return;
  }
  empty.classList.add("hidden");
  payments.forEach(p => {
    const row = document.createElement("div");
    row.className = "payment-row flex items-center gap-4 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5";
    row.dataset.id = p.id;
    row.innerHTML = `
      <div class="shrink-0">${getCardSVG(p.type)}</div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-gray-900">${getCardLabel(p.type)} ending in ${p.last4}</p>
        <p class="text-xs text-gray-400 mt-0.5">Expires ${p.expiry}${p.primary ? " <span class='text-green-600 font-semibold'>• Primary Method</span>" : ""}</p>
      </div>
      ${p.primary ? "" : `<button onclick="setPrimary(${p.id})" class="text-xs font-semibold text-gray-500 hover:text-green-700 transition px-2 py-1">Set Primary</button>`}
      <button onclick="promptRemove(${p.id})" class="text-xs font-bold text-red-500 hover:text-red-600 transition px-2 py-1">Remove</button>
    `;
    list.appendChild(row);
  });

  function setPrimary(id) {
  payments = payments.map(p => ({ ...p, primary: p.id === id }));
  renderPayments();
  showToast("Primary payment method updated!");
}

function promptRemove(id) {
  pendingRemoveId = id;
  document.getElementById("confirm-overlay").classList.remove("hidden");
}
function cancelRemove() {
  pendingRemoveId = null;
  document.getElementById("confirm-overlay").classList.add("hidden");
}
}
function confirmRemove() {
  if (!pendingRemoveId) return;
  const wasPrimary = payments.find(p => p.id === pendingRemoveId)?.primary;
  payments = payments.filter(p => p.id !== pendingRemoveId);
  if (wasPrimary && payments.length > 0) payments[0].primary = true;
  pendingRemoveId = null;
  document.getElementById("confirm-overlay").classList.add("hidden");
  renderPayments();
  showToast("Payment method removed.");
}
// ADD PAYMENT MODAL 
function openAddPayment() {
  document.getElementById("add-payment-modal").classList.remove("modal-hidden");
  document.getElementById("add-payment-modal").classList.add("modal-visible");
  document.getElementById("card-name").value = "";
  document.getElementById("card-number").value = "";
  document.getElementById("card-expiry").value = "";
  document.getElementById("card-cvv").value = "";
  document.getElementById("card-primary").checked = payments.length === 0;
  document.querySelector('input[name="card-type"][value="visa"]').checked = true;
}
function closeAddPayment() {
  document.getElementById("add-payment-modal").classList.remove("modal-visible");
  document.getElementById("add-payment-modal").classList.add("modal-hidden");
}

function formatCardNumber(input) {
  let v = input.value.replace(/\D/g, "").slice(0, 16);
  input.value = v.replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(input) {
  let v = input.value.replace(/\D/g, "").slice(0, 4);
  if (v.length > 2) v = v.slice(0,2) + "/" + v.slice(2);
  input.value = v;
}

function addPaymentMethod() {
  const name   = document.getElementById("card-name").value.trim();
  const num    = document.getElementById("card-number").value.replace(/\s/g,"");
  const expiry = document.getElementById("card-expiry").value.trim();
  const cvv    = document.getElementById("card-cvv").value.trim();
  const type   = document.querySelector('input[name="card-type"]:checked')?.value || "visa";
  const primary = document.getElementById("card-primary").checked;

  if (!name)               { showToast("Please enter the cardholder name.", false); return; }
  if (num.length < 13)     { showToast("Please enter a valid card number.", false); return; }
  if (!/^\d{2}\/\d{2}$/.test(expiry)) { showToast("Please enter a valid expiry date (MM/YY).", false); return; }
  if (cvv.length < 3)      { showToast("Please enter a valid CVV.", false); return; }

  if (primary) payments = payments.map(p => ({ ...p, primary: false }));

  const newId = Date.now();
  payments.push({ id: newId, type, last4: num.slice(-4), expiry, primary: primary || payments.length === 0, name });
  closeAddPayment();
  renderPayments();
  showToast("Payment method added!");
}
//  SAVE CHANGES 
function saveChanges() { showToast("Changes saved successfully!"); }

//  TOAST 
let toastTimer = null;
function showToast(msg, success = true) {
  clearTimeout(toastTimer);
  const toast = document.getElementById("toast");
  const icon  = document.getElementById("toast-icon");
  document.getElementById("toast-text").textContent = msg;
  icon.className = `w-5 h-5 shrink-0 ${success ? "text-green-400" : "text-red-400"}`;
  icon.innerHTML = success
    ? `<path d="M20 6L9 17l-5-5"/>`
    : `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`;
  toast.classList.remove("hide");
  toast.classList.add("show");
  toastTimer = setTimeout(() => { toast.classList.remove("show"); toast.classList.add("hide"); }, 3200);
}

//  INIT 
renderPayments();