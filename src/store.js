// Datos de la demo, compartidos por las 4 pantallas.
// Todo vive en localStorage de quien prueba la demo: no hay servidor.
// Lo que se edita en un administrador aparece en la carta, y los pedidos
// hechos en la carta con pedidos llegan al administrador de pedidos.

const NS = 'oceanic-demo:v1:';
export const FOTO = (id, w = 600) => `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`;
export const clp = (n) => '$' + Math.round(Number(n) || 0).toLocaleString('es-CL');
export const uid = () => Math.random().toString(36).slice(2, 9);
export const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const haceMin = (m) => new Date(Date.now() - m * 60000).toISOString();

function semilla() {
  return {
    local: {
      nombre: 'Oceanic Restobar',
      tipo: 'Restobar · Hotel Oceanic',
      direccion: 'Av. Borgoño 12925, Reñaca, Viña del Mar',
      horario: 'Todos los días · 12:30 a 22:30',
      telefono: '+56 32 283 0006',
      whatsapp: '56322830006',
      instagram: 'https://instagram.com/',
      facebook: '',
      sitio: 'https://oceanic-restobar.vercel.app/landing/',
      titulo: 'Sabores del Pacífico',
      frase: 'Cocina costera y coctelería, frente al mar de Reñaca.',
      tema: 'claro',
    },
    categorias: [
      { id: 'compartir', nombre: 'Para compartir', icono: '🦪' },
      { id: 'fondos', nombre: 'Fondos', icono: '🐟' },
      { id: 'postres', nombre: 'Postres', icono: '🍮' },
      { id: 'barra', nombre: 'Barra', icono: '🍹' },
      { id: 'sin-alcohol', nombre: 'Sin alcohol', icono: '🍋' },
    ],
    productos: [
      { id: 'ostiones', nombre: 'Ostiones de la bahía', precio: 12900, cat: 'compartir', etiqueta: 'Para compartir', desc: 'Limón, leche de tigre y aceite de cilantro.', detalle: '', foto: '1663072302693-d92701c4ef42', emoji: '🦪', visible: true },
      { id: 'ceviche', nombre: 'Ceviche Oceanic', precio: 13900, cat: 'compartir', etiqueta: 'De la casa', desc: 'Pesca blanca, palta, cebolla morada y ají amarillo.', detalle: 'Pesca del día marinada al momento en leche de tigre. Consulta por la versión sin picante.', foto: '1535399831218-d5bd36d1a6b3', emoji: '🐟', visible: true },
      { id: 'tartar', nombre: 'Tartar de atún', precio: 12500, cat: 'compartir', etiqueta: '', desc: 'Atún, mango, pepino y lima.', detalle: '', foto: '1769830644804-0ede2ee32a62', emoji: '🍣', visible: true },
      { id: 'pesca', nombre: 'Pesca del día', precio: 18900, cat: 'fondos', etiqueta: 'Recomendado', desc: 'Con papas rústicas, ensalada fresca y salsa de la casa.', detalle: 'La pesca cambia según lo que llega a la caleta. Pregunta cuál es la de hoy.', foto: '1665401015549-712c0dc5ef85', emoji: '🐟', visible: true },
      { id: 'linguini', nombre: 'Linguini marino', precio: 17500, cat: 'fondos', etiqueta: '', desc: 'Mariscos salteados, tomate cherry y vino blanco.', detalle: '', foto: '1563379926898-05f4575a45d8', emoji: '🍝', visible: true },
      { id: 'risotto', nombre: 'Risotto de camarón', precio: 16900, cat: 'fondos', etiqueta: 'Favorito', desc: 'Arroz arborio, parmesano y bisque de mariscos.', detalle: '', foto: '1623962470629-ead26532ef44', emoji: '🦐', visible: true },
      { id: 'leche-asada', nombre: 'Leche asada', precio: 4900, cat: 'postres', etiqueta: 'Clásico', desc: 'Receta de la casa, con caramelo.', detalle: '', foto: '', emoji: '🍮', visible: true },
      { id: 'mousse', nombre: 'Mousse de maracuyá', precio: 5500, cat: 'postres', etiqueta: '', desc: 'Maracuyá fresco y crumble de galleta.', detalle: '', foto: '', emoji: '🥭', visible: true },
      { id: 'spritz', nombre: 'Spritz de la costa', precio: 8500, cat: 'barra', etiqueta: 'Atardecer', desc: 'Aperol, espumante, pomelo y romero.', detalle: '', foto: '1782201591364-39945c7f39d2', emoji: '🍹', visible: true },
      { id: 'pisco-sour', nombre: 'Pisco sour', precio: 6900, cat: 'barra', etiqueta: '', desc: 'Pisco, limón de pica y amargo de angostura.', detalle: '', foto: '1632995561510-38616ed64ff6', emoji: '🍸', visible: true },
      { id: 'limonada', nombre: 'Limonada de menta', precio: 3900, cat: 'sin-alcohol', etiqueta: 'Sin alcohol', desc: 'Limón, menta fresca y hielo.', detalle: '', foto: '', emoji: '🍋', visible: true },
      { id: 'jugo', nombre: 'Jugo natural del día', precio: 3900, cat: 'sin-alcohol', etiqueta: '', desc: 'Pregunta por la fruta de hoy.', detalle: '', foto: '', emoji: '🧃', visible: true },
    ],
    garzones: [
      { id: 'g1', nombre: 'Camila', activo: true },
      { id: 'g2', nombre: 'Matías', activo: true },
      { id: 'g3', nombre: 'Josefa', activo: false },
    ],
    mesas: [
      { n: 1, garzon: 'g1' }, { n: 2, garzon: 'g1' }, { n: 3, garzon: 'g1' }, { n: 4, garzon: 'g1' },
      { n: 5, garzon: 'g2' }, { n: 6, garzon: 'g2' }, { n: 7, garzon: 'g2' }, { n: 8, garzon: 'g2' },
    ],
    pedidos: [
      { id: 1041, mesa: 3, cliente: 'Andrea', items: [{ id: 'ceviche', nombre: 'Ceviche Oceanic', precio: 13900, cant: 1 }, { id: 'pisco-sour', nombre: 'Pisco sour', precio: 6900, cant: 2 }], nota: '', propina: 2770, estado: 'entregado', hora: haceMin(52), cerrado: false },
      { id: 1042, mesa: 3, cliente: 'Andrea', items: [{ id: 'pesca', nombre: 'Pesca del día', precio: 18900, cant: 2 }], nota: 'Una sin salsa, por favor.', propina: 3780, estado: 'preparacion', hora: haceMin(18), cerrado: false },
      { id: 1043, mesa: 5, cliente: 'Rodrigo', items: [{ id: 'spritz', nombre: 'Spritz de la costa', precio: 8500, cant: 2 }, { id: 'ostiones', nombre: 'Ostiones de la bahía', precio: 12900, cant: 1 }], nota: '', propina: 2990, estado: 'confirmado', hora: haceMin(9), cerrado: false },
      { id: 1044, mesa: 5, cliente: 'Paula', items: [{ id: 'limonada', nombre: 'Limonada de menta', precio: 3900, cant: 1 }], nota: '', propina: 0, estado: 'pendiente', hora: haceMin(3), cerrado: false },
    ],
    llamadas: [
      { id: 'l1', mesa: 7, hora: haceMin(1), atendida: false },
    ],
  };
}

