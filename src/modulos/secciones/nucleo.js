// 2.3 El algoritmo de cruce.
// Parte 1, la máquina: en escritorio la escena se ancla y el scroll la hace trabajar en cuatro
// pasos (calibrar los pesos, recibir el lote, puntuar cada comuna, recomendar el destino).
// En móvil la fórmula y el dial se dibujan una vez; el resultado queda estático.
// Parte 2, el simulador: radios y deslizadores nativos que recalculan el ranking con la misma
// función del informe (calcularPuntajes), reordenado con Flip.
// El HTML ya trae el estado final; aquí solo se vuelve a escribir desde proyecto.js y se anima.
import { Flip } from 'gsap/Flip';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { formula, simulador, calcularPuntajes } from '../../datos/proyecto.js';
import { formatoDecimal, crearSVG } from '../utilidades.js';

// Geometría del dial en unidades de su viewBox (480 × 480)
const DIAL = { lado: 480, centro: 240, etiqueta: 112, borde: 221 };
const ORIGEN_AGUJA = `${DIAL.centro} ${DIAL.centro}`;
const HUECO = 0.012; // separación entre arcos, en fracción de vuelta
const LOTE_MAQUINA = 'perecederos';
const LOTE_INICIAL = 'perecederos'; // el simulador arranca donde terminó la máquina
const DURACION_CAMBIO = 0.6;
const ESPERA_ANUNCIO = 650; // ms: el lector de pantalla oye el resultado al soltar, no en cada paso

// Quita el ruido binario (0,73749999… → 0,7375) para que el redondeo a tres decimales
// sea el mismo en la máquina, en el simulador y en el HTML estático.
const limpio = (n) => Math.round(n * 1e9) / 1e9;
const cifra3 = (n) => formatoDecimal(limpio(n), 3);
const cifra2 = (n) => formatoDecimal(limpio(n), 2);
const redondear2 = (n) => Math.round(n * 100) / 100;
const porcentaje = (peso) => `${Math.round(peso * 100)} %`;
const enumerar = (partes) => new Intl.ListFormat('es', { type: 'conjunction' }).format(partes);
const ordenComuna = new Map(simulador.comunas.map((c, i) => [c.id, i]));
const buscarLote = (id) => simulador.lotes.find((l) => l.id === id) ?? simulador.lotes[0];

// Ranking estable: a igual puntaje manda el orden de la lista de comunas.
function clasificar(lote, pesos) {
  return calcularPuntajes(lote, pesos)
    .map((c) => ({ ...c, puntaje: limpio(c.puntaje) }))
    .sort((a, b) => b.puntaje - a.puntaje || ordenComuna.get(a.id) - ordenComuna.get(b.id));
}

export function iniciar(contexto) {
  const seccion = document.getElementById('nucleo');
  if (!seccion) return;
  iniciarMaquina(seccion, contexto);
  iniciarSimulador(seccion, contexto);
}

/* ==========================================================================
   PARTE 1 · La máquina
   ========================================================================== */

function punto(radio, fraccion) {
  const angulo = fraccion * Math.PI * 2;
  return [DIAL.centro + radio * Math.sin(angulo), DIAL.centro - radio * Math.cos(angulo)];
}

function trazoArco(radio, desde, hasta) {
  const [x0, y0] = punto(radio, desde);
  const [x1, y1] = punto(radio, hasta);
  const grande = hasta - desde > 0.5 ? 1 : 0;
  return `M${redondear2(x0)} ${redondear2(y0)}A${radio} ${radio} 0 ${grande} 1 ${redondear2(x1)} ${redondear2(y1)}`;
}

// Cada variable ocupa en la vuelta del dial la fracción que vale su peso.
function tramosDelDial() {
  let acumulado = 0;
  return formula.variables.map((v) => {
    const desde = acumulado;
    acumulado = limpio(acumulado + v.peso);
    return { ...v, desde, hasta: acumulado };
  });
}

