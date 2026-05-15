function toggleConsent() {
        var cb = document.getElementById('f-consent');
        var box = document.getElementById('consent-box');
        var check = document.getElementById('consent-check');
        var wrap = document.getElementById('consent-wrap');
        var err = document.getElementById('consent-error');
        cb.checked = !cb.checked;
        if (cb.checked) {
          box.style.background = 'var(--forest)';
          box.style.borderColor = 'var(--forest)';
          check.style.display = 'block';
          wrap.style.borderColor = 'var(--forest)';
          wrap.style.background = 'var(--forest-faint)';
          err.style.display = 'none';
        } else {
          box.style.background = '#fff';
          box.style.borderColor = 'var(--sand-mid)';
          check.style.display = 'none';
          wrap.style.borderColor = 'var(--sand-mid)';
          wrap.style.background = 'var(--cream)';
        }
      }

// ===== ИЗОБРАЖЕНИЯ: фоллбэк =====
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('img').forEach(function(img) {
    img.onerror = function() {
      this.style.display = 'none';
      var ph = document.createElement('div');
      ph.style.cssText = 'width:100%;height:100%;background:linear-gradient(135deg,#EBF1FC,#BDD0F0);display:flex;align-items:center;justify-content:center;font-size:40px;';
      ph.textContent = '🐾';
      if (this.parentNode) this.parentNode.appendChild(ph);
    };
  });

  applyCustomServices();
  initPriceEditorData();
  applyCustomPrices();
  buildPriceCards();
});

// ===== ОТЗЫВЫ =====
var PRICE_STORAGE_KEY = 'vet_drug_price_overrides_v1';
var CUSTOM_SERVICES_KEY = 'vet_drug_custom_services_v1';

function getPriceOverrides() {
  try { return JSON.parse(localStorage.getItem(PRICE_STORAGE_KEY) || '{}'); } catch(e) { return {}; }
}
function savePriceOverrides(obj) {
  try { localStorage.setItem(PRICE_STORAGE_KEY, JSON.stringify(obj)); } catch(e) {}
}
function getCustomServices() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_SERVICES_KEY) || '[]'); } catch(e) { return []; }
}
function saveCustomServices(arr) {
  try { localStorage.setItem(CUSTOM_SERVICES_KEY, JSON.stringify(arr)); } catch(e) {}
}
function formatPriceInput(value) {
  var raw = String(value || '').trim();
  if (!raw) return '—';
  if (raw === '—') return raw;
  var digits = raw.replace(/[^0-9]/g, '');
  if (!digits) return raw;
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
}
function getPriceCellStyle() {
  return "text-align:right;padding-right:24px;font-weight:600;color:var(--forest);font-family:'Cormorant Garamond',serif;font-size:18px;";
}
function clearCustomServiceRows() {
  document.querySelectorAll('tr[data-custom-service-id]').forEach(function(row) { row.remove(); });
}
function createCustomServiceRow(service) {
  var row = document.createElement('tr');
  row.setAttribute('data-custom-service-id', service.id);

  var name = document.createElement('td');
  name.textContent = service.name || '';
  row.appendChild(name);

  var price = document.createElement('td');
  price.setAttribute('style', getPriceCellStyle());
  price.textContent = service.price || '—';
  row.appendChild(price);

  if (service.price2) {
    var price2 = document.createElement('td');
    price2.setAttribute('style', getPriceCellStyle());
    price2.textContent = service.price2;
    row.appendChild(price2);
  }
  return row;
}
function applyCustomServices() {
  clearCustomServiceRows();
  getCustomServices().forEach(function(service) {
    var category = document.getElementById('price-' + service.categoryId);
    var tbody = category ? category.querySelector('tbody') : null;
    if (tbody) tbody.appendChild(createCustomServiceRow(service));
  });
}
function initPriceEditorData() {
  document.querySelectorAll('.price-category').forEach(function(category) {
    var categoryId = category.id.replace('price-', '');
    category.querySelectorAll('tbody tr').forEach(function(row, rowIndex) {
      var cells = row.querySelectorAll('td');
      if (cells.length < 2 || cells[0].hasAttribute('colspan')) return;
      cells.forEach(function(cell, cellIndex) {
        if (cellIndex === 0) return;
        cell.setAttribute('data-price-key', categoryId + '-' + rowIndex + '-' + cellIndex);
      });
    });
  });
}
function applyCustomPrices() {
  var overrides = getPriceOverrides();
  document.querySelectorAll('[data-price-key]').forEach(function(cell) {
    var key = cell.getAttribute('data-price-key');
    if (Object.prototype.hasOwnProperty.call(overrides, key)) cell.textContent = overrides[key];
  });
}
function buildPriceCards() {
  document.querySelectorAll('.price-table-wrap').forEach(function(wrap) {
    var oldCards = wrap.querySelector('.price-cards');
    if (oldCards) oldCards.remove();
    var rows = wrap.querySelectorAll('tbody tr');
    var cards = document.createElement('div');
    cards.className = 'price-cards';
    rows.forEach(function(row) {
      var cells = row.querySelectorAll('td');
      if (cells.length === 1 || cells[0].hasAttribute('colspan')) {
        var hd = document.createElement('div');
        hd.style.cssText = 'background:var(--forest-faint);font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:var(--forest-light);padding:8px 12px;border-radius:8px;margin-top:8px;';
        hd.textContent = cells[0].textContent;
        cards.appendChild(hd);
      } else if (cells.length >= 2) {
        var card = document.createElement('div');
        card.className = 'price-card-row';
        var name = document.createElement('div');
        name.className = 'price-card-row-name';
        name.textContent = cells[0].textContent;
        var price = document.createElement('div');
        price.className = 'price-card-row-price';
        var lastCell = cells[cells.length - 1];
        var priceText = lastCell.textContent.trim();
        price.textContent = priceText === '—' ? cells[1].textContent.trim() : priceText;
        card.appendChild(name);
        card.appendChild(price);
        cards.appendChild(card);
      }
    });
    wrap.appendChild(cards);
  });
}
function getPriceCategoryName(category) {
  var id = category.id.replace('price-', '');
  var btn = document.querySelector('.price-tab[onclick*="' + id + '"]');
  return btn ? btn.textContent.trim() : id;
}
function renderAdminPriceEditor() {
  var el = document.getElementById('adminPricesList');
  if (!el) return;
  if (!isAdmin()) { el.innerHTML = '<p style="color:var(--text-muted);">Редактирование доступно только администратору.</p>'; return; }
  var html = '';
  document.querySelectorAll('.price-category').forEach(function(category) {
    var categoryId = category.id.replace('price-', '');
    var addedCount = category.querySelectorAll('tr[data-custom-service-id]').length;
    var rowsHtml = '';
    category.querySelectorAll('tbody tr').forEach(function(row) {
      var cells = row.querySelectorAll('td');
      if (cells.length < 2 || cells[0].hasAttribute('colspan')) return;
      var serviceName = cells[0].textContent.trim();
      var customId = row.getAttribute('data-custom-service-id') || '';
      var inputs = '';
      cells.forEach(function(cell, cellIndex) {
        if (cellIndex === 0) return;
        var key = cell.getAttribute('data-price-key');
        var label = cellIndex === 1 ? 'Основная цена' : 'Доп. цена';
        inputs += '<label class="admin-price-field">' + label + '<input data-admin-price-input="' + key + '" value="' + escHtml(cell.textContent.trim()) + '" onblur="saveAdminPrice(this)" onkeydown="if(event.key===\'Enter\'){this.blur();}"></label>';
      });
      rowsHtml += '<div class="admin-price-row">' +
        '<div class="admin-price-name">' + escHtml(serviceName) +
          (customId ? '<button type="button" class="admin-price-delete" onclick="deleteAdminService(\'' + escHtml(customId) + '\')">Удалить услугу</button>' : '') +
        '</div>' +
        '<div class="admin-price-inputs">' + inputs + '</div>' +
      '</div>';
    });
    if (rowsHtml) {
      var addForm = '<div class="admin-service-form">' +
        '<div class="admin-service-title">Добавить новую услугу</div>' +
        '<div class="admin-service-grid">' +
          '<label class="admin-price-field">Название<input id="admin-service-name-' + categoryId + '" type="text" placeholder="Например: новая процедура"></label>' +
          '<label class="admin-price-field">Цена<input id="admin-service-price-' + categoryId + '" type="text" placeholder="1200"></label>' +
          '<button type="button" class="btn-primary admin-service-add" onclick="addAdminService(\'' + categoryId + '\')">Добавить</button>' +
        '</div>' +
        (addedCount ? '<div style="margin-top:8px;font-size:12px;color:var(--text-muted);">Добавлено вручную: ' + addedCount + '</div>' : '') +
      '</div>';
      html += '<div class="admin-price-card">' +
        '<h4>' + escHtml(getPriceCategoryName(category)) + '</h4>' + rowsHtml + addForm + '</div>';
    }
  });
  el.innerHTML = html || '<p style="color:var(--text-muted);">В прайсе пока нет редактируемых цен.</p>';
}
function addAdminService(categoryId) {
  if (!isAdmin()) { showToast('Только администратор'); return; }
  var nameEl = document.getElementById('admin-service-name-' + categoryId);
  var priceEl = document.getElementById('admin-service-price-' + categoryId);
  var name = nameEl ? nameEl.value.trim() : '';
  var price = priceEl ? priceEl.value.trim() : '';
  if (!name) { showToast('Введите название услуги'); if (nameEl) nameEl.focus(); return; }
  var services = getCustomServices();
  services.push({
    id: 'svc-' + Date.now(),
    categoryId: categoryId,
    name: name,
    price: formatPriceInput(price || '—')
  });
  saveCustomServices(services);
  applyCustomServices();
  initPriceEditorData();
  applyCustomPrices();
  buildPriceCards();
  renderAdminPriceEditor();
  showToast('Услуга добавлена в прайс');
}
function deleteAdminService(id) {
  if (!isAdmin()) { showToast('Только администратор'); return; }
  if (!confirm('Удалить эту услугу из прайса?')) return;
  saveCustomServices(getCustomServices().filter(function(service) { return service.id !== id; }));
  applyCustomServices();
  initPriceEditorData();
  applyCustomPrices();
  buildPriceCards();
  renderAdminPriceEditor();
  showToast('Услуга удалена');
}
function saveAdminPrice(input) {
  if (!isAdmin()) { showToast('🔐 Только администратор'); return; }
  var key = input.getAttribute('data-admin-price-input');
  var value = formatPriceInput(input.value);
  input.value = value;
  var overrides = getPriceOverrides();
  overrides[key] = value;
  savePriceOverrides(overrides);
  var cell = document.querySelector('[data-price-key="' + key + '"]');
  if (cell) cell.textContent = value;
  buildPriceCards();
  showToast('💰 Цена обновлена');
}
function resetAdminPrices() {
  if (!isAdmin()) { showToast('🔐 Только администратор'); return; }
  if (!confirm('Сбросить все изменения цен в этом браузере?')) return;
  localStorage.removeItem(PRICE_STORAGE_KEY);
  location.reload();
}

