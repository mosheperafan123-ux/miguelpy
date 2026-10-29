// Piezas fijas del sitio: precarga, barra superior, índice, riel de progreso,
// compuertas de las placas claras y navegación por anclas.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let suavizador = null;
let reducidoGlobal = false;

// Desplaza hasta un destino respetando el desplazamiento suave (si está activo).
export function irA(destino) {
  if (!destino) return;
  // Las secciones ya traen aire arriba; los bloques internos (3.1, 3.2, 3.3) necesitan margen para la barra.
  const margen = destino.classList.contains('seccion') || destino.id === 'inicio' ? 0 : 88;
  if (suavizador) suavizador.scrollTo(destino, !reducidoGlobal, `top ${margen}px`);
  else
    window.scrollTo({
      top: destino.getBoundingClientRect().top + window.scrollY - margen,
      behavior: reducidoGlobal ? 'auto' : 'smooth',
    });
  if (!destino.hasAttribute('tabindex')) destino.setAttribute('tabindex', '-1');
  destino.focus({ preventScroll: true });
}

export function iniciarMarco({ smoother, reducido }) {
  suavizador = smoother;
  reducidoGlobal = reducido;
  iniciarBarra(reducido);
  const menu = iniciarIndice(reducido);
  iniciarAnclas(menu);
  iniciarRiel();
}

/* ---------- Barra: se esconde al bajar y vuelve al subir ---------- */
function iniciarBarra(reducido) {
  const barra = document.getElementById('barra');
  if (!barra || reducido) return;
  let oculta = false;
  const mostrar = (visible) => {
    if (visible === !oculta) return;
    oculta = !visible;
    gsap.to(barra, {
      yPercent: visible ? 0 : -110,
      duration: visible ? 0.6 : 0.4,
      ease: visible ? 'expo.out' : 'power2.in',
      overwrite: true,
    });
  };
  ScrollTrigger.create({
    start: 160,
    end: 'max',
    onUpdate: (self) => mostrar(self.direction === -1),
    onLeaveBack: () => mostrar(true),
  });
}

/* ---------- Índice a pantalla completa ---------- */
function iniciarIndice(reducido) {
  const boton = document.querySelector('.barra__menu');
  const texto = document.querySelector('.barra__menu-texto');
  const panel = document.getElementById('indice');
  const envoltura = document.getElementById('envoltura');
  if (!boton || !panel) return null;
  let abierto = false;

  const abrir = () => {
    abierto = true;
    panel.hidden = false;
    boton.setAttribute('aria-expanded', 'true');
    texto.textContent = 'Cerrar';
    envoltura.inert = true;
    document.documentElement.classList.add('bloqueado');
    suavizador?.paused(true);
    if (!reducido) {
      gsap.fromTo(panel, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'expo.inOut' });
      gsap.fromTo(
        panel.querySelectorAll('.indice__capitulo, li'),
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.025, delay: 0.28, ease: 'expo.out' },
      );
    }
    panel.querySelector('a')?.focus({ preventScroll: true });
  };

  const cerrar = (alTerminar) => {
    if (!abierto) return;
    abierto = false;
    boton.setAttribute('aria-expanded', 'false');
    texto.textContent = 'Índice';
    envoltura.inert = false;
    document.documentElement.classList.remove('bloqueado');
    suavizador?.paused(false);
    const fin = () => {
      panel.hidden = true;
      alTerminar?.();
    };
    if (reducido) fin();
    else gsap.to(panel, { clipPath: 'inset(100% 0% 0% 0%)', duration: 0.6, ease: 'expo.inOut', onComplete: fin });
  };

  boton.addEventListener('click', () => (abierto ? cerrar(() => boton.focus()) : abrir()));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && abierto) cerrar(() => boton.focus());
  });
  return { cerrar, estaAbierto: () => abierto, panel };
}

/* ---------- Anclas internas ---------- */
function iniciarAnclas(menu) {
  document.addEventListener('click', (e) => {
    const enlace = e.target.closest('a[href^="#"]');
    if (!enlace) return;
    const id = enlace.getAttribute('href');
    if (id.length < 2) return;
    const destino = document.getElementById(id.slice(1));
    if (!destino) return;
    e.preventDefault();
    history.replaceState(null, '', id);
    if (menu?.estaAbierto() && menu.panel.contains(enlace)) menu.cerrar(() => irA(destino));
    else irA(destino);
  });
}

/* ---------- Riel de progreso ---------- */
let rielCodigo = null;
let rielNombre = null;

