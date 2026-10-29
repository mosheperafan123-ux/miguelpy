// 1.6 Referentes: una línea de escáner recorre una vez las tres soluciones de izquierda a
// derecha (el equipo las «inspecciona») y, cuando termina, las esquinas del visor de la brecha
// se cierran desde fuera hacia dentro, como un enfoque: lo que falta queda encuadrado.

const ESQUINAS = [
  { lado: 'ai', x: -1, y: -1 },
  { lado: 'ad', x: 1, y: -1 },
  { lado: 'bi', x: -1, y: 1 },
  { lado: 'bd', x: 1, y: 1 },
];
const APERTURA = 26; // px que se abren las esquinas antes de enfocar

export function iniciar({ gsap, ScrollTrigger, reducido }) {
  if (reducido) return;
  const seccion = document.getElementById('referentes');
  const escaner = seccion?.querySelector('.referentes__escaner');
  const lista = seccion?.querySelector('.referentes__lista');
  if (!escaner || !lista) return;
  const brecha = seccion.querySelector('.referentes__brecha');

  // El haz solo existe para la animación: se crea aquí y no ensucia el HTML.
  const haz = document.createElement('span');
  haz.className = 'referentes__haz';
  haz.setAttribute('aria-hidden', 'true');
  escaner.append(haz);
  gsap.set(haz, { autoAlpha: 0 });

  const enfoque = brecha ? prepararEnfoque(gsap, brecha) : null;
  let escaneado = false;
  let brechaVisible = false;
  const enfocar = () => {
    if (escaneado && brechaVisible) enfoque?.play();
  };

  gsap
    .timeline({
      scrollTrigger: { trigger: lista, start: 'top 70%', toggleActions: 'play none none none' },
      onComplete: () => {
        escaneado = true;
        enfocar();
      },
    })
    .set(haz, { x: 0, autoAlpha: 1 })
    .to(haz, { x: () => lista.offsetWidth - 1, duration: 1.8, ease: 'power3.inOut' })
    .to(haz, { autoAlpha: 0, duration: 0.35, ease: 'power2.out' }, '-=0.2');

  // El enfoque espera a que termine el barrido y a que la placa esté a la vista.
  if (brecha) {
    ScrollTrigger.create({
      trigger: brecha,
      start: 'top 82%',
      toggleActions: 'play none none none',
      onEnter: () => {
        brechaVisible = true;
        enfocar();
      },
    });
  }
}

// Sustituye las esquinas de fondo de .visor por cuatro piezas que sí se pueden mover.
function prepararEnfoque(gsap, placa) {
  const piezas = ESQUINAS.map(({ lado }) => {
    const pieza = document.createElement('span');
    pieza.className = `referentes__esquina referentes__esquina--${lado}`;
    pieza.setAttribute('aria-hidden', 'true');
    placa.append(pieza);
    return pieza;
  });
  placa.classList.add('referentes__brecha--animada');

  return gsap.timeline({ paused: true }).from(piezas, {
    x: (i) => ESQUINAS[i].x * APERTURA,
    y: (i) => ESQUINAS[i].y * APERTURA,
    autoAlpha: 0,
    duration: 1,
    ease: 'expo.out',
  });
}
