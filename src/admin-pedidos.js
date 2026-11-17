// Pantalla 4: administrador de pedidos (pedidos por mesa, garzones, mesas y QR).
import { leer, guardar, alCambiar, clp, esc, uid, ESTADOS, totalPedido, irA } from './store.js';
import { crearAdmin, modal, qrSvg, urlDe, toast } from './admin-base.js';

let filtroEstado = 'todos';
let colapsadas = new Set();
const hora = (iso) => new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago' });
const hace = (iso) => { const m = Math.round((Date.now() - new Date(iso)) / 60000); return m < 1 ? 'recién' : m < 60 ? `hace ${m} min` : `hace ${Math.floor(m / 60)} h`; };
const garzonDe = (mesa) => { const g = leer('mesas').find((m) => m.n === mesa)?.garzon; return leer('garzones').find((x) => x.id === g); };

const admin = crearAdmin({
  plan: 'Plan pedidos',
  verCarta: 'pedidos',
  pestanas: [
    { id: 'pedidos', nombre: 'Pedidos', icono: '🛎' },
    { id: 'garzones', nombre: 'Garzones', icono: '♟' },
    { id: 'mesas', nombre: 'Mesas y QR', icono: '▦' },
  ],
  badges: () => ({ pedidos: leer('pedidos').filter((p) => !p.cerrado && p.estado === 'pendiente').length + leer('llamadas').filter((l) => !l.atendida).length }),
  pintar(id, el) { VISTAS[id](el); },
});

const VISTAS = {
  pedidos(el) {
    const abiertos = leer('pedidos').filter((p) => !p.cerrado);
    const llamadas = leer('llamadas').filter((l) => !l.atendida);
    const cuenta = (e) => abiertos.filter((p) => e === 'todos' || p.estado === e).length;
    const visibles = abiertos.filter((p) => filtroEstado === 'todos' || p.estado === filtroEstado);
    const mesas = [...new Set(visibles.map((p) => p.mesa))].sort((a, b) => a - b);

    el.innerHTML = `
      <div class="cab"><div><h1>Pedidos del local</h1><p>Agrupados por mesa y por persona. Cambia el estado y el cliente lo ve en su celular.</p></div>
        <button class="boton boton--linea" data-probar>Hacer un pedido de prueba ↗</button></div>
      ${llamadas.length ? `<div class="panel" style="margin-top:16px;border-color:#f0c2b9;background:#fff6f4">
        <h2>🔔 Llamadas al garzón</h2>
        <div class="lista" style="margin-top:6px">${llamadas.map((l) => `
          <div class="fila" style="grid-template-columns:1fr auto"><div><b>Mesa ${l.mesa}</b><small>${hace(l.hora)} · Atiende ${esc(garzonDe(l.mesa)?.nombre || 'sin asignar')}</small></div>
          <button class="boton boton--chico" data-atender="${esc(l.id)}">Atendida</button></div>`).join('')}</div>
      </div>` : ''}
      <div class="filtros" style="margin-top:16px">
        ${['todos', ...Object.keys(ESTADOS)].map((e) => `<button class="boton boton--chico ${filtroEstado === e ? '' : 'boton--linea'}" data-filtro="${e}">${e === 'todos' ? 'Todos' : `${ESTADOS[e].icono} ${ESTADOS[e].label}`} · ${cuenta(e)}</button>`).join('')}
      </div>
      <div style="display:grid;gap:14px;margin-top:14px">
        ${mesas.length ? mesas.map((n) => mesaHtml(n, visibles.filter((p) => p.mesa === n), abiertos.filter((p) => p.mesa === n))).join('') : '<div class="panel vacio">No hay pedidos con este filtro. Abre la pantalla 3 y haz uno.</div>'}
      </div>`;
  },

  garzones(el) {
    const garzones = leer('garzones');
    const mesas = leer('mesas');
    el.innerHTML = `
      <div class="cab"><div><h1>Garzones</h1><p>El equipo que atiende las mesas. Cada mesa tiene un garzón a cargo.</p></div>
        <button class="boton" data-nuevo-garzon>+ Nuevo garzón</button></div>
      <div class="panel" style="margin-top:16px"><div class="lista">
        ${garzones.map((g) => {
          const suyas = mesas.filter((m) => m.garzon === g.id).map((m) => m.n);
          return `<div class="fila">
            <div class="mini">🧑‍🍳</div>
            <div><b>${esc(g.nombre)}${g.activo ? '' : '<span class="oculto-tag">Inactivo</span>'}</b><small>${suyas.length ? `Mesas ${suyas.join(', ')}` : 'Sin mesas asignadas'}</small></div>
            <div class="fila-acciones">
              <label class="switch" title="${g.activo ? 'Activo' : 'Inactivo'}"><input type="checkbox" data-activo="${esc(g.id)}"${g.activo ? ' checked' : ''} aria-label="Garzón activo"><span></span></label>
              <button class="icono-b" data-editar-garzon="${esc(g.id)}" aria-label="Editar ${esc(g.nombre)}">✎</button>
            </div></div>`;
        }).join('')}
      </div></div>`;
  },

  mesas(el) {
    const mesas = leer('mesas');
    const garzones = leer('garzones');
    el.innerHTML = `
      <div class="cab"><div><h1>Mesas y códigos QR</h1><p>Cada mesa tiene su QR: el pedido llega con el número de mesa y al garzón a cargo.</p></div>
        <div class="filtros"><button class="boton boton--linea" data-quitar-mesa${mesas.length <= 1 ? ' disabled' : ''}>− Quitar mesa</button><button class="boton" data-agregar-mesa>+ Agregar mesa</button></div></div>
      <div class="qr-grilla" style="margin-top:16px">
        ${mesas.map((m) => `
          <div class="qr-tarjeta">
            <h3>Mesa ${m.n}</h3>
            <div class="qr">${qrSvg(urlDe(`pedidos.html?mesa=${m.n}`))}</div>
            <select data-garzon-mesa="${m.n}" aria-label="Garzón de la mesa ${m.n}">
              <option value="">Sin garzón</option>
              ${garzones.filter((g) => g.activo || g.id === m.garzon).map((g) => `<option value="${esc(g.id)}"${g.id === m.garzon ? ' selected' : ''}>${esc(g.nombre)}</option>`).join('')}
            </select>
            <div class="acciones"><button class="boton boton--chico" data-abrir-mesa="${m.n}">Probar esta mesa</button></div>
          </div>`).join('')}
      </div>`;
  },
};

