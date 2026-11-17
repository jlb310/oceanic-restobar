// Oceanic Restobar · carta digital, atención en mesa y reservas por WhatsApp.
const NEGOCIO = 'Oceanic Restobar';
const WHATSAPP = '56322830006';
const HORARIO = { abre: '12:30', cierra: '22:30' };
const foto = (id, w = 700) => `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`;

const PLATOS = [
  { nombre: 'Ostiones de la bahía', texto: 'Limón, leche de tigre y aceite de cilantro.', precio: 12900, cat: 'compartir', foto: '1663072302693-d92701c4ef42' },
  { nombre: 'Ceviche Oceanic', texto: 'Pesca blanca, palta, cebolla morada y ají amarillo.', precio: 13900, cat: 'compartir', foto: '1535399831218-d5bd36d1a6b3', etiqueta: 'De la casa' },
  { nombre: 'Pesca del día', texto: 'Con papas rústicas, ensalada fresca y salsa de la casa.', precio: 18900, cat: 'fondos', foto: '1665401015549-712c0dc5ef85', etiqueta: 'Recomendado' },
  { nombre: 'Linguini marino', texto: 'Mariscos salteados, tomate cherry y vino blanco.', precio: 17500, cat: 'fondos', foto: '1563379926898-05f4575a45d8' },
  { nombre: 'Risotto de camarón', texto: 'Arroz arborio, parmesano y bisque de mariscos.', precio: 16900, cat: 'fondos', foto: '1623962470629-ead26532ef44' },
  { nombre: 'Spritz de la costa', texto: 'Aperol, espumante, pomelo y romero.', precio: 8500, cat: 'barra', foto: '1782201591364-39945c7f39d2' },
];

const clp = (n) => '$' + n.toLocaleString('es-CL');
const aviso = document.getElementById('aviso');
let avisoTimer;
function avisar(msg) {
  aviso.textContent = msg;
  aviso.classList.add('ver');
  clearTimeout(avisoTimer);
  avisoTimer = setTimeout(() => aviso.classList.remove('ver'), 3200);
}
function whatsapp(msg) {
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
}

// Carta con pestañas
const contenedor = document.getElementById('platos');
function pintar(cat = 'todos') {
  contenedor.innerHTML = PLATOS.filter((p) => cat === 'todos' || p.cat === cat).map((p) => `
    <article class="plato">
      <div class="plato-foto"><img loading="lazy" src="${foto(p.foto)}" alt="">${p.etiqueta ? `<span>${p.etiqueta}</span>` : ''}</div>
      <div class="plato-texto">
        <div class="plato-cab"><h3>${p.nombre}</h3><b>${clp(p.precio)}</b></div>
        <p>${p.texto}</p>
        <button type="button" data-pedir="${p.nombre}">Pedir o consultar <span aria-hidden="true">→</span></button>
      </div>
    </article>`).join('');
}
pintar();
document.querySelectorAll('.pestana').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('.pestana').forEach((x) => { x.classList.toggle('activa', x === b); x.setAttribute('aria-selected', x === b); });
  pintar(b.dataset.cat);
}));

document.addEventListener('click', (e) => {
  const pedir = e.target.closest('[data-pedir]');
  if (pedir) { whatsapp(`Hola ${NEGOCIO}, quiero pedir o consultar por: ${pedir.dataset.pedir}.`); avisar('Abriendo WhatsApp…'); return; }
  if (e.target.closest('[data-accion="ayuda"]')) { whatsapp(`Hola ${NEGOCIO}, necesito atención.`); avisar('Abriendo WhatsApp…'); }
});

// Reserva
const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });
const campoFecha = document.querySelector('#form-reserva [name="fecha"]');
campoFecha.min = hoy;
campoFecha.value = hoy;
document.getElementById('form-reserva').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = new FormData(e.currentTarget);
  const [a, m, d] = String(f.get('fecha')).split('-');
  whatsapp(`Hola ${NEGOCIO}, soy ${f.get('nombre')}. Quiero reservar una mesa para ${f.get('personas')} el ${d}/${m}/${a}, para ${f.get('momento').toLowerCase()}. ¿Me confirman disponibilidad?`);
  avisar('Abriendo WhatsApp para confirmar tu reserva…');
});

// Abierto o cerrado, en hora de Chile
function estado() {
  const ahora = new Date().toLocaleTimeString('es-CL', { timeZone: 'America/Santiago', hour: '2-digit', minute: '2-digit', hour12: false });
  const abierto = ahora >= HORARIO.abre && ahora < HORARIO.cierra;
  document.querySelectorAll('[data-estado]').forEach((el) => {
    el.classList.toggle('abierto', abierto);
    el.querySelector('span').textContent = abierto ? `Abierto ahora · hasta las ${HORARIO.cierra}` : `Cerrado · abrimos a las ${HORARIO.abre}`;
  });
}
estado();
setInterval(estado, 60000);

// Navegación y apariciones
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('solida', scrollY > 40), { passive: true });
const io = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('visible'); io.unobserve(x.target); } }), { rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.revela').forEach((el) => io.observe(el));