var REVIEWS_KEY = 'vet_drug_reviews_v3';
var selectedStars = 5;

function setStar(n) {
  selectedStars = n;
  var spans = document.querySelectorAll('#starPicker span');
  spans.forEach(function(s, i) {
    s.classList.toggle('active', i < n);
  });
}
// Инициализируем все звёзды активными
document.addEventListener('DOMContentLoaded', function() {
  setStar(5);
});

var BASE_REVIEWS = [
  {
    id: 9000000003,
    name: 'Екатерина Воронова',
    pet: '🐈 Британская кошка Муся, 4 года',
    text: 'Обращалась на УЗИ брюшной полости к доктору Киселёвой Веронике Ярославне. Всё прошло профессионально — Вероника Ярославна очень мягко работает с животными, Муся почти не нервничала. По итогам осмотра дала развёрнутые рекомендации и объяснила результаты понятным языком. Клиника чистая, очереди не было. Однозначно вернёмся при необходимости!',
    stars: 5,
    avatar: '👩',
    date: '4 мая 2025',
    reply: ''
  },
  {
    id: 9000000002,
    name: 'Алексей Громов',
    pet: '🐕 Лабрадор Граф, 6 лет',
    text: 'Привозил собаку на плановую вакцинацию и обработку от паразитов. Принимала Фролова Диана Сергеевна — внимательный специалист, всё объяснила, рассказала о графике прививок на следующий год. Граф перенёс укол спокойно. Цены адекватные, администраторы приветливые. Запись онлайн работает без проблем — очень удобно!',
    stars: 5,
    avatar: '👨',
    date: '3 мая 2025',
    reply: ''
  },
  {
    id: 9000000001,
    name: 'Анастасия',
    pet: '🐇 Кролик Пуговка, 2 года',
    text: 'Обратились с кроликом к Ахмаду Барфину Хасану. Врач внимательно осмотрел Пуговку, подробно объяснил, как ухаживать за экзотическим питомцем, и дал понятные рекомендации. Очень спокойно и бережно работает с животными. Спасибо за внимательный подход, обязательно придём на контрольный осмотр.',
    stars: 5,
    avatar: '👩',
    date: '3 мая 2025',
    reply: ''
  }
];