function mesaHtml(n, visibles, todos) {
  const g = garzonDe(n);
  const total = todos.reduce((s, p) => s + totalPedido(p) + p.propina, 0);
  const pendientes = todos.filter((p) => p.estado === 'pendiente').length;
  const personas = [...new Set(visibles.map((p) => p.cliente))];
  const cerrada = colapsadas.has(n);
  return `
    <section class="panel" style="padding:0;overflow:hidden">
      <header style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:14px 16px;background:var(--marca);color:#fff;cursor:pointer" data-colapsar="${n}">
        <div style="flex:1;min-width:160px"><small style="color:#a9c0c9;font-weight:700;letter-spacing:.1em;font-size:11px">MESA</small>
          <h2 style="font:700 24px/1 'Bodoni Moda',Georgia,serif">Mesa ${n}</h2>
          <small style="color:#c7d6db">${todos.length} ${todos.length === 1 ? 'pedido' : 'pedidos'} · ${[...new Set(todos.map((p) => p.cliente))].length} personas · Atiende ${esc(g?.nombre || 'sin asignar')}</small></div>
        ${pendientes ? `<span style="background:#ffd27a;color:#3d2a00;font-weight:700;font-size:12px;padding:5px 9px;border-radius:999px">⏳ ${pendientes} pendiente${pendientes > 1 ? 's' : ''}</span>` : ''}
        <b style="font-size:20px">${clp(total)}</b>
        <button class="boton boton--chico" style="background:#f6f2ea;color:var(--marca)" data-cerrar-mesa="${n}">🔒 Cerrar mesa</button>
        <span aria-hidden="true">${cerrada ? '▸' : '▾'}</span>
      </header>
      ${cerrada ? '' : `<div style="padding:12px 16px 16px;display:grid;gap:14px">${personas.map((c) => personaHtml(c, visibles.filter((p) => p.cliente === c))).join('')}</div>`}
    </section>`;
}