function reunirMaquina(escena) {
  const lote = buscarLote(LOTE_MAQUINA);
  const ranking = clasificar(lote);
  const tramos = tramosDelDial();
  const porVariable = (selector) => tramos.map((t) => escena.querySelector(`${selector}[data-variable="${t.clave}"]`));
  return {
    escena,
    lote,
    tramos,
    mejor: ranking[0],
    porId: new Map(ranking.map((c) => [c.id, c])),
    pasos: [...escena.querySelectorAll('.nucleo__paso')],
    formula: escena.querySelector('.nucleo__formula'),
    terminos: porVariable('.nucleo__termino'),
    arcos: porVariable('.nucleo__arco'),
    porcentajes: porVariable('.nucleo__porcentaje'),
    dial: escena.querySelector('.nucleo__dial'),
    descripcion: escena.querySelector('#nucleo-dial-desc'),
    agujaBase: escena.querySelector('.nucleo__aguja-base'),
    aguja: escena.querySelector('.nucleo__aguja'),
    suma: escena.querySelector('.nucleo__suma'),
    masAlto: escena.querySelector('.nucleo__mas-alto'),
    muelle: escena.querySelector('.nucleo__muelle'),
    ficha: escena.querySelector('.nucleo__ficha'),
    loteNombre: escena.querySelector('.nucleo__lote-nombre'),
    loteDetalle: escena.querySelector('.nucleo__lote-detalle'),
    filas: [...escena.querySelectorAll('.nucleo__fila')],
    recomendacion: escena.querySelector('.nucleo__recomendacion'),
    destino: escena.querySelector('.nucleo__recomendacion-destino'),
    trazas: escena.querySelector('.nucleo__trazas'),
  };
}

// Escribe el estado final desde los datos. También sirve para restaurarlo al salir de un matchMedia.
function pintarMaquina(m) {
  m.tramos.forEach((t, i) => {
    m.arcos[i]
      ?.querySelectorAll('path')
      .forEach((p) => p.setAttribute('d', trazoArco(Number(p.dataset.radio), t.desde + HUECO / 2, t.hasta - HUECO / 2)));
    const etiqueta = m.porcentajes[i];
    if (etiqueta) {
      const [x, y] = punto(DIAL.etiqueta, (t.desde + t.hasta) / 2);
      etiqueta.setAttribute('x', redondear2(x));
      etiqueta.setAttribute('y', redondear2(y));
      etiqueta.textContent = porcentaje(t.peso);
    }
    const termino = m.terminos[i];
    if (termino) {
      termino.querySelector('.nucleo__coef').textContent = formatoDecimal(t.peso, 2);
      termino.querySelector('.nucleo__variable').textContent = t.nombre;
    }
  });

  const sumaPesos = m.tramos.at(-1)?.hasta ?? 0;
  if (m.suma) m.suma.textContent = cifra2(sumaPesos);
  if (m.masAlto) m.masAlto.textContent = cifra3(m.mejor.puntaje);
  m.agujaBase?.setAttribute('transform', `rotate(${redondear2(m.mejor.puntaje * 360)} ${ORIGEN_AGUJA})`);
  if (m.descripcion) {
    const reparto = enumerar(m.tramos.map((t) => `${t.nombre.toLowerCase()} ${porcentaje(t.peso)}`));
    m.descripcion.textContent =
      `Los cuatro pesos reparten la vuelta completa: ${reparto}. ` +
      `La aguja marca el puntaje más alto del lote ${m.lote.nombre.toLowerCase()}: ${cifra3(m.mejor.puntaje)} sobre 1.`;
  }

  if (m.loteNombre) m.loteNombre.textContent = m.lote.nombre;
  if (m.loteDetalle) m.loteDetalle.textContent = m.lote.detalle;

  m.filas.forEach((fila) => {
    const comuna = m.porId.get(fila.dataset.comuna);
    if (!comuna) return;
    fila.querySelector('.nucleo__fila-nombre').textContent = comuna.nombre;
    fila.querySelector('.nucleo__fila-cifra').textContent = cifra3(comuna.puntaje);
    fila.querySelector('.nucleo__fila-barra').style.setProperty('--valor', comuna.puntaje);
    fila.classList.toggle('es-mejor', comuna.id === m.mejor.id);
  });
  if (m.destino) m.destino.textContent = m.mejor.nombre;
}

