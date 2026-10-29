// 3 · Hoja de ruta técnica.
// 3.2: en escritorio la pista de etapas se ancla y se desplaza en horizontal mientras un lote
//      recorre la cinta transportadora semana a semana. 3.3: el Gantt hace crecer sus barras al
//      ritmo de las semanas, dibuja las dependencias y resalta predecesoras y sucesoras.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { etapas, actividades, totalSemanas } from '../../datos/proyecto.js';
import { crearSVG } from '../utilidades.js';

// Por debajo de esta altura la etapa más larga (E3) no cabe junto a la cinta: se quedan apiladas.
const CONSULTA_ANCLA = '(min-width: 900px) and (min-height: 640px)';
const CODO = 8; // tramo horizontal de cada conector antes de girar 90°

const limitar = (n, min, max) => Math.min(max, Math.max(min, n));
const r1 = (n) => Math.round(n * 10) / 10;

export function iniciar(contexto) {
  const seccion = document.getElementById('ruta');
  if (!seccion) return;
  iniciarEtapas(seccion, contexto);
  iniciarCronograma(seccion, contexto);
}

/* ==========================================================================
   3.2 Etapas: pista horizontal anclada + cinta transportadora
   ========================================================================== */
function iniciarEtapas(seccion, { reducido }) {
  const bloque = seccion.querySelector('#ruta-etapas');
  const escenario = bloque?.querySelector('.ruta-etapas__escenario');
  const pista = escenario?.querySelector('.ruta-etapas__pista');
  const cinta = escenario?.querySelector('.ruta-cinta');
  if (!pista || !cinta || reducido) return;

  const paneles = [...pista.querySelectorAll('.ruta-etapa')];
  const carro = cinta.querySelector('.ruta-cinta__carro');
  const correa = cinta.querySelector('.ruta-cinta__correa');
  const textura = cinta.querySelector('.ruta-cinta__textura');
  const rodillo = cinta.querySelector('.ruta-cinta__rodillo');
  const numero = cinta.querySelector('.ruta-cinta__semana');
  const codigo = cinta.querySelector('.ruta-cinta__codigo');
  const nombre = cinta.querySelector('.ruta-cinta__nombre');
  const marcas = [...cinta.querySelectorAll('.ruta-cinta__semanas span')];
  const tramos = [...cinta.querySelectorAll('.ruta-cinta__tramo')];
  if (paneles.length !== etapas.length || !carro || !correa || !textura) return;

  // Semana «continua» en la que una etapa le pasa el relevo a la siguiente. Si comparten
  // semana (E4 y E5 en la 14), el relevo cae a mitad de esa semana.
  const relevos = etapas.slice(1).map((etapa, i) => (etapas[i].semanas[1] + 1 + etapa.semanas[0]) / 2);

  let primeraVez = true;
  const mm = gsap.matchMedia();

  mm.add(CONSULTA_ANCLA, () => {
    bloque.classList.add('ruta-etapas--anclada');

    let anclas = [];
    let anchoVia = 0;
    let perimetro = Math.PI * 10;
    let paso = 12;
    let semanaActual = 0;
    let etapaActual = -1;
    const moverCarro = gsap.quickSetter(carro, 'xPercent');
    const moverTextura = gsap.quickSetter(textura, 'x', 'px');

    const desplazamiento = () => Math.max(0, pista.offsetWidth - escenario.clientWidth);

    // Cada etapa toma el relevo a medio camino entre los momentos en que los centros de dos
    // paneles vecinos cruzan el centro de la pantalla. Así la lectura de semana, el lote y el
    // panel resaltado cuentan siempre lo mismo.
    const medir = () => {
      const recorrido = desplazamiento() || 1;
      const mitad = escenario.clientWidth / 2;
      const centros = paneles.map((panel) =>
        limitar((panel.offsetLeft + panel.offsetWidth / 2 - mitad) / recorrido, 0, 1),
      );
      anclas = [{ p: 0, s: etapas[0].semanas[0] }];
      relevos.forEach((s, i) => {
        const p = Math.max(anclas[anclas.length - 1].p, (centros[i] + centros[i + 1]) / 2);
        anclas.push({ p, s });
      });
      anclas.push({ p: 1, s: totalSemanas + 0.999 });
      anchoVia = carro.offsetWidth;
      perimetro = Math.PI * (rodillo?.offsetWidth || 10);
      paso = parseFloat(getComputedStyle(cinta).getPropertyValue('--paso')) || 12;
    };

    const semanaEn = (p) => {
      for (let i = 1; i < anclas.length; i++) {
        const a = anclas[i - 1];
        const b = anclas[i];
        if (p <= b.p) return b.p > a.p ? a.s + ((b.s - a.s) * (p - a.p)) / (b.p - a.p) : b.s;
      }
      return anclas[anclas.length - 1].s;
    };

    const etapaEn = (p) => {
      let k = 0;
      for (let i = 1; i < etapas.length; i++) if (p >= anclas[i].p) k = i;
      return k;
    };

    const actualizar = (p) => {
      if (!anclas.length) return;
      const semanaContinua = semanaEn(p);
      const fraccion = limitar((semanaContinua - 1) / totalSemanas, 0, 1);
      const distancia = fraccion * anchoVia;

      // El lote avanza; la correa y los rodillos giran a la misma velocidad de superficie.
      moverCarro(fraccion * 100);
      moverTextura((distancia % paso) - paso);
      correa.style.setProperty('--giro', `${((distancia / perimetro) * 360).toFixed(1)}deg`);

      const semana = limitar(Math.floor(semanaContinua), 1, totalSemanas);
      if (semana !== semanaActual) {
        marcas[semanaActual - 1]?.classList.remove('es-actual');
        marcas[semana - 1]?.classList.add('es-actual');
        numero.textContent = String(semana);
        semanaActual = semana;
      }

      const k = etapaEn(p);
      if (k !== etapaActual) {
        paneles.forEach((panel, i) => panel.classList.toggle('es-activa', i === k));
        tramos.forEach((tramo, i) => tramo.classList.toggle('es-activa', i === k));
        codigo.textContent = etapas[k].codigo;
        nombre.textContent = etapas[k].nombreCorto;
        cinta.style.setProperty('--tono', `var(--etapa-${k + 1})`);
        etapaActual = k;
      }
    };

    medir();
    gsap.to(pista, {
      x: () => -desplazamiento(),
      ease: 'none',
      onUpdate() {
        actualizar(this.progress());
      },
      scrollTrigger: {
        trigger: escenario,
        pin: true,
        start: 'top top',
        end: () => `+=${desplazamiento()}`,
        scrub: true,
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          medir();
          actualizar(self.progress);
        },
      },
    });
    actualizar(0);

    // Si el anclaje se recrea al volver a escritorio, se reordena para que el refresco
    // calcule primero este anclaje y después todo lo que queda debajo.
    if (!primeraVez) ScrollTrigger.sort();
    primeraVez = false;

    return () => {
      bloque.classList.remove('ruta-etapas--anclada');
      paneles.forEach((panel) => panel.classList.remove('es-activa'));
      tramos.forEach((tramo) => tramo.classList.remove('es-activa'));
      marcas.forEach((marca) => marca.classList.remove('es-actual'));
      carro.style.removeProperty('transform');
      textura.style.removeProperty('transform');
      correa.style.removeProperty('--giro');
      cinta.style.removeProperty('--tono');
    };
  });
}

