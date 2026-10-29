// 1.3 Factores: los cuatro pictogramas se dibujan una sola vez, escalonados, al entrar el panel,
// como un instrumento que se enciende cuadrante por cuadrante.

const TRAZOS = 'path, circle, line, polyline, polygon, rect, ellipse';

export function iniciar({ gsap, reducido }) {
  if (reducido) return;
  const seccion = document.getElementById('factores');
  const panel = seccion?.querySelector('.factores__panel');
  if (!panel) return;
  const pictos = gsap.utils.toArray('.factores__picto', seccion);
  if (!pictos.length) return;

  const dibujar = (picto) => ({
    trazos: picto.querySelectorAll(TRAZOS),
    vars: { drawSVG: 0, duration: 1.1, ease: 'power2.inOut', stagger: 0.07 },
  });

  const mm = gsap.matchMedia();

  // Con el retículo 2×2 los cuatro cuadrantes están a la vista a la vez: un solo disparador.
  mm.add('(min-width: 720px)', () => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: panel, start: 'top 72%', toggleActions: 'play none none none' } });
    pictos.forEach((picto, i) => {
      const { trazos, vars } = dibujar(picto);
      tl.from(trazos, vars, i * 0.22);
    });
  });

  // En una columna cada pictograma se dibuja al llegar a su propio cuadrante.
  mm.add('(max-width: 719.98px)', () => {
    pictos.forEach((picto) => {
      const { trazos, vars } = dibujar(picto);
      gsap.from(trazos, { ...vars, scrollTrigger: { trigger: picto, start: 'top 85%', toggleActions: 'play none none none' } });
    });
  });
}