function getReviews() {
  try {
    var stored = localStorage.getItem(REVIEWS_KEY);
    var userReviews = stored ? JSON.parse(stored) : [];
    // Фильтруем пользовательские (id < 9000000000 — живые, добавленные юзерами)
    var liveReviews = userReviews.filter(function(r) { return r.id < 9000000000; });
    // Объединяем: сначала живые (новые), потом базовые
    return liveReviews.concat(BASE_REVIEWS);
  } catch(e) { return BASE_REVIEWS.slice(); }
}
function saveReviews(r) {
  // Сохраняем только пользовательские отзывы (не базовые)
  var toSave = r.filter(function(rv) { return rv.id < 9000000000; });
  try { localStorage.setItem(REVIEWS_KEY, JSON.stringify(toSave)); } catch(e) {}
}
function renderStars(n) {
  var s = '';
  for (var i = 0; i < 5; i++) s += i < n ? '★' : '☆';
  return s;
}
function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function formatDate() {
  var d = new Date();
  var months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
  return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

var REVIEW_COOLDOWN_KEY = 'drug_review_cooldown';
var REVIEW_COOLDOWN_MS = 90 * 24 * 60 * 60 * 1000;
function getReviewCooldowns() {
  try { return JSON.parse(localStorage.getItem(REVIEW_COOLDOWN_KEY) || '{}'); } catch(e) { return {}; }
}
function saveReviewCooldowns(obj) {
  try { localStorage.setItem(REVIEW_COOLDOWN_KEY, JSON.stringify(obj)); } catch(e) {}
}
function normalizeName(name) { return name.toLowerCase().replace(/\s+/g,' ').trim(); }
function checkReviewCooldown(name) {
  var cooldowns = getReviewCooldowns();
  var last = cooldowns[normalizeName(name)];
  if (!last) return null;
  var diff = Date.now() - last;
  if (diff < REVIEW_COOLDOWN_MS) return Math.ceil((REVIEW_COOLDOWN_MS - diff) / (24*60*60*1000));
  return null;
}
function setReviewCooldown(name) {
  var cooldowns = getReviewCooldowns();
  cooldowns[normalizeName(name)] = Date.now();
  saveReviewCooldowns(cooldowns);
}
function submitReview() {
  var name = (document.getElementById('rv-name').value || '').trim();
  var pet  = (document.getElementById('rv-pet').value  || '').trim();
  var text = (document.getElementById('rv-text').value || '').trim();
  if (!name) { showToast('Введите ваше имя'); return; }
  if (!text) { showToast('Напишите текст отзыва'); return; }
  var daysLeft = checkReviewCooldown(name);
  if (daysLeft !== null) {
    showToast('⏳ Следующий отзыв можно оставить через ' + daysLeft + ' дн.');
    return;
  }
  var reviews = getReviews();
  var newId = Date.now();
  reviews.unshift({ id: newId, name: name, pet: pet || '🐾 Питомец', text: text, stars: selectedStars, avatar: '👤', date: formatDate(), reply: '' });
  saveReviews(reviews);
  setReviewCooldown(name);
  document.getElementById('rv-name').value = '';
  document.getElementById('rv-pet').value = '';
  document.getElementById('rv-text').value = '';
  setStar(5);
  renderReviews();
  renderReviewsHome();
  showToast('✅ Отзыв опубликован! Спасибо!');
}

function renderReviewCard(r) {
  var replyHtml = '';
  if (r.reply) {
    replyHtml = '<div class="review-reply">' +
      '<div class="review-reply-label">🏥 Ответ клиники</div>' +
      '<div class="review-reply-text">' + escHtml(r.reply) + '</div>' +
      '<button class="review-reply-edit" onclick="editReply(' + r.id + ')">✏️ Изменить ответ</button>' +
    '</div>';
  } else {
    replyHtml = '<button class="review-reply-btn" onclick="openReply(' + r.id + ')">💬 Ответить</button>';
  }
  return '<div class="review-card reveal" id="rev-' + r.id + '">' +
    '<div class="review-top">' +
      '<div class="review-stars">' + renderStars(r.stars) + '</div>' +
      '<div class="review-actions">' +
        '<span class="review-date">' + (r.date||'') + '</span>' +
        '<button class="review-delete-btn" onclick="deleteReview(' + r.id + ')" title="Удалить">🗑️</button>' +
      '</div>' +
    '</div>' +
    '<div class="review-text">' + escHtml(r.text) + '</div>' +
    '<div class="review-author">' +
      '<div class="review-avatar">' + (r.avatar||'👤') + '</div>' +
      '<div><div class="review-name">' + escHtml(r.name) + '</div>' +
      '<div class="review-pet">' + escHtml(r.pet||'') + '</div></div>' +
    '</div>' +
    replyHtml +
  '</div>';
}

function renderReviews() {
  var grid = document.getElementById('reviewsGrid');
  if (!grid) return;
  var reviews = getReviews();
  if (reviews.length === 0) {
    grid.innerHTML = '<div class="reviews-empty">Пока нет отзывов. Оставьте первый!</div>';
    return;
  }
  grid.innerHTML = reviews.map(renderReviewCard).join('');
  setTimeout(function() {
    grid.querySelectorAll('.reveal').forEach(function(el) { observer.observe(el); });
  }, 50);
}

function renderReviewsHome() {
  var grid = document.getElementById('reviewsGridHome');
  if (!grid) return;
  var reviews = getReviews().slice(0, 3);
  if (reviews.length === 0) {
    grid.innerHTML = '<div class="reviews-empty" style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--text-muted);">Отзывов пока нет — <a href="#" onclick="showPage(\'reviews\')" style="color:var(--forest);">оставьте первый!</a></div>';
    return;
  }
  grid.innerHTML = reviews.map(renderReviewCard).join('');
  setTimeout(function() {
    grid.querySelectorAll('.reveal').forEach(function(el) { observer.observe(el); });
  }, 50);
}

var ADMIN_PIN = '1234'; // ← Смени на свой пин
var adminUnlocked = false;
var adminUnlockTimer = null;

function checkAdminPin(callback) {
  if (adminUnlocked) { callback(); return; }
  var pin = prompt('🔐 Введите пин-код администратора:');
  if (pin === null) return;
  if (pin === ADMIN_PIN) {
    adminUnlocked = true;
    clearTimeout(adminUnlockTimer);
    adminUnlockTimer = setTimeout(function() { adminUnlocked = false; }, 5 * 60 * 1000); // сессия 5 минут
    callback();
  } else {
    showToast('❌ Неверный пин-код');
  }
}

function deleteReview(id) {
  checkAdminPin(function() {
    if (!confirm('Удалить этот отзыв?')) return;
    var reviews = getReviews().filter(function(r) { return r.id !== id; });
    saveReviews(reviews);
    renderReviews();
    renderReviewsHome();
    showToast('🗑️ Отзыв удалён');
  });
}
function openReply(id) {
  checkAdminPin(function() { _openReplyInner(id); });
}
function _openReplyInner(id) {
  document.querySelectorAll('.review-reply-box').forEach(function(b) { b.remove(); });
  var card = document.getElementById('rev-' + id);
  if (!card) return;
  var btn = card.querySelector('.review-reply-btn');
  if (btn) btn.style.display = 'none';
  var box = document.createElement('div');
  box.className = 'review-reply-box';
  box.id = 'reply-box-' + id;
  box.innerHTML = '<textarea id="reply-ta-' + id + '" placeholder="Введите ответ от клиники..." rows="3"></textarea>' +
    '<div style="display:flex;gap:8px;margin-top:8px;">' +
      '<button class="reply-send-btn" onclick="saveReply(' + id + ')">✅ Опубликовать</button>' +
      '<button class="reply-cancel-btn" onclick="renderReviews();renderReviewsHome();">Отмена</button>' +
    '</div>';
  card.appendChild(box);
  setTimeout(function() { var ta = document.getElementById('reply-ta-' + id); if(ta) ta.focus(); }, 50);
}
function editReply(id) {
  var reviews = getReviews();
  var r = reviews.find(function(x) { return x.id === id; });
  if (!r) return;
  var card = document.getElementById('rev-' + id);
  var replyDiv = card ? card.querySelector('.review-reply') : null;
  if (replyDiv) replyDiv.style.display = 'none';
  var box = document.createElement('div');
  box.className = 'review-reply-box';
  box.innerHTML = '<textarea id="reply-ta-' + id + '" rows="3">' + escHtml(r.reply) + '</textarea>' +
    '<div style="display:flex;gap:8px;margin-top:8px;">' +
      '<button class="reply-send-btn" onclick="saveReply(' + id + ')">✅ Сохранить</button>' +
      '<button class="reply-cancel-btn" onclick="renderReviews();renderReviewsHome();">Отмена</button>' +
    '</div>';
  if (card) card.appendChild(box);
  setTimeout(function() { var ta = document.getElementById('reply-ta-' + id); if(ta){ ta.focus(); ta.selectionStart = ta.value.length; } }, 50);
}
function saveReply(id) {
  var ta = document.getElementById('reply-ta-' + id);
  if (!ta) return;
  var text = ta.value.trim();
  if (!text) { showToast('Введите текст ответа'); return; }
  var reviews = getReviews().map(function(r) {
    if (r.id === id) r.reply = text;
    return r;
  });
  saveReviews(reviews);
  renderReviews();
  renderReviewsHome();
  showToast('✅ Ответ опубликован!');
}

// Scroll reveal
var observer = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting) { e.target.classList.add('visible'); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(function(el) { observer.observe(el); });

// Рендерим
renderReviews();
renderReviewsHome();

function showPage(name) {
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  document.querySelectorAll('.nav-links a').forEach(function(a) { a.classList.remove('active'); });
  document.getElementById('page-' + name).classList.add('active');
  var navEl = document.getElementById('nav-' + name);
  if (navEl) navEl.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById('navLinks').classList.remove('open');
  if (name === 'reviews') { renderReviews(); }
  setTimeout(function() {
    document.querySelectorAll('.reveal:not(.visible)').forEach(function(el) { observer.observe(el); });
  }, 100);
}
function showPriceTab(tab, e) {
  document.querySelectorAll('.price-tab').forEach(function(t) { t.classList.remove('active'); });
  document.querySelectorAll('.price-category').forEach(function(c) { c.classList.remove('active'); });
  document.getElementById('price-' + tab).classList.add('active');
  if (e && e.target) e.target.classList.add('active');
  buildPriceCards();
}

window.addEventListener('load', function() {
  var params = new URLSearchParams(window.location.search);
  var targetPage = params.get('page') || window.location.hash.replace('#', '');
  if (targetPage && document.getElementById('page-' + targetPage) && typeof showPage === 'function') {
    showPage(targetPage);
  }
});

function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}
document.addEventListener('click', function(e) {
  var burger = document.getElementById('burger');
  var nav = document.getElementById('navLinks');
  if (nav && nav.classList.contains('open') && !burger.contains(e.target) && !nav.contains(e.target)) {
    nav.classList.remove('open');
  }
});
function openModal() {
  document.getElementById('modalOverlay').classList.add('open');
  document.getElementById('modalForm').style.display = 'block';
  document.getElementById('modalSuccess').style.display = 'none';
  document.body.style.overflow = 'hidden';
  setTimeout(initDateField, 50);
}
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
function closeModalOutside(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
}
// ========== РАСПИСАНИЕ И СЛОТЫ ==========
var APPOINTMENTS_KEY = 'vet_appointments_v1';
var SLOT_INTERVAL = 5; // минут — интервал между слотами
var SLOT_CAPACITY = 2;  // максимум человек на один слот

function getAppointments() {
  try { return JSON.parse(localStorage.getItem(APPOINTMENTS_KEY) || '[]'); } catch(e) { return []; }
}
function saveAppointments(arr) {
  try { localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(arr)); } catch(e) {}
}

// Возвращает минуты с начала дня для строки "HH:MM"
function timeToMinutes(t) {
  var p = t.split(':');
  return parseInt(p[0]) * 60 + parseInt(p[1]);
}
function minutesToTime(m) {
  var h = Math.floor(m / 60), mn = m % 60;
  return (h < 10 ? '0' : '') + h + ':' + (mn < 10 ? '0' : '') + mn;
}

// Генерирует список слотов для выбранной клиники и даты
function generateSlots(clinic, dateStr) {
  var isRound = clinic.indexOf('Мачуги') !== -1; // круглосуточная
  var startMin = isRound ? 0 : 9 * 60;           // 00:00 или 09:00
  var endMin   = isRound ? 24 * 60 - SLOT_INTERVAL : 21 * 60; // до 23:55 или 21:00

  var appointments = getAppointments();
  var slots = [];
  for (var m = startMin; m <= endMin; m += SLOT_INTERVAL) {
    var timeStr = minutesToTime(m);
    var count = appointments.filter(function(a) {
      return a.date === dateStr && a.clinic === clinic && a.time === timeStr;
    }).length;
    slots.push({ time: timeStr, count: count, full: count >= SLOT_CAPACITY });
  }
  return slots;
}

function updateTimeSlots() {
  var dateEl  = document.getElementById('f-date');
  var timeEl  = document.getElementById('f-time');
  var clinic  = document.getElementById('f-clinic').value;
  var dateStr = dateEl ? dateEl.value : '';

  // Устанавливаем минимальную дату — сегодня
  if (dateEl && !dateEl.min) {
    var today = new Date();
    dateEl.min = today.toISOString().split('T')[0];
  }

  if (!dateStr) {
    timeEl.innerHTML = '<option value="">Сначала выберите дату</option>';
    return;
  }

  var slots = generateSlots(clinic, dateStr);
  var freeSlots = slots.filter(function(s) { return !s.full; });

  if (freeSlots.length === 0) {
    timeEl.innerHTML = '<option value="">Нет свободного времени на эту дату</option>';
    return;
  }

  timeEl.innerHTML = freeSlots.map(function(s) {
    var label = s.time;
    if (s.count === 1) label += ' (осталось 1 место)';
    return '<option value="' + s.time + '">' + label + '</option>';
  }).join('');

  checkSelectedSlot();
}

function checkSelectedSlot() {
  var busyDiv  = document.getElementById('timeSlotBusy');
  var busyText = document.getElementById('timeSlotBusyText');
  var timeEl   = document.getElementById('f-time');
  var dateEl   = document.getElementById('f-date');
  var clinic   = document.getElementById('f-clinic') ? document.getElementById('f-clinic').value : '';

  if (!busyDiv || !timeEl || !timeEl.value) { if(busyDiv) busyDiv.style.display='none'; return; }

  var dateStr = dateEl ? dateEl.value : '';
  var appointments = getAppointments();
  var selected = timeToMinutes(timeEl.value);

  var count = appointments.filter(function(a) {
    return a.date === dateStr && a.clinic === clinic && a.time === timeEl.value;
  }).length;

  if (count >= SLOT_CAPACITY) {
    // Найти ближайший свободный
    var slots = generateSlots(clinic, dateStr);
    var free = slots.filter(function(s) { return !s.full; });
    if (free.length > 0) {
      busyText.textContent = 'Это время занято. Ближайшее свободное: ' + free[0].time;
    } else {
      busyText.textContent = 'На эту дату нет свободных мест.';
    }
    busyDiv.style.display = 'block';
  } else {
    busyDiv.style.display = 'none';
  }
}

