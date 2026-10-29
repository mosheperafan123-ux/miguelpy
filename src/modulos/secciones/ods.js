// 1.5 ODS 11: el dial arranca con el objetivo 1 bajo el indicador y gira una vez, pasando por
// los objetivos 2, 3… hasta dejar el 11 arriba. El HTML ya trae el dial en su posición final
// (el grupo .ods__rueda está girado), así que sin JavaScript se lee igual.
import { ods } from '../../datos/proyecto.js';

const TOTAL_OBJETIVOS = 17;
const CENTRO = '200 200'; // centro del viewBox del dial

export function iniciar({ gsap, reducido }) {
  if (reducido) return;
  const seccion = document.getElementById('ods');
  const instrumento = seccion?.querySelector('.ods__instrumento');
  const giro = seccion?.querySelector('.ods__giro');
  if (!instrumento || !giro) return;

  // Ángulo que separa el objetivo 1 del objetivo elegido. Girar el grupo interno ese ángulo
  // deshace el giro de .ods__rueda (objetivo 1 arriba); al volver a 0 el giro es antihorario
  // y el indicador «cuenta» del 1 al 11.
  const recorrido = (360 / TOTAL_OBJETIVOS) * (ods.numero - 1);

  gsap.set(giro, { svgOrigin: CENTRO });
  gsap.from(giro, {
    rotation: recorrido,
    duration: 2.4,
    ease: 'expo.inOut',
    scrollTrigger: { trigger: instrumento, start: 'top 72%', toggleActions: 'play none none none' },
  });
}
