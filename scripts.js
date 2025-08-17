
// Casa Bruma – scripts.js
let SITE = { data: null };

async function loadContent(){
  const res = await fetch('content.json');
  SITE.data = await res.json();
  document.querySelectorAll('[data-restaurant-name]').forEach(el=>el.textContent = SITE.data.restaurant.name);
  buildSeals();
  buildMenu();
  buildFeatured();
  buildCalendar();
  buildPackages();
  buildTestimonials();
  initFilters();
  initEmailPopup();
  hydrateContact();
  lazyFadeIns();
}

function qs(sel){return document.querySelector(sel)}
function qsa(sel){return [...document.querySelectorAll(sel)]}

// Seals
function buildSeals(){
  const wrap = qs('#seals');
  wrap.innerHTML = SITE.data.seals.map(s=>`<span class="seal"><span>${s.icon}</span> ${s.label}</span>`).join('');
}

// Menu
function groupBy(arr, key){ return arr.reduce((acc, it)=>((acc[it[key]]??=[]).push(it), acc), {}) }
function buildMenu(){
  const categories = SITE.data.menu_categories;
  const items = SITE.data.menu_items;
  const wrap = qs('#menu');
  const grouped = groupBy(items, 'category');

  wrap.innerHTML = `
    <div class="filters" id="diet-filters">
      <span class="badge">Filtros:</span>
      <button class="btn" data-filter="all">Todos</button>
      <button class="btn" data-filter="vegano">Vegano</button>
      <button class="btn" data-filter="gluten-free">Sin gluten</button>
    </div>
    ${categories.map(cat=>`
      <section class="category fade-in">
        <h3>${cat.icon} ${cat.name}</h3>
        <div>
          <details open>
            <summary>Ver platos</summary>
            <div>
              ${ (grouped[cat.name]||[]).map(i=>`
                <div class="item" data-tags="${(i.tags||[]).join(',')}">
                  <div>
                    <div><strong>${i.name}</strong> — ${i.desc}</div>
                    <div class="tags">${(i.tags||[]).join(' • ')}</div>
                  </div>
                  <div><strong>$${i.price.toLocaleString('es-CL')}</strong></div>
                </div>
              `).join('') }
            </div>
          </details>
        </div>
      </section>
    `).join('')}
  `;
}

// Featured dishes
function buildFeatured(){
  const wrap = qs('#featured');
  wrap.innerHTML = SITE.data.featured_dishes.map(d=>`
    <article class="card fade-in">
      <img src="${d.image}" alt="${d.name}" loading="lazy">
      <div class="p">
        <h3>${d.name}</h3>
        <p>${d.desc}</p>
        <div class="meta"><span>${(d.tags||[]).join(' • ')}</span><span>$${d.price.toLocaleString('es-CL')}</span></div>
      </div>
    </article>
  `).join('');
}

// Calendar (simple monthly view)
function buildCalendar(dateStr){
  const wrap = qs('#calendar');
  const data = SITE.data.events;
  const baseDate = dateStr ? new Date(dateStr) : new Date();
  const y = baseDate.getFullYear();
  const m = baseDate.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m+1, 0);
  const days = last.getDate();
  const head = qs('#cal-head');
  head.innerHTML = `
    <button class="btn" id="prev-month">◀</button>
    <strong>${baseDate.toLocaleDateString('es-CL', {month:'long', year:'numeric'})}</strong>
    <button class="btn" id="next-month">▶</button>
  `;
  const grid = qs('#cal-grid');
  grid.innerHTML = '';
  const weekday = (d)=> (new Date(y, m, d).getDay()+6)%7; // Mon=0

  const labels = ['L','M','X','J','V','S','D'];
  labels.forEach(l=> grid.insertAdjacentHTML('beforeend', `<div class="day badge" style="text-align:center;font-weight:700">${l}</div>`));

  for(let i=0;i<weekday(1);i++){
    grid.insertAdjacentHTML('beforeend','<div></div>');
  }
  for(let d=1; d<=days; d++){
    const dateISO = new Date(y,m,d).toISOString().slice(0,10);
    const todaysEvents = data.filter(e=>e.date===dateISO);
    grid.insertAdjacentHTML('beforeend',`
      <div class="day">
        <div style="font-weight:700">${d}</div>
        ${todaysEvents.map(e=>`<div class="event" title="${e.summary}">${e.time} · ${e.title.split(':')[0]}</div>`).join('')}
      </div>
    `);
  }
  qs('#prev-month').onclick = ()=> buildCalendar(new Date(y, m-1, 1).toISOString());
  qs('#next-month').onclick = ()=> buildCalendar(new Date(y, m+1, 1).toISOString());
}