// Инициализация минимальной даты при открытии формы
function initDateField() {
  var dateEl = document.getElementById('f-date');
  if (dateEl) {
    var today = new Date();
    dateEl.min = today.toISOString().split('T')[0];
    if (!dateEl.value) dateEl.value = today.toISOString().split('T')[0];
    updateTimeSlots();
  }
}

var TG_BOT_TOKEN = '8563672960:AAFp7DJSrmwW2k9LyMHUKuOTzutqMfqb3sk';
var TG_CHAT_ID   = '-1003915532130';
var OWNER_PHONE_DISPLAY = '8 989 812 22 00';
var OWNER_WHATSAPP = '79898122200';
// ▲▲▲ КАК ПОЛУЧИТЬ: создайте бота у @BotFather → скопируйте токен.
//     Chat ID: добавьте бота в группу и напишите /start, затем откройте
//     https://api.telegram.org/bot<ВАШ_ТОКЕН>/getUpdates — найдите "chat":{"id":...}
// =====================================================

function sendTelegramNotification(data) {
  if (!TG_BOT_TOKEN || TG_BOT_TOKEN === 'ВСТАВИТЬ_ТОКЕН_БОТА') return;
  var text =
    '🐾 *Новая запись на приём!*\n' +
    '———————————————\n' +
    '👤 *Имя:* ' + (data.name || 'не указано') + '\n' +
    '📞 *Телефон:* ' + data.phone + '\n' +
    (data.email ? '📧 *Email:* ' + data.email + '\n' : '') +
    '🐶 *Животное:* ' + (data.animal || '—') + '\n' +
    '🏥 *Услуга:* ' + (data.service || '—') + '\n' +
    '📍 *Клиника:* ' + (data.clinic || '—') + '\n' +
    '📅 *Дата:* ' + (data.date || '—') + (data.dayName ? ' (' + data.dayName + ')' : '') + '\n' +
    (data.comment ? '💬 *Комментарий:* ' + data.comment + '\n' : '') +
    '✅ *Согласие на обработку ПД:* ' + (data.consent ? 'Дано ✔️' : 'Не дано ❌') + '\n' +
    '🌐 *IP-адрес:* ' + (data.ip || 'неизвестен') + '\n' +
    '———————————————\n' +
    '🕐 ' + (data.submittedAt || new Date().toLocaleString('ru-RU'));

  // Попытка 1: sendMessage
  fetch('https://api.telegram.org/bot' + TG_BOT_TOKEN + '/sendMessage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TG_CHAT_ID, text: text, parse_mode: 'Markdown' })
  }).then(function(r) {
    return r.json();
  }).then(function(json) {
    // Если бот не может доставить — пробуем через forwardMessage или логируем
    if (!json.ok) {
      console.warn('TG sendMessage failed:', json.description);
      // Попытка 2: отправить без Markdown (на случай спецсимволов)
      var plainText = text.replace(/\*/g, '').replace(/_/g, '');
      fetch('https://api.telegram.org/bot' + TG_BOT_TOKEN + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TG_CHAT_ID, text: plainText })
      }).catch(function() {});
    }
  }).catch(function() {
    // Сеть недоступна — сохраняем в очередь для повторной отправки
    try {
      var queue = JSON.parse(localStorage.getItem('tg_queue') || '[]');
      queue.push({ data: data, ts: Date.now() });
      localStorage.setItem('tg_queue', JSON.stringify(queue.slice(-10))); // макс 10
    } catch(e) {}
  });
}

function buildOwnerRequestText(data) {
  return [
    'Новая заявка с сайта клиники Друг',
    'Имя: ' + (data.name || 'не указано'),
    'Телефон клиента: ' + (data.phone || 'не указан'),
    data.email ? 'Email: ' + data.email : '',
    'Животное: ' + (data.animal || 'не указано'),
    'Услуга: ' + (data.service || 'не указана'),
    'Клиника: ' + (data.clinic || 'не указана'),
    'Дата: ' + (data.date || 'не указана') + (data.dayName ? ' (' + data.dayName + ')' : ''),
    data.comment ? 'Комментарий: ' + data.comment : '',
    'Отправлено: ' + (data.submittedAt || new Date().toLocaleString('ru-RU'))
  ].filter(Boolean).join('\n');
}

// Повторная отправка отложенных уведомлений при следующем открытии страницы
(function retryTgQueue() {
  try {
    var queue = JSON.parse(localStorage.getItem('tg_queue') || '[]');
    if (!queue.length) return;
    localStorage.removeItem('tg_queue');
    queue.forEach(function(item) {
      setTimeout(function() { sendTelegramNotification(item.data); }, 1000);
    });
  } catch(e) {}
})();

// ========== ПРОВЕРКА ТЕЛЕФОНА И EMAIL ==========
function checkPhoneExists() {
  var phone = (document.getElementById('f-phone').value || '').replace(/\D/g, '');
  var status = document.getElementById('phone-status');
  var hint   = document.getElementById('phone-hint');
  // Нужно минимум 11 цифр (7 + 10)
  if (phone.length < 11) {
    status.style.display = 'none';
    hint.style.display = 'none';
    return;
  }
  // Ищем среди сохранённых заявок
  var appointments = getAppointments();
  var found = appointments.filter(function(a) {
    return a.phone && a.phone.replace(/\D/g, '') === phone;
  });
  if (found.length > 0) {
    var last = found[found.length - 1];
    status.textContent = '⚠️';
    status.style.display = 'block';
    hint.style.display = 'block';
    hint.style.background = '#fffbeb';
    hint.style.color = '#92400e';
    hint.style.border = '1px solid #fcd34d';
    hint.style.borderRadius = '6px';
    hint.style.padding = '6px 10px';
    hint.textContent = '⚠️ Этот номер уже записан' + (last.date ? ' на ' + last.date : '') + '. Если хотите перезаписаться — мы свяжемся с вами.';
  } else {
    status.textContent = '✅';
    status.style.display = 'block';
    hint.style.display = 'none';
  }
}

function checkEmail() {
  var val = (document.getElementById('f-email').value || '').trim();
  var status = document.getElementById('email-status');
  var hint   = document.getElementById('email-hint');
  if (!val) { status.style.display = 'none'; hint.style.display = 'none'; return; }
  // Простая проверка формата
  var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);
  if (ok) {
    status.textContent = '✅';
    status.style.display = 'block';
    hint.style.display = 'none';
  } else {
    status.textContent = '❌';
    status.style.display = 'block';
    hint.textContent = 'Введите корректный email, например: name@mail.ru';
    hint.style.display = 'block';
  }
}
// ========== END ПРОВЕРКА ==========

// ========== ИСТОРИЯ ЗАЯВОК (IP + аккаунт) ==========
var HISTORY_KEY = 'vet_app_history_v1'; // глобальная история по IP

function getAppHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch(e) { return []; }
}
function saveAppHistory(arr) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(arr)); } catch(e) {} 
}

// Получаем IP через бесплатный API
function getClientIP(callback) {
  fetch('https://api.ipify.org?format=json')
    .then(function(r){ return r.json(); })
    .then(function(d){ callback(d.ip || 'неизвестен'); })
    .catch(function(){ callback('неизвестен'); });
}

function saveToHistory(record) {
  var history = getAppHistory();
  history.unshift(record); // новые сверху
  if (history.length > 50) history = history.slice(0, 50); // макс 50 записей
  saveAppHistory(history);

  // Если залогинен — сохраняем также в аккаунт
  var s = getSession();
  if (s && !s.isAdmin) {
    var users = getUsers();
    if (users[s.email]) {
      if (!users[s.email].appHistory) users[s.email].appHistory = [];
      users[s.email].appHistory.unshift(record);
      if (users[s.email].appHistory.length > 30) users[s.email].appHistory = users[s.email].appHistory.slice(0, 30);
      saveUsers(users);
    }
  }
}

function formatPhoneLink(phone) {
  if (!phone) return '—';
  var digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) digits = '7' + digits;
  if (digits.length < 11) return escHtml(phone);
  return '<a href="tel:+' + digits + '" style="color:var(--forest);font-weight:800;text-decoration:none;">' + escHtml(phone) + '</a>';
}