function iniciarMaquina(seccion, { gsap, ScrollTrigger, reducido }) {
  const escena = seccion.querySelector('.nucleo__escena');
  if (!escena) return;
  const m = reunirMaquina(escena);
  pintarMaquina(m);
  if (reducido) return; // todo queda en su estado final

  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => animarEscritorio(m, gsap, ScrollTrigger));
  mm.add('(max-width: 899.98px)', () => animarMovil(m, gsap));
}

// Lee los colores ya resueltos de las variables de contexto, para poder interpolarlos.
function tonos(el) {
  const estilo = getComputedStyle(el);
  return { gris: estilo.getPropertyValue('--texto-3').trim(), blanco: estilo.getPropertyValue('--texto').trim() };
}

// Posición de un elemento dentro de un ancestro posicionado, sin contar transformaciones
// (la ficha se mueve con transform y la escena puede estar anclada).
function caja(el, ancestro) {
  let x = 0;
  let y = 0;
  let nodo = el;
  while (nodo && nodo !== ancestro) {
    x += nodo.offsetLeft;
    y += nodo.offsetTop;
    nodo = nodo.offsetParent;
  }
  return { x, y, ancho: el.offsetWidth, alto: el.offsetHeight };
}

const caminoCrudo = (d) => MotionPathPlugin.cacheRawPathMeasurements(MotionPathPlugin.stringToRawPath(d));

// Estados de partida que no se pueden expresar con fromTo (textos que luego cuentan)
function ponerEnCero(m) {
  m.terminos.forEach((t) => {
    if (t) t.querySelector('.nucleo__coef').textContent = cifra2(0);
  });
  m.suma.textContent = cifra2(0);
  m.masAlto.textContent = cifra3(0);
}

