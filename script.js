const sections = ['coffee','cold','food','dessert','extras'];

  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;

      if (cat === 'all') {
        document.querySelectorAll('section[data-cat], .sep').forEach(el => el.style.display = '');
      } else {
        document.querySelectorAll('section[data-cat]').forEach(sec => {
          sec.style.display = (sec.dataset.cat === cat || sec.dataset.cat === 'all') ? '' : 'none';
        });
        document.querySelectorAll('.sep').forEach((sep, i) => {
          sep.style.display = 'none';
        });
        const target = document.getElementById('sec-' + cat);
        if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      }
    });
  });

  function openModal(name, desc, emoji, price, allergens) {
    document.getElementById('modalName').textContent = name;
    document.getElementById('modalDesc').textContent = desc;
    document.getElementById('modalEmoji').textContent = emoji;
    document.getElementById('modalPrice').textContent = price;

    const tagsEl = document.getElementById('modalTags');
    tagsEl.innerHTML = '';
    allergens.forEach(a => {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = a;
      tagsEl.appendChild(span);
    });

    document.getElementById('modalOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    document.getElementById('modalOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  function handleOverlayClick(e) {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    if (!q) {
      document.querySelectorAll('.item').forEach(el => el.style.display = '');
      document.querySelectorAll('section[data-cat], .sep').forEach(el => el.style.display = '');
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('[data-cat="all"]').classList.add('active');
      return;
    }

    document.querySelectorAll('.sep').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));

    document.querySelectorAll('section[data-cat]').forEach(sec => {
      const items = sec.querySelectorAll('.item');
      let any = false;
      items.forEach(item => {
        const name = (item.dataset.name || '').toLowerCase();
        const text = item.textContent.toLowerCase();
        const match = name.includes(q) || text.includes(q);
        item.style.display = match ? '' : 'none';
        if (match) any = true;
      });
      sec.style.display = any ? '' : 'none';
    });
  });

function openMenu() {
    const landing = document.getElementById('landing');
    landing.classList.add('exit');
    setTimeout(() => {
      landing.style.display = 'none';
      const menuPage = document.getElementById('menu-page');
      menuPage.classList.add('visible');
      window.scrollTo(0, 0);
    }, 520);
  }

  function closeMenu() {
    const menuPage = document.getElementById('menu-page');
    const landing = document.getElementById('landing');
    menuPage.classList.remove('visible');
    landing.style.display = '';
    landing.classList.remove('exit');
    landing.classList.add('enter');
    window.scrollTo(0, 0);
    setTimeout(() => landing.classList.remove('enter'), 450);
  }