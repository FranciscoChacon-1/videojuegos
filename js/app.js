// ================================
// Utilidades comunes
// ================================
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// Año en footer
const yearSpan = $("#year");
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

// Menú responsive
const btnMenu = $("#btnMenu");
const menu = $("#menu");
if (btnMenu && menu) {
  btnMenu.addEventListener("click", () => menu.classList.toggle("show"));
  // Cierra al seleccionar un enlace
  $$(".nav-menu a").forEach(a =>
    a.addEventListener("click", () => menu.classList.remove("show"))
  );
}

// Tema (oscuro/claro) con persistencia
const btnTheme = $("#btnTheme");
const root = document.documentElement;
(function initTheme(){
  const saved = localStorage.getItem("theme") || "dark";
  if(saved === "light") document.body.classList.add("light");
})();
if (btnTheme) {
  btnTheme.addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
  });
}

// ================================
// Inicio: suscripción simple (fake)
// ================================
const formSub = $("#formSub");
if (formSub) {
  formSub.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("#subEmail").value.trim();
    if (!email) return;
    showToast(`¡Gracias por suscribirte, ${email}!`);
    formSub.reset();
  });
}

// ================================
// Catálogo: filtro y lista de deseados
// ================================
const search = $("#search");
const platformSel = $("#platform");
const genreSel = $("#genre");
const gamesGrid = $("#gamesGrid");
const wishList = $("#wishList");
const clearListBtn = $("#clearList");

let wish = JSON.parse(localStorage.getItem("wish") || "[]");
renderWish();

function filterGames(){
  if(!gamesGrid) return;
  const term = (search?.value || "").toLowerCase();
  const platform = platformSel?.value || "";
  const genre = genreSel?.value || "";

  $$(".game", gamesGrid).forEach(card => {
    const title = card.dataset.title.toLowerCase();
    const p = card.dataset.platform;
    const g = card.dataset.genre;
    const match =
      (!term || title.includes(term)) &&
      (!platform || platform === p) &&
      (!genre || genre === g);
    card.style.display = match ? "" : "none";
  });
}
[search, platformSel, genreSel].forEach(ctrl => {
  if (ctrl) ctrl.addEventListener("input", filterGames);
});

// “Añadir” a lista de deseados
if (gamesGrid) {
  gamesGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-cart");
    if (!btn) return;
    const game = btn.dataset.game;
    if (!wish.includes(game)) {
      wish.push(game);
      persistWish();
      renderWish();
      showToast(`Añadido a tu lista: ${game}`);
    } else {
      showToast(`"${game}" ya está en tu lista`);
    }
  });
}
if (clearListBtn) {
  clearListBtn.addEventListener("click", () => {
    wish = [];
    persistWish();
    renderWish();
    showToast("Lista limpiada");
  });
}
function renderWish(){
  if(!wishList) return;
  wishList.innerHTML = "";
  wish.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${item}</span>
      <button class="btn danger btn-sm" aria-label="Eliminar" data-remove="${item}">Eliminar</button>
    `;
    wishList.appendChild(li);
  });
  // eliminar individuales
  wishList.addEventListener("click", (e) => {
    const rm = e.target.closest("[data-remove]");
    if (!rm) return;
    const name = rm.dataset.remove;
    wish = wish.filter(x => x !== name);
    persistWish();
    renderWish();
    showToast(`Eliminado: ${name}`);
  }, { once: true });
}
function persistWish(){ localStorage.setItem("wish", JSON.stringify(wish)); }

// ================================
// Contacto: validación básica
// ================================
const contactForm = $("#contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fields = ["name", "email", "platformSel", "message"];
    let ok = true;

    fields.forEach(id => {
      const el = $("#" + id);
      const err = document.querySelector(`[data-error-for="${id}"]`);
      if(!el || !err) return;

      if(!el.value.trim()){
        ok = false;
        err.textContent = "Este campo es obligatorio.";
      } else if (id === "email" && !/^\S+@\S+\.\S+$/.test(el.value.trim())){
        ok = false;
        err.textContent = "Ingresa un correo válido.";
      } else {
        err.textContent = "";
      }
    });

    const accept = $("#accept");
    if (!accept.checked) {
      ok = false;
      showToast("Debes aceptar la política de privacidad");
    }

    if (ok) {
      showToast("¡Mensaje enviado! Te responderemos pronto.");
      contactForm.reset();
    }
  });
}

// ================================
// Toast helper
// ================================
const toast = $("#toast");
function showToast(msg){
  if(!toast){
    alert(msg); return;
  }
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}
