// 1.4 Pregunta reto: lectura guiada. Al bajar, cada palabra pasa de gris tenue a negro, en
// orden, como si la máquina leyera la pregunta. En escritorio se ancla un contenedor interno
// (nunca la <section>, que lleva la compuerta de clip-path); en móvil se lee en un tramo corto.
import { SplitText } from 'gsap/SplitText';

export function iniciar({ gsap, ScrollTrigger, reducido }) {
  // Con movimiento reducido la pregunta se queda completa en negro, tal como viene del HTML.
  if (reducido) return;
  const seccion = document.getElementById('pregunta');
  const lectura = seccion?.querySelector('.pregunta__lectura');
  const texto = seccion?.querySelector('.pregunta__texto');
  if (!lectura || !texto) return;
  const avance = seccion.querySelector('.pregunta__avance');

  // Colores reales de la placa clara (las variables de contexto ya vienen resueltas).
  const estilos = getComputedStyle(seccion);
  const tenue = estilos.getPropertyValue('--texto-3').trim() || '#5f5f5f';
  const pleno = estilos.getPropertyValue('--texto').trim() || '#000000';

  const { words: palabras } = SplitText.create(texto, { type: 'words', wordsClass: 'pregunta__palabra' });
  if (!palabras.length) return;

  let ejecuciones = 0;
  const mm = gsap.matchMedia();

  mm.add({ escritorio: '(min-width: 900px)', movil: '(max-width: 899.98px)' }, ({ conditions }) => {
    const disparador = conditions.escritorio
      ? { trigger: lectura, start: 'center center', end: '+=100%', pin: true, scrub: true }
      : { trigger: lectura, start: 'top 78%', end: 'bottom 45%', scrub: true };

    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: disparador });
    // Cada palabra tarda 1 unidad y la siguiente empieza 0,28 después: una onda de lectura
    // de unas cuatro palabras de ancho que avanza con el desplazamiento.
    tl.fromTo(palabras, { color: tenue, opacity: 0.3 }, { color: pleno, opacity: 1, duration: 1, stagger: 0.28 }, 0);
    if (avance) tl.fromTo(avance, { scaleX: 0 }, { scaleX: 1, duration: tl.duration() }, 0);

    // Al cruzar el punto de corte el anclaje se crea de nuevo y queda al final de la lista de
    // ScrollTrigger; se reordena por posición para que las secciones de abajo cuenten su espacio.
    if (ejecuciones++ > 0) ScrollTrigger.sort();
  });
}