function animarEscritorio(m, gsap, ScrollTrigger) {
  const { escena } = m;
  const { gris, blanco } = tonos(escena);
  const filaMejor = m.filas.find((f) => f.dataset.comuna === m.mejor.id);
  if (!filaMejor || !m.ficha || !m.trazas) return undefined;
  const otrasBarras = m.filas.filter((f) => f !== filaMejor).map((f) => f.querySelector('.nucleo__fila-barra'));
  const giroBase = m.mejor.puntaje * 360; // el grupo exterior ya está girado a la lectura final

  // Trazas de circuito con vías en los codos. pathLength = 1 hace que el trazado no dependa
  // de la medida real, así un cambio de tamaño no obliga a rehacer la línea de tiempo.
  const traza = () => crearSVG('path', { class: 'nucleo__traza', pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 });
  const via = () => crearSVG('circle', { class: 'nucleo__via', r: 3.5 });
  const trazas = { entrada: traza(), salida: traza(), viasEntrada: [via(), via()], viasSalida: [via(), via()] };
  m.trazas.append(trazas.entrada, trazas.salida, ...trazas.viasEntrada, ...trazas.viasSalida);

  // La ficha recorre dos caminos (muelle → dial → comuna). Su posición sale de MotionPathPlugin
  // sobre caminos medidos en píxeles de la escena, relativos a la posición natural de la ficha.
  const recorrido = { entrada: 0, salida: 0 };
  const caminos = { entrada: null, salida: null };
  const colocarFicha = () => {
    const enSalida = recorrido.salida > 0;
    const camino = enSalida ? caminos.salida : caminos.entrada;
    if (!camino) return;
    const { x, y } = MotionPathPlugin.getPositionOnPath(camino, enSalida ? recorrido.salida : recorrido.entrada);
    gsap.set(m.ficha, { x, y });
  };

  const medir = () => {
    const ancho = escena.clientWidth;
    const alto = escena.clientHeight;
    if (!ancho || !alto) return;
    m.trazas.setAttribute('viewBox', `0 0 ${ancho} ${alto}`);

    const dial = caja(m.dial, escena);
    const cx = dial.x + dial.ancho / 2;
    const cy = dial.y + dial.alto / 2;
    const radio = (dial.ancho * DIAL.borde) / DIAL.lado;
    const ficha = caja(m.ficha, escena);
    const fx = ficha.x + ficha.ancho / 2;
    const fy = ficha.y + ficha.alto / 2;
    const muelle = caja(m.muelle, escena);
    const fila = caja(filaMejor, escena);
    const puerto = caja(filaMejor.querySelector('.nucleo__fila-puerto'), escena);
    const px = puerto.x + puerto.ancho / 2;
    const py = puerto.y + puerto.alto / 2;
    // Los codos van a mitad del hueco entre columnas
    const x1 = Math.max(fx + ficha.ancho, (muelle.x + muelle.ancho + cx - radio) / 2);
    const x2 = Math.min(px - 12, (cx + radio + fila.x) / 2);
    const r = (n) => redondear2(n);

    trazas.entrada.setAttribute('d', `M${r(fx + ficha.ancho / 2 + 6)} ${r(fy)}H${r(x1)}V${r(cy)}H${r(cx - radio - 6)}`);
    trazas.salida.setAttribute('d', `M${r(cx + radio + 6)} ${r(cy)}H${r(x2)}V${r(py)}H${r(px - puerto.ancho / 2 - 4)}`);
    [
      [trazas.viasEntrada[0], x1, fy],
      [trazas.viasEntrada[1], x1, cy],
      [trazas.viasSalida[0], x2, cy],
      [trazas.viasSalida[1], x2, py],
    ].forEach(([circulo, x, y]) => {
      circulo.setAttribute('cx', r(x));
      circulo.setAttribute('cy', r(y));
    });

    caminos.entrada = caminoCrudo(`M0 0H${r(x1 - fx)}V${r(cy - fy)}H${r(cx - fx)}`);
    caminos.salida = caminoCrudo(`M${r(cx - fx)} ${r(cy - fy)}H${r(x2 - fx)}V${r(py - fy)}H${r(px - fx)}`);
    colocarFicha();
  };
  medir();
  ScrollTrigger.addEventListener('refresh', medir);

  ponerEnCero(m);
  const cifrasFilas = m.filas.map((f) => f.querySelector('.nucleo__fila-cifra'));
  cifrasFilas.forEach((c) => (c.textContent = cifra3(0)));
  gsap.set(m.aguja, { svgOrigin: ORIGEN_AGUJA, rotation: -giroBase });

  const lecturaSuma = { n: 0 };
  const lecturaAlto = { n: 0 };
  const pintarSuma = () => (m.suma.textContent = cifra2(lecturaSuma.n));
  const pintarAlto = () => (m.masAlto.textContent = cifra3(lecturaAlto.n));

  // Marcas de tiempo de la secuencia (unidades de la línea de tiempo, no segundos: manda el scroll)
  const T = { pesos: 0.2, paso: 0.95, lote: 4.1, puntajes: 5.6, decision: 7.6, fin: 10 };

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: escena, start: 'top top', end: '+=260%', pin: true, scrub: 1, anticipatePin: 1 },
  });

  const encender = (indice, desde, hasta) => {
    const paso = m.pasos[indice];
    if (!paso) return;
    tl.fromTo(paso, { color: gris }, { color: blanco, duration: 0.2 }, desde).fromTo(
      paso.querySelector('.nucleo__paso-avance > span'),
      { scaleX: 0 },
      { scaleX: 1, duration: hasta - desde },
      desde,
    );
  };

  // 1 · Calibrar: cada término se enciende, su coeficiente se descifra y su arco se dibuja
  encender(0, 0, T.lote);
  m.tramos.forEach((t, i) => {
    const inicio = T.pesos + i * T.paso;
    const termino = m.terminos[i];
    tl.fromTo(termino, { color: gris }, { color: blanco, duration: 0.3 }, inicio)
      .to(
        termino.querySelector('.nucleo__coef'),
        { scrambleText: { text: formatoDecimal(t.peso, 2), chars: '0123456789', revealDelay: 0.35, speed: 0.5 }, duration: 0.75 },
        inicio,
      )
      .fromTo(m.arcos[i].querySelectorAll('path'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.8 }, inicio + 0.05)
      .fromTo(m.porcentajes[i], { opacity: 0 }, { opacity: 1, duration: 0.25 }, inicio + 0.55)
      .to(m.aguja, { rotation: t.hasta * 360 - giroBase, svgOrigin: ORIGEN_AGUJA, duration: 0.8 }, inicio + 0.05)
      .to(lecturaSuma, { n: t.hasta, duration: 0.8, onUpdate: pintarSuma }, inicio + 0.05);
  });

  // 2 · Recibir: la traza de entrada se tiende y el lote viaja del muelle al centro del dial
  encender(1, T.lote, T.puntajes);
  tl.fromTo(trazas.entrada, { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 0.6 }, T.lote)
    .fromTo(trazas.viasEntrada, { opacity: 0 }, { opacity: 1, duration: 0.1, stagger: 0.25 }, T.lote + 0.15)
    .to(recorrido, { entrada: 1, duration: 1, onUpdate: colocarFicha }, T.lote + 0.35);

  // 3 · Puntuar: cada barra crece hasta su puntaje y la aguja sigue al más alto
  encender(2, T.puntajes, T.decision);
  m.filas.forEach((fila, i) => {
    const comuna = m.porId.get(fila.dataset.comuna);
    if (!comuna) return;
    const lectura = { n: 0 };
    const inicio = T.puntajes + 0.1 + i * 0.08;
    tl.fromTo(fila.querySelector('.nucleo__fila-barra'), { scaleX: 0 }, { scaleX: comuna.puntaje, duration: 1.4 }, inicio).to(
      lectura,
      { n: comuna.puntaje, duration: 1.4, onUpdate: () => (cifrasFilas[i].textContent = cifra3(lectura.n)) },
      inicio,
    );
  });
  // Tras calibrar, la aguja interior está en 360 − giroBase (las 12 en punto). Barre giroBase
  // grados hasta 360, que sumado al giro del grupo exterior es justo la lectura final del HTML.
  tl.to(m.aguja, { rotation: 360, svgOrigin: ORIGEN_AGUJA, duration: 1.6 }, T.puntajes + 0.1).to(
    lecturaAlto,
    { n: m.mejor.puntaje, duration: 1.6, onUpdate: pintarAlto },
    T.puntajes + 0.1,
  );

  // 4 · Recomendar: se marca la mejor fila, se tiende la ruta y el lote viaja por ella
  encender(3, T.decision, T.fin - 0.6);
  tl.fromTo(otrasBarras, { opacity: 1 }, { opacity: 0.4, duration: 0.4 }, T.decision + 0.05)
    .fromTo(
      [filaMejor.querySelector('.nucleo__fila-marco'), filaMejor.querySelector('.nucleo__fila-distintivo')],
      { opacity: 0 },
      { opacity: 1, duration: 0.3 },
      T.decision + 0.1,
    )
    .fromTo(trazas.salida, { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 0.7 }, T.decision + 0.2)
    .fromTo(trazas.viasSalida, { opacity: 0 }, { opacity: 1, duration: 0.1, stagger: 0.25 }, T.decision + 0.35)
    .to(recorrido, { salida: 1, duration: 0.9, onUpdate: colocarFicha }, T.decision + 0.4)
    .fromTo(m.ficha, { scale: 1 }, { scale: 0.55, duration: 0.25 }, T.decision + 1.1)
    .fromTo(
      m.recomendacion,
      { clipPath: 'inset(0% 100% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5 },
      T.decision + 1.4,
    )
    .to({}, { duration: 0.01 }, T.fin); // reposo final antes de soltar el anclaje

  // Al salir de escritorio, matchMedia revierte los tweens; esto deshace lo que no son tweens.
  return () => {
    ScrollTrigger.removeEventListener('refresh', medir);
    m.trazas.replaceChildren();
    m.trazas.setAttribute('viewBox', '0 0 1 1');
    gsap.set(m.ficha, { clearProps: 'transform' });
    pintarMaquina(m);
  };
}

