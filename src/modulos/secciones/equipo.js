// Equipo. Las minitiras se recalculan con actividadesDe() (que ya cuenta las actividades de
// «Todos») y se rellenan una vez al entrar, semana a semana: así se lee la carga de cada persona.
import { actividadesDe } from '../../datos/proyecto.js';

// Semanas (1 a 16) en las que una persona tiene al menos una actividad
function semanasDe(iniciales) {
  const activas = new Set();
  for (const { semanas } of actividadesDe(iniciales)) {
    for (let s = semanas[0]; s <= semanas[1]; s++) activas.add(s);
  }
  return activas;
}

// [1, 2, 13, 14, 15, 16] → «1, 2 y 13 a 16»
function textoSemanas(activas) {
  const tramos = [];
  for (const s of [...activas].sort((a, b) => a - b)) {
    const ultimo = tramos.at(-1);
    if (ultimo && s === ultimo[1] + 1) ultimo[1] = s;
    else tramos.push([s, s]);
  }
  const partes = tramos.flatMap(([a, b]) => (b - a >= 2 ? [`${a} a ${b}`] : a === b ? [`${a}`] : [`${a}`, `${b}`]));
  return partes.length > 1 ? `${partes.slice(0, -1).join(', ')} y ${partes.at(-1)}` : (partes[0] ?? '');
}

export function iniciar({ gsap, ScrollTrigger, reducido }) {
  const seccion = document.getElementById('equipo');
  if (!seccion) return;

  const rellenosPorTira = new Map();

  for (const placa of seccion.querySelectorAll('.equipo__placa[data-iniciales]')) {
    const tira = placa.querySelector('.equipo__tira');
    if (!tira) continue;
    const activas = semanasDe(placa.dataset.iniciales);
    const celdas = [...tira.querySelectorAll('.equipo__semana')];
    celdas.forEach((celda, i) => celda.classList.toggle('equipo__semana--activa', activas.has(i + 1)));

    const cuenta = placa.querySelector('[data-cuenta]');
    if (cuenta) cuenta.textContent = String(activas.size);
    const texto = placa.querySelector('[data-semanas-texto]');
    if (texto && activas.size) texto.textContent = `Con actividades en las semanas ${textoSemanas(activas)}.`;

    rellenosPorTira.set(
      tira,
      celdas.filter((_, i) => activas.has(i + 1)).map((celda) => celda.querySelector('.equipo__relleno')),
    );
  }

  if (reducido || !rellenosPorTira.size) return;

  for (const rellenos of rellenosPorTira.values()) {
    gsap.set(rellenos, { scaleY: 0, transformOrigin: '50% 100%' });
  }

  // Las tiras que entran juntas (una fila de placas) se escalonan entre sí
  ScrollTrigger.batch([...rellenosPorTira.keys()], {
    start: 'top 88%',
    onEnter: (lote) =>
      lote.forEach((tira, i) =>
        gsap.to(rellenosPorTira.get(tira), {
          scaleY: 1,
          duration: 0.55,
          ease: 'power3.out',
          stagger: 0.045,
          delay: i * 0.16,
        }),
      ),
  });
}