function personaHtml(cliente, pedidos) {
  const total = pedidos.reduce((s, p) => s + totalPedido(p) + p.propina, 0);
  return `
    <div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:8px"><b style="font-size:16px">👤 ${esc(cliente)}</b><small style="color:var(--tenue)">Total con propina <b style="color:var(--texto)">${clp(total)}</b></small></div>
      <div style="display:grid;gap:10px">${pedidos.sort((a, b) => b.id - a.id).map(pedidoHtml).join('')}</div>
    </div>`;
}

function pedidoHtml(p) {
  const sub = totalPedido(p);
  const color = { pendiente: '#b7791f', confirmado: '#2f8c86', preparacion: '#2f6f8c', entregado: '#2f8a57', cancelado: '#c2412d' }[p.estado];
  return `
    <article style="border:1px solid var(--linea);border-left:4px solid ${color};border-radius:12px;padding:12px 14px;display:grid;gap:8px;background:var(--panel2)">
      <div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><b>Pedido ${p.id}</b><small style="color:var(--tenue)">${hora(p.hora)} · ${hace(p.hora)}</small></div>
      <div style="display:grid;gap:2px">${p.items.map((i) => `<div style="display:flex;justify-content:space-between;gap:8px"><span>${i.cant} × ${esc(i.nombre)}</span><span>${clp(i.precio * i.cant)}</span></div>`).join('')}</div>
      ${p.nota ? `<div style="background:#fff7de;border-radius:9px;padding:8px 10px;font-size:13.5px">✎ <b>Nota:</b> ${esc(p.nota)}</div>` : ''}
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
        <small style="color:var(--tenue)">Subtotal ${clp(sub)} · Propina ${clp(p.propina)} · <b style="color:var(--texto)">Total ${clp(sub + p.propina)}</b></small>
        <select data-estado="${p.id}" aria-label="Estado del pedido ${p.id}" style="min-height:38px;border-radius:9px;border:1px solid var(--linea);padding:0 10px;font-weight:700;background:var(--panel)">
          ${Object.entries(ESTADOS).map(([k, e]) => `<option value="${k}"${k === p.estado ? ' selected' : ''}>${e.icono} ${e.label}</option>`).join('')}
        </select>
      </div>
    </article>`;
}

function formGarzon(id) {
  const g = leer('garzones').find((x) => x.id === id) || { nombre: '', activo: true };
  modal({
    titulo: id ? 'Editar garzón' : 'Nuevo garzón',
    cuerpo: `<label class="campo">Nombre<input name="nombre" value="${esc(g.nombre)}" required></label>
      <label class="campo" style="display:flex;align-items:center;gap:10px"><span class="switch"><input type="checkbox" name="activo"${g.activo ? ' checked' : ''}><span></span></span>Activo (puede tener mesas)</label>`,
    onGuardar(f) {
      const l = leer('garzones');
      const datos = { nombre: f.get('nombre').trim(), activo: f.get('activo') === 'on' };
      if (id) Object.assign(l.find((x) => x.id === id), datos); else l.push({ id: uid(), ...datos });
      guardar('garzones', l);
      admin.refrescar();
    },
  });
}

