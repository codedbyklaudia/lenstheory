/* ==========================================================================
   Lens Theory: basket, details dialog and enquiry shortcut
   Plain JavaScript, no libraries.
   - Bookable services are read from the cards on the page (data-service)
   - Services are priced per hour, and the quantity in the basket is hours
   - The basket is saved in localStorage, so it survives a page refresh
   - Only ids and hours are stored; prices always come from the page
   ========================================================================== */

(() => {
  'use strict';

  const STORAGE_KEY = 'lenstheory-basket-v1';
  const MAX_HOURS = 10;

  /* ---------- Small helpers ---------- */

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function formatPrice(value) {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  const hoursText = (hours) => `${hours} hour${hours === 1 ? '' : 's'}`;

  function createEl(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function createButton(className, text, data, label) {
    const button = createEl('button', className, text);
    button.type = 'button';
    Object.entries(data).forEach(([key, value]) => {
      button.dataset[key] = value;
    });
    if (label) button.setAttribute('aria-label', label);
    return button;
  }

  /* ==========================================================================
     Details dialog (terms for a session)
     ========================================================================== */

  $$('[data-terms-open]').forEach((button) => {
    button.addEventListener('click', () => {
      const dialog = document.getElementById(button.dataset.termsOpen);
      if (!dialog || typeof dialog.showModal !== 'function') return;
      dialog.showModal();
      document.body.classList.add('modal-open');
    });
  });

  $$('dialog').forEach((dialog) => {
    dialog.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
    });

    /* Clicking the dark area outside the box closes it */
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });

    $$('[data-terms-close]', dialog).forEach((button) => {
      button.addEventListener('click', () => dialog.close());
    });
  });

  /* ==========================================================================
     Enquiry shortcut: "Enquire" pre-selects the shoot type in the form
     ========================================================================== */

  $$('[data-enquire]').forEach((link) => {
    link.addEventListener('click', () => {
      const select = $('#type');
      if (select) select.value = link.dataset.enquire;
    });
  });

  /* ==========================================================================
     Basket
     ========================================================================== */

  const drawer = $('#basket');
  if (!drawer) return;

  const overlay = $('[data-basket-overlay]');
  const closeButton = $('[data-basket-close]', drawer);
  const listEl = $('[data-basket-list]', drawer);
  const emptyEl = $('[data-basket-empty]', drawer);
  const footerEl = $('[data-basket-footer]', drawer);
  const totalEl = $('[data-basket-total]', drawer);
  const clearButton = $('[data-basket-clear]', drawer);
  const statusEl = $('[data-basket-status]');
  const countEls = $$('[data-basket-count]');
  const floatingButton = $('[data-basket-fab]');

  /* ---------- Service catalogue (read from the cards) ---------- */

  const catalogue = new Map();

  $$('[data-service]').forEach((card) => {
    const price = Number(card.dataset.price);
    if (!card.dataset.id || !Number.isFinite(price) || price < 0) return;

    const image = $('.card__img', card);
    catalogue.set(card.dataset.id, {
      id: card.dataset.id,
      name: card.dataset.name || card.dataset.id,
      price, /* price per hour */
      image: image ? image.getAttribute('src') : '',
    });
  });

  /* ---------- Basket state: id -> hours ---------- */

  let basket = new Map();

  function loadBasket() {
    const loaded = new Map();

    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

      if (Array.isArray(saved)) {
        saved.forEach((entry) => {
          const qty = Number(entry && entry.qty);
          if (entry && catalogue.has(entry.id) && Number.isInteger(qty) && qty > 0) {
            loaded.set(entry.id, Math.min(qty, MAX_HOURS));
          }
        });
      }
    } catch (error) {
      /* Storage unavailable or corrupted: start with an empty basket */
    }

    basket = loaded;
  }

  function saveBasket() {
    try {
      const data = [...basket].map(([id, qty]) => ({ id, qty }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      /* Storage unavailable: the basket still works for this visit */
    }
  }

  /* ---------- Actions ---------- */

  function announce(message) {
    if (!statusEl || !message) return;
    statusEl.textContent = '';
    setTimeout(() => {
      statusEl.textContent = message;
    }, 50);
  }

  function update(message) {
    saveBasket();
    render();
    announce(message);
  }

  function addItem(id) {
    const item = catalogue.get(id);
    if (!item) return false;

    const current = basket.get(id) || 0;
    if (current >= MAX_HOURS) {
      announce(`You can book up to ${MAX_HOURS} hours of each session.`);
      return false;
    }

    basket.set(id, current + 1);
    update(`${item.name} added to basket, ${hoursText(current + 1)} in total`);
    return true;
  }

  function changeHours(id, change) {
    const next = (basket.get(id) || 0) + change;

    if (next <= 0) {
      removeItem(id);
      return;
    }

    basket.set(id, Math.min(next, MAX_HOURS));
    update();
  }

  function removeItem(id) {
    const item = catalogue.get(id);
    basket.delete(id);
    update(item ? `${item.name} removed from basket` : undefined);
  }

  function clearBasket() {
    basket.clear();
    update('Basket cleared');
  }

  /* ---------- Rendering ---------- */

  function buildItem(item, hours) {
    const li = createEl('li', 'basket__item');

    if (item.image) {
      const thumb = createEl('img', 'basket__thumb');
      thumb.src = item.image;
      thumb.alt = '';
      thumb.width = 72;
      thumb.height = 72;
      li.append(thumb);
    } else {
      li.classList.add('basket__item--no-image');
    }

    const info = createEl('div', 'basket__info');
    const name = createEl('p', 'basket__name', item.name);
    const price = createEl('p', 'basket__price', `${formatPrice(item.price)} per hour`);

    const row = createEl('div', 'basket__row');
    const quantity = createEl('div', 'qty');
    quantity.setAttribute('role', 'group');
    quantity.setAttribute('aria-label', `Hours for ${item.name}`);

    const decrease = createButton('qty__btn', '\u2212', { action: 'decrease', id: item.id }, `Remove one hour of ${item.name}`);
    const value = createEl('span', 'qty__value', `${hours} h`);
    value.setAttribute('aria-label', hoursText(hours));
    const increase = createButton('qty__btn', '+', { action: 'increase', id: item.id }, `Add one hour of ${item.name}`);
    increase.disabled = hours >= MAX_HOURS;
    quantity.append(decrease, value, increase);

    const lineTotal = createEl('p', 'basket__line', formatPrice(item.price * hours));
    row.append(quantity, lineTotal);

    const remove = createButton('basket__remove', 'Remove', { action: 'remove', id: item.id }, `Remove ${item.name} from basket`);

    info.append(name, price, row, remove);
    li.append(info);
    return li;
  }

  function render() {
    let count = 0;
    let total = 0;

    listEl.replaceChildren();

    basket.forEach((hours, id) => {
      const item = catalogue.get(id);
      count += hours;
      total += item.price * hours;
      listEl.append(buildItem(item, hours));
    });

    countEls.forEach((element) => {
      element.textContent = String(count);
      element.hidden = count === 0;
    });

    totalEl.textContent = formatPrice(total);
    emptyEl.hidden = count > 0;
    listEl.hidden = count === 0;
    footerEl.hidden = count === 0;

    if (floatingButton) floatingButton.hidden = count === 0;
  }

  /* ---------- Opening and closing the drawer ---------- */

  const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
  let lastFocused = null;

  const isOpen = () => drawer.classList.contains('is-open');

  function setExpanded(value) {
    $$('[data-basket-open]').forEach((button) => {
      button.setAttribute('aria-expanded', String(value));
    });
  }

  function openBasket(trigger) {
    if (isOpen()) return;
    lastFocused = trigger || document.activeElement;

    drawer.removeAttribute('inert');
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
    document.body.classList.add('basket-open');
    setExpanded(true);
    closeButton.focus();
  }

  function closeBasket() {
    if (!isOpen()) return;

    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    drawer.setAttribute('inert', '');
    document.body.classList.remove('basket-open');
    setExpanded(false);

    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  }

  /* ---------- "Added" feedback on the card button ---------- */

  function flashAdded(button) {
    if (!button.dataset.label) button.dataset.label = button.textContent;

    button.classList.add('is-added');
    button.textContent = 'Added \u2713';

    clearTimeout(button.flashTimer);
    button.flashTimer = setTimeout(() => {
      button.classList.remove('is-added');
      button.textContent = button.dataset.label;
    }, 1600);
  }

  /* ---------- Events ---------- */

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const addButton = target.closest('[data-add-to-basket]');
    if (addButton) {
      const card = addButton.closest('[data-service]');
      if (card && addItem(card.dataset.id)) flashAdded(addButton);
      return;
    }

    const opener = target.closest('[data-basket-open]');
    if (opener) {
      openBasket(opener);
      return;
    }

    if (target.closest('[data-basket-close]') || target === overlay) {
      closeBasket();
    }
  });

  listEl.addEventListener('click', (event) => {
    const button = event.target instanceof Element ? event.target.closest('[data-action]') : null;
    if (!button) return;

    const { action, id } = button.dataset;

    if (action === 'increase') changeHours(id, 1);
    if (action === 'decrease') changeHours(id, -1);
    if (action === 'remove') removeItem(id);

    /* Keep keyboard focus in place after the list is redrawn */
    const same = $(`[data-action="${action}"][data-id="${id}"]`, listEl);
    const fallback = $('[data-action]', listEl) || closeButton;
    (same && !same.disabled ? same : fallback).focus();
  });

  clearButton.addEventListener('click', () => {
    clearBasket();
    closeButton.focus();
  });

  document.addEventListener('keydown', (event) => {
    if (!isOpen()) return;

    if (event.key === 'Escape') {
      closeBasket();
      return;
    }

    if (event.key !== 'Tab') return;

    /* Keep Tab inside the open drawer */
    const focusable = $$(FOCUSABLE, drawer).filter((element) => !element.closest('[hidden]'));
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* Keep several open tabs in sync */
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      loadBasket();
      render();
    }
  });

  /* ---------- Start ---------- */

  loadBasket();
  render();
})();