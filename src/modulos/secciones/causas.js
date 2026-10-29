// 1.2 Árbol del problema como placa de circuito. Una sola idea de movimiento: la señal sale de
// las causas, enciende el chip del problema central y desde él llega a los efectos.
//
// Las trazas se calculan con la posición real de las cajas (relativa a la placa), así que se
// recalculan con cada cambio de tamaño. Se dibujan con pathLength="1" y stroke-dashoffset de 1 a 0:
// la animación no depende de la longitud real y sobrevive a que la geometría cambie.
import { crearSVG, esEscritorio } from '../utilidades.js';

const RADIO = 8; // esquinas redondeadas de las trazas
const PIN = 8; // largo de las patas del chip
const HOLGURA_VIA = 6; // distancia de la vía al borde de la caja
const ESPINA_X = 7; // posición de la espina vertical en móvil
const APAGADO = 0.55; // opacidad del texto sin señal (sigue cumpliendo contraste AA)
const ESCALON = 0.24; // separación entre trazas en el timeline

const r1 = (n) => Math.round(n * 10) / 10;

// Recorrido en ángulo recto con las esquinas redondeadas.
function ruta(puntos, radio) {
  const p = puntos.filter((q, i) => i === 0 || Math.hypot(q.x - puntos[i - 1].x, q.y - puntos[i - 1].y) > 0.1);
  let d = `M${r1(p[0].x)} ${r1(p[0].y)}`;
  for (let i = 1; i < p.length - 1; i++) {
    const [a, b, c] = [p[i - 1], p[i], p[i + 1]];
    const l1 = Math.hypot(b.x - a.x, b.y - a.y);
    const l2 = Math.hypot(c.x - b.x, c.y - b.y);
    const r = Math.min(radio, l1 / 2, l2 / 2);
    if (r < 0.5) {
      d += `L${r1(b.x)} ${r1(b.y)}`;
      continue;
    }
    const entrada = { x: b.x + ((a.x - b.x) / l1) * r, y: b.y + ((a.y - b.y) / l1) * r };
    const salida = { x: b.x + ((c.x - b.x) / l2) * r, y: b.y + ((c.y - b.y) / l2) * r };
    d += `L${r1(entrada.x)} ${r1(entrada.y)}Q${r1(b.x)} ${r1(b.y)} ${r1(salida.x)} ${r1(salida.y)}`;
  }
  const fin = p[p.length - 1];
  return `${d}L${r1(fin.x)} ${r1(fin.y)}`;
}

// Elige en qué punto del canal entre columnas gira cada traza para que ninguna se cruce.
// Devuelve, por traza, una fracción del canal (0 = junto a la caja, 1 = junto al chip).
// Entre las que bajan, la de más arriba gira más cerca del chip; entre las que suben, la de más abajo.
function canales(yNodos, yPines) {
  const t = yNodos.map(() => 0.5);
  const indices = yNodos.map((_, i) => i);
  const bajan = indices.filter((i) => yNodos[i] < yPines[i] - 0.75);
  const suben = indices.filter((i) => yNodos[i] > yPines[i] + 0.75).reverse();
  bajan.forEach((i, k) => (t[i] = 0.72 - 0.2 * k));
  suben.forEach((i, k) => (t[i] = 0.72 - 0.2 * k));
  return t;
}

// Crea una sola vez todos los elementos del SVG; después solo se les cambia la geometría.
function construir(svg, causas, efectos, chip) {
  svg.replaceChildren();

  // Escritorio: trazas causa → chip y chip → efecto, con patas en el chip y vías en las cajas.
  const escritorio = crearSVG('g', { class: 'causas__capa causas__capa--escritorio' });
  const capasEscritorio = ['bases', 'luces', 'pulsos', 'pines', 'vias'].map(() => crearSVG('g'));
  const [gBases, gLuces, gPulsos, gPines, gVias] = capasEscritorio;
  escritorio.append(...capasEscritorio);

  const conexion = (nodo, i) => {
    const c = {
      nodo,
      texto: nodo.querySelector('.causas__texto'),
      marco: nodo.querySelector('.causas__marco'),
      base: crearSVG('path', { class: 'causas__traza-base' }),
      luz: crearSVG('path', { class: 'causas__traza-luz', pathLength: 1 }),
      pulso: crearSVG('path', { class: 'causas__pulso', pathLength: 1 }),
      pin: crearSVG('rect', { class: 'causas__pin', width: PIN, height: 3 }),
      pinLuz: crearSVG('rect', { class: 'causas__pin-luz', width: PIN, height: 3 }),
      via: crearSVG('circle', { class: 'causas__via', r: 3.25 }),
      punto: crearSVG('circle', { class: 'causas__punto', r: 1.4 }),
    };
    // Pulsos desfasados para que no viajen todos a la vez
    c.pulso.style.animationDelay = `${-((i * 0.83) % 2.8).toFixed(2)}s`;
    gBases.append(c.base);
    gLuces.append(c.luz);
    gPulsos.append(c.pulso);
    gPines.append(c.pin, c.pinLuz);
    gVias.append(c.via, c.punto);
    return c;
  };
  const conexionesCausas = causas.map((nodo, i) => conexion(nodo, i));
  const conexionesEfectos = efectos.map((nodo, i) => conexion(nodo, i + causas.length));

  // Móvil: una espina vertical con una rama hacia cada caja (causas, chip y efectos).
  const movil = crearSVG('g', { class: 'causas__capa causas__capa--movil' });
  const capasMovil = ['bases', 'luces', 'vias'].map(() => crearSVG('g'));
  const [mBases, mLuces, mVias] = capasMovil;
  movil.append(...capasMovil);
  const espinaBase = crearSVG('path', { class: 'causas__traza-base' });
  const espinaLuz = crearSVG('path', { class: 'causas__traza-luz', pathLength: 1 });
  mBases.append(espinaBase);
  mLuces.append(espinaLuz);
  const ramas = [...causas, chip, ...efectos].map((el) => {
    const r = {
      el,
      base: crearSVG('path', { class: 'causas__traza-base' }),
      luz: crearSVG('path', { class: 'causas__rama-luz' }),
      via: crearSVG('circle', { class: 'causas__via', r: 3.25 }),
      punto: crearSVG('circle', { class: 'causas__punto', r: 1.4 }),
    };
    mBases.append(r.base);
    mLuces.append(r.luz);
    mVias.append(r.via, r.punto);
    return r;
  });

  svg.append(escritorio, movil);
  return { conexionesCausas, conexionesEfectos, espinaBase, espinaLuz, ramas };
}

