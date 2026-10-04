// ---- TODO: fill these in after you create your Supabase project ----
// Project settings > API > Project URL / anon public key.
// The anon key is safe to expose in client-side code as long as the
// "products" table only has a public SELECT policy (see supabase/schema.sql).
const SUPABASE_URL = 'https://wopuzwtnmmlsqhbqsgzw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_01fUirJj6DOvUG9s6iIWXQ_KPW8fVI0';
// ----------------------------------------------------------------------

// Decided values, carried over from the real plan (not placeholders):
const MARKET_CONFIG = {
  sr: { label: 'Suriname', taxRate: 0.10, gateway: 'Suriname gateway (placeholder)' },
  gy: { label: 'Guyana', taxRate: 0.14, gateway: 'Guyana gateway (placeholder)' },
};

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let market = null;       // 'sr' | 'gy'
let products = [];       // fetched once per market session
let cart = {};           // { productId: qty }

const $ = (sel) => document.querySelector(sel);

function fmt(n) {
  return '$' + Number(n).toFixed(2);
}

async function chooseMarket(code) {
  market = code;
  sessionStorage.setItem('market', code);
  $('#landing').style.display = 'none';
  $('#store').style.display = 'block';
  $('#confirmation').style.display = 'none';
  cart = {};
  renderStoreHeader();
  await loadProducts();
  renderCatalog();
  renderCart();
}

function switchMarket() {
  const hasItems = Object.keys(cart).length > 0;
  if (hasItems) {
    const ok = confirm('Switching markets clears your cart, since tax and payment are tied to one market per order. Continue?');
    if (!ok) return;
  }
  market = null;
  sessionStorage.removeItem('market');
  $('#store').style.display = 'none';
  $('#confirmation').style.display = 'none';
  $('#landing').style.display = 'block';
}

function renderStoreHeader() {
  const cfg = MARKET_CONFIG[market];
  $('#current-market-label').textContent = cfg.label;
  $('#current-market-label').className = 'market-script ' + market;
}

async function loadProducts() {
  const { data, error } = await client
    .from('products')
    .select('id, sku, name, price_sr, price_gy, stock_sr, stock_gy');
  if (error) {
    $('#catalog').innerHTML = '<p style="color:#A32D2D">Could not load products: ' + error.message + '</p>';
    products = [];
    return;
  }
  products = data || [];
}

function priceFor(p) { return market === 'sr' ? p.price_sr : p.price_gy; }
function stockFor(p) { return market === 'sr' ? p.stock_sr : p.stock_gy; }

function renderCatalog() {
  const el = $('#catalog');
  el.innerHTML = '';
  products.forEach((p) => {
    const stock = stockFor(p);
    const inStock = stock > 0;
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <h3>${p.name}</h3>
      <p class="sku">SKU ${p.sku}</p>
      <p class="price">${fmt(priceFor(p))}</p>
      <p class="stock ${inStock ? 'ok' : 'out'}">${inStock ? stock + ' in stock' : 'Out of stock in ' + MARKET_CONFIG[market].label}</p>
      <button class="add-btn ${market}" ${inStock ? '' : 'disabled'} data-id="${p.id}">
        ${inStock ? 'Add to cart' : 'Unavailable'}
      </button>
    `;
    card.querySelector('button').addEventListener('click', () => addToCart(p.id));
    el.appendChild(card);
  });
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
  renderCatalog();
}

function removeFromCart(id) {
  delete cart[id];
  renderCart();
  renderCatalog();
}

function renderCart() {
  const el = $('#cart-items');
  const ids = Object.keys(cart);
  if (ids.length === 0) {
    el.innerHTML = '<p class="cart-empty">No items yet.</p>';
    $('#cart-totals').innerHTML = '';
    $('#pay-btn').disabled = true;
    return;
  }
  el.innerHTML = '';
  let subtotal = 0;
  ids.forEach((id) => {
    const p = products.find((x) => String(x.id) === String(id));
    const qty = cart[id];
    const lineTotal = priceFor(p) * qty;
    subtotal += lineTotal;
    const row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML = `<span>${p.name} &times; ${qty}</span><span>${fmt(lineTotal)} <button class="switch-link" data-remove="${id}">remove</button></span>`;
    row.querySelector('[data-remove]').addEventListener('click', () => removeFromCart(id));
    el.appendChild(row);
  });

  const cfg = MARKET_CONFIG[market];
  const tax = subtotal * cfg.taxRate;
  const total = subtotal + tax;
  $('#cart-totals').innerHTML = `
    <div class="line"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
    <div class="line"><span>Tax (${cfg.label}, ${(cfg.taxRate * 100).toFixed(0)}%)</span><span>${fmt(tax)}</span></div>
    <div class="line grand"><span>Total</span><span>${fmt(total)}</span></div>
  `;
  $('#gateway-note').textContent = 'Paying via: ' + cfg.gateway;
  $('#pay-btn').disabled = false;
  $('#pay-btn').className = 'pay-btn ' + market;
  $('#pay-btn').dataset.total = total.toFixed(2);
}

function payNow() {
  const cfg = MARKET_CONFIG[market];
  const orderId = 'DEMO-' + Date.now().toString().slice(-6);
  $('#confirmation .order-id').textContent = orderId;
  $('#confirmation .order-market').textContent = cfg.label;
  $('#confirmation .order-total').textContent = fmt($('#pay-btn').dataset.total);
  $('#confirmation .order-gateway').textContent = cfg.gateway;
  $('#store').style.display = 'none';
  $('#confirmation').style.display = 'block';
}

function startNewOrder() {
  cart = {};
  $('#confirmation').style.display = 'none';
  $('#store').style.display = 'block';
  renderCart();
}

document.addEventListener('DOMContentLoaded', () => {
  $('#choose-sr').addEventListener('click', () => chooseMarket('sr'));
  $('#choose-gy').addEventListener('click', () => chooseMarket('gy'));
  $('#switch-market').addEventListener('click', switchMarket);
  $('#pay-btn').addEventListener('click', payNow);
  $('#new-order-btn').addEventListener('click', startNewOrder);
});
