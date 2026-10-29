// Portada: escena SVG de respaldo, video de la portada (opcional, generado con IA) y entrada del
// titular. main.js llama a iniciar() al cargar y a entrada() cuando se abre la compuerta de la precarga.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { meta, ods } from '../../datos/proyecto.js';

const ANCHO_INICIAL = 62;
const ANCHO_FINAL = 125;

// Instante de la escena que se deja quieto con movimiento reducido: los siete lotes en tránsito.
const FOTOGRAMA_QUIETO = 9.8;

const LINEA_OCULTA = {
  fontVariationSettings: `'wdth' ${ANCHO_INICIAL}`,
  clipPath: 'inset(-25% 100% -25% -2%)',
  opacity: 0,
};

const estado = {
  el: null,
  fase: 'espera', // espera → entrando → terminada
  lineaTiempo: null,
  lineas: null,
  tweenTitulo: null,
  videoListo: false,
  videoVisible: false,
  pausado: false,
  enPantalla: true,
};

const lista = (...elementos) => elementos.flat().filter(Boolean);

function buscarElementos(seccion) {
  const uno = (selector) => seccion.querySelector(selector);
  const todos = (selector) => [...seccion.querySelectorAll(selector)];
  return {
    fondo: uno('.inicio__fondo'),
    interior: uno('.inicio__fondo-interior'),
    escena: uno('.inicio__escena'),
    video: uno('.inicio__video'),
    contenido: uno('.inicio__contenido'),
    titulo: uno('.inicio__titulo'),
    entradilla: uno('.inicio__entradilla'),
    botones: todos('.inicio__acciones .boton'),
    desliza: uno('.inicio__desliza'),
    indicador: uno('.inicio__desliza-filete'),
    regla: uno('.inicio__regla'),
    datos: todos('.inicio__dato'),
    ods: uno('[data-dato="ods"]'),
    coordenadas: uno('[data-dato="coordenadas"]'),
    pausa: uno('.inicio__pausa'),
  };
}

export function iniciar(contexto) {
  const seccion = document.getElementById('inicio');
  if (!seccion) return;
  const el = buscarElementos(seccion);
  estado.el = el;
  seccion.classList.add('inicio--activo');

  if (contexto.reducido) {
    // Todo visible y quieto: sin entrada, sin video en marcha, escena detenida.
    quietarEscena(el);
    prepararPoster(el);
    return;
  }

  prepararVideo(el);
  prepararPausa(el);

  // Estados iniciales de la entrada (solo con JavaScript y movimiento permitido)
  gsap.set(lista(el.interior), { scale: 1.12, opacity: 0 });
  gsap.set(lista(el.entradilla, el.botones, el.datos, el.desliza, el.pausa), { opacity: 0 });
  gsap.set(lista(el.regla), { scaleX: 0, transformOrigin: '0% 50%' });
  dividirTitulo(el.titulo);

  crearSalida(el, seccion);

  // Fuera de pantalla no se gasta nada: escena y video se detienen.
  ScrollTrigger.create({
    trigger: seccion,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      estado.enPantalla = self.isActive;
      aplicarMovimiento();
    },
  });

  // Red de seguridad: si la precarga no llegara a abrir la compuerta, la portada se muestra igual.
  window.setTimeout(() => entrada(contexto), 8000);
}

/**
 * Entrada de la portada. Se ejecuta una sola vez (las llamadas siguientes devuelven la misma
 * línea de tiempo). Con movimiento reducido no hace nada.
 */