/* ==========================================================================
   3.3 Cronograma: barras, dependencias y resaltado
   ========================================================================== */
function iniciarCronograma(seccion, { reducido }) {
  const figura = seccion.querySelector('.ruta-gantt');
  const lienzo = figura?.querySelector('.ruta-gantt__lienzo');
  const svg = figura?.querySelector('.ruta-gantt__dependencias');
  const cuerpo = figura?.querySelector('tbody');
  const lectura = figura?.querySelector('.ruta-gantt__lectura');
  const dato = figura?.querySelector('.ruta-gantt__dato');
  if (!lienzo || !svg || !cuerpo || !lectura || !dato) return;

  const filas = new Map(
    [...cuerpo.querySelectorAll('tr[data-actividad]')].map((fila) => [fila.dataset.actividad, fila]),
  );
  const antecesoras = new Map(actividades.map((a) => [a.id, a.precede]));
  const sucesoras = new Map(
    actividades.map((a) => [a.id, actividades.filter((b) => b.precede.includes(a.id)).map((b) => b.id)]),
  );

  // Las filas solo son enfocables si hay JavaScript que les dé respuesta.
  filas.forEach((fila) => {
    fila.tabIndex = 0;
  });
  lectura.hidden = false;

  // 'oculto' hasta que la tabla entra en pantalla; 'dibujando' durante la entrada; 'visible' después
  // (o desde el principio con movimiento reducido).
  let estado = reducido ? 'visible' : 'oculto';
  let conectores = [];
  let enFoco = null;
  let bajoCursor = null;

  /* ---------- Conectores de dependencia ---------- */
  const ocultar = (grupos) => {
    const trazos = grupos.flatMap((g) => [...g.querySelectorAll('.ruta-gantt__halo, .ruta-gantt__traza')]);
    const remates = grupos.flatMap((g) => [...g.querySelectorAll('.ruta-gantt__punta, .ruta-gantt__via')]);
    if (trazos.length) gsap.set(trazos, { drawSVG: '0%' });
    if (remates.length) gsap.set(remates, { opacity: 0 });
  };

  const construir = () => {
    const ancho = lienzo.offsetWidth;
    const alto = lienzo.offsetHeight;
    if (!ancho || !alto) return;
    svg.setAttribute('viewBox', `0 0 ${ancho} ${alto}`);

    // offsetLeft/offsetWidth ignoran el scaleX de la entrada: la geometría sale siempre de la barra final.
    const base = lienzo.getBoundingClientRect();
    const medidas = new Map();
    filas.forEach((fila, id) => {
      const barra = fila.querySelector('.ruta-gantt__barra');
      if (!barra) return;
      const caja = barra.parentElement.getBoundingClientRect();
      const x0 = caja.left - base.left + barra.offsetLeft;
      const arriba = caja.top - base.top + barra.offsetTop;
      medidas.set(id, {
        x0,
        x1: x0 + barra.offsetWidth,
        arriba,
        abajo: arriba + barra.offsetHeight,
        medio: arriba + barra.offsetHeight / 2,
      });
    });

    svg.replaceChildren();
    conectores = [];
    for (const actividad of actividades) {
      for (const desde of actividad.precede) {
        const p = medidas.get(desde);
        const s = medidas.get(actividad.id);
        if (!p || !s) continue;
        const { linea, punta } = trazar(p, s);
        const grupo = crearSVG('g', { class: 'ruta-gantt__conector', 'data-desde': desde, 'data-hasta': actividad.id });
        grupo.append(
          crearSVG('path', { class: 'ruta-gantt__halo', d: linea }),
          crearSVG('path', { class: 'ruta-gantt__traza', d: linea }),
          crearSVG('circle', { class: 'ruta-gantt__via', cx: r1(p.x1), cy: r1(p.medio), r: 2 }),
          crearSVG('path', { class: 'ruta-gantt__punta', d: punta }),
        );
        svg.append(grupo);
        conectores.push(grupo);
      }
    }

    if (estado === 'oculto') ocultar(conectores);
    if (enFoco) resaltar(enFoco);
  };

  const dibujar = () => {
    if (estado !== 'oculto') return;
    estado = 'dibujando';
    const linea = gsap.timeline({
      onComplete: () => {
        estado = 'visible';
      },
    });
    conectores.forEach((grupo, i) => {
      const t = i * 0.045;
      linea
        .to(grupo.querySelector('.ruta-gantt__via'), { opacity: 1, duration: 0.2, ease: 'power1.out' }, t)
        .to(grupo.querySelectorAll('.ruta-gantt__halo, .ruta-gantt__traza'), { drawSVG: '100%', duration: 0.6, ease: 'power2.inOut' }, t)
        .to(grupo.querySelector('.ruta-gantt__punta'), { opacity: 1, duration: 0.25, ease: 'power1.out' }, t + 0.5);
    });
  };

  /* ---------- Resaltado y lectura ---------- */
  const codigoDe = (texto) =>
    Object.assign(document.createElement('span'), { className: 'ruta-gantt__codigo', textContent: texto });

  // ['A5', 'A6', 'A7'] → A5, A6 y A7
  const enumerar = (ids) =>
    ids.flatMap((id, i) => (i === 0 ? [codigoDe(id)] : [i === ids.length - 1 ? ' y ' : ', ', codigoDe(id)]));

  const escribir = (id) => {
    const antes = antecesoras.get(id) ?? [];
    const despues = sucesoras.get(id) ?? [];
    dato.replaceChildren(
      codigoDe(id),
      ...(antes.length ? [' depende de ', ...enumerar(antes)] : [' no depende de otra actividad']),
      '; ',
      ...(despues.length ? ['habilita ', ...enumerar(despues)] : ['no habilita otras actividades']),
      '.',
    );
  };

  const resaltar = (id) => {
    if (!filas.has(id)) return;
    const antes = antecesoras.get(id) ?? [];
    const despues = sucesoras.get(id) ?? [];
    const cambio = id !== enFoco;
    enFoco = id;
    figura.classList.add('ruta-gantt--foco');
    filas.forEach((fila, clave) => {
      fila.classList.toggle('es-foco', clave === id);
      fila.classList.toggle('es-antecesora', antes.includes(clave));
      fila.classList.toggle('es-sucesora', despues.includes(clave));
    });
    const vecinos = conectores.filter((g) => g.dataset.desde === id || g.dataset.hasta === id);
    conectores.forEach((g) => g.classList.toggle('es-vecina', vecinos.includes(g)));
    svg.append(...vecinos); // los conectores resaltados se pintan por encima del resto
    if (cambio) escribir(id);
  };

  const limpiar = () => {
    if (!enFoco) return;
    enFoco = null;
    figura.classList.remove('ruta-gantt--foco');
    filas.forEach((fila) => fila.classList.remove('es-foco', 'es-antecesora', 'es-sucesora'));
    conectores.forEach((g) => g.classList.remove('es-vecina'));
    dato.replaceChildren();
  };

  const filaDe = (nodo) => nodo?.closest?.('tr[data-actividad]') ?? null;
  const esPuntero = (e) => e.pointerType === 'mouse' || e.pointerType === 'pen';

  cuerpo.addEventListener('pointerover', (e) => {
    if (!esPuntero(e)) return;
    const fila = filaDe(e.target);
    if (!fila) return;
    bajoCursor = fila.dataset.actividad;
    resaltar(bajoCursor);
  });

  cuerpo.addEventListener('pointerleave', (e) => {
    if (!esPuntero(e)) return;
    bajoCursor = null;
    const enfocada = filaDe(document.activeElement);
    if (enfocada && cuerpo.contains(enfocada)) resaltar(enfocada.dataset.actividad);
    else limpiar();
  });

  cuerpo.addEventListener('focusin', (e) => {
    const fila = filaDe(e.target);
    if (fila) resaltar(fila.dataset.actividad);
  });

  cuerpo.addEventListener('focusout', (e) => {
    if (cuerpo.contains(e.relatedTarget)) return;
    if (bajoCursor) resaltar(bajoCursor);
    else limpiar();
  });

  // En pantallas táctiles un toque basta para leer las dependencias de una fila.
  cuerpo.addEventListener('click', (e) => {
    const fila = filaDe(e.target);
    if (fila) resaltar(fila.dataset.actividad);
  });

  // Flechas arriba y abajo para recorrer las actividades con el teclado.
  cuerpo.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const fila = filaDe(e.target);
    const destino = e.key === 'ArrowDown' ? fila?.nextElementSibling : fila?.previousElementSibling;
    if (!destino?.matches('tr[data-actividad]')) return;
    e.preventDefault();
    destino.focus();
  });

  /* ---------- Entrada: las barras crecen al ritmo de las semanas ---------- */
  if (!reducido) {
    // Una unidad de tiempo = una semana: cada barra crece mientras el «cabezal» recorre sus semanas.
    const barrido = gsap.timeline({ paused: true });
    for (const actividad of actividades) {
      const barra = filas.get(actividad.id)?.querySelector('.ruta-gantt__barra');
      if (!barra) continue;
      const [inicio, fin] = actividad.semanas;
      barrido.fromTo(barra, { scaleX: 0 }, { scaleX: 1, duration: fin - inicio + 1, ease: 'none' }, inicio - 1);
    }

    let lanzado = false;
    const lanzar = () => {
      if (lanzado) return;
      lanzado = true;
      gsap.to(barrido, { progress: 1, duration: 1.9, ease: 'power2.inOut', onComplete: dibujar });
    };
    ScrollTrigger.create({ trigger: lienzo, start: 'top 80%', toggleActions: 'play none none none', onEnter: lanzar, onLeave: lanzar });
  }

  /* ---------- Recalcular conectores cuando cambian las medidas ---------- */
  let pendiente = 0;
  const programar = () => {
    cancelAnimationFrame(pendiente);
    pendiente = requestAnimationFrame(construir);
  };

  construir();
  new ResizeObserver(programar).observe(lienzo);
  ScrollTrigger.addEventListener('refresh', programar);
  document.fonts?.ready.then(programar);
}