export function iniciar({ gsap, ScrollTrigger, reducido }) {
  const seccion = document.getElementById('causas');
  const escena = seccion?.querySelector('.causas__escena');
  const placa = seccion?.querySelector('.causas__placa');
  const svg = placa?.querySelector('.causas__trazas');
  const chip = placa?.querySelector('.causas__chip');
  if (!escena || !placa || !svg || !chip) return;
  const causas = [...placa.querySelectorAll('.causas__lista--causas .causas__nodo')];
  const efectos = [...placa.querySelectorAll('.causas__lista--efectos .causas__nodo')];
  if (!causas.length || !efectos.length) return;

  const capas = construir(svg, causas, efectos, chip);
  const chipMarco = chip.querySelector('.causas__chip-marco');
  const chipContenido = chip.querySelector('.causas__chip-contenido');
  const ledLuz = chip.querySelector('.causas__led-luz');
  const espina = { arriba: 0, abajo: 0, ys: [] };

  /* ---------- Geometría ---------- */
  const trazar = () => {
    const caja = placa.getBoundingClientRect();
    if (!caja.width || !caja.height) return;
    svg.setAttribute('viewBox', `0 0 ${r1(caja.width)} ${r1(caja.height)}`);
    const rel = (el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left - caja.left, y: r.top - caja.top, w: r.width, h: r.height };
    };
    if (esEscritorio()) {
      const c = rel(chip);
      trazarLado(capas.conexionesCausas, c, true, rel);
      trazarLado(capas.conexionesEfectos, c, false, rel);
    } else {
      trazarEspina(rel);
    }
  };

  // izquierda = causas (de la caja al chip); derecha = efectos (del chip a la caja).
  const trazarLado = (conexiones, c, izquierda, rel) => {
    const n = conexiones.length;
    const yPines = conexiones.map((_, i) => c.y + (c.h * (i + 1)) / (n + 1));
    const cajas = conexiones.map((cx) => rel(cx.nodo));
    const yNodos = cajas.map((b) => b.y + b.h / 2);
    const xNodos = cajas.map((b) => (izquierda ? b.x + b.w + HOLGURA_VIA : b.x - HOLGURA_VIA));
    const xPunta = izquierda ? c.x - PIN : c.x + c.w + PIN;
    const t = canales(yNodos, yPines);

    conexiones.forEach((cx, i) => {
      const [xo, yo, yp] = [xNodos[i], yNodos[i], yPines[i]];
      const xGiro = xo + (xPunta - xo) * t[i];
      let puntos =
        Math.abs(yo - yp) <= 0.75
          ? [{ x: xo, y: yo }, { x: xPunta, y: yo }]
          : [{ x: xo, y: yo }, { x: xGiro, y: yo }, { x: xGiro, y: yp }, { x: xPunta, y: yp }];
      // La traza se dibuja siempre en el sentido de la señal
      if (!izquierda) puntos = puntos.reverse();
      const d = ruta(puntos, RADIO);
      cx.base.setAttribute('d', d);
      cx.luz.setAttribute('d', d);
      cx.pulso.setAttribute('d', d);
      const xPin = izquierda ? c.x - PIN : c.x + c.w;
      for (const pin of [cx.pin, cx.pinLuz]) {
        pin.setAttribute('x', r1(xPin));
        pin.setAttribute('y', r1(yp - 1.5));
      }
      for (const v of [cx.via, cx.punto]) {
        v.setAttribute('cx', r1(xo));
        v.setAttribute('cy', r1(yo));
      }
    });
  };

  const trazarEspina = (rel) => {
    const cajas = capas.ramas.map((r) => rel(r.el));
    const ys = cajas.map((b) => b.y + b.h / 2);
    espina.arriba = ys[0];
    espina.abajo = ys[ys.length - 1];
    espina.ys = ys;
    const d = `M${ESPINA_X} ${r1(espina.arriba)}V${r1(espina.abajo)}`;
    capas.espinaBase.setAttribute('d', d);
    capas.espinaLuz.setAttribute('d', d);
    capas.ramas.forEach((r, i) => {
      const xVia = cajas[i].x - HOLGURA_VIA;
      const dRama = `M${ESPINA_X} ${r1(ys[i])}H${r1(xVia)}`;
      r.base.setAttribute('d', dRama);
      r.luz.setAttribute('d', dRama);
      for (const v of [r.via, r.punto]) {
        v.setAttribute('cx', r1(xVia));
        v.setAttribute('cy', r1(ys[i]));
      }
    });
  };

  trazar();
  ScrollTrigger.addEventListener('refreshInit', trazar);
  ScrollTrigger.addEventListener('refresh', trazar);
  if ('ResizeObserver' in window) new ResizeObserver(trazar).observe(placa);

  // Con movimiento reducido el circuito queda dibujado y encendido, sin anclajes ni pulsos.
  if (reducido) return;

  const mm = gsap.matchMedia();

  /* ---------- Escritorio: la escena se ancla y el scroll recorre el circuito ---------- */
  mm.add('(min-width: 900px)', () => {
    let umbralVivo = 0.9;
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: escena,
        // Si la escena cabe, se ancla centrada; si no, desde arriba con aire para la barra.
        start: () => (escena.offsetHeight <= window.innerHeight - 160 ? 'center center' : 'top 96px'),
        end: '+=120%',
        pin: true,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (st) => placa.classList.toggle('causas__placa--viva', st.progress >= umbralVivo),
      },
    });

    // 1. Cada causa se enciende y su traza avanza hacia el chip.
    capas.conexionesCausas.forEach((cx, i) => {
      const t0 = i * ESCALON;
      tl.fromTo(cx.texto, { opacity: APAGADO }, { opacity: 1, duration: 0.18 }, t0)
        .fromTo([cx.marco, cx.punto], { opacity: 0 }, { opacity: 1, duration: 0.18 }, t0)
        .fromTo(cx.luz, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1 }, t0 + 0.08)
        .fromTo(cx.pinLuz, { opacity: 0 }, { opacity: 1, duration: 0.1 }, t0 + 1.04);
    });

    // 2. El chip se enciende cuando le llega la última señal.
    const tChip = (capas.conexionesCausas.length - 1) * ESCALON + 1.2;
    tl.fromTo(chipMarco, { opacity: 0 }, { opacity: 1, duration: 0.3 }, tChip)
      .fromTo(chipContenido, { opacity: APAGADO }, { opacity: 1, duration: 0.3 }, tChip)
      .fromTo(ledLuz, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.22 }, tChip + 0.08);

    // 3. Del chip salen las trazas hacia los efectos, que se iluminan al recibir la señal.
    const tEfectos = tChip + 0.45;
    capas.conexionesEfectos.forEach((cx, i) => {
      const t0 = tEfectos + i * ESCALON;
      tl.fromTo(cx.pinLuz, { opacity: 0 }, { opacity: 1, duration: 0.1 }, t0)
        .fromTo(cx.luz, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1 }, t0 + 0.04)
        .fromTo(cx.texto, { opacity: APAGADO }, { opacity: 1, duration: 0.18 }, t0 + 1)
        .fromTo([cx.marco, cx.punto], { opacity: 0 }, { opacity: 1, duration: 0.18 }, t0 + 1);
    });

    // 4. Pausa con todo encendido antes de soltar el anclaje; ahí empiezan los pulsos.
    const fin = tl.duration();
    tl.to({}, { duration: 0.5 });
    umbralVivo = fin / tl.duration();

    return () => placa.classList.remove('causas__placa--viva');
  });

  /* ---------- Móvil: sin anclar, una espina que se dibuja con el scroll ---------- */
  mm.add('(max-width: 899.98px)', () => {
    placa.classList.add('causas__placa--secuencia');
    const encendibles = (r) => [r.el, r.luz, r.punto];

    const encender = (progreso) => {
      const y = espina.arriba + progreso * (espina.abajo - espina.arriba);
      capas.ramas.forEach((r, i) => {
        const activo = progreso > 0.002 && espina.ys[i] <= y + 1;
        encendibles(r).forEach((el) => el.toggleAttribute('data-encendido', activo));
      });
    };

    gsap.fromTo(
      capas.espinaLuz,
      { strokeDashoffset: 1 },
      {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: placa,
          start: 'top 72%',
          end: 'bottom 62%',
          scrub: true,
          onUpdate: (st) => encender(st.progress),
          onRefresh: (st) => encender(st.progress),
        },
      },
    );

    return () => {
      placa.classList.remove('causas__placa--secuencia');
      capas.ramas.forEach((r) => encendibles(r).forEach((el) => el.removeAttribute('data-encendido')));
    };
  });
}
