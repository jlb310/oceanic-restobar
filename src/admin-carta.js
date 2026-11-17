// Pantalla 2: administrador de la carta.
import { leer, guardar, alCambiar, FOTO, clp, esc, uid, irA } from './store.js';
import { crearAdmin, modal, qrSvg, urlDe, toast } from './admin-base.js';

let busq = '';
let catFiltro = '';

const fotoMini = (p) => (p.foto ? `<img src="${/^https?:/.test(p.foto) ? esc(p.foto) : FOTO(p.foto, 120)}" alt="">` : esc(p.emoji || '🍽️'));

const admin = crearAdmin({
  plan: 'Plan carta',
  verCarta: 'carta',
  pestanas: [
    { id: 'resumen', nombre: 'Resumen', icono: '▦' },
    { id: 'productos', nombre: 'Productos', icono: '☰' },
    { id: 'categorias', nombre: 'Categorías', icono: '⌗' },
    { id: 'local', nombre: 'Datos del local', icono: '◎' },
    { id: 'personalizar', nombre: 'Personalizar', icono: '✦' },
    { id: 'qr', nombre: 'Código QR', icono: '▣' },
  ],
  pintar(id, el) { VISTAS[id](el); },
});

const VISTAS = {
  resumen(el) {
    const productos = leer('productos');
    const cats = leer('categorias');
    el.innerHTML = `
      <div class="cab"><div><h1>Resumen</h1><p>Prueba el administrador como si Oceanic fuera tuyo: cambia un precio y mira la carta.</p></div>
        <button class="boton" data-ir-carta>Ver la carta ↗</button></div>
      <div class="numeros" style="margin-top:16px">
        <div class="numero"><b>${productos.length}</b><span>Productos en la carta</span></div>
        <div class="numero"><b>${productos.filter((p) => p.visible).length}</b><span>Disponibles hoy</span></div>
        <div class="numero"><b>${productos.filter((p) => !p.visible).length}</b><span>Ocultos</span></div>
        <div class="numero"><b>${cats.length}</b><span>Categorías</span></div>
      </div>
      <div class="panel" style="margin-top:16px">
        <div class="cab"><h2>Accesos rápidos</h2></div>
        <div class="filtros" style="margin-top:12px">
          <button class="boton boton--linea" data-tab-ir="productos">+ Nuevo producto</button>
          <button class="boton boton--linea" data-tab-ir="local">Cambiar horario o teléfono</button>
          <button class="boton boton--linea" data-tab-ir="personalizar">Cambiar tema de la carta</button>
          <button class="boton boton--linea" data-tab-ir="qr">Imprimir el QR</button>
        </div>
      </div>`;
  },

  productos(el) {
    const productos = leer('productos');
    const cats = leer('categorias');
    const q = busq.toLowerCase();
    const lista = productos.filter((p) => (!catFiltro || p.cat === catFiltro) && (!q || p.nombre.toLowerCase().includes(q)));
    const catNombre = (id) => cats.find((c) => c.id === id)?.nombre || 'Sin categoría';
    el.innerHTML = `
      <div class="cab"><div><h1>Productos</h1><p>Edita precios, fotos y disponibilidad. Los ocultos no aparecen en la carta.</p></div>
        <button class="boton" data-nuevo>+ Nuevo producto</button></div>
      <div class="panel" style="margin-top:16px">
        <div class="filtros">
          <input type="search" id="busq" placeholder="Buscar producto" value="${esc(busq)}" aria-label="Buscar producto">
          <select id="cat-filtro" aria-label="Filtrar por categoría"><option value="">Todas las categorías</option>${cats.map((c) => `<option value="${esc(c.id)}"${c.id === catFiltro ? ' selected' : ''}>${esc(c.icono)} ${esc(c.nombre)}</option>`).join('')}</select>
        </div>
        <div class="lista" style="margin-top:8px">
          ${lista.length ? lista.map((p) => `
            <div class="fila">
              <div class="mini">${fotoMini(p)}</div>
              <div><b>${esc(p.nombre)}${p.visible ? '' : '<span class="oculto-tag">Oculto</span>'}</b><small>${esc(catNombre(p.cat))} · ${clp(p.precio)}${p.etiqueta ? ` · ${esc(p.etiqueta)}` : ''}</small></div>
              <div class="fila-acciones">
                <label class="switch" title="${p.visible ? 'Disponible' : 'Oculto'}"><input type="checkbox" data-visible="${esc(p.id)}"${p.visible ? ' checked' : ''} aria-label="Disponible en la carta"><span></span></label>
                <button class="icono-b" data-editar="${esc(p.id)}" aria-label="Editar ${esc(p.nombre)}">✎</button>
              </div>
            </div>`).join('') : '<p class="vacio">No hay productos con ese filtro.</p>'}
        </div>
      </div>`;
  },

  categorias(el) {
    const cats = leer('categorias');
    const productos = leer('productos');
    el.innerHTML = `
      <div class="cab"><div><h1>Categorías</h1><p>Las secciones de la carta, en el orden en que aparecen.</p></div>
        <button class="boton" data-nueva-cat>+ Nueva categoría</button></div>
      <div class="panel" style="margin-top:16px"><div class="lista">
        ${cats.map((c, i) => `
          <div class="fila">
            <div class="mini">${esc(c.icono)}</div>
            <div><b>${esc(c.nombre)}</b><small>${productos.filter((p) => p.cat === c.id).length} productos</small></div>
            <div class="fila-acciones">
              <button class="icono-b" data-subir="${i}" aria-label="Subir"${i === 0 ? ' disabled style="opacity:.35"' : ''}>↑</button>
              <button class="icono-b" data-editar-cat="${esc(c.id)}" aria-label="Editar ${esc(c.nombre)}">✎</button>
            </div>
          </div>`).join('')}
      </div></div>`;
  },

  local(el) {
    const l = leer('local');
    el.innerHTML = `
      <div class="cab"><div><h1>Datos del local</h1><p>Lo que aparece en la carta: dirección, horario, teléfono y redes. Solo se muestran las redes con enlace.</p></div></div>
      <form class="panel form" id="form-local" style="margin-top:16px">
        <div class="form-2">
          <label class="campo">Nombre del local<input name="nombre" value="${esc(l.nombre)}" required></label>
          <label class="campo">Tipo de local<input name="tipo" value="${esc(l.tipo)}"></label>
          <label class="campo">Dirección<input name="direccion" value="${esc(l.direccion)}"></label>
          <label class="campo">Horario<input name="horario" value="${esc(l.horario)}"></label>
          <label class="campo">Teléfono<input name="telefono" value="${esc(l.telefono)}" inputmode="tel"></label>
          <label class="campo">WhatsApp <small>Solo números, con 56</small><input name="whatsapp" value="${esc(l.whatsapp)}" inputmode="numeric"></label>
          <label class="campo">Instagram<input name="instagram" value="${esc(l.instagram)}" placeholder="https://instagram.com/…"></label>
          <label class="campo">Facebook<input name="facebook" value="${esc(l.facebook)}" placeholder="https://facebook.com/…"></label>
          <label class="campo">Sitio web<input name="sitio" value="${esc(l.sitio)}" placeholder="https://…"></label>
        </div>
        <div><button class="boton">Guardar cambios</button></div>
      </form>`;
  },

  personalizar(el) {
    const l = leer('local');
    const temas = [
      ['claro', 'Claro', 'Marfil y azul océano, luminoso.', 'linear-gradient(135deg,#f6f2ea 60%,#0d2b3e 60%)'],
      ['oscuro', 'Oscuro', 'Alto contraste para la noche.', 'linear-gradient(135deg,#0f1417 60%,#6fd0c4 60%)'],
      ['oceano', 'Océano', 'Azul profundo con verde agua.', 'linear-gradient(135deg,#0d2b3e 60%,#8fd1c8 60%)'],
    ];
    el.innerHTML = `
      <div class="cab"><div><h1>Personalizar la carta</h1><p>Título, frase de portada y el tema de colores.</p></div><button class="boton boton--linea" data-ir-carta>Ver cómo queda ↗</button></div>
      <form class="panel form" id="form-portada" style="margin-top:16px">
        <label class="campo">Título de portada <small>Máximo 28 caracteres, para que quede en una línea.</small><input name="titulo" maxlength="28" value="${esc(l.titulo)}"></label>
        <label class="campo">Frase de portada<input name="frase" maxlength="80" value="${esc(l.frase)}"></label>
        <div class="campo">Tema de la carta
          <div class="opciones">${temas.map(([id, n, d, g]) => `<button type="button" class="opcion" data-tema="${id}" aria-pressed="${l.tema === id}"><i style="background:${g}"></i><b>${n}</b><small>${d}</small></button>`).join('')}</div>
        </div>
        <div><button class="boton">Guardar cambios</button></div>
      </form>`;
  },

  qr(el) {
    const url = urlDe('carta.html');
    el.innerHTML = `
      <div class="cab"><div><h1>Código QR</h1><p>Un solo QR para todas las mesas. Al escanearlo, el cliente entra directo a la carta.</p></div></div>
      <div class="panel qr-grande" style="margin-top:16px">
        <div class="qr">${qrSvg(url)}</div>
        <div><b>${esc(leer('local').nombre)}</b><br><small style="color:var(--tenue)">${esc(url)}</small></div>
        <div class="filtros" style="justify-content:center">
          <button class="boton" onclick="window.print()">Imprimir</button>
          <button class="boton boton--linea" data-ir-carta>Abrir la carta</button>
        </div>
        <p style="color:var(--tenue);font-size:13px;max-width:440px">¿Quieres recibir pedidos desde la mesa? En el plan con pedidos, cada mesa tiene su propio QR y el pedido llega al administrador.</p>
      </div>`;
  },
};