// Conector en codo desde el final de la barra predecesora hasta el inicio de la sucesora.
// Si la sucesora empieza lejos, entra por su izquierda; si se solapan, cae sobre su borde.
function trazar(p, s) {
  if (s.x0 >= p.x1 + CODO * 2) {
    const codo = p.x1 + CODO;
    return {
      linea: `M${r1(p.x1)} ${r1(p.medio)}H${r1(codo)}V${r1(s.medio)}H${r1(s.x0 - 4)}`,
      punta: `M${r1(s.x0 - 5.5)} ${r1(s.medio - 3.5)}L${r1(s.x0)} ${r1(s.medio)}L${r1(s.x0 - 5.5)} ${r1(s.medio + 3.5)}Z`,
    };
  }
  const x = limitar(p.x1 + CODO, s.x0 + CODO, s.x1 - CODO);
  const baja = s.medio >= p.medio;
  const y = baja ? s.arriba : s.abajo;
  const d = baja ? 1 : -1;
  return {
    linea: `M${r1(p.x1)} ${r1(p.medio)}H${r1(x)}V${r1(y - 4 * d)}`,
    punta: `M${r1(x - 3.5)} ${r1(y - 5.5 * d)}L${r1(x)} ${r1(y)}L${r1(x + 3.5)} ${r1(y - 5.5 * d)}Z`,
  };
}
