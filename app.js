"use strict";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

const CART_STORAGE_KEY = "cobreyhierro_carrito";
const THEME_STORAGE_KEY = "cobreyhierro_tema";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
});

const state = {
  productos: [],
  carrito: []
};

const dom = {
  loadingState: document.getElementById("loading-state"),
  errorState: document.getElementById("error-state"),
  btnRetry: document.getElementById("btn-retry"),
  catalogoGrid: document.getElementById("catalogo-grid"),

  btnTheme: document.getElementById("btn-theme"),
  iconSun: document.getElementById("icon-sun"),
  iconMoon: document.getElementById("icon-moon"),

  btnCart: document.getElementById("btn-cart"),
  cartCount: document.getElementById("cart-count"),
  cartOverlay: document.getElementById("cart-overlay"),
  cartDrawer: document.getElementById("cart-drawer"),
  btnCartClose: document.getElementById("btn-cart-close"),
  cartItems: document.getElementById("cart-items"),
  cartEmpty: document.getElementById("cart-empty"),
  cartTotal: document.getElementById("cart-total"),
  btnCheckout: document.getElementById("btn-checkout"),

  btnContacto: document.getElementById("btn-contacto"),
  contactOverlay: document.getElementById("contact-overlay"),
  contactModal: document.getElementById("contact-modal"),
  btnContactClose: document.getElementById("btn-contact-close"),
  contactForm: document.getElementById("contact-form"),
  contactFeedback: document.getElementById("contact-feedback"),
  btnContactSubmit: document.getElementById("btn-contact-submit"),

  year: document.getElementById("year")
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  dom.year.textContent = new Date().getFullYear();

  initTheme();
  loadCartFromStorage();
  bindGlobalEvents();

  await cargarProductos();

  renderCarrito();
}

async function cargarProductos() {
  mostrarEstadoCarga();

  try {
    const respuesta = await fetch("productos.json");

    if (!respuesta.ok) {
      throw new Error(`Error HTTP ${respuesta.status} al cargar productos.json`);
    }

    const productos = await respuesta.json();

    if (!Array.isArray(productos) || productos.length === 0) {
      throw new Error("El catálogo llegó vacío o con un formato inesperado.");
    }

    state.productos = productos;
    renderCatalogo();
    mostrarEstadoListo();

  } catch (error) {
    console.error("No se pudo cargar el catálogo:", error);
    mostrarEstadoError();
  }
}

function mostrarEstadoCarga() {
  dom.loadingState.hidden = false;
  dom.errorState.hidden = true;
  dom.catalogoGrid.hidden = true;
}

function mostrarEstadoError() {
  dom.loadingState.hidden = true;
  dom.errorState.hidden = false;
  dom.catalogoGrid.hidden = true;
}

function mostrarEstadoListo() {
  dom.loadingState.hidden = true;
  dom.errorState.hidden = true;
  dom.catalogoGrid.hidden = false;
}

function renderCatalogo() {
  dom.catalogoGrid.innerHTML = state.productos.map(productoCardHTML).join("");
}

function productoCardHTML(producto) {
  return `
    <li class="product-card" data-id="${producto.id}">
      <div class="product-media">
        <img src="${producto.imagen}" alt="${escapeHTML(producto.nombre)}" loading="lazy">
      </div>
      <div class="product-body">
        <span class="product-category">${escapeHTML(producto.categoria)}</span>
        <h3 class="product-name">${escapeHTML(producto.nombre)}</h3>
        <p class="product-desc">${escapeHTML(producto.descripcion)}</p>
        <p class="product-price">${formatoCOP.format(producto.precio)}</p>
        <div class="product-actions">
          <input
            type="number"
            min="1"
            value="1"
            class="qty-input"
            aria-label="Cantidad de ${escapeHTML(producto.nombre)}"
            data-qty-for="${producto.id}"
          >
          <button type="button" class="btn btn-primary btn-add" data-add-id="${producto.id}">
            Agregar al carrito
          </button>
        </div>
      </div>
    </li>
  `;
}

