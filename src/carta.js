// Pantallas 1 (carta) y 3 (carta con pedidos). El modo viene de <body data-modo>.
import { leer, guardar, alCambiar, aplicarTema, FOTO, clp, esc, uid, ESTADOS, totalPedido } from './store.js';

const MODO = document.body.dataset.modo; // 'carta' | 'pedidos'
const PIDE = MODO === 'pedidos';
const MESA = Number(new URLSearchParams(location.search).get('mesa')) || 4;
const PREF = 'oceanic-demo:pref:'; // preferencias de quien mira (no del local)
const pref = (k, d) => { try { return localStorage.getItem(PREF + k) ?? d; } catch { return d; } };
const setPref = (k, v) => { try { localStorage.setItem(PREF + k, v); } catch { /* nada */ } };

let local, categorias, productos;
let filtro = 'todos';
let busqueda = '';
let carro = PIDE ? JSON.parse(pref(`carro:${MESA}`, '[]')) : [];
let propina = { modo: 'sugerida', valor: 0 };

const app = document.getElementById('app');
const aviso = document.getElementById('aviso');
let avisoT;
function avisar(t) { aviso.textContent = t; aviso.classList.add('ver'); clearTimeout(avisoT); avisoT = setTimeout(() => aviso.classList.remove('ver'), 2600); }

const LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 18c2.2 0 2.2-2 4.4-2s2.2 2 4.4 2 2.2-2 4.4-2 2.2 2 4.4 2 2.2-2 4.4-2M7 22.5c2 0 2-1.8 4-1.8s2 1.8 4 1.8 2-1.8 4-1.8 2 1.8 4 1.8 2-1.8 2.6-1.8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="16" cy="11" r="3.4" fill="currentColor"/></svg>';

function cargar() {
  local = leer('local');
  categorias = leer('categorias');
  productos = leer('productos').filter((p) => p.visible);
  aplicarTema(pref('tema', '') || local.tema);
}

const fotoDe = (p, w) => (p.foto ? (/^https?:/.test(p.foto) ? `<img loading="lazy" src="${esc(p.foto)}" alt="">` : `<img loading="lazy" src="${FOTO(p.foto, w)}" alt="">`) : esc(p.emoji || '🍽️'));
const enCarro = (id) => carro.find((c) => c.id === id)?.cant || 0;

function tarjeta(p) {
  const n = enCarro(p.id);
  return `
    <article class="prod" data-detalle="${esc(p.id)}" role="button" tabindex="0" aria-label="Ver ${esc(p.nombre)}">
      <div class="prod-foto">${fotoDe(p, 500)}</div>
      <div class="prod-texto">
        ${p.etiqueta ? `<span class="etiqueta">${esc(p.etiqueta)}</span>` : ''}
        <h3>${esc(p.nombre)}</h3>
        <p>${esc(p.desc)}</p>
        <div class="prod-pie"><span class="precio">${clp(p.precio)}</span>
          ${PIDE ? (n ? `<span class="en-carro" aria-label="${n} en tu pedido">${n}</span>` : `<button class="mas" data-sumar="${esc(p.id)}" aria-label="Agregar ${esc(p.nombre)}">+</button>`) : ''}
        </div>
      </div>
    </article>`;
}