// ---------- Formularios ----------
function formProducto(id) {
  const productos = leer('productos');
  const cats = leer('categorias');
  const p = productos.find((x) => x.id === id) || { id: '', nombre: '', precio: '', cat: cats[0]?.id, etiqueta: '', desc: '', detalle: '', foto: '', emoji: '🍽️', visible: true };
  modal({
    titulo: id ? 'Editar producto' : 'Nuevo producto',
    cuerpo: `
      <div class="form-2">
        <label class="campo">Nombre<input name="nombre" value="${esc(p.nombre)}" required></label>
        <label class="campo">Precio<input name="precio" type="number" min="0" step="100" value="${esc(p.precio)}" required inputmode="numeric"></label>
        <label class="campo">Categoría<select name="cat">${cats.map((c) => `<option value="${esc(c.id)}"${c.id === p.cat ? ' selected' : ''}>${esc(c.icono)} ${esc(c.nombre)}</option>`).join('')}</select></label>
        <label class="campo">Etiqueta <small>Opcional: «De la casa», «Picante»…</small><input name="etiqueta" value="${esc(p.etiqueta)}"></label>
      </div>
      <label class="campo">Descripción corta<input name="desc" value="${esc(p.desc)}"></label>
      <label class="campo">Detalle <small>Opcional, se ve al abrir el producto</small><textarea name="detalle">${esc(p.detalle)}</textarea></label>
      <div class="form-2">
        <label class="campo">Foto <small>Enlace a una imagen (opcional)</small><input name="foto" value="${esc(/^https?:/.test(p.foto) || !p.foto ? p.foto : FOTO(p.foto, 900))}" placeholder="https://…"></label>
        <label class="campo">Emoji si no hay foto<input name="emoji" value="${esc(p.emoji)}" maxlength="4"></label>
      </div>
      <label class="campo" style="display:flex;align-items:center;gap:10px"><span class="switch"><input type="checkbox" name="visible"${p.visible ? ' checked' : ''}><span></span></span>Disponible en la carta</label>`,
    extra: id ? '<button type="button" class="boton boton--peligro" data-borrar style="margin-right:auto">Eliminar</button>' : '',
    onGuardar(f) {
      const datos = { nombre: f.get('nombre').trim(), precio: Number(f.get('precio')), cat: f.get('cat'), etiqueta: f.get('etiqueta').trim(), desc: f.get('desc').trim(), detalle: f.get('detalle').trim(), foto: f.get('foto').trim(), emoji: f.get('emoji').trim(), visible: f.get('visible') === 'on' };
      const lista = leer('productos');
      if (id) Object.assign(lista.find((x) => x.id === id), datos); else lista.push({ id: uid(), ...datos });
      guardar('productos', lista);
      admin.refrescar();
      toast('✓', 'Producto guardado', 'Ya se ve en la carta.');
    },
  }).addEventListener('click', (e) => {
    if (e.target.closest('[data-borrar]') && confirm(`¿Eliminar «${p.nombre}» de la carta?`)) {
      guardar('productos', leer('productos').filter((x) => x.id !== id));
      e.target.closest('dialog').close();
      admin.refrescar();
    }
  });
}

