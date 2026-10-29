// 1.1 Diagnóstico inicial. Una sola idea de movimiento: los cuatro instrumentos se encienden
// (sus pictogramas se dibujan en secuencia) y después cada uno queda «vivo» con un bucle sutil
// que repite el patrón que describe. El texto no se mueve.

// Detiene las animaciones SMIL (la aguja del dial) en su primer fotograma.
function congelarSMIL(svg) {
  try {
    svg.setCurrentTime?.(0);
    svg.pauseAnimations?.();
  } catch {
    /* navegador sin SMIL: no hay nada que detener */
  }
}

export function iniciar({ gsap, reducido }) {
  const rejilla = document.querySelector('#problema .problema__patrones');
  if (!rejilla) return;
  const patrones = [...rejilla.querySelectorAll('.problema__patron')];
  if (!patrones.length) return;

  patrones.forEach((patron) => {
    const svg = patron.querySelector('.problema__picto');
    if (svg) congelarSMIL(svg);
  });
  if (reducido) return;

  // La escritura a mano arranca en blanco cuando empieza su bucle; hasta entonces no se ve
  // (si no, el texto aparecería antes que el papel).
  const escrituras = rejilla.querySelectorAll('.problema__escritura');
  gsap.set(escrituras, { opacity: 0 });

  const activar = (patron) => {
    gsap.set(patron.querySelectorAll('.problema__escritura'), { opacity: 1 });
    patron.setAttribute('data-vivo', '');
    patron.querySelector('.problema__picto')?.unpauseAnimations?.();
  };

  // Añade al timeline el encendido de un pictograma a partir del instante t.
  const encender = (tl, patron, t) => {
    const svg = patron.querySelector('.problema__picto');
    if (!svg) return;
    const lineas = svg.querySelectorAll('.problema__linea');
    const rellenos = svg.querySelectorAll('.problema__relleno');
    const aparecen = svg.querySelectorAll('.problema__aparece');
    if (lineas.length) tl.from(lineas, { drawSVG: 0, duration: 1.1, stagger: 0.045, ease: 'power3.out' }, t);
    if (rellenos.length)
      tl.from(rellenos, { scaleY: 0, transformOrigin: '50% 100%', duration: 0.9, stagger: 0.08, ease: 'expo.out' }, t + 0.45);
    if (aparecen.length) tl.from(aparecen, { opacity: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out' }, t + 0.6);
  };

  const mm = gsap.matchMedia();

  // Con las cuatro columnas a la vista: una sola secuencia escalonada al entrar la rejilla.
  mm.add('(min-width: 1100px)', () => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: rejilla, start: 'top 78%', toggleActions: 'play none none none' },
      onComplete: () => patrones.forEach(activar),
    });
    patrones.forEach((patron, i) => encender(tl, patron, i * 0.28));
  });

  // En 1 o 2 columnas parte de la rejilla queda fuera de pantalla: cada lectura se enciende al llegar.
  mm.add('(max-width: 1099.98px)', () => {
    patrones.forEach((patron) => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: patron, start: 'top 82%', toggleActions: 'play none none none' },
        onComplete: () => activar(patron),
      });
      encender(tl, patron, 0);
    });
  });
}
