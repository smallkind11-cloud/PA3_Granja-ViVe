/* script.js - Interactividad PA3 integrated for productos.html (Granja Vi.Ve.) */

/* ------------------ Datos: Clases, prototipos, objetos y arrays ------------------ */

class Producto {
  constructor(id, nombre, precio, categoria, stock, img){
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.categoria = categoria;
    this.stock = stock;
    this.img = img || 'https://via.placeholder.com/400x200?text=' + encodeURIComponent(nombre);
  }
  getInfo(){
    return `${this.nombre} — S/ ${this.precio.toFixed(2)}`;
  }
}

class AnimalVivo extends Producto {
  constructor(id, nombre, precio, categoria, stock, pesoKg, img){
    super(id, nombre, precio, categoria, stock, img);
    this.pesoKg = pesoKg;
  }
  getInfo(){
    return `${this.nombre} (vivo) • ${this.pesoKg} kg • S/ ${this.precio.toFixed(2)}`;
  }
}

class ProductoProcesado extends Producto {
  constructor(id, nombre, precio, categoria, stock, descripcion, img){
    super(id, nombre, precio, categoria, stock, img);
    this.descripcion = descripcion;
  }
  getInfo(){
    return `${this.nombre} — ${this.descripcion} — S/ ${this.precio.toFixed(2)}`;
  }
}

Producto.prototype.isAvailable = function(){
  return this.stock > 0;
};

const productos = [
  // Animales
  new AnimalVivo(1, 'Lechón Pietrain x Duroc', 250.00, 'Reproductores', 5, 12.5, 'img/lechoncitos1.png'),
  new AnimalVivo(2, 'Cochino de engorde', 180.00, 'Engorde', 8, 30, 'img/lechoncitos2.png'),

  // Procesados
  new ProductoProcesado(3, 'Chorizo Ahumado 500g', 25.00, 'Procesados', 50, 'Artesanal con hierbas', 'img/chorizo.png'),
  new ProductoProcesado(4, 'Salchicha Artesanal 1kg', 40.00, 'Procesados', 40, 'Hecha en granja artesana', 'img/salchicha.png'),

  // Servicios de inseminación
  new ProductoProcesado(5, 'Inseminación Artificial Duroc', 250.00, 'Servicios', 20, 'Genética Duroc pura', 'img/inseminacion.png'),
  new ProductoProcesado(6, 'Inseminación Artificial Pietrain', 250.00, 'Servicios', 20, 'Genética Pietrain pura', 'img/inseminacion.png'),
  new ProductoProcesado(7, 'Inseminación Artificial Large White', 300.00, 'Servicios', 15, 'Genética Large White', 'img/inseminacion.png')
];

const categoriasMap = new Map();
for (const p of productos) {
  if (!categoriasMap.has(p.categoria)) categoriasMap.set(p.categoria, []);
  categoriasMap.get(p.categoria).push(p);
}

/* ---------------------- CARRITO / LOCAL STORAGE ------------------------- */

const CART_KEY = 'granja_vive_cart';
let carrito = [];

function agregarAlCarrito(id) {
  const prod = productos.find(p => p.id === id);
  if (!prod) { alert('Producto no encontrado'); return; }
  if (prod.stock <= 0) { alert('Sin stock'); return; }

  const existe = carrito.find(item => item.id === id);

  if (existe) {
    existe.cantidad++;
  } else {
    carrito.push({
      id: prod.id,
      nombre: prod.nombre,
      precio: prod.precio,
      cantidad: 1
    });
  }

  actualizarCarritoUI();
  guardarCarrito();
}

function removerDelCarrito(id) {
  carrito = carrito.filter(item => item.id !== id);
  actualizarCarritoUI();
  guardarCarrito();
}

function totalRecursivo(items, idx = 0) {
  if (idx >= items.length) return 0;
  return (items[idx].precio * items[idx].cantidad) + totalRecursivo(items, idx + 1);
}

/* Ajuste automático de precios */
function aplicarAjustePrecioCreciente(id, porcentaje) {
  const p = productos.find(x => x.id === id);
  if (p) p.precio += p.precio * (porcentaje / 100);
}

/* ---------------------- ELEMENTOS DEL DOM --------------------------- */
const productosContainer = document.getElementById('productos');
const cartModal = document.getElementById('cart-modal');
const cartItemsList = document.getElementById('cart-items');
const cartCountSpan = document.getElementById('cart-count');
const cartTotalSpan = document.getElementById('cart-total');
const btnCart = document.getElementById('btn-cart');
const btnCloseCart = document.getElementById('close-cart');
const searchInput = document.getElementById('search');
const countdownEl = document.getElementById('countdown');