function bindGlobalEvents() {
  dom.catalogoGrid.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-add-id]");
    if (!boton) return;

    const id = Number(boton.dataset.addId);
    const input = dom.catalogoGrid.querySelector(`[data-qty-for="${id}"]`);
    const cantidad = normalizarCantidad(input.value);
    input.value = cantidad;

    agregarAlCarrito(id, cantidad);
    feedbackBotonAgregado(boton);
  });

  dom.btnCart.addEventListener("click", abrirCarrito);
  dom.btnCartClose.addEventListener("click", cerrarCarrito);
  dom.cartOverlay.addEventListener("click", cerrarCarrito);

  dom.cartItems.addEventListener("click", (evento) => {
    const btnMenos = evento.target.closest("[data-decrease]");
    const btnMas = evento.target.closest("[data-increase]");
    const btnEliminar = evento.target.closest("[data-remove]");

    if (btnMenos) cambiarCantidad(Number(btnMenos.dataset.decrease), -1);
    if (btnMas) cambiarCantidad(Number(btnMas.dataset.increase), 1);
    if (btnEliminar) eliminarDelCarrito(Number(btnEliminar.dataset.remove));
  });

  dom.cartItems.addEventListener("change", (evento) => {
    const input = evento.target.closest("[data-qty-cart-for]");
    if (!input) return;
    const id = Number(input.dataset.qtyCartFor);
    const cantidad = normalizarCantidad(input.value);
    input.value = cantidad;
    fijarCantidad(id, cantidad);
  });

  dom.btnCheckout.addEventListener("click", () => {
    if (state.carrito.length === 0) return;
    alert("¡Gracias por tu compra! Este es un proyecto de demostración, así que ningún cargo real se ha realizado.");
    state.carrito = [];
    guardarCarrito();
    renderCarrito();
    cerrarCarrito();
  });

  dom.btnRetry.addEventListener("click", cargarProductos);

  dom.btnTheme.addEventListener("click", toggleTheme);

  dom.btnContacto.addEventListener("click", abrirContacto);
  dom.btnContactClose.addEventListener("click", cerrarContacto);
  dom.contactOverlay.addEventListener("click", cerrarContacto);
  dom.contactForm.addEventListener("submit", enviarContacto);

  document.addEventListener("keydown", (evento) => {
    if (evento.key !== "Escape") return;
    if (!dom.cartDrawer.hidden) cerrarCarrito();
    if (!dom.contactModal.hidden) cerrarContacto();
  });
}

function normalizarCantidad(valor) {
  const numero = Math.floor(Number(valor));
  return Number.isFinite(numero) && numero > 0 ? numero : 1;
}

function feedbackBotonAgregado(boton) {
  const textoOriginal = boton.textContent;
  boton.textContent = "Agregado ✓";
  boton.classList.add("added");
  setTimeout(() => {
    boton.textContent = textoOriginal;
    boton.classList.remove("added");
  }, 1100);
}

function agregarAlCarrito(id, cantidad) {
  const existente = state.carrito.find((item) => item.id === id);
  if (existente) {
    existente.cantidad += cantidad;
  } else {
    state.carrito.push({ id, cantidad });
  }
  guardarCarrito();
  renderCarrito();
}

function cambiarCantidad(id, delta) {
  const item = state.carrito.find((item) => item.id === id);
  if (!item) return;
  item.cantidad = Math.max(1, item.cantidad + delta);
  guardarCarrito();
  renderCarrito();
}

function fijarCantidad(id, cantidad) {
  const item = state.carrito.find((item) => item.id === id);
  if (!item) return;
  item.cantidad = cantidad;
  guardarCarrito();
  renderCarrito();
}

function eliminarDelCarrito(id) {
  state.carrito = state.carrito.filter((item) => item.id !== id);
  guardarCarrito();
  renderCarrito();
}

function calcularTotal() {
  return state.carrito.reduce((total, item) => {
    const producto = state.productos.find((p) => p.id === item.id);
    return producto ? total + producto.precio * item.cantidad : total;
  }, 0);
}

function totalArticulos() {
  return state.carrito.reduce((total, item) => total + item.cantidad, 0);
}

function renderCarrito() {
  dom.cartCount.textContent = totalArticulos();

  if (state.carrito.length === 0) {
    dom.cartEmpty.hidden = false;
    dom.cartItems.hidden = true;
  } else {
    dom.cartEmpty.hidden = true;
    dom.cartItems.hidden = false;
    dom.cartItems.innerHTML = state.carrito
      .map((item) => {
        const producto = state.productos.find((p) => p.id === item.id);
        if (!producto) return "";
        return cartItemHTML(producto, item.cantidad);
      })
      .join("");
  }

  dom.cartTotal.textContent = formatoCOP.format(calcularTotal());
}