// Packages + testimonials
function buildPackages(){
  const wrap = qs('#packages');
  wrap.innerHTML = SITE.data.packages.map(p=>`
    <article class="card fade-in">
      <div class="p">
        <h3>${p.name}</h3>
        <ul>${p.includes.map(i=>`<li>${i}</li>`).join('')}</ul>
        <p><strong>${p.price}</strong></p>
        <button class="btn filled" onclick="openEventForm('${p.name}')">Consultar paquete</button>
      </div>
    </article>
  `).join('');
}
function buildTestimonials(){
  const wrap = qs('#testimonials');
  wrap.innerHTML = SITE.data.testimonials.map(t=>`
    <blockquote class="card p fade-in">“${t.text}”<br><small>— ${t.author}</small></blockquote>
  `).join('');
}

// Filters
function initFilters(){
  qsa('#diet-filters .btn').forEach(b=>{
    b.addEventListener('click', ()=>{
      const f = b.dataset.filter;
      qsa('.item').forEach(it=>{
        const tags = it.dataset.tags || '';
        it.style.display = (f==='all' || tags.includes(f)) ? '' : 'none';
      })
    })
  })
}

// Email capture popup
function initEmailPopup(){
  const key = 'cb_popup_closed';
  if(localStorage.getItem(key)) return;
  const popup = qs('#popup');
  setTimeout(()=> popup.classList.add('show'), 2000);
  qs('#popup-close').onclick = ()=>{ popup.classList.remove('show'); localStorage.setItem(key,'1') };
  qs('#popup-form').addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = e.target.email.value.trim();
    if(!email) return;
    // Here you'd POST to your email provider (Mailchimp/etc)
    popup.querySelector('.status').textContent = '¡Gracias! Cupón enviado a tu correo.';
    setTimeout(()=>{ popup.classList.remove('show'); localStorage.setItem(key,'1') }, 1200);
  });
}

// Contact hydration
function hydrateContact(){
  const tel = SITE.data.restaurant.phone;
  const wa = SITE.data.restaurant.whatsapp;
  qs('#phone-link').href = `tel:${tel.replace(/\s+/g,'')}`;
  qs('#wa-link').href = `https://wa.me/${wa}`;
}

// Event form opener
function openEventForm(prefill){
  const input = qs('#evento_tipo');
  input.value = prefill || '';
  qs('#contact').scrollIntoView({behavior:'smooth'});
}

// Quick reserve (mock; replace with OpenTable or your backend)
function handleQuickReserve(e){
  e.preventDefault();
  const fd = new FormData(e.target);
  const date = fd.get('date'), time = fd.get('time'), ppl = fd.get('people');
  alert(`Reserva solicitada para ${date} a las ${time} (${ppl} personas).\n\nIntegra OpenTable o tu API aquí.`);
}

// Fade-in on scroll
function lazyFadeIns(){
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(en.isIntersecting){ en.target.classList.add('visible'); io.unobserve(en.target); }
    });
  }, {threshold:.1});
  qsa('.fade-in').forEach(el=> io.observe(el));
}

window.addEventListener('DOMContentLoaded', loadContent);
window.handleQuickReserve = handleQuickReserve;
window.openEventForm = openEventForm;