function animarMovil(m, gsap) {
  const { gris, blanco } = tonos(m.escena);
  const giroBase = m.mejor.puntaje * 360;
  ponerEnCero(m);
  gsap.set(m.aguja, { svgOrigin: ORIGEN_AGUJA, rotation: -giroBase });

  // La fórmula se arma una sola vez al entrar
  const armado = gsap.timeline({ scrollTrigger: { trigger: m.formula, start: 'top 80%', toggleActions: 'play none none none' } });
  m.tramos.forEach((t, i) => {
    const termino = m.terminos[i];
    armado
      .fromTo(termino, { color: gris }, { color: blanco, duration: 0.5, ease: 'power2.out' }, i * 0.22)
      .to(
        termino.querySelector('.nucleo__coef'),
        { scrambleText: { text: formatoDecimal(t.peso, 2), chars: '0123456789', revealDelay: 0.3, speed: 0.5 }, duration: 0.8, ease: 'none' },
        i * 0.22,
      );
  });

  // El dial se calibra cuando aparece y la aguja termina en el puntaje más alto
  const lecturaSuma = { n: 0 };
  const lecturaAlto = { n: 0 };
  const calibrado = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    scrollTrigger: { trigger: m.dial, start: 'top 75%', toggleActions: 'play none none none' },
  });
  m.tramos.forEach((t, i) => {
    const inicio = i * 0.5;
    calibrado
      .fromTo(m.arcos[i].querySelectorAll('path'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.6 }, inicio)
      .fromTo(m.porcentajes[i], { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power1.out' }, inicio + 0.35)
      .to(m.aguja, { rotation: t.hasta * 360 - giroBase, svgOrigin: ORIGEN_AGUJA, duration: 0.5 }, inicio)
      .to(lecturaSuma, { n: t.hasta, duration: 0.5, onUpdate: () => (m.suma.textContent = cifra2(lecturaSuma.n)) }, inicio);
  });
  calibrado
    .to(m.aguja, { rotation: 360, svgOrigin: ORIGEN_AGUJA, duration: 1.1, ease: 'power3.inOut' }, '+=0.1')
    .to(lecturaAlto, { n: m.mejor.puntaje, duration: 1.1, ease: 'power3.inOut', onUpdate: () => (m.masAlto.textContent = cifra3(lecturaAlto.n)) }, '<');

  return () => pintarMaquina(m);
}

/* ==========================================================================
   PARTE 2 · Simulador «Prueba la regla»
   ========================================================================== */

function crearPuesto(comuna) {
  const parte = (clase, texto = '') => {
    const el = document.createElement('span');
    el.className = clase;
    el.textContent = texto;
    return el;
  };
  const li = document.createElement('li');
  li.className = 'nucleo__puesto visor';
  li.dataset.comuna = comuna.id;
  const apilada = parte('nucleo__apilada');
  apilada.setAttribute('aria-hidden', 'true');
  apilada.append(...formula.variables.map((v) => parte(`nucleo__segmento nucleo__segmento--${v.clave}`)));
  li.append(
    parte('nucleo__posicion codigo'),
    parte('nucleo__puesto-nombre', comuna.nombre),
    parte('nucleo__distintivo', 'Recomendado'),
    apilada,
    parte('nucleo__puesto-puntaje codigo'),
    parte('solo-lector nucleo__puesto-aportes'),
  );
  return li;
}

function iniciarSimulador(seccion, { gsap, reducido }) {
  const raiz = seccion.querySelector('.nucleo__simulador');
  const lista = raiz?.querySelector('.nucleo__ranking');
  if (!raiz || !lista) return;

  const anuncio = raiz.querySelector('.nucleo__anuncio');
  const destino = raiz.querySelector('.nucleo__veredicto-destino');
  const detalle = raiz.querySelector('.nucleo__veredicto-detalle');
  const loteActual = raiz.querySelector('.nucleo__lote-actual');
  const tablaLeyenda = raiz.querySelector('.nucleo__tabla caption');
  const tablaFilas = [...raiz.querySelectorAll('.nucleo__tabla tbody tr')];
  const restablecer = raiz.querySelector('.nucleo__restablecer');
  const radios = [...raiz.querySelectorAll('input[name="nucleo-lote"]')];
  const mandos = formula.variables
    .map((variable) => {
      const caja = raiz.querySelector(`.nucleo__mando[data-variable="${variable.clave}"]`);
      return {
        variable,
        rango: caja?.querySelector('.nucleo__rango'),
        efectivo: caja?.querySelector('.nucleo__efectivo-cifra'),
        marca: caja?.querySelector('.nucleo__marca-informe'),
        viva: raiz.querySelector(`.nucleo__formula-viva [data-variable="${variable.clave}"]`),
      };
    })
    .filter((mando) => mando.rango);

  const pesosInforme = Object.fromEntries(formula.variables.map((v) => [v.clave, Math.round(v.peso * 100)]));
  const estado = { lote: buscarLote(LOTE_INICIAL), pesos: { ...pesosInforme } };

  // Con JavaScript aparecen los mandos y se sincronizan con los datos
  raiz.querySelectorAll('[data-requiere-js]').forEach((el) => (el.hidden = false));
  radios.forEach((radio) => (radio.checked = radio.value === estado.lote.id));
  mandos.forEach(({ variable, rango, marca }) => {
    rango.value = String(estado.pesos[variable.clave]);
    marca?.style.setProperty('--informe', variable.peso);
  });

  // Nodos persistentes por comuna: Flip los sigue cuando cambian de puesto
  const filas = new Map(simulador.comunas.map((c) => [c.id, crearPuesto(c)]));
  const lecturas = new Map(simulador.comunas.map((c) => [c.id, { n: 0 }]));
  lista.replaceChildren(...clasificar(estado.lote, estado.pesos).map((c) => filas.get(c.id)));

  let temporizador = 0;
  const anunciar = (texto) => {
    window.clearTimeout(temporizador);
    temporizador = window.setTimeout(() => {
      if (anuncio) anuncio.textContent = texto;
    }, ESPERA_ANUNCIO);
  };

  const ordenar = (ids, animar) => {
    const actual = [...lista.children].map((li) => li.dataset.comuna);
    if (actual.join() === ids.join()) return;
    const antes = animar ? Flip.getState([...lista.children]) : null;
    lista.append(...ids.map((id) => filas.get(id)));
    if (antes) Flip.from(antes, { duration: DURACION_CAMBIO, ease: 'power3.inOut', simple: true });
  };

  const pintarPuesto = (comuna, posicion, animar) => {
    const li = filas.get(comuna.id);
    li.querySelector('.nucleo__posicion').textContent = String(posicion + 1);

    // Cada tramo se coloca con translate (xPercent) y se mide con scaleX: nada de width
    const segmentos = li.querySelectorAll('.nucleo__segmento');
    let desplazamiento = 0;
    formula.variables.forEach((v, j) => {
      const aporte = limpio(comuna.aportes[v.clave]);
      const destinoTramo = { xPercent: desplazamiento * 100, scaleX: aporte };
      desplazamiento = limpio(desplazamiento + aporte);
      if (animar) gsap.to(segmentos[j], { ...destinoTramo, duration: DURACION_CAMBIO, ease: 'power3.inOut', overwrite: true });
      else gsap.set(segmentos[j], { ...destinoTramo, overwrite: true });
    });

    const cifra = li.querySelector('.nucleo__puesto-puntaje');
    const lectura = lecturas.get(comuna.id);
    if (animar) {
      gsap.to(lectura, {
        n: comuna.puntaje,
        duration: DURACION_CAMBIO,
        ease: 'power3.inOut',
        overwrite: true,
        onUpdate: () => (cifra.textContent = cifra3(lectura.n)),
      });
    } else {
      gsap.killTweensOf(lectura);
      lectura.n = comuna.puntaje;
      cifra.textContent = cifra3(comuna.puntaje);
    }

    const aportes = formula.variables.map((v) => `${v.nombre.toLowerCase()} ${cifra3(comuna.aportes[v.clave])}`);
    li.querySelector('.nucleo__puesto-aportes').textContent = `Aportes: ${enumerar(aportes)}.`;
  };

  const pintarVeredicto = (ranking, suma, hablar) => {
    const [primero, segundo] = ranking;
    if (loteActual) loteActual.textContent = estado.lote.nombre;
    let texto;
    if (!suma) {
      destino.textContent = 'Sin recomendación';
      detalle.textContent = 'Todos los pesos están en cero: sube al menos uno para que la regla pueda comparar.';
      texto = 'Sin recomendación: todos los pesos están en cero.';
    } else {
      const puntaje = cifra3(primero.puntaje);
      const empate =
        segundo && segundo.puntaje === primero.puntaje
          ? ` Empata con la ${segundo.nombre}; a igual puntaje se mantiene el orden de la lista de comunas.`
          : '';
      const cifra = document.createElement('span');
      cifra.className = 'codigo';
      cifra.textContent = puntaje;
      destino.textContent = primero.nombre;
      detalle.replaceChildren(`Enviar ${estado.lote.nombre.toLowerCase()} con puntaje `, cifra, `.${empate}`);
      texto = `Recomendación: enviar ${estado.lote.nombre} a la ${primero.nombre}, con puntaje ${puntaje}.${empate}`;
    }
    if (hablar) anunciar(texto);
  };

  const pintarTabla = (ranking) => {
    if (tablaLeyenda) {
      tablaLeyenda.textContent = `Valores normalizados de 0 a 1 para el lote «${estado.lote.nombre}» y puntaje con los pesos actuales. Datos de prueba ficticios.`;
    }
    const porId = new Map(ranking.map((c) => [c.id, c]));
    tablaFilas.forEach((tr) => {
      const comuna = porId.get(tr.dataset.comuna);
      if (!comuna) return;
      tr.querySelectorAll('td[data-variable]').forEach((td) => (td.textContent = cifra2(comuna.valores[td.dataset.variable])));
      const celda = tr.querySelector('td[data-dato="puntaje"]');
      if (celda) celda.textContent = cifra3(comuna.puntaje);
    });
  };

  const actualizar = ({ animar = !reducido, hablar = true } = {}) => {
    const suma = Object.values(estado.pesos).reduce((a, b) => a + b, 0);
    const ranking = clasificar(estado.lote, estado.pesos);

    mandos.forEach(({ variable, rango, efectivo, viva }) => {
      const valor = estado.pesos[variable.clave];
      const peso = cifra2(suma ? valor / suma : 0);
      if (efectivo) efectivo.textContent = peso;
      if (viva) viva.textContent = peso;
      rango.style.setProperty('--avance', valor / 100);
      rango.setAttribute('aria-valuetext', `${valor} de 100, peso efectivo ${peso}`);
    });

    ordenar(
      ranking.map((c) => c.id),
      animar,
    );
    ranking.forEach((comuna, i) => pintarPuesto(comuna, i, animar));
    lista.classList.toggle('nucleo__ranking--sin-pesos', suma === 0);
    pintarVeredicto(ranking, suma, hablar);
    pintarTabla(ranking);
  };

  radios.forEach((radio) =>
    radio.addEventListener('change', () => {
      if (!radio.checked) return;
      estado.lote = buscarLote(radio.value);
      actualizar();
    }),
  );
  mandos.forEach(({ variable, rango }) =>
    rango.addEventListener('input', () => {
      estado.pesos[variable.clave] = Number(rango.value);
      actualizar();
    }),
  );
  restablecer?.addEventListener('click', () => {
    estado.pesos = { ...pesosInforme };
    mandos.forEach(({ variable, rango }) => (rango.value = String(estado.pesos[variable.clave])));
    actualizar();
  });

  actualizar({ animar: false, hablar: false });
}