function cartItemHTML(producto, cantidad) {
  return `
    <li class="cart-item" data-id="${producto.id}">
      <div class="cart-item-media">
        <img src="${producto.imagen}" alt="${escapeHTML(producto.nombre)}" loading="lazy">
      </div>
      <div>
        <p class="cart-item-name">${escapeHTML(producto.nombre)}</p>
        <p class="cart-item-price">${formatoCOP.format(producto.precio)} c/u</p>
        <div class="cart-item-qty">
          <button type="button" class="qty-btn" data-decrease="${producto.id}" aria-label="Restar unidad">−</button>
          <input
            type="number"
            min="1"
            value="${cantidad}"
            class="qty-input"
            style="width:44px"
            data-qty-cart-for="${producto.id}"
            aria-label="Cantidad de ${escapeHTML(producto.nombre)} en el carrito"
          >
          <button type="button" class="qty-btn" data-increase="${producto.id}" aria-label="Sumar unidad">+</button>
        </div>
      </div>
      <button type="button" class="cart-item-remove" data-remove="${producto.id}">Quitar</button>
    </li>
  `;
}

function abrirCarrito() {
  dom.cartOverlay.hidden = false;
  dom.cartDrawer.hidden = false;
  requestAnimationFrame(() => dom.cartDrawer.classList.add("open"));
  document.body.style.overflow = "hidden";
}

function cerrarCarrito() {
  dom.cartDrawer.classList.remove("open");
  document.body.style.overflow = "";
  setTimeout(() => {
    dom.cartOverlay.hidden = true;
    dom.cartDrawer.hidden = true;
  }, 280);
}

function guardarCarrito() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.carrito));
  } catch (error) {
    console.error("No se pudo guardar el carrito en localStorage:", error);
  }
}

function loadCartFromStorage() {
  try {
    const guardado = localStorage.getItem(CART_STORAGE_KEY);
    state.carrito = guardado ? JSON.parse(guardado) : [];
  } catch (error) {
    console.error("No se pudo leer el carrito de localStorage:", error);
    state.carrito = [];
  }
}

function initTheme() {
  let temaGuardado;
  try {
    temaGuardado = localStorage.getItem(THEME_STORAGE_KEY);
  } catch (error) {
    temaGuardado = null;
  }

  const prefiereOscuro = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const tema = temaGuardado || (prefiereOscuro ? "dark" : "light");

  aplicarTema(tema);
}

function toggleTheme() {
  const temaActual = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  const nuevoTema = temaActual === "dark" ? "light" : "dark";
  aplicarTema(nuevoTema);

  try {
    localStorage.setItem(THEME_STORAGE_KEY, nuevoTema);
  } catch (error) {
    console.error("No se pudo guardar la preferencia de tema:", error);
  }
}

function aplicarTema(tema) {
  document.documentElement.setAttribute("data-theme", tema);
  const esOscuro = tema === "dark";
  dom.iconSun.hidden = esOscuro;
  dom.iconMoon.hidden = !esOscuro;
  dom.btnTheme.setAttribute(
    "aria-label",
    esOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
  );
}

function abrirContacto() {
  dom.contactOverlay.hidden = false;
  dom.contactModal.hidden = false;
  document.body.style.overflow = "hidden";
  dom.contactForm.querySelector("#contact-nombre").focus();
}

function cerrarContacto() {
  dom.contactOverlay.hidden = true;
  dom.contactModal.hidden = true;
  document.body.style.overflow = "";
}

async function enviarContacto(evento) {
  evento.preventDefault();

  const datos = new FormData(dom.contactForm);
  const cuerpo = {
    nombre: datos.get("nombre"),
    email: datos.get("email"),
    mensaje: datos.get("mensaje")
  };

  dom.btnContactSubmit.disabled = true;
  dom.btnContactSubmit.textContent = "Enviando…";
  mostrarFeedbackContacto("", "");

  try {
    const respuesta = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(cuerpo)
    });

    if (!respuesta.ok) {
      throw new Error(`Error HTTP ${respuesta.status} al enviar el formulario`);
    }

    mostrarFeedbackContacto("¡Mensaje enviado! Te responderemos pronto.", "ok");
    dom.contactForm.reset();
    setTimeout(cerrarContacto, 1600);

  } catch (error) {
    console.error("No se pudo enviar el formulario de contacto:", error);
    mostrarFeedbackContacto(
      "No pudimos enviar tu mensaje. Escríbenos directo a yeimertorres30@gmail.com.",
      "error"
    );
  } finally {
    dom.btnContactSubmit.disabled = false;
    dom.btnContactSubmit.textContent = "Enviar mensaje";
  }
}

function mostrarFeedbackContacto(texto, tipo) {
  dom.contactFeedback.textContent = texto;
  dom.contactFeedback.className = "contact-feedback" + (tipo ? ` ${tipo}` : "");
}

function escapeHTML(texto) {
  const div = document.createElement("div");
  div.textContent = String(texto ?? "");
  return div.innerHTML;
}
