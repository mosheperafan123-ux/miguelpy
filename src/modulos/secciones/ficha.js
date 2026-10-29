// 2.2 Ficha del proyecto.
// Las metas suben una sola vez hasta su valor, y la pista de Design Thinking se traza
// hasta la última fase realizada: cada nodo se rellena cuando la línea lo alcanza.
// El anillo de las fases en curso es CSS (base.css lo detiene con movimiento reducido).
import { ficha } from '../../datos/proyecto.js';
import { contar } from '../utilidades.js';

export function iniciar({ gsap, reducido }) {
  const seccion = document.getElementById('ficha');
  if (!seccion || reducido) return;

  contarMetas(seccion);
  trazarPista(gsap, seccion);
}

function contarMetas(seccion) {
  seccion.querySelectorAll('[data-meta]').forEach((numero) => {
    const meta = ficha.metas[Number(numero.dataset.meta)];
    if (!meta) return;
    // Ancho final reservado (cifras tabulares): la unidad no salta mientras cuenta
    numero.style.minWidth = `${String(meta.cifra).length}ch`;
    contar(numero, meta.cifra, { duracion: 1.4, inicio: 'top 88%' });
  });
}

function trazarPista(gsap, seccion) {
  const pista = seccion.querySelector('.ficha__pista');
  const linea = pista?.querySelector('.ficha__pista-hecha');
  if (!pista || !linea) return;

  const rellenos = pista.querySelectorAll('.ficha__fase-relleno');
  const duracion = 1.1;
  const tramo = rellenos.length > 1 ? duracion / (rellenos.length - 1) : 0;

  const pasada = gsap.timeline({ scrollTrigger: { trigger: pista, start: 'top 85%', toggleActions: 'play none none none' } });
  pasada.from(linea, { drawSVG: 0, duration: duracion, ease: 'none' }, 0.15);
  // Cada fase realizada se rellena justo cuando la línea llega a su nodo
  rellenos.forEach((relleno, i) => {
    pasada.from(relleno, { scale: 0, duration: 0.45, ease: 'back.out(2.4)' }, 0.15 + i * tramo);
  });
}
