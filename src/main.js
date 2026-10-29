import './estilos/base.css';
import './estilos/marco.css';
import.meta.glob('./estilos/secciones/*.css', { eager: true });

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { Flip } from 'gsap/Flip';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { CustomEase } from 'gsap/CustomEase';

import { movimientoReducido, extenderTitulo } from './modulos/utilidades.js';
import { iniciarMarco, correrPrecarga, crearCompuerta, registrarEnRiel, irA } from './modulos/marco.js';

gsap.registerPlugin(
  ScrollTrigger,
  ScrollSmoother,
  SplitText,
  DrawSVGPlugin,
  ScrambleTextPlugin,
  MotionPathPlugin,
  Flip,
  ScrollToPlugin,
  CustomEase,
);

// Cada sección exporta iniciar(contexto). Se inician en el orden de la página para que
// ScrollTrigger calcule bien las posiciones cuando hay secciones ancladas (pin).
const modulos = import.meta.glob('./modulos/secciones/*.js', { eager: true });
const ORDEN = [
  'inicio',
  'problema',
  'causas',
  'factores',
  'pregunta',
  'ods',
  'referentes',
  'seleccion',
  'ficha',
  'nucleo',
  'presupuesto',
  'alcance',
  'ruta',
  'equipo',
  'referencias',
];

const reducido = movimientoReducido();

// La visita siempre arranca arriba: la precarga se abre sobre la portada. Si la dirección trae
// un ancla (por ejemplo /#nucleo), se va allí cuando termina la precarga.
const anclaInicial = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// Desplazamiento suave solo con ratón o trackpad; en pantallas táctiles se usa el nativo.
const smoother =
  !reducido && ScrollTrigger.isTouch !== 1
    ? ScrollSmoother.create({ wrapper: '#envoltura', content: '#contenido', smooth: 1, effects: true })
    : null;

const contexto = { gsap, ScrollTrigger, smoother, reducido };

iniciarMarco(contexto);

// Las compuertas solo van en la primera placa clara de cada bloque. Se calculan antes de que
// los anclajes envuelvan secciones en contenedores nuevos.
const primerasClaras = new Set(
  [...document.querySelectorAll('.seccion--clara')].filter(
    (s) => !s.previousElementSibling?.classList.contains('seccion--clara'),
  ),
);

for (const nombre of ORDEN) {
  const seccion = document.getElementById(nombre);
  if (!seccion) continue;
  if (primerasClaras.has(seccion)) crearCompuerta(seccion, contexto);
  seccion.querySelectorAll('[data-extender]').forEach((titulo) =>
    extenderTitulo(titulo, { scrollTrigger: { trigger: titulo, start: 'top 88%', toggleActions: 'play none none none' } }),
  );
  try {
    modulos[`./modulos/secciones/${nombre}.js`]?.iniciar?.(contexto);
  } catch (error) {
    console.error(`No se pudo iniciar la sección «${nombre}»:`, error);
  }
  registrarEnRiel(seccion);
}

document.querySelectorAll('.pie [data-extender]').forEach((titulo) =>
  extenderTitulo(titulo, { scrollTrigger: { trigger: titulo, start: 'top 90%', toggleActions: 'play none none none' } }),
);

// Las fuentes cambian medidas: se recalculan los disparadores cuando terminan de cargar.
document.fonts?.ready.then(() => ScrollTrigger.refresh());
window.addEventListener('load', () => ScrollTrigger.refresh());

correrPrecarga(contexto, () => {
  // La portada entra siempre, aunque se salte a un ancla: si no, quedaría oculta al volver arriba.
  modulos['./modulos/secciones/inicio.js']?.entrada?.(contexto);
  if (anclaInicial) irA(anclaInicial);
});