function render() {
  const q = busqueda.trim().toLowerCase();
  const coincide = (p) => !q || `${p.nombre} ${p.desc} ${p.etiqueta}`.toLowerCase().includes(q);
  const destacados = productos.filter((p) => p.etiqueta && coincide(p));
  const grupos = [
    ...(filtro === 'todos' || filtro === 'destacados' ? [{ id: 'destacados', nombre: 'Destacados', items: destacados }] : []),
    ...categorias.filter((c) => filtro === 'todos' || filtro === c.id).map((c) => ({ ...c, items: productos.filter((p) => p.cat === c.id && coincide(p)) })),
  ].filter((g) => g.items.length);
  const redes = [['instagram', '📷', 'Instagram'], ['facebook', 'f', 'Facebook'], ['whatsapp', '💬', 'WhatsApp'], ['sitio', '🌐', 'Sitio web']]
    .filter(([k]) => local[k]).map(([k, i, n]) => `<a class="red" href="${k === 'whatsapp' ? `https://wa.me/${esc(local.whatsapp)}` : esc(local[k])}" target="_blank" rel="noopener" aria-label="${n}">${i}</a>`).join('');
  const llamado = PIDE && leer('llamadas').some((l) => l.mesa === MESA && !l.atendida);
  const misPedidos = PIDE ? pedidosMesa() : [];
  const cuenta = carro.reduce((s, c) => s + c.cant, 0);
  const vista = pref('vista', 'grilla');

  document.body.classList.toggle('vista-lista', vista === 'lista');
  document.body.classList.toggle('sin-carro', !cuenta);
  app.innerHTML = `
    <header class="top">
      <div class="logo">${LOGO}</div>
      <div class="top-texto"><strong>${esc(local.nombre)}</strong><span>${esc(local.tipo)}</span></div>
      <button class="icono" data-accion="info" aria-label="Información del local">i</button>
    </header>
    <section class="portada">
      <img src="${FOTO('1781016781951-d555ad5e4526', 900)}" alt="">
      <div class="portada-texto">
        <span class="pill">${PIDE ? `Mesa ${MESA} · Pedidos desde la mesa` : 'Carta digital'}</span>
        <h1>${esc(local.titulo)}</h1>
        <p>${esc(local.frase)}</p>
      </div>
    </section>
    ${PIDE ? `<div class="mesa"><div><b>Estás en la mesa ${MESA}</b><small>Tu pedido llega directo al local.</small></div><button class="boton-mesero${llamado ? ' llamado' : ''}" data-accion="mesero">${llamado ? '🔔 Garzón en camino' : '🔔 Llamar al garzón'}</button></div>` : ''}
    <div class="acciones">${redes}<span class="espacio"></span>
      <button class="chip-accion" data-accion="vista">${vista === 'lista' ? '▦ Grilla' : '☰ Lista'}</button>
      <button class="chip-accion" data-accion="tema">${document.documentElement.dataset.tema === 'claro' ? '☾ Oscuro' : '☀ Claro'}</button>
    </div>
    <div class="pegajoso">
      <label class="buscar"><span aria-hidden="true">⌕</span><input type="search" id="buscar" placeholder="Buscar en la carta" value="${esc(busqueda)}" aria-label="Buscar en la carta"></label>
      <div class="chips" role="tablist" aria-label="Categorías">
        <button class="chip${filtro === 'todos' ? ' activa' : ''}" data-filtro="todos">Todo</button>
        <button class="chip${filtro === 'destacados' ? ' activa' : ''}" data-filtro="destacados">⭐ Destacados</button>
        ${categorias.map((c) => `<button class="chip${filtro === c.id ? ' activa' : ''}" data-filtro="${esc(c.id)}">${esc(c.icono)} ${esc(c.nombre)}</button>`).join('')}
      </div>
    </div>
    ${grupos.length ? grupos.map((g) => `
      <section class="seccion">
        <div class="seccion-cab"><h2>${esc(g.nombre)}</h2><span>${g.items.length} ${g.items.length === 1 ? 'producto' : 'productos'}</span></div>
        <div class="grilla">${g.items.map(tarjeta).join('')}</div>
      </section>`).join('') : '<p class="vacio">No encontramos productos con esa búsqueda.</p>'}
    <p class="pie">${esc(local.direccion)} · ${esc(local.horario)}<br>Carta digital por <a href="https://spacehost.cl" target="_blank" rel="noopener">Spacehost</a></p>
    ${PIDE && misPedidos.length ? `<button class="boton-seguimiento" data-accion="seguimiento">🧾 Mis pedidos (${misPedidos.length})</button>` : ''}
    ${PIDE ? `<div class="barra-carro${cuenta ? ' ver' : ''}"><span><span class="cuenta">${cuenta}</span>${clp(subtotal())}</span><button class="ir" data-accion="carro">Ver pedido</button></div>` : ''}
  `;
}

// ---------- Detalle de producto ----------
function abrirHoja(html) {
  let d = document.getElementById('hoja');
  if (!d) { d = document.createElement('dialog'); d.id = 'hoja'; d.className = 'hoja'; document.body.append(d); d.addEventListener('click', (e) => { if (e.target === d) d.close(); }); }
  d.innerHTML = html;
  if (!d.open) d.showModal();
  return d;
}

function detalle(id) {
  const p = productos.find((x) => x.id === id);
  if (!p) return;
  let cant = 1;
  const pintar = () => abrirHoja(`
    <div class="hoja-cuerpo">
      <div class="detalle-foto">${fotoDe(p, 900)}</div>
      <div class="detalle-cuerpo">
        ${p.etiqueta ? `<span class="etiqueta">${esc(p.etiqueta)}</span>` : ''}
        <h2>${esc(p.nombre)}</h2>
        <p>${esc(p.desc)}</p>
        ${p.detalle ? `<p style="margin-top:8px">${esc(p.detalle)}</p>` : ''}
      </div>
      <div class="fila-total"><span class="precio" style="font-size:22px">${clp(p.precio)}</span>
        ${PIDE ? `<span class="cantidad"><button data-cant="-1" aria-label="Quitar uno">−</button><span>${cant}</span><button data-cant="1" aria-label="Agregar uno">+</button></span>` : ''}
      </div>
      ${PIDE ? `<button class="boton-primario" data-agregar>Agregar · ${clp(p.precio * cant)}</button>` : '<button class="boton-primario" data-cerrar>Volver a la carta</button>'}
    </div>
    <button class="cerrar" data-cerrar aria-label="Cerrar" style="position:absolute;top:12px;right:12px;z-index:3">×</button>`);
  const d = pintar();
  d.onclick = (e) => {
    if (e.target === d || e.target.closest('[data-cerrar]')) return d.close();
    const c = e.target.closest('[data-cant]');
    if (c) { cant = Math.max(1, cant + Number(c.dataset.cant)); pintar(); }
    if (e.target.closest('[data-agregar]')) { sumar(p.id, cant); d.close(); }
  };
}

// ---------- Carrito ----------
const subtotal = () => carro.reduce((s, c) => s + c.precio * c.cant, 0);
const montoPropina = () => (propina.modo === 'sin' ? 0 : propina.modo === 'otro' ? Math.max(0, propina.valor) : Math.round(subtotal() * 0.1));
function guardarCarro() { setPref(`carro:${MESA}`, JSON.stringify(carro)); }

function sumar(id, cant = 1) {
  const p = productos.find((x) => x.id === id);
  const c = carro.find((x) => x.id === id);
  if (c) c.cant += cant; else carro.push({ id, nombre: p.nombre, precio: p.precio, cant });
  guardarCarro(); render(); avisar(`${cant} × ${p.nombre} agregado`);
}

function hojaCarro() {
  const cliente = pref('cliente', '');
  const d = abrirHoja(`
    <div class="hoja-cab"><h2>Tu pedido · mesa ${MESA}</h2><button class="cerrar" data-cerrar aria-label="Cerrar">×</button></div>
    <div class="hoja-cuerpo">
      <div>${carro.map((c) => `
        <div class="linea"><div><b>${esc(c.nombre)}</b><br><small>${clp(c.precio)} c/u</small></div>
          <span class="cantidad"><button data-item="${esc(c.id)}" data-cant="-1" aria-label="Quitar uno">−</button><span>${c.cant}</span><button data-item="${esc(c.id)}" data-cant="1" aria-label="Agregar uno">+</button></span></div>`).join('')}</div>
      <label class="campo">Tu nombre<input id="cliente" value="${esc(cliente)}" autocomplete="given-name" placeholder="Para que el garzón sepa de quién es" required></label>
      <label class="campo">Nota para la cocina<textarea id="nota" rows="2" placeholder="Ej.: sin cebolla, la salsa aparte">${esc(pref('nota', ''))}</textarea></label>
      <div class="campo">Propina
        <div class="propinas">
          <button data-propina="sugerida" class="${propina.modo === 'sugerida' ? 'activa' : ''}">10% · ${clp(Math.round(subtotal() * 0.1))}</button>
          <button data-propina="otro" class="${propina.modo === 'otro' ? 'activa' : ''}">Otro monto</button>
          <button data-propina="sin" class="${propina.modo === 'sin' ? 'activa' : ''}">Sin propina</button>
        </div>
        ${propina.modo === 'otro' ? `<input id="propina-otro" type="number" inputmode="numeric" min="0" step="500" value="${propina.valor || ''}" placeholder="Monto en pesos" style="min-height:46px;padding:0 12px;border-radius:12px;border:1px solid var(--linea);background:var(--fondo2)">` : ''}
      </div>
      <div class="totales">
        <div class="fila-total"><span>Subtotal</span><span>${clp(subtotal())}</span></div>
        <div class="fila-total"><span>Propina</span><span>${clp(montoPropina())}</span></div>
        <div class="fila-total total"><span>Total</span><span>${clp(subtotal() + montoPropina())}</span></div>
      </div>
      <button class="boton-primario" data-enviar>Enviar pedido</button>
      <p class="nota-envio">El pedido llega al local y queda pendiente hasta que lo confirmen.</p>
    </div>`);
  d.onclick = (e) => {
    if (e.target === d || e.target.closest('[data-cerrar]')) return d.close();
    const it = e.target.closest('[data-item]');
    if (it) {
      const c = carro.find((x) => x.id === it.dataset.item);
      c.cant += Number(it.dataset.cant);
      carro = carro.filter((x) => x.cant > 0);
      guardarCarro(); render();
      if (!carro.length) return d.close();
      return hojaCarro();
    }
    const pr = e.target.closest('[data-propina]');
    if (pr) { propina.modo = pr.dataset.propina; return hojaCarro(); }
    if (e.target.closest('[data-enviar]')) enviar(d);
  };
  d.oninput = (e) => {
    if (e.target.id === 'cliente') setPref('cliente', e.target.value);
    if (e.target.id === 'nota') setPref('nota', e.target.value);
    if (e.target.id === 'propina-otro') {
      propina.valor = Number(e.target.value) || 0;
      d.querySelector('.totales').children[1].lastElementChild.textContent = clp(montoPropina());
      d.querySelector('.totales .total').lastElementChild.textContent = clp(subtotal() + montoPropina());
    }
  };
}

function enviar(d) {
  const cliente = d.querySelector('#cliente').value.trim();
  if (!cliente) { d.querySelector('#cliente').focus(); return avisar('Escribe tu nombre para enviar el pedido'); }
  const pedidos = leer('pedidos');
  const id = Math.max(1040, ...pedidos.map((p) => p.id)) + 1;
  pedidos.push({ id, mesa: MESA, cliente, items: carro, nota: d.querySelector('#nota').value.trim(), propina: montoPropina(), estado: 'pendiente', hora: new Date().toISOString(), cerrado: false });
  guardar('pedidos', pedidos);
  carro = []; guardarCarro(); setPref('nota', ''); propina = { modo: 'sugerida', valor: 0 };
  render(); seguimiento();
  avisar(`Pedido ${id} enviado`);
}

// ---------- Seguimiento ----------
function pedidosMesa() {
  const cliente = pref('cliente', '');
  return leer('pedidos').filter((p) => p.mesa === MESA && !p.cerrado && (!cliente || p.cliente === cliente)).sort((a, b) => b.id - a.id);
}

const ORDEN = ['pendiente', 'confirmado', 'preparacion', 'entregado'];
function seguimiento() {
  const lista = pedidosMesa();
  const d = abrirHoja(`
    <div class="hoja-cab"><h2>Mis pedidos</h2><button class="cerrar" data-cerrar aria-label="Cerrar">×</button></div>
    <div class="hoja-cuerpo" id="seguimiento">
      ${lista.length ? lista.map((p) => {
        const e = ESTADOS[p.estado];
        const paso = ORDEN.indexOf(p.estado);
        return `<div class="seguimiento">
          <div class="seguimiento-cab"><b>Pedido ${p.id}</b><span class="estado estado--${p.estado}">${e.icono} ${e.label}</span></div>
          ${p.estado !== 'cancelado' ? `<div class="pasos">${ORDEN.map((_, i) => `<i class="${i <= paso ? 'hecho' : ''}"></i>`).join('')}</div>` : ''}
          <small style="color:var(--tenue)">${e.mensaje}</small>
          <small>${p.items.map((i) => `${i.cant} × ${esc(i.nombre)}`).join(' · ')}</small>
          <div class="fila-total"><small style="color:var(--tenue)">Total con propina</small><b>${clp(totalPedido(p) + p.propina)}</b></div>
        </div>`;
      }).join('') : '<p class="vacio">Todavía no envías pedidos desde esta mesa.</p>'}
      <p class="nota-envio">Esta pantalla se actualiza sola cuando el local cambia el estado.</p>
    </div>`);
  d.onclick = (e) => { if (e.target === d || e.target.closest('[data-cerrar]')) d.close(); };
}

// ---------- Llamar al garzón ----------
function llamarGarzon() {
  const llamadas = leer('llamadas');
  if (llamadas.some((l) => l.mesa === MESA && !l.atendida)) return avisar('Ya avisamos al garzón, viene en camino');
  if (!confirm(`¿Llamar al garzón a la mesa ${MESA}?`)) return;
  llamadas.push({ id: uid(), mesa: MESA, hora: new Date().toISOString(), atendida: false });
  guardar('llamadas', llamadas);
  render(); avisar('Listo, avisamos al garzón');
}

// ---------- Información del local ----------
function info() {
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(local.direccion)}`;
  const d = abrirHoja(`
    <div class="hoja-cab"><h2>${esc(local.nombre)}</h2><button class="cerrar" data-cerrar aria-label="Cerrar">×</button></div>
    <div class="hoja-cuerpo"><div class="info-lista">
      <div><span>📍</span><p><small>Dirección</small>${esc(local.direccion)}<br><a href="${maps}" target="_blank" rel="noopener">Abrir en Google Maps ↗</a></p></div>
      <div><span>🕐</span><p><small>Horario</small>${esc(local.horario)}</p></div>
      ${local.telefono ? `<div><span>☎</span><p><small>Teléfono</small><a href="tel:${esc(local.telefono.replace(/\s/g, ''))}">${esc(local.telefono)}</a></p></div>` : ''}
    </div></div>`);
  d.onclick = (e) => { if (e.target === d || e.target.closest('[data-cerrar]')) d.close(); };
}

// ---------- Eventos ----------
app.addEventListener('click', (e) => {
  const sumarB = e.target.closest('[data-sumar]');
  if (sumarB) { e.stopPropagation(); return sumar(sumarB.dataset.sumar); }
  const f = e.target.closest('[data-filtro]');
  if (f) { filtro = f.dataset.filtro; render(); return; }
  const a = e.target.closest('[data-accion]')?.dataset.accion;
  if (a === 'info') return info();
  if (a === 'vista') { setPref('vista', pref('vista', 'grilla') === 'lista' ? 'grilla' : 'lista'); return render(); }
  if (a === 'tema') { setPref('tema', document.documentElement.dataset.tema === 'claro' ? 'oscuro' : 'claro'); cargar(); return render(); }
  if (a === 'carro') return hojaCarro();
  if (a === 'mesero') return llamarGarzon();
  if (a === 'seguimiento') return seguimiento();
  const det = e.target.closest('[data-detalle]');
  if (det) detalle(det.dataset.detalle);
});
app.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('[data-detalle]')) detalle(e.target.dataset.detalle); });
app.addEventListener('input', (e) => {
  if (e.target.id !== 'buscar') return;
  busqueda = e.target.value;
  const pos = e.target.selectionStart;
  render();
  const b = document.getElementById('buscar'); b.focus(); b.setSelectionRange(pos, pos);
});

// Cambios hechos en el administrador (otra pantalla) se ven al tiro.
alCambiar((clave) => {
  cargar();
  carro = carro.filter((c) => productos.some((p) => p.id === c.id));
  const hoja = document.getElementById('hoja');
  if (PIDE && clave === 'pedidos' && hoja?.open && hoja.querySelector('#seguimiento')) seguimiento();
  render();
});

cargar();
render();