// ---------- Eventos ----------
document.addEventListener('click', (e) => {
  const t = e.target;
  if (t.closest('[data-probar]')) return irA('pedidos', { mesa: 4 });
  const f = t.closest('[data-filtro]');
  if (f) { filtroEstado = f.dataset.filtro; return admin.refrescar(); }
  const at = t.closest('[data-atender]');
  if (at) { guardar('llamadas', leer('llamadas').map((l) => (l.id === at.dataset.atender ? { ...l, atendida: true } : l))); return admin.refrescar(); }
  const cm = t.closest('[data-cerrar-mesa]');
  if (cm) {
    e.stopPropagation();
    const n = Number(cm.dataset.cerrarMesa);
    if (confirm(`¿Cerrar la mesa ${n}? Sus pedidos pasan al historial y la mesa queda libre.`)) {
      guardar('pedidos', leer('pedidos').map((p) => (p.mesa === n ? { ...p, cerrado: true } : p)));
      guardar('llamadas', leer('llamadas').map((l) => (l.mesa === n ? { ...l, atendida: true } : l)));
      admin.refrescar();
      toast('🔒', `Mesa ${n} cerrada`, 'Quedó libre para los próximos clientes.');
    }
    return;
  }
  const col = t.closest('[data-colapsar]');
  if (col && !t.closest('button')) { const n = Number(col.dataset.colapsar); colapsadas.has(n) ? colapsadas.delete(n) : colapsadas.add(n); return admin.refrescar(); }
  if (t.closest('[data-nuevo-garzon]')) return formGarzon();
  const eg = t.closest('[data-editar-garzon]');
  if (eg) return formGarzon(eg.dataset.editarGarzon);
  if (t.closest('[data-agregar-mesa]')) { const m = leer('mesas'); m.push({ n: Math.max(0, ...m.map((x) => x.n)) + 1, garzon: '' }); guardar('mesas', m); return admin.refrescar(); }
  if (t.closest('[data-quitar-mesa]')) { const m = leer('mesas'); if (m.length > 1) { m.pop(); guardar('mesas', m); } return admin.refrescar(); }
  const am = t.closest('[data-abrir-mesa]');
  if (am) return irA('pedidos', { mesa: Number(am.dataset.abrirMesa) });
});
document.addEventListener('change', (e) => {
  const s = e.target.closest('[data-estado]');
  if (s) { guardar('pedidos', leer('pedidos').map((p) => (p.id === Number(s.dataset.estado) ? { ...p, estado: s.value } : p))); return admin.refrescar(); }
  const a = e.target.closest('[data-activo]');
  if (a) { guardar('garzones', leer('garzones').map((g) => (g.id === a.dataset.activo ? { ...g, activo: a.checked } : g))); return admin.refrescar(); }
  const gm = e.target.closest('[data-garzon-mesa]');
  if (gm) { guardar('mesas', leer('mesas').map((m) => (m.n === Number(gm.dataset.garzonMesa) ? { ...m, garzon: gm.value } : m))); }
});

// Avisos en vivo: pedidos nuevos y llamadas que llegan desde la pantalla 3.
let conocidos = new Set(leer('pedidos').map((p) => p.id));
let llamadasConocidas = new Set(leer('llamadas').map((l) => l.id));
alCambiar((clave) => {
  if (clave === 'pedidos') {
    for (const p of leer('pedidos')) if (!conocidos.has(p.id)) toast('🧾', `Nuevo pedido · Mesa ${p.mesa}`, `${esc(p.cliente)} · ${p.items.reduce((s, i) => s + i.cant, 0)} productos · ${clp(totalPedido(p) + p.propina)}`, () => admin.mostrar('pedidos'));
    conocidos = new Set(leer('pedidos').map((p) => p.id));
  }
  if (clave === 'llamadas') {
    for (const l of leer('llamadas')) if (!llamadasConocidas.has(l.id) && !l.atendida) toast('🔔', `Llamada al garzón · Mesa ${l.mesa}`, 'Toca para ver los pedidos.', () => admin.mostrar('pedidos'));
    llamadasConocidas = new Set(leer('llamadas').map((l) => l.id));
  }
  admin.refrescar();
});
// Si el pedido se hizo en la pantalla 3 y recién ahora se abre este administrador, también se avisa.
(function avisosPendientes() {
  const K = 'oceanic-demo:pref:vistos';
  let vistos;
  try { vistos = new Set(JSON.parse(localStorage.getItem(K) || '[]')); } catch { vistos = new Set(); }
  for (const p of leer('pedidos')) if (!p.cerrado && p.estado === 'pendiente' && !vistos.has(`p${p.id}`)) toast('🧾', `Nuevo pedido · Mesa ${p.mesa}`, `${esc(p.cliente)} · ${clp(totalPedido(p) + p.propina)}`, () => admin.mostrar('pedidos'));
  for (const l of leer('llamadas')) if (!l.atendida && !vistos.has(`l${l.id}`)) toast('🔔', `Llamada al garzón · Mesa ${l.mesa}`, hace(l.hora), () => admin.mostrar('pedidos'));
  const todos = [...leer('pedidos').map((p) => `p${p.id}`), ...leer('llamadas').map((l) => `l${l.id}`)];
  try { localStorage.setItem(K, JSON.stringify(todos)); } catch { /* nada */ }
})();

setInterval(() => { if (admin.actual === 'pedidos' && !document.querySelector('dialog[open]') && document.activeElement?.tagName !== 'SELECT') admin.refrescar(); }, 30000);

admin.refrescar();
