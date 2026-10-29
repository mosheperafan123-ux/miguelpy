// 2.4 Presupuesto. Una sola idea de movimiento: la cifra se acumula.
// El total sube como un contador, la barra del plano se construye tramo a tramo con sus cotas
// y las horas del equipo se encienden semana a semana mientras se baja.
import { presupuesto } from '../../datos/proyecto.js';
import { contar, formatoCOP } from '../utilidades.js';

// El plano pasa de vertical a horizontal en el mismo punto que su CSS
const PLANO_HORIZONTAL = '(min-width: 1024px)';

export function iniciar({ gsap, reducido }) {
  const seccion = document.getElementById('presupuesto');
  if (!seccion) return;

  sincronizarPlano(seccion);
  if (reducido) return;

  contar(seccion.querySelector('[data-total]'), presupuesto.total, {
    formato: formatoCOP,
    duracion: 2.2,
    inicio: 'top 82%',
  });

  animarPlano(seccion, gsap);
  animarMatriz(seccion, gsap);
}

// El ancho (o alto) de cada tramo sale de proyecto.js, no del HTML.
function sincronizarPlano(seccion) {
  for (const pieza of seccion.querySelectorAll('.presupuesto__pieza[data-rubro]')) {
    const rubro = presupuesto.rubros.find((r) => r.rubro === pieza.dataset.rubro);
    if (rubro) pieza.style.setProperty('--valor', rubro.valor);
  }
}

function animarPlano(seccion, gsap) {
  const dibujo = seccion.querySelector('.presupuesto__dibujo');
  if (!dibujo) return;
  const cero = dibujo.querySelector('.presupuesto__cero');
  const piezas = [...dibujo.querySelectorAll('.presupuesto__pieza')];
  const cotaTotal = dibujo.querySelector('.presupuesto__cota-total');

  const mm = gsap.matchMedia();
  mm.add({ horizontal: PLANO_HORIZONTAL, vertical: `not all and ${PLANO_HORIZONTAL}` }, (ctx) => {
    const { horizontal } = ctx.conditions;

    // Recortes: el tramo «sale» desde el origen y la cota se traza como con un tiralíneas.
    // Se usa clip-path y no scaleX para no deformar las tramas mientras crecen.
    const tramoOculto = horizontal ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 100% 0%)';
    const cotaOculta = horizontal ? 'inset(-1rem 100% -1rem 0%)' : 'inset(0% -40rem 100% -1rem)';
    const cotaVisible = horizontal ? 'inset(-1rem 0% -1rem 0%)' : 'inset(0% -40rem 0% -1rem)';

    const tl = gsap.timeline({
      scrollTrigger: { trigger: dibujo, start: 'top 75%', toggleActions: 'play none none none' },
    });

    // Primero el rubro que vale cero: un punto y su llamada, sin barra
    if (cero) {
      tl.from(cero.querySelector('.presupuesto__cero-via'), { scale: 0, duration: 0.45, ease: 'back.out(2.4)' })
        .from(
          cero.querySelector('.presupuesto__cero-linea'),
          horizontal
            ? { scaleY: 0, transformOrigin: '50% 0%', duration: 0.6, ease: 'power3.inOut' }
            : { scaleX: 0, transformOrigin: '0% 50%', duration: 0.5, ease: 'power3.inOut' },
          '<0.1',
        )
        .from(cero.querySelector('.presupuesto__cero-texto'), { opacity: 0, duration: 0.4, ease: 'power2.out' }, '>-0.2');
    }

    // Luego cada tramo, en el orden de la tabla, con su cota detrás
    piezas.forEach((pieza, i) => {
      tl.fromTo(
        pieza.querySelector('.presupuesto__segmento'),
        { clipPath: tramoOculto },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.85, ease: 'expo.out', clearProps: 'clipPath' },
        i === 0 ? '>-0.1' : '>-0.5',
      ).fromTo(
        pieza.querySelector('.presupuesto__cota'),
        { clipPath: cotaOculta },
        { clipPath: cotaVisible, duration: 0.7, ease: 'power3.out', clearProps: 'clipPath' },
        '<0.12',
      );
    });

    // Al final, la cota total cierra la cadena (solo existe en el plano horizontal)
    if (horizontal && cotaTotal) {
      tl.fromTo(
        cotaTotal,
        { clipPath: 'inset(-1rem 100% -1rem 0%)' },
        { clipPath: 'inset(-1rem 0% -1rem 0%)', duration: 1.1, ease: 'power3.inOut', clearProps: 'clipPath' },
        '>-0.25',
      );
    }
  });
}

// Matriz de horas: con scrub, cada celda (6 h de una persona en una semana) se enciende
// columna a columna y el contador marca exactamente las horas encendidas.
function animarMatriz(seccion, gsap) {
  const matriz = seccion.querySelector('.presupuesto__matriz');
  const contador = seccion.querySelector('[data-horas]');
  const celdas = [...seccion.querySelectorAll('.presupuesto__celda')];
  if (!matriz || !celdas.length) return;

  const { horas, semanas, integrantes } = presupuesto.especie;
  const horasPorCelda = horas / (semanas * integrantes);
  const formatoHoras = (h) => `${String(Math.round(h)).padStart(3, '0')} h`;

  let encendidas = -1;
  const encender = (n) => {
    if (n === encendidas) return;
    celdas.forEach((celda, i) => celda.classList.toggle('presupuesto__celda--apagada', i >= n));
    if (contador) contador.textContent = formatoHoras(n * horasPorCelda);
    encendidas = n;
  };

  encender(0);
  const estado = { n: 0 };
  gsap.to(estado, {
    n: celdas.length,
    ease: 'none',
    onUpdate: () => encender(Math.round(estado.n)),
    scrollTrigger: { trigger: matriz, start: 'top 82%', end: 'bottom 38%', scrub: 0.5 },
  });
}