function formCategoria(id) {
  const cats = leer('categorias');
  const c = cats.find((x) => x.id === id) || { id: '', nombre: '', icono: '🍽️' };
  modal({
    titulo: id ? 'Editar categoría' : 'Nueva categoría',
    cuerpo: `<div class="form-2"><label class="campo">Nombre<input name="nombre" value="${esc(c.nombre)}" required></label><label class="campo">Ícono (emoji)<input name="icono" value="${esc(c.icono)}" maxlength="4"></label></div>`,
    extra: id ? '<button type="button" class="boton boton--peligro" data-borrar style="margin-right:auto">Eliminar</button>' : '',
    onGuardar(f) {
      const lista = leer('categorias');
      const datos = { nombre: f.get('nombre').trim(), icono: f.get('icono').trim() || '🍽️' };
      if (id) Object.assign(lista.find((x) => x.id === id), datos); else lista.push({ id: uid(), ...datos });
      guardar('categorias', lista);
      admin.refrescar();
    },
  }).addEventListener('click', (e) => {
    if (!e.target.closest('[data-borrar]')) return;
    const n = leer('productos').filter((p) => p.cat === id).length;
    if (n) return alert(`Esta categoría tiene ${n} productos. Muévelos a otra categoría antes de eliminarla.`);
    if (confirm(`¿Eliminar la categoría «${c.nombre}»?`)) { guardar('categorias', leer('categorias').filter((x) => x.id !== id)); e.target.closest('dialog').close(); admin.refrescar(); }
  });
}