function iniciarRiel() {
  const riel = document.querySelector('.riel');
  const cursor = document.querySelector('.riel__cursor');
  rielCodigo = document.querySelector('.riel__codigo');
  rielNombre = document.querySelector('.riel__nombre');
  if (!riel || !cursor) return;
  const moverY = gsap.quickSetter(cursor, 'y', 'px');
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => moverY(self.progress * riel.offsetHeight),
  });
}

// Se llama después de iniciar cada sección, para que el cálculo incluya los anclajes previos.
export function registrarEnRiel(seccion) {
  const capitulo = seccion.dataset.capitulo;
  const nombre = seccion.dataset.tituloCorto;
  if (!capitulo || !rielCodigo) return;
  const actualizar = () => {
    rielCodigo.textContent = capitulo;
    rielNombre.textContent = nombre ?? '';
  };
  ScrollTrigger.create({
    trigger: seccion,
    start: 'top 50%',
    end: 'bottom 50%',
    onEnter: actualizar,
    onEnterBack: actualizar,
  });
}

/* ---------- Compuerta: la placa clara entra deslizándose a pantalla completa ---------- */
export function crearCompuerta(seccion, { reducido }) {
  if (reducido) return;
  gsap.fromTo(
    seccion,
    { clipPath: 'inset(0% 4.5% 0% 4.5% round 10px)' },
    {
      clipPath: 'inset(0% 0% 0% 0% round 0px)',
      ease: 'none',
      scrollTrigger: { trigger: seccion, start: 'top bottom', end: 'top 25%', scrub: true },
    },
  );
}

/* ---------- Precarga: la red se enciende y la compuerta se abre ---------- */
export function correrPrecarga({ reducido, smoother }, alAbrir) {
  const precarga = document.getElementById('precarga');
  const terminar = () => {
    precarga?.setAttribute('data-terminada', '');
    document.documentElement.classList.remove('bloqueado');
    smoother?.paused(false);
    ScrollTrigger.refresh();
  };
  if (!precarga || reducido) {
    terminar();
    alAbrir?.();
    return;
  }

  let vista = false;
  try {
    vista = sessionStorage.getItem('precarga-vista') === '1';
    sessionStorage.setItem('precarga-vista', '1');
  } catch {
    vista = false;
  }

  document.documentElement.classList.add('bloqueado');
  smoother?.paused(true);

  const cifra = precarga.querySelector('.precarga__cifra');
  const texto = precarga.querySelector('.precarga__texto');
  const estado = { n: 0 };
  const tl = gsap.timeline({ onComplete: terminar });

  if (!vista) {
    tl.from(precarga.querySelectorAll('.precarga__traza'), { drawSVG: 0, duration: 0.75, stagger: 0.14, ease: 'power2.inOut' }, 0.1)
      .from(precarga.querySelector('.precarga__anillo'), { drawSVG: '50% 50%', duration: 0.9, ease: 'power3.inOut' }, 0)
      .from(
        precarga.querySelectorAll('.precarga__nodo'),
        { scale: 0, transformOrigin: '50% 50%', duration: 0.5, stagger: 0.07, ease: 'back.out(2.2)' },
        0.35,
      )
      .to(
        estado,
        {
          n: 100,
          duration: 1.75,
          ease: 'power2.inOut',
          onUpdate: () => {
            cifra.textContent = String(Math.round(estado.n)).padStart(3, '0');
          },
        },
        0,
      )
      .to(texto, { duration: 0.45, scrambleText: { text: 'Leyendo demanda', chars: '01', speed: 0.8 } }, 0.55)
      .to(texto, { duration: 0.45, scrambleText: { text: 'Cruzando datos', chars: '01', speed: 0.8 } }, 1.05)
      .to(texto, { duration: 0.45, scrambleText: { text: 'Red en línea', chars: '01', speed: 0.8 } }, 1.55)
      .to(precarga.querySelector('.precarga__nucleo'), { opacity: 0, scale: 0.94, duration: 0.45, ease: 'power2.in' }, 2.1);
  } else {
    tl.set(precarga.querySelector('.precarga__nucleo'), { opacity: 0 });
  }

  tl.addLabel('abrir')
    .to(precarga.querySelector('.precarga__obturador--arriba'), { yPercent: -101, duration: 1.15, ease: 'expo.inOut' }, 'abrir')
    .to(precarga.querySelector('.precarga__obturador--abajo'), { yPercent: 101, duration: 1.15, ease: 'expo.inOut' }, 'abrir')
    .add(() => alAbrir?.(), 'abrir+=0.3');
}