function renderAppHistory() {
  var el = document.getElementById('visitsList');
  if (!el) return;

  var s = getSession();
  var admin = isAdmin();
  var history = [];

  // Администратор видит ВСЕ заявки из общей истории
  if (admin) {
    history = getAppHistory();
  } else if (s && !s.isAdmin) {
    // Залогиненный пользователь — история из аккаунта
    var users = getUsers();
    if (users[s.email] && users[s.email].appHistory) {
      history = users[s.email].appHistory;
    }
  }

  // Если нет аккаунта или история пустая — показываем из localStorage по IP (все)
  if (!history.length) {
    history = getAppHistory();
  }

  if (!history.length) {
    el.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--text-muted);">' +
      '<div style="font-size:48px;margin-bottom:1rem;">📋</div>' +
      '<p>История заявок пока пуста.<br>После оформления записи она появится здесь.</p></div>';
    return;
  }

  // Для администратора — показываем счётчик ожидающих заявок
  var pendingCount = history.filter(function(v) { return (v.status || 'pending') === 'pending'; }).length;
  var adminHeader = admin && pendingCount > 0
    ? '<div style="margin-bottom:16px;padding:12px 18px;background:#fff7ed;border:1.5px solid #fb923c;border-radius:12px;font-size:14px;font-weight:700;color:#c2410c;">📋 Ожидают обработки: ' + pendingCount + ' заявок</div>'
    : '';

  el.innerHTML = adminHeader + '<div style="display:flex;flex-direction:column;gap:12px;">' +
    history.map(function(v, i) {
      var statusColor = { pending: '#f59e0b', confirmed: '#10b981', cancelled: '#ef4444', done: '#0077C8' };
      var statusLabel = { pending: '⏳ Ожидает', confirmed: '✅ Подтверждена', cancelled: '❌ Отменена', done: '📞 Выполнено' };
      var st = v.status || 'pending';
      var isDone = st === 'done' || st === 'confirmed';

      // Кнопка «Выполнить» — только для администратора и только если заявка ещё ожидает
      var callBtn = '';
      if (admin && !isDone) {
        callBtn = '<div style="margin-top:12px;border-top:1px solid var(--sand);padding-top:12px;">' +
          '<button onclick="markAppointmentDone(' + i + ')" style="' +
            'background:#0077C8;color:#fff;border:none;border-radius:10px;' +
            'padding:10px 20px;font-size:13px;font-weight:700;cursor:pointer;' +
            'font-family:\'Onest\',sans-serif;display:inline-flex;align-items:center;gap:8px;' +
            'transition:all 0.2s;' +
          '" onmouseover="this.style.background=\'#005fa3\'" onmouseout="this.style.background=\'#0077C8\'">' +
            '📞 Позвонили — выполнить' +
          '</button>' +
        '</div>';
      }

      return '<div style="background:var(--warm-white);border:1px solid ' + (st === 'pending' && admin ? '#fcd34d' : 'var(--sand)') + ';border-radius:var(--radius-sm);padding:1.2rem 1.4rem;box-shadow:var(--shadow-sm);">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">' +
          '<div>' +
            '<div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-muted);margin-bottom:4px;">Заявка #' + (i + 1) + ' · ' + (v.submittedAt || v.date || '—') + '</div>' +
            '<div style="font-weight:700;color:var(--text-dark);font-size:15px;">' + escHtml(v.name || 'Без имени') + '</div>' +
            '<div style="font-size:13px;color:var(--text-soft);margin-top:2px;">📞 ' + formatPhoneLink(v.phone) + (v.email ? ' · 📧 ' + escHtml(v.email) : '') + '</div>' +
          '</div>' +
          '<span style="font-size:12px;font-weight:700;padding:4px 12px;border-radius:50px;background:' + (statusColor[st] || '#f59e0b') + '22;color:' + (statusColor[st] || '#f59e0b') + ';">' + (statusLabel[st] || '⏳ Ожидает') + '</span>' +
        '</div>' +
        '<div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px;">' +
          (v.animal ? '<span style="font-size:12px;padding:3px 10px;border-radius:50px;background:var(--forest-faint);color:var(--forest);font-weight:600;">' + escHtml(v.animal) + '</span>' : '') +
          (v.service ? '<span style="font-size:12px;padding:3px 10px;border-radius:50px;background:var(--amber-pale);color:var(--forest);font-weight:600;">' + escHtml(v.service) + '</span>' : '') +
          (v.clinic ? '<span style="font-size:12px;padding:3px 10px;border-radius:50px;background:var(--sand);color:var(--text-mid);font-weight:600;">📍 ' + escHtml(v.clinic) + '</span>' : '') +
          (v.date ? '<span style="font-size:12px;padding:3px 10px;border-radius:50px;background:var(--sand);color:var(--text-mid);font-weight:600;">📅 ' + escHtml(v.date) + '</span>' : '') +
        '</div>' +
        (v.ip ? '<div style="margin-top:6px;font-size:11px;color:var(--text-muted);">🌐 IP: ' + escHtml(v.ip) + '</div>' : '') +
        callBtn +
      '</div>';
    }).join('') +
  '</div>';
}

// ========== ПОМЕТИТЬ ЗАЯВКУ КАК ВЫПОЛНЕННУЮ (после звонка) ==========
function markAppointmentDone(index) {
  if (!isAdmin()) { showToast('🔐 Только администратор'); return; }
  var history = getAppHistory();
  if (!history[index]) return;

  var v = history[index];
  v.status = 'done';
  v.doneAt = new Date().toLocaleDateString('ru-RU') + ' ' + new Date().toLocaleTimeString('ru-RU', {hour:'2-digit',minute:'2-digit'});
  history[index] = v;
  saveAppHistory(history);

  // Уведомление в Telegram
  if (TG_BOT_TOKEN && TG_BOT_TOKEN !== 'ВСТАВИТЬ_ТОКЕН_БОТА') {
    var text =
      '✅ *Заявка выполнена после звонка*\n' +
      '———————————————\n' +
      '👤 *Имя:* ' + (v.name || '—') + '\n' +
      '📞 *Телефон:* ' + (v.phone || '—') + '\n' +
      '🐶 *Животное:* ' + (v.animal || '—') + '\n' +
      '🏥 *Услуга:* ' + (v.service || '—') + '\n' +
      '📍 *Клиника:* ' + (v.clinic || '—') + '\n' +
      '📅 *Дата записи:* ' + (v.date || '—') + '\n' +
      '🕐 *Выполнено:* ' + v.doneAt;
    fetch('https://api.telegram.org/bot' + TG_BOT_TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_CHAT_ID, text: text, parse_mode: 'Markdown' })
    }).catch(function(){});
  }

  renderAppHistory();
  showToast('✅ Заявка отмечена как выполненная!');
}

function submitForm() {
  var name    = (document.getElementById('f-name').value || '').trim();
  var phone   = document.getElementById('f-phone').value.trim();
  var email   = (document.getElementById('f-email').value || '').trim();
  var animal  = document.getElementById('f-animal').value;
  var service = document.getElementById('f-service').value;
  var clinic  = document.getElementById('f-clinic').value;
  var dateStr = document.getElementById('f-date') ? document.getElementById('f-date').value : '';
  var comment = document.getElementById('f-comment').value.trim();
  var consent = document.getElementById('f-consent');

  if (!name) {
    showToast('Пожалуйста, введите ваше имя');
    document.getElementById('f-name').focus();
    return;
  }
  if (!phone || phone.replace(/\D/g,'').length < 11) {
    showToast('Пожалуйста, введите номер телефона');
    document.getElementById('f-phone').focus();
    return;
  }
  if (!dateStr) { showToast('Выберите дату приёма'); return; }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    showToast('Проверьте формат email');
    document.getElementById('f-email').focus();
    return;
  }
  if (!consent || !consent.checked) {
    var wrap = document.getElementById('consent-wrap');
    var err  = document.getElementById('consent-error');
    if (wrap) { wrap.style.borderColor = '#dc2626'; wrap.style.background = '#fef2f2'; }
    if (err)  { err.style.display = 'block'; }
    wrap && wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Сохраняем в appointments (для проверки дублей)
  var days = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
  var dateObj = new Date(dateStr + 'T12:00:00');
  var dayName = days[dateObj.getDay()];
  var appointments = getAppointments();
  appointments.push({ name: name, phone: phone, email: email, date: dateStr, time: '', clinic: clinic });
  saveAppointments(appointments);

  // Скрываем форму, показываем успех сразу
  document.getElementById('modalForm').style.display = 'none';
  document.getElementById('modalSuccess').style.display = 'block';

  // Получаем IP и сохраняем историю + шлём в TG
  getClientIP(function(ip) {
    var now = new Date();
    var submittedAt = now.toLocaleDateString('ru-RU') + ' ' + now.toLocaleTimeString('ru-RU', {hour:'2-digit',minute:'2-digit'});
    var record = {
      name: name, phone: phone, email: email,
      animal: animal, service: service, clinic: clinic,
      date: dateStr, dayName: dayName, comment: comment,
      ip: ip, submittedAt: submittedAt, status: 'pending',
      consent: true
    };
    saveToHistory(record);
    sendTelegramNotification(record);
  });
}
function showToast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 2800);
}
// ========== AUTH SYSTEM ==========
var ADMIN_EMAIL = 'patimejkerdaun@gmail.com';
var ADMIN_PASS = '839824';
var USERS_KEY = 'vet_users_v1';
var SESSION_KEY = 'vet_session_v1';

function getUsers() { try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); } catch(e) { return {}; } }
function saveUsers(u) { try { localStorage.setItem(USERS_KEY, JSON.stringify(u)); } catch(e) {} }
function getSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch(e) { return null; } }
function saveSession(s) { try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch(e) {} }
function isAdmin() { var s = getSession(); return s && s.email === ADMIN_EMAIL; }
function isLoggedIn() { return !!getSession(); }