export const ESTADOS = {
  pendiente: { label: 'Pendiente', icono: '⏳', mensaje: 'Tu pedido llegó al local. Espera la confirmación.' },
  confirmado: { label: 'Confirmado', icono: '✅', mensaje: 'El local confirmó tu pedido.' },
  preparacion: { label: 'En preparación', icono: '👨‍🍳', mensaje: 'Tu pedido se está preparando.' },
  entregado: { label: 'Entregado', icono: '🍽️', mensaje: 'Tu pedido fue entregado. ¡Buen provecho!' },
  cancelado: { label: 'Cancelado', icono: '❌', mensaje: 'El pedido fue cancelado. Habla con el personal.' },
};

const CLAVES = Object.keys(semilla());

export function leer(clave) {
  try {
    const v = localStorage.getItem(NS + clave);
    if (v) return JSON.parse(v);
  } catch { /* sin almacenamiento: se usa la semilla */ }
  return semilla()[clave];
}

export function guardar(clave, valor) {
  try { localStorage.setItem(NS + clave, JSON.stringify(valor)); } catch { /* modo privado */ }
}

export function restablecer() {
  try { CLAVES.forEach((c) => localStorage.removeItem(NS + c)); } catch { /* nada */ }
}

// Avisa cuando otra pantalla (otra pestaña o el otro iframe) cambia los datos.
export function alCambiar(fn) {
  addEventListener('storage', (e) => { if (e.key?.startsWith(NS)) fn(e.key.slice(NS.length)); });
}

// Tema elegido por el local (Personalizar) aplicado al <html>.
export function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema || 'claro';
}

// Pide al menú DEMO que muestre otra pantalla (cuando la página está dentro del iframe).
export function irA(pantalla, extra = {}) {
  if (window.parent !== window) window.parent.postMessage({ demo: 'ir', pantalla, ...extra }, location.origin);
  else location.href = { carta: 'carta.html', 'admin-carta': 'admin-carta.html', pedidos: `pedidos.html${extra.mesa ? `?mesa=${extra.mesa}` : ''}`, 'admin-pedidos': 'admin-pedidos.html' }[pantalla];
}

export const totalPedido = (p) => p.items.reduce((s, i) => s + i.precio * i.cant, 0);
