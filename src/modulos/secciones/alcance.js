// 2.5 Restricciones y alcance. Movimiento mínimo: el contorno de la zona excluida se traza
// una vez, lado a lado y a velocidad de pluma constante, como un trazador de planos que delimita
// lo que queda fuera.

export function iniciar({ gsap, reducido }) {
  const caja = document.querySelector('#alcance .alcance__excluido');
  if (!caja || reducido) return;

  const filo = (lado) => caja.querySelector(`.alcance__filo--${lado}`);
  const ancho = caja.offsetWidth || 1;
  const alto = caja.offsetHeight || 1;
  const perimetro = 2 * (ancho + alto);
  // Cada lado dura lo que mide: la pluma no acelera en las esquinas
  const tramo = (medida) => medida / perimetro;

  const trazo = gsap
    .timeline({ paused: true, defaults: { ease: 'none' } })
    .from(filo('arriba'), { scaleX: 0, transformOrigin: '0% 50%', duration: tramo(ancho) })
    .from(filo('derecha'), { scaleY: 0, transformOrigin: '50% 0%', duration: tramo(alto) })
    .from(filo('abajo'), { scaleX: 0, transformOrigin: '100% 50%', duration: tramo(ancho) })
    .from(filo('izquierda'), { scaleY: 0, transformOrigin: '50% 100%', duration: tramo(alto) });

  // La curva va en el recorrido completo, no en cada lado
  gsap.to(trazo, {
    progress: 1,
    duration: 1.6,
    ease: 'power2.inOut',
    scrollTrigger: { trigger: caja, start: 'top 80%', toggleActions: 'play none none none' },
  });
}