/* ---------------------- RENDERIZADO DE PRODUCTOS --------------------------- */
function renderProductos(list) {
  productosContainer.innerHTML = '';

  list.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    card.tabIndex = 0;

    card.innerHTML = `
      <img src="${p.img}" alt="${p.nombre}">
      <h4>${p.getInfo()}</h4>
      <p>Stock: ${p.stock}</p>

      <div class="actions">
        <button class="btn-details">Detalles</button>
        <button class="btn-add">Agregar</button>
      </div>
    `;

    /* Click completo */
    card.addEventListener('click', () => {
      alert('Detalle rápido: ' + p.getInfo());
    });

    /* Botón detalles */
    card.querySelector('.btn-details').addEventListener('click', (e) => {
      e.stopPropagation();
      alert(
        `Detalles:\n${p.getInfo()}\nCategoría: ${p.categoria}\nStock: ${p.stock}`
      );
    });

    /* Botón agregar */
    card.querySelector('.btn-add').addEventListener('click', (e) => {
      e.stopPropagation();
      agregarAlCarrito(p.id);
    });

    productosContainer.appendChild(card);
  });
}

/* ---------------------- CARRITO UI --------------------------- */
function actualizarCarritoUI() {
  cartItemsList.innerHTML = '';

  carrito.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${item.nombre} x ${item.cantidad}</span>
      <span>S/ ${(item.precio * item.cantidad).toFixed(2)}
        <button class="small-remove" data-id="${item.id}">❌</button>
      </span>
    `;
    cartItemsList.appendChild(li);
  });

  cartTotalSpan.textContent = totalRecursivo(carrito).toFixed(2);

  const totalCantidad = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  cartCountSpan.textContent = totalCantidad;
}

/* ---------------------- LOCAL STORAGE --------------------------- */
function guardarCarrito() {
  localStorage.setItem(CART_KEY, JSON.stringify(carrito));
}

function cargarCarrito() {
  const data = localStorage.getItem(CART_KEY);
  if (data) carrito = JSON.parse(data);
}

/* ---------------------- EVENTOS GENERALES --------------------------- */
btnCart.addEventListener('click', toggleCart);
btnCloseCart.addEventListener('click', toggleCart);

function toggleCart() {
  cartModal.classList.toggle('hidden');
}

/* Buscar */
searchInput.addEventListener('keyup', () => {
  const q = searchInput.value.toLowerCase();
  const filtered = productos.filter(
    p => p.nombre.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q)
  );
  renderProductos(filtered);
});

/* Eliminar del carrito */
cartItemsList.addEventListener('click', (e) => {
  if (e.target.classList.contains('small-remove')) {
    const id = Number(e.target.dataset.id);
    removerDelCarrito(id);
  }
});

/* ---------------------- CHECKOUT --------------------------- */
document.getElementById('checkout').addEventListener('click', () => {
  const total = totalRecursivo(carrito);
  if (total === 0) {
    alert('El carrito está vacío');
    return;
  }

  const metodo = confirm('¿Pagar con Yape? (Aceptar = Yape / Cancelar = Transferencia)')
    ? 'Yape'
    : 'Transferencia';

  alert(`Pedido registrado. Total: S/ ${total.toFixed(2)} — Método: ${metodo}`);

  carrito = [];
  guardarCarrito();
  actualizarCarritoUI();
  toggleCart();
});

/* ---------------------- TEMPORIZADOR --------------------------- */

function iniciarTemporizador(segundos) {
  let t = segundos;

  const intervalo = setInterval(() => {
    if (t <= 0) {
      countdownEl.textContent = '00:00';
      document.getElementById('promo').textContent = 'Promo finalizada';
      clearInterval(intervalo);
      return;
    }

    const mm = String(Math.floor(t / 60)).padStart(2, '0');
    const ss = String(t % 60).padStart(2, '0');

    countdownEl.textContent = `${mm}:${ss}`;
    t--;
  }, 1000);
}

/* ---------------------- INICIO --------------------------- */
window.onload = () => {
  cargarCarrito();
  renderProductos(productos);
  actualizarCarritoUI();

  productos.forEach(p => {
    if (p.categoria === 'Procesados') aplicarAjustePrecioCreciente(p.id, 3);
  });

  iniciarTemporizador(5 * 60);

  document.getElementById('year').textContent = new Date().getFullYear();
};