export function entrada(contexto) {
  if (contexto?.reducido || !estado.el) return null;
  if (estado.lineaTiempo) return estado.lineaTiempo;

  const el = estado.el;
  estado.fase = 'entrando';
  const tl = gsap.timeline({
    onComplete: () => {
      estado.fase = 'terminada';
    },
  });
  estado.lineaTiempo = tl;

  tl.to(lista(el.interior), { scale: 1, opacity: 1, duration: 2.4, ease: 'expo.out' }, 0);

  if (estado.lineas) {
    estado.tweenTitulo = extenderLineas(estado.lineas);
    tl.add(estado.tweenTitulo, 0.2);
  }

  tl.to(lista(el.entradilla), { opacity: 1, duration: 1, ease: 'power2.out' }, 0.95)
    .to(lista(el.botones), { opacity: 1, duration: 0.9, ease: 'power2.out', stagger: 0.08 }, 1.05)
    .to(lista(el.regla), { scaleX: 1, duration: 1.4, ease: 'expo.inOut' }, 0.9)
    .to(lista(el.datos), { opacity: 1, duration: 0.7, ease: 'power2.out', stagger: 0.07 }, 1.35);

  // Las cifras de la banda se leen como un instrumento que se calibra.
  if (el.ods) {
    tl.to(
      el.ods,
      { duration: 1.1, scrambleText: { text: `ODS ${ods.numero}`, chars: '0123456789', speed: 0.45, revealDelay: 0.3 } },
      1.4,
    );
  }
  if (el.coordenadas) {
    tl.to(
      el.coordenadas,
      {
        duration: 1.6,
        scrambleText: {
          text: `${meta.coordenadas.lat} ${meta.coordenadas.lon}`,
          chars: '0123456789',
          speed: 0.45,
          revealDelay: 0.45,
        },
      },
      1.55,
    );
  }

  tl.to(lista(el.desliza, el.pausa), { opacity: 1, duration: 0.8, ease: 'power2.out' }, 1.8);

  // Si el video ya cargó durante la precarga, entra con el fondo.
  if (estado.videoListo) mostrarVideo(true);

  return tl;
}

/* ---------- Titular: se «extiende» línea a línea ---------- */
function extenderLineas(lineas) {
  return gsap.fromTo(
    lineas,
    { ...LINEA_OCULTA },
    {
      fontVariationSettings: `'wdth' ${ANCHO_FINAL}`,
      clipPath: 'inset(-25% -6% -25% -2%)',
      opacity: 1,
      duration: 1.6,
      ease: 'expo.out',
      stagger: 0.12,
    },
  );
}

function dividirTitulo(titulo) {
  if (!titulo) return;
  SplitText.create(titulo, {
    type: 'lines',
    linesClass: 'inicio__titulo-linea',
    autoSplit: true,
    onSplit(division) {
      titulo.classList.add('inicio__titulo--dividido');
      estado.lineas = division.lines;
      if (estado.fase === 'espera') {
        gsap.set(division.lines, { ...LINEA_OCULTA });
      } else if (estado.fase === 'entrando' && estado.tweenTitulo && estado.lineaTiempo) {
        // Las fuentes o el ancho cambiaron a mitad de la entrada: el gesto se rehace sobre las
        // líneas nuevas en el mismo punto de la línea de tiempo.
        const posicion = estado.tweenTitulo.startTime();
        estado.tweenTitulo.kill();
        estado.tweenTitulo = extenderLineas(division.lines);
        estado.lineaTiempo.add(estado.tweenTitulo, posicion);
      }
      // Con la entrada terminada, las líneas nuevas ya quedan en su estado final (el de la hoja de estilos).
    },
  });
}

/* ---------- Salida con el desplazamiento ---------- */
function crearSalida(el, seccion) {
  const medios = gsap.matchMedia();
  medios.add({ escritorio: '(min-width: 900px)', movil: '(max-width: 899px)' }, (ctx) => {
    const subida = ctx.conditions.escritorio ? 0.12 : 0.06;
    const salida = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: seccion,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    if (el.contenido) {
      salida
        .to(el.contenido, { y: () => -subida * window.innerHeight, duration: 1 }, 0)
        .to(el.contenido, { opacity: 0, duration: 0.6 }, 0.1);
    }
    if (el.fondo) salida.to(el.fondo, { scale: 1.08, opacity: 0.25, duration: 1 }, 0);
  });
}