function openAuth() { document.getElementById('authOverlay').classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeAuth() { document.getElementById('authOverlay').classList.remove('open'); document.body.style.overflow = ''; }
function closeAuthOutside(e) { if (e.target === document.getElementById('authOverlay')) closeAuth(); }

function switchAuthTab(tab, el) {
  document.querySelectorAll('.auth-tab').forEach(function(t) { t.classList.remove('active'); });
  document.querySelectorAll('.auth-panel').forEach(function(p) { p.classList.remove('active'); });
  document.getElementById('auth' + (tab === 'login' ? 'Login' : 'Register')).classList.add('active');
  if (el) el.classList.add('active');
  else {
    var tabs = document.querySelectorAll('.auth-tab');
    tabs[tab === 'login' ? 0 : 1].classList.add('active');
  }
}

function doLogin() {
  var email = (document.getElementById('loginEmail').value || '').trim().toLowerCase();
  var pass = (document.getElementById('loginPassword').value || '').trim();
  if (!email || !pass) { showToast('Заполните email и пароль'); return; }
  // Проверка администратора
  if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
    saveSession({ email: ADMIN_EMAIL, name: 'Администратор', isAdmin: true });
    onLogin(); closeAuth(); showToast('✅ Добро пожаловать, Администратор!'); return;
  }
  var users = getUsers();
  if (!users[email]) { showToast('❌ Пользователь не найден'); return; }
  if (users[email].password !== btoa(pass)) { showToast('❌ Неверный пароль'); return; }
  saveSession({ email: email, name: users[email].name, isAdmin: false });
  onLogin(); closeAuth();
  showToast('✅ Добро пожаловать, ' + users[email].name + '!');
}

function doRegister() {
  var name = (document.getElementById('regName').value || '').trim();
  var email = (document.getElementById('regEmail').value || '').trim().toLowerCase();
  var pass = (document.getElementById('regPassword').value || '').trim();
  if (!name || !email || !pass) { showToast('Заполните все поля'); return; }
  if (pass.length < 6) { showToast('Пароль минимум 6 символов'); return; }
  if (!email.includes('@')) { showToast('Введите корректный email'); return; }
  if (email === ADMIN_EMAIL) { showToast('❌ Этот email зарезервирован'); return; }
  var users = getUsers();
  if (users[email]) { showToast('❌ Пользователь уже существует'); return; }
  users[email] = { name: name, password: btoa(pass), pets: [], visits: [], vaccines: [] };
  saveUsers(users);
  saveSession({ email: email, name: name, isAdmin: false });
  onLogin(); closeAuth();
  showToast('✅ Аккаунт создан! Добро пожаловать, ' + name + '!');
}

function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
  onLogout(); showPage('home'); showToast('До свидания!');
}

function onLogin() {
  var s = getSession();
  document.getElementById('navAccountLabel').textContent = s.name.split(' ')[0];
  updateDeleteBtnVisibility();
  renderReviews(); renderReviewsHome();
}

function onLogout() {
  document.getElementById('navAccountLabel').textContent = 'Войти';
  updateDeleteBtnVisibility();
  renderReviews(); renderReviewsHome();
}

function handleAccountClick() {
  if (isLoggedIn()) { showCabinet(); } else { openAuth(); }
}

function showCabinet() {
  var s = getSession();
  if (!s) { openAuth(); return; }
  var admin = isAdmin();
  document.getElementById('cabinetTitle').textContent = admin ? '⚙️ Панель администратора' : 'Мой кабинет';
  document.getElementById('cabinetUserName').textContent = s.name;
  document.getElementById('cabinetUserEmail').textContent = s.email;
  document.getElementById('cabinetAvatar').textContent = admin ? '🔐' : '👤';
  document.querySelectorAll('.admin-only').forEach(function(el) { el.style.display = admin ? '' : 'none'; });
  showPage('cabinet');
  renderPets(); renderVisits(); renderVaccines();
  if (admin) renderAdminPriceEditor();
}

function updateDeleteBtnVisibility() {
  var admin = isAdmin();
  document.querySelectorAll('.review-delete-btn').forEach(function(btn) {
    btn.style.display = admin ? 'flex' : 'none';
  });
  document.querySelectorAll('.review-reply-btn, .review-reply-edit').forEach(function(btn) {
    btn.style.display = admin ? '' : 'none';
  });
}

// ========== PETS ==========
function getUserData(key) {
  var s = getSession(); if (!s || s.isAdmin) return [];
  var users = getUsers(); var u = users[s.email];
  return (u && u[key]) ? u[key] : [];
}
function setUserData(key, val) {
  var s = getSession(); if (!s || s.isAdmin) return;
  var users = getUsers();
  if (!users[s.email]) return;
  users[s.email][key] = val;
  saveUsers(users);
}

