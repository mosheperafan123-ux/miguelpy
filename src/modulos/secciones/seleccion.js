// 2.1 Selección de la solución.
// Un solo momento: la matriz arranca como un medidor (los LED se encienden fila a fila)
// y los totales suben hasta 19, 18 y 22. Después, las trazas del diagrama llevan
// la oferta y la demanda al núcleo, que entrega la recomendación.
import { seleccion } from '../../datos/proyecto.js';
import { contar } from '../utilidades.js';

export function iniciar({ gsap, reducido }) {
  const seccion = document.getElementById('seleccion');
  if (!seccion || reducido) return;

  encenderMedidores(gsap, seccion);
  contarTotales(seccion);

  const medios = gsap.matchMedia();
  medios.add('(min-width: 900px)', () => {
    dibujarIntegracion(gsap, seccion.querySelector('.seleccion__diagrama--horizontal'));
  });
  medios.add('(max-width: 899px)', () => {
    dibujarIntegracion(gsap, seccion.querySelector('.seleccion__diagrama--vertical'));
  });
}

function encenderMedidores(gsap, seccion) {
  const tabla = seccion.querySelector('.seleccion__desplazable');
  const filas = seccion.querySelectorAll('.seleccion__tabla tbody tr');
  if (!tabla || !filas.length) return;

  const linea = gsap.timeline({ scrollTrigger: { trigger: tabla, start: 'top 75%', toggleActions: 'play none none none' } });
  filas.forEach((fila, i) => {
    fila.querySelectorAll('.seleccion__medidor').forEach((medidor) => {
      const encendidos = medidor.querySelectorAll('.seleccion__seg--on');
      // steps(1): cada LED salta de apagado a encendido, sin fundido, como un medidor real
      linea.from(encendidos, { opacity: 0.12, duration: 0.07, ease: 'steps(1)', stagger: 0.065 }, i * 0.14);
    });
  });
}

function contarTotales(seccion) {
  seccion.querySelectorAll('[data-total]').forEach((cifra) => {
    const valor = seleccion.totales[Number(cifra.dataset.total)];
    if (valor === undefined) return;
    // Se reserva el ancho final (cifras tabulares) para que la tabla no salte cuando «0» pasa a «22»
    cifra.style.minWidth = `${String(valor).length}ch`;
    contar(cifra, valor, { duracion: 1.4, inicio: 'top 92%', retraso: 0.35 });
  });
}

function dibujarIntegracion(gsap, svg) {
  if (!svg) return;
  const entradas = svg.querySelectorAll('.seleccion__traza--entrada');
  const vias = svg.querySelectorAll('.seleccion__via');
  const esquinas = svg.querySelector('.seleccion__esquinas');
  const salida = svg.querySelector('.seleccion__traza--salida');
  const flecha = svg.querySelector('.seleccion__flecha');
  const relleno = svg.querySelector('.seleccion__salida-relleno');

  gsap
    .timeline({ scrollTrigger: { trigger: svg, start: 'top 78%', toggleActions: 'play none none none' } })
    .from(entradas, { drawSVG: 0, duration: 1, ease: 'power2.inOut' }, 0)
    .from(vias, { scale: 0, transformOrigin: '50% 50%', duration: 0.35, stagger: 0.08, ease: 'back.out(2)' }, 0.2)
    // El visor del núcleo se cierra sobre la idea 3 cuando llegan las dos trazas
    .from(esquinas, { scale: 1.18, opacity: 0, transformOrigin: '50% 50%', duration: 0.7, ease: 'expo.out' }, 0.85)
    .from(salida, { drawSVG: 0, duration: 0.45, ease: 'power2.inOut' }, 1.15)
    .from(flecha, { opacity: 0, duration: 0.15 }, 1.55)
    .from(relleno, { scaleX: 0, transformOrigin: '0% 50%', duration: 0.8, ease: 'expo.out' }, 1.6);
}
