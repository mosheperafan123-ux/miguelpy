// Herramientas compartidas por todas las secciones.
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

export const movimientoReducido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const esEscritorio = () => window.matchMedia('(min-width: 900px)').matches;

// 308000 → «308.000»
export const formatoCOP = (n) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n);

// 0.35 → «0,35»
export const formatoDecimal = (n, decimales = 2) =>
  n.toLocaleString('es-CO', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });

export function crearSVG(etiqueta, atributos = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', etiqueta);
  for (const [clave, valor] of Object.entries(atributos)) el.setAttribute(clave, valor);
  return el;
}

/**
 * Contador de matriz de puntos. El HTML ya trae el valor final (se lee sin JavaScript);
 * esta función lo pone en cero y lo hace subir una sola vez cuando entra en pantalla.
 */
export function contar(el, valor, { duracion = 1.6, formato = (n) => String(Math.round(n)), inicio = 'top 85%', retraso = 0 } = {}) {
  if (!el || movimientoReducido()) return null;
  const estado = { n: 0 };
  el.textContent = formato(0);
  return gsap.to(estado, {
    n: valor,
    duration: duracion,
    delay: retraso,
    ease: 'power2.inOut',
    onUpdate: () => {
      el.textContent = formato(estado.n);
    },
    scrollTrigger: { trigger: el, start: inicio, toggleActions: 'play none none none' },
  });
}

// Lee la anchura final que la hoja de estilos le da a un titular ('wdth' 112 → 112).
function anchuraFinal(el) {
  const valor = getComputedStyle(el).fontVariationSettings.match(/wdth["']?\s+([\d.]+)/);
  return valor ? parseFloat(valor[1]) : 100;
}

/**
 * Gesto propio del sitio: el titular se «extiende» como un actuador.
 * Cada línea pasa de una anchura condensada a la final, sin cambiar dónde se parte el texto
 * (las líneas se calculan con la anchura final y luego se fijan con white-space: nowrap).
 */
export function extenderTitulo(el, { desde = 66, retraso = 0, duracion = 1.5, scrollTrigger = null } = {}) {
  if (!el || movimientoReducido()) return null;
  const hasta = anchuraFinal(el);
  return SplitText.create(el, {
    type: 'lines',
    linesClass: 'linea-extensible',
    autoSplit: true,
    onSplit(division) {
      return gsap.fromTo(
        division.lines,
        { fontVariationSettings: `'wdth' ${desde}`, opacity: 0, clipPath: 'inset(-20% 100% -20% 0%)' },
        {
          fontVariationSettings: `'wdth' ${hasta}`,
          opacity: 1,
          clipPath: 'inset(-20% -5% -20% 0%)',
          duration: duracion,
          ease: 'expo.out',
          stagger: 0.09,
          delay: retraso,
          scrollTrigger,
        },
      );
    },
  });
}