function renderPets() {
  var pets = getUserData('pets');
  var el = document.getElementById('petsList');
  if (!el) return;
  if (!isLoggedIn()) { el.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem;">Войдите, чтобы видеть питомцев</p>'; return; }
  if (pets.length === 0) { el.innerHTML = '<p style="color:var(--text-muted);margin-bottom:1rem;">У вас пока нет добавленных питомцев.</p>'; return; }
  el.innerHTML = pets.map(function(p, i) {
    return '<div class="pet-card">' +
      '<div class="pet-avatar">' + p.type + '</div>' +
      '<div class="pet-info">' +
        '<div class="pet-name">' + escHtml(p.name) + '</div>' +
        '<div class="pet-meta">' + escHtml(p.breed || '') + (p.year ? ' · ' + (2026 - p.year) + ' лет' : '') + '</div>' +
        '<div class="pet-tags"><span class="pet-tag">Добавлен: ' + p.added + '</span></div>' +
      '</div>' +
      '<button onclick="removePet(' + i + ')" style="background:none;border:none;cursor:pointer;font-size:18px;opacity:0.4;align-self:flex-start;" title="Удалить">🗑️</button>' +
    '</div>';
  }).join('');
}

function removePet(i) {
  if (!confirm('Удалить питомца?')) return;
  var pets = getUserData('pets'); pets.splice(i, 1); setUserData('pets', pets); renderPets();
}

function openAddPet() { document.getElementById('addPetOverlay').classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeAddPet() { document.getElementById('addPetOverlay').classList.remove('open'); document.body.style.overflow = ''; }
function closeAddPetOutside(e) { if (e.target === document.getElementById('addPetOverlay')) closeAddPet(); }

function savePet() {
  var name = (document.getElementById('petName').value || '').trim();
  var type = document.getElementById('petType').value;
  var breed = (document.getElementById('petBreed').value || '').trim();
  var year = parseInt(document.getElementById('petYear').value) || 0;
  if (!name) { showToast('Введите кличку'); return; }
  var pets = getUserData('pets');
  pets.push({ name: name, type: type, breed: breed, year: year, added: formatDate() });
  setUserData('pets', pets);
  closeAddPet(); renderPets();
  showToast('🐾 ' + name + ' добавлен(а)!');
}

function renderVisits() {
  renderAppHistory();
}

function renderVaccines() {
  var vaccines = getUserData('vaccines');
  var el = document.getElementById('vaccinesList');
  if (!el) return;
  if (vaccines.length === 0) {
    el.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--text-muted);">' +
      '<div style="font-size:48px;margin-bottom:1rem;">💉</div>' +
      '<p>График прививок пуст.<br>Данные появятся после добавления ветеринаром.</p></div>'; return;
  }
  el.innerHTML = vaccines.map(function(v) {
    return '<div class="vaccine-row"><div><div class="vaccine-name">' + escHtml(v.name) + '</div>' +
      '<div class="vaccine-date">Следующая: ' + v.next + '</div></div>' +
      '<span class="vaccine-status ' + v.status + '">' + (v.status === 'ok' ? '✅ OK' : v.status === 'soon' ? '⚠️ Скоро' : '🔴 Просрочено') + '</span></div>';
  }).join('');
}

function showCabinetTab(tab, el) {
  if (tab === 'prices' && !isAdmin()) { showToast('🔐 Только администратор'); return; }
  document.querySelectorAll('.cabinet-tab').forEach(function(t) { t.classList.remove('active'); });
  document.querySelectorAll('.cabinet-panel').forEach(function(p) { p.classList.remove('active'); });
  document.getElementById('cab-' + tab).classList.add('active');
  if (el) el.classList.add('active');
  if (tab === 'prices') renderAdminPriceEditor();
}

// ========== SYMPTOM CHECKER ==========
var checkerAnimal = null;
var checkerSymptoms = [];

var SYMPTOMS = {
  'Собака': ['Вялость / слабость','Отказ от еды','Рвота','Диарея','Кашель','Одышка','Судороги','Хромота','Кровь в моче','Понос с кровью','Резкое похудение','Зуд / расчёсы','Увеличение живота','Слезотечение','Чихание'],
  'Кошка': ['Вялость / слабость','Отказ от еды','Рвота','Понос','Кашель','Одышка','Судороги','Кровь в моче','Затруднённое мочеиспускание','Резкое похудение','Зуд / облысение','Увеличение живота','Слезотечение','Чихание','Трудности при дыхании'],
  'Птица': ['Взъерошенные перья','Отказ от еды','Вялость','Одышка','Выделения из носа','Понос','Судороги','Нарушение координации','Опухшие глаза'],
  'Грызун': ['Вялость','Отказ от еды','Понос','Одышка','Судороги','Опухоли / шишки','Зуд','Облысение']
};

var URGENT = ['Одышка','Судороги','Понос с кровью','Кровь в моче','Затруднённое мочеиспускание','Трудности при дыхании','Увеличение живота'];
var MEDIUM = ['Рвота','Диарея','Понос','Отказ от еды','Хромота','Резкое похудение'];

function selectAnimal(animal, el) {
  checkerAnimal = animal; checkerSymptoms = [];
  document.querySelectorAll('.checker-animal-btn').forEach(function(b) { b.classList.remove('sel'); });
  el.classList.add('sel');
  var btn = document.getElementById('checkerBtn1');
  btn.disabled = false; btn.style.opacity = '1';
  // Обновим симптомы
  var syms = SYMPTOMS[animal] || [];
  document.getElementById('symptomGrid').innerHTML = syms.map(function(s) {
    return '<span class="symptom-chip" onclick="toggleSymptom(this,\'' + s.replace(/'/g,"\\'") + '\')">' + s + '</span>';
  }).join('');
}

function toggleSymptom(el, sym) {
  el.classList.toggle('sel');
  var idx = checkerSymptoms.indexOf(sym);
  if (idx === -1) checkerSymptoms.push(sym); else checkerSymptoms.splice(idx, 1);
  var btn = document.getElementById('checkerBtn2');
  btn.disabled = checkerSymptoms.length === 0;
  btn.style.opacity = checkerSymptoms.length > 0 ? '1' : '0.4';
}

function checkerNext(step) {
  document.querySelectorAll('.checker-step').forEach(function(s) { s.classList.remove('active'); });
  document.getElementById('checker-step-' + step).classList.add('active');
  if (step === 3) { showCheckerResult(); }
}

function showCheckerResult() {
  var urgentFound = checkerSymptoms.filter(function(s) { return URGENT.indexOf(s) !== -1; });
  var mediumFound = checkerSymptoms.filter(function(s) { return MEDIUM.indexOf(s) !== -1; });
  var level, title, text;
  if (urgentFound.length > 0) {
    level = 'urgent'; title = '🚨 Требуется срочная помощь!';
    text = '<strong>' + checkerAnimal + '</strong> — выявлены критические симптомы: <strong>' + urgentFound.join(', ') + '</strong>.<br><br>Это может указывать на опасное для жизни состояние. Рекомендуем немедленно обратиться в клинику. Клиника на ул. Мачуги, 20 работает <strong>круглосуточно</strong>.';
  } else if (mediumFound.length > 0 || checkerSymptoms.length >= 3) {
    level = 'medium'; title = '⚠️ Рекомендуем визит к ветеринару';
    text = 'Симптомы (' + checkerSymptoms.join(', ') + ') могут свидетельствовать о заболевании, требующем осмотра специалиста. Запишитесь на приём в ближайшие 1–2 дня для точной диагностики.';
  } else {
    level = 'low'; title = '✅ Состояние умеренное';
    text = 'Указанные симптомы (' + checkerSymptoms.join(', ') + ') не требуют экстренного вмешательства. Понаблюдайте за питомцем 1–2 дня. Если симптомы усилятся — запишитесь на приём. При любом сомнении консультация ветеринара никогда не лишняя!';
  }
  document.getElementById('checkerResult').innerHTML =
    '<div class="checker-result ' + level + '">' +
      '<div class="checker-result-title">' + title + '</div>' +
      '<p>' + text + '</p>' +
    '</div>';
}

// ========== OVERRIDE renderReviewCard to hide delete for non-admin ==========
// Re-patch renderReviewCard to control visibility
var _origRenderReviewCard = renderReviewCard;
renderReviewCard = function(r) {
  var html = _origRenderReviewCard(r);
  return html;
};

// After render, hide delete buttons for non-admin
var _origRenderReviews = renderReviews;
renderReviews = function() {
  _origRenderReviews();
  setTimeout(updateDeleteBtnVisibility, 20);
};
var _origRenderReviewsHome = renderReviewsHome;
renderReviewsHome = function() {
  _origRenderReviewsHome();
  setTimeout(updateDeleteBtnVisibility, 20);
};

// ========== OVERRIDE deleteReview to require login as admin ==========
deleteReview = function(id) {
  if (!isAdmin()) { showToast('🔐 Только администратор может удалять отзывы'); return; }
  if (!confirm('Удалить этот отзыв?')) return;
  var reviews = getReviews().filter(function(r) { return r.id !== id; });
  saveReviews(reviews);
  renderReviews(); renderReviewsHome();
  showToast('🗑️ Отзыв удалён');
};

openReply = function(id) {
  if (!isAdmin()) { showToast('🔐 Только администратор может отвечать на отзывы'); return; }
  _openReplyInner(id);
};

// ========== INIT ==========
(function() {
  var s = getSession();
  if (s) {
    document.getElementById('navAccountLabel').textContent = s.name.split(' ')[0];
  }
  updateDeleteBtnVisibility();
})();

var pageUrl = window.location.href;
var shareText = 'Ветеринарная клиника «Друг» в Краснодаре — 15 лет заботы о питомцах!';
function shareVK() { window.open('https://vk.com/share.php?url=' + encodeURIComponent(pageUrl) + '&title=' + encodeURIComponent(shareText), '_blank'); }
function shareTelegram() { window.open('https://t.me/share/url?url=' + encodeURIComponent(pageUrl) + '&text=' + encodeURIComponent(shareText), '_blank'); }
function shareWhatsApp() { window.open('https://wa.me/79898122200?text=' + encodeURIComponent(shareText + ' ' + pageUrl), '_blank'); }

// ========== МАСКА ТЕЛЕФОНА ==========
(function() {
  function applyPhoneMask(input) {
    input.addEventListener('input', function(e) {
      var val = this.value.replace(/\D/g, ''); // только цифры
      // Убираем ведущую 8 или 7
      if (val.length > 0 && (val[0] === '8' || val[0] === '7')) {
        val = val.slice(1);
      }
      val = val.slice(0, 10); // максимум 10 цифр (без кода страны)
      var out = '';
      if (val.length > 0) out = '+7 (' + val.slice(0, 3);
      if (val.length >= 4) out += ') ' + val.slice(3, 6);
      if (val.length >= 7) out += '-' + val.slice(6, 8);
      if (val.length >= 9) out += '-' + val.slice(8, 10);
      this.value = out;
    });
    input.addEventListener('keydown', function(e) {
      // Разрешаем backspace, delete, стрелки, tab
      if ([8,9,37,38,39,40,46].indexOf(e.keyCode) !== -1) return;
      // Блокируем нецифровые символы (кроме +)
      if ((e.key && !/[\d+]/.test(e.key)) && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
      }
    });
    input.addEventListener('focus', function() {
      if (this.value === '') this.value = '+7 (';
    });
    input.addEventListener('blur', function() {
      if (this.value === '+7 (' || this.value === '+7') this.value = '';
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    var ph = document.getElementById('f-phone');
    if (ph) applyPhoneMask(ph);
  });
})();
function copyMaxNumber() {
  var phone = '+7 989 812-22-00';
  var done = function() { showToast('Номер для MAX скопирован: +7 989 812-22-00'); };
  var fallback = function() {
    var ta = document.createElement('textarea');
    ta.value = phone;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    var copied = false;
    try { copied = document.execCommand('copy'); } catch(e) {}
    document.body.removeChild(ta);
    if (copied) done();
    else window.prompt('Скопируйте номер для MAX:', phone);
  };
  if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
    navigator.clipboard.writeText(phone).then(done).catch(fallback);
  } else {
    fallback();
  }
}
function copyLink() {
  navigator.clipboard.writeText(pageUrl).then(function() { showToast('✅ Ссылка скопирована!'); }).catch(function() {
    var inp = document.createElement('input'); inp.value = pageUrl;
    document.body.appendChild(inp); inp.select(); document.execCommand('copy');
    document.body.removeChild(inp); showToast('✅ Ссылка скопирована!');
  });
}

// ===== LOADER SCRIPT =====
(function(){
  var bar = document.getElementById('ldBar');
  var status = document.getElementById('ldStatus');
  var pctEl = document.getElementById('ldPct');
  var overlay = document.getElementById('loader-overlay');
  var msgs = ['Инициализация...','Загрузка данных...','Подготовка...','Почти готово...','Добро пожаловать!'];
  var pct = 0;
  var iv = setInterval(function(){
    pct += Math.random() * 12 + 4;
    if(pct > 100) pct = 100;
    var p = Math.round(pct);
    bar.style.width = pct + '%';
    pctEl.textContent = p + '%';
    var idx = Math.min(Math.floor(pct / 22), msgs.length - 1);
    status.textContent = msgs[idx];
    if(pct >= 100){
      clearInterval(iv);
      setTimeout(function(){
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
      }, 600);
    }
  }, 90);
  document.body.style.overflow = 'hidden';
})();
// ===== END LOADER SCRIPT =====

// ===== STAT COUNTER =====
(function() {
  function formatNum(n, thousands) {
    if (thousands) {
      return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
    return n.toString();
  }

  function animateCounter(el) {
    var target   = parseInt(el.dataset.count, 10);
    var suffix   = el.dataset.suffix  || '';
    var prefix   = el.dataset.prefix  || '';
    var thousands = !!el.dataset.thousands;

    var duration = 900; // ms total
    var start    = null;
    var startVal = 0;

    // easing: fast start, then slight ease-out at end
    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    el.classList.add('counting');

    function step(ts) {
      if (!start) start = ts;
      var elapsed = ts - start;
      var progress = Math.min(elapsed / duration, 1);
      var eased = easeOutExpo(progress);
      var current = Math.round(startVal + (target - startVal) * eased);

      el.textContent = prefix + formatNum(current, thousands) + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix + formatNum(target, thousands) + suffix;
        el.classList.remove('counting');
        el.classList.add('done');
        // remove done class after anim
        setTimeout(function(){ el.classList.remove('done'); }, 600);
      }
    }
    requestAnimationFrame(step);
  }

  function initCounters() {
    var els = document.querySelectorAll('.stat-num[data-count]');
    if (!els.length) return;

    var triggered = false;

    function runAll() {
      if (triggered) return;
      triggered = true;
      els.forEach(function(el, i) {
        setTimeout(function() { animateCounter(el); }, i * 120);
      });
      if (obs) obs.disconnect();
    }

    // На мобиле threshold 0.1 — достаточно чтобы 10% было видно
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) runAll();
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    obs.observe(els[0]);

    // Страховка: если через 3 сек всё ещё не запустилось — запускаем принудительно
    setTimeout(runAll, 3000);
  }

  // Ждём лоадер — но с запасным вариантом через DOMContentLoaded
  var loaderEl = document.getElementById('loader-overlay');
  if (loaderEl) {
    loaderEl.addEventListener('transitionend', function handler() {
      loaderEl.removeEventListener('transitionend', handler);
      initCounters();
    });
    // Запасной вариант если transitionend не сработал (iOS)
    setTimeout(initCounters, 2500);
  } else {
    window.addEventListener('DOMContentLoaded', initCounters);
  }
})();
// ===== END STAT COUNTER =====

// ===== GALLERY =====
var galleryPhotos = [
  { src: 'assets/image-040.jpg', caption: 'Рентген корги', cat: 'surgery' },
  { src: 'assets/image-041.jpg', caption: 'Рентген корги 2', cat: 'surgery' },
  { src: 'assets/image-042.jpg', caption: 'Хорёк на процедуре', cat: 'animals' },
  { src: 'assets/image-043.jpg', caption: 'Ветеринар с немецкой овчаркой', cat: 'team' },
  { src: 'assets/image-044.jpg', caption: 'Ветеринар с овчаркой', cat: 'team' },
  { src: 'assets/image-045.jpg', caption: 'Ветеринар с овчаркой 2', cat: 'team' },
  { src: 'assets/image-046.jpg', caption: 'Ветеринар со щенками', cat: 'team' },
  { src: 'assets/image-047.jpg', caption: 'Щенок немецкой овчарки', cat: 'animals' },
  { src: 'assets/image-048.jpg', caption: 'Щенок немецкой овчарки 2', cat: 'animals' },
  { src: 'assets/image-049.jpg', caption: 'Хорёк в реанимации', cat: 'surgery' },
  { src: 'assets/image-050.jpg', caption: 'Ветеринар с хорьком', cat: 'surgery' },
  { src: 'assets/image-051.jpg', caption: 'Новорождённые щенки', cat: 'animals' },
  { src: 'assets/image-052.jpg', caption: 'Шоколадный лабрадор с мячом', cat: 'animals' },
  { src: 'assets/image-053.jpg', caption: 'Кошка сфинкс на осмотре', cat: 'animals' },
  { src: 'assets/image-030.jpg', caption: 'Ветеринар со щенками немецкой овчарки', cat: 'team' },
  { src: 'assets/image-031.jpg', caption: 'Хаски на приёме', cat: 'animals' },
  { src: 'assets/image-032.jpg', caption: 'Алабай в зале ожидания', cat: 'animals' },
  { src: 'assets/image-033.jpg', caption: 'Лемур — экзотический пациент', cat: 'animals' },
  { src: 'assets/image-034.jpg', caption: 'Весёлый питбуль', cat: 'animals' },
  { src: 'assets/image-035.jpg', caption: 'Пудель-той с перевязкой', cat: 'animals' },
  { src: 'assets/image-036.jpg', caption: 'Любовь с первого взгляда', cat: 'team' },
  { src: 'assets/image-037.jpg', caption: 'Новорождённый после кесарева', cat: 'surgery' },
  { src: 'assets/image-038.jpg', caption: 'Хирургическая операция', cat: 'surgery' },
  { src: 'assets/image-039.jpg', caption: 'Щенок лабрадора на осмотре', cat: 'team' }
,
  { src: 'assets/image-054.jpg', caption: 'Стоматологическая процедура', cat: 'surgery' },
  { src: 'assets/image-055.jpg', caption: 'Анализ рентген-снимка зубов', cat: 'surgery' },
  { src: 'assets/image-056.jpg', caption: 'Стоматологический рентген', cat: 'surgery' },
  { src: 'assets/image-057.jpg', caption: 'Рентген-оборудование', cat: 'surgery' },
  { src: 'assets/image-058.jpg', caption: 'Рентген зубов', cat: 'surgery' },
  { src: 'assets/image-059.jpg', caption: 'Инструменты к операции', cat: 'surgery' },
  { src: 'assets/image-060.jpg', caption: 'Щенок корги', cat: 'animals' },
  { src: 'assets/image-061.jpg', caption: 'Щенки пуделя', cat: 'animals' },
  { src: 'assets/image-062.jpg', caption: 'Лечение хорька', cat: 'surgery' },
  { src: 'assets/image-063.jpg', caption: 'Команда ветеринарной клиники', cat: 'team' },
  { src: 'assets/image-064.jpg', caption: 'Новорождённые щенки дога', cat: 'animals' },
  { src: 'assets/image-065.jpg', caption: 'Щенок кане-корсо', cat: 'animals' },
  { src: 'assets/image-066.jpg', caption: 'Щенки бигля', cat: 'animals' },
  { src: 'assets/image-067.jpg', caption: 'Ветеринар с лабрадором', cat: 'team' },
  { src: 'assets/image-068.jpg', caption: 'Стоматология — рентген', cat: 'surgery' }
,
  { src: 'assets/image-069.jpg', caption: 'Кот рэгдолл на осмотре', cat: 'animals' },
  { src: 'assets/image-070.jpg', caption: 'Ветеринар с бордер-колли', cat: 'team' },
  { src: 'assets/image-071.jpg', caption: 'Ветеринар с бордер-колли 2', cat: 'team' },
  { src: 'assets/image-072.jpg', caption: 'Осмотр бордер-колли', cat: 'team' },
  { src: 'assets/image-073.jpg', caption: 'Операция вдвоём', cat: 'surgery' },
  { src: 'assets/image-074.jpg', caption: 'Ветеринар с собакой', cat: 'team' },
  { src: 'assets/image-075.jpg', caption: 'Два корги в клинике', cat: 'animals' },
  { src: 'assets/image-076.jpg', caption: 'Кот рэгдолл крупным планом', cat: 'animals' },
  { src: 'assets/image-077.jpg', caption: 'Ветеринар с котом рэгдолл', cat: 'team' },
  { src: 'assets/image-078.jpg', caption: 'Кот рэгдолл — инъекция', cat: 'animals' },
  { src: 'assets/image-079.jpg', caption: 'Кот рэгдолл — портрет', cat: 'animals' },
  { src: 'assets/image-080.jpg', caption: 'Ветеринар с котом рэгдолл 2', cat: 'team' },
  { src: 'assets/image-081.jpg', caption: 'Кот рэгдолл на осмотре 2', cat: 'animals' },
  { src: 'assets/image-082.jpg', caption: 'Ветеринар с рэгдоллом', cat: 'team' },
  { src: 'assets/image-083.jpg', caption: 'Измерение сахара у кота', cat: 'surgery' }
];
var lbIndex = 0;
var lbFiltered = galleryPhotos.map(function(_,i){ return i; });

function filterGallery(cat, btn) {
  document.querySelectorAll('.gf-btn').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
  var items = document.querySelectorAll('.gallery-item');
  lbFiltered = [];
  items.forEach(function(item, i) {
    var itemCat = item.dataset.cat;
    var show = cat === 'all' || itemCat === cat;
    item.classList.toggle('gi-hidden', !show);
    if (show) lbFiltered.push(i);
  });
}

function openLightbox(idx) {
  var pos = lbFiltered.indexOf(idx);
  lbIndex = pos >= 0 ? pos : 0;
  renderLb();
  document.getElementById('lightboxOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightboxOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function lbNav(dir) {
  lbIndex = (lbIndex + dir + lbFiltered.length) % lbFiltered.length;
  renderLb();
}

function renderLb() {
  var photo = galleryPhotos[lbFiltered[lbIndex]];
  var img = document.getElementById('lbImg');
  img.style.opacity = '0';
  img.src = photo.src;
  img.onload = function() { img.style.transition = 'opacity 0.25s'; img.style.opacity = '1'; };
  document.getElementById('lbCaption').textContent = photo.caption;
  document.getElementById('lbCounter').textContent = (lbIndex + 1) + ' / ' + lbFiltered.length;
}

document.addEventListener('keydown', function(e) {
  var lb = document.getElementById('lightboxOverlay');
  if (!lb.classList.contains('open')) return;
  if (e.key === 'ArrowRight') lbNav(1);
  if (e.key === 'ArrowLeft') lbNav(-1);
  if (e.key === 'Escape') closeLightbox();
});
// ===== END GALLERY =====