/* ---------- Video de la portada ---------- */
function prepararVideo(el) {
  const { video } = el;
  if (!video) return;
  video.muted = true;
  gsap.set(video, { opacity: 0 });

  const listo = () => {
    if (estado.videoListo || video.hidden) return;
    estado.videoListo = true;
    if (estado.fase !== 'espera') mostrarVideo(false);
  };

  // Sin video (lo normal hasta que el equipo lo genere) la escena SVG queda de fondo, sin avisos.
  const retirar = () => {
    estado.videoListo = false;
    video.pause();
    video.hidden = true;
    if (estado.videoVisible) {
      estado.videoVisible = false;
      gsap.to(lista(el.escena), { autoAlpha: 1, duration: 0.8, ease: 'power2.out' });
      aplicarMovimiento();
    }
  };

  video.addEventListener('canplay', listo);
  video.addEventListener('loadeddata', listo);
  video.addEventListener('error', retirar);
  video.querySelector('source:last-of-type')?.addEventListener('error', retirar);

  // Con «ahorro de datos» activado en el teléfono no se descarga: queda la escena SVG.
  if (navigator.connection?.saveData) {
    retirar();
    return;
  }

  // El video (varios MB) no compite con el JavaScript ni con las fuentes: el HTML lo declara
  // con preload="none" y se pide cuando la página terminó de cargar. Mientras, se ve la escena.
  const cargar = () => {
    video.preload = 'auto';
    video.load();
  };
  if (document.readyState === 'complete') cargar();
  else window.addEventListener('load', cargar, { once: true });
}

function mostrarVideo(inmediato) {
  const { video, escena } = estado.el;
  if (!video || estado.videoVisible || video.hidden) return;
  estado.videoVisible = true;
  // «Inmediato»: el fondo aún está entrando, basta un fundido corto para que no se note el cambio.
  const duracion = inmediato ? 0.4 : 1.6;

  const revelar = () => {
    gsap.to(video, { opacity: 1, duration: duracion, ease: 'power2.inOut' });
    gsap.to(lista(escena), { autoAlpha: 0, duration: duracion, ease: 'power2.inOut', onComplete: aplicarMovimiento });
  };

  // Pausado o fuera de pantalla: se muestra quieto y arranca cuando toque.
  if (!debeMoverse()) {
    revelar();
    return;
  }
  const intento = video.play();
  if (intento && typeof intento.then === 'function') {
    // Si el navegador bloquea la reproducción automática, sigue la escena SVG.
    intento.then(revelar, () => {
      estado.videoVisible = false;
    });
  } else {
    revelar();
  }
}

// Con movimiento reducido no se reproduce ni se descarga el video: solo el póster, si existe.
function prepararPoster(el) {
  const { video } = el;
  if (!video) return;
  video.querySelectorAll('source').forEach((fuente) => fuente.remove());
  video.load();
  video.hidden = true;
  const poster = video.getAttribute('poster');
  if (!poster) return;
  const prueba = new Image();
  prueba.onload = () => {
    video.hidden = false;
    gsap.set(lista(el.escena), { autoAlpha: 0 });
  };
  prueba.src = poster;
}

/* ---------- Pausa del movimiento (WCAG 2.2.2) ---------- */
function prepararPausa(el) {
  const { pausa } = el;
  if (!pausa) return;
  const texto = pausa.querySelector('.inicio__pausa-texto');
  pausa.hidden = false;
  pausa.addEventListener('click', () => {
    estado.pausado = !estado.pausado;
    // El texto del botón ya dice su estado; aria-pressed lo repetiría en el lector de pantalla.
    pausa.dataset.pausado = String(estado.pausado);
    if (texto) texto.textContent = estado.pausado ? 'Reanudar movimiento' : 'Pausar movimiento';
    aplicarMovimiento();
  });
}

function debeMoverse() {
  return !estado.pausado && estado.enPantalla;
}

function aplicarMovimiento() {
  const el = estado.el;
  if (!el) return;
  const mover = debeMoverse();
  // Con el video a la vista la escena queda oculta: no tiene sentido que siga animándose.
  alternarSMIL(el.escena, mover && !estado.videoVisible);
  alternarSMIL(el.indicador, mover);
  if (estado.videoVisible && el.video) {
    if (mover) el.video.play()?.catch(() => {});
    else el.video.pause();
  }
}

function alternarSMIL(svg, activo) {
  if (!svg || typeof svg.pauseAnimations !== 'function') return;
  if (activo) svg.unpauseAnimations();
  else svg.pauseAnimations();
}

function quietarEscena(el) {
  if (el.escena?.pauseAnimations) {
    el.escena.pauseAnimations();
    el.escena.setCurrentTime(FOTOGRAMA_QUIETO);
  }
  if (el.indicador?.pauseAnimations) {
    el.indicador.pauseAnimations();
    el.indicador.setCurrentTime(1.1);
  }
}