// ---------- Eventos ----------
document.addEventListener('click', (e) => {
  const t = e.target;
  if (t.closest('[data-ir-carta]')) return irA('carta');
  const ir = t.closest('[data-tab-ir]');
  if (ir) { admin.mostrar(ir.dataset.tabIr); if (ir.dataset.tabIr === 'productos') formProducto(); return; }
  if (t.closest('[data-nuevo]')) return formProducto();
  const ed = t.closest('[data-editar]');
  if (ed) return formProducto(ed.dataset.editar);
  if (t.closest('[data-nueva-cat]')) return formCategoria();
  const ec = t.closest('[data-editar-cat]');
  if (ec) return formCategoria(ec.dataset.editarCat);
  const sub = t.closest('[data-subir]');
  if (sub) { const l = leer('categorias'); const i = Number(sub.dataset.subir); [l[i - 1], l[i]] = [l[i], l[i - 1]]; guardar('categorias', l); return admin.refrescar(); }
  const tema = t.closest('[data-tema]');
  if (tema) { document.querySelectorAll('[data-tema]').forEach((b) => b.setAttribute('aria-pressed', b === tema)); }
});
document.addEventListener('change', (e) => {
  const v = e.target.closest('[data-visible]');
  if (v) { const l = leer('productos'); l.find((p) => p.id === v.dataset.visible).visible = v.checked; guardar('productos', l); admin.refrescar(); }
  if (e.target.id === 'cat-filtro') { catFiltro = e.target.value; admin.refrescar(); }
});
document.addEventListener('input', (e) => {
  if (e.target.id !== 'busq') return;
  busq = e.target.value;
  admin.refrescar();
  const b = document.getElementById('busq'); b.focus(); b.setSelectionRange(busq.length, busq.length);
});
document.addEventListener('submit', (e) => {
  if (e.target.id === 'form-local') {
    e.preventDefault();
    guardar('local', { ...leer('local'), ...Object.fromEntries(new FormData(e.target)) });
    toast('✓', 'Datos guardados', 'La carta ya muestra la información nueva.');
  }
  if (e.target.id === 'form-portada') {
    e.preventDefault();
    const tema = document.querySelector('[data-tema][aria-pressed="true"]')?.dataset.tema || 'claro';
    guardar('local', { ...leer('local'), ...Object.fromEntries(new FormData(e.target)), tema });
    try { localStorage.removeItem('oceanic-demo:pref:tema'); } catch { /* nada */ }
    toast('✓', 'Carta personalizada', 'Abre la carta para ver el cambio.', () => irA('carta'));
  }
});

alCambiar(() => admin.refrescar());
admin.refrescar();
