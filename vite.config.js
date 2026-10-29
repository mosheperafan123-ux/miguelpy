import { defineConfig } from 'vite';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const carpetaSrc = fileURLToPath(new URL('./src/', import.meta.url));

// Cada sección vive en su propio archivo HTML (src/secciones/*.html).
// Este plugin sustituye <!-- incluir: secciones/x.html --> por el contenido del archivo,
// tanto en desarrollo como al construir el sitio final.
function incluirParciales() {
  const patron = /<!--\s*incluir:\s*([\w./-]+)\s*-->/g;
  return {
    name: 'incluir-parciales',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace(patron, (_, ruta) => {
          const archivo = carpetaSrc + ruta;
          return existsSync(archivo) ? readFileSync(archivo, 'utf8') : `<!-- falta el parcial ${ruta} -->`;
        });
      },
    },
    configureServer(servidor) {
      servidor.watcher.add(carpetaSrc + 'secciones');
      servidor.watcher.on('change', (archivo) => {
        if (archivo.endsWith('.html')) servidor.ws.send({ type: 'full-reload' });
      });
    },
  };
}

export default defineConfig({
  // Rutas relativas: GitHub Pages sirve el sitio en una subcarpeta (usuario.github.io/repositorio/).
  // Con './' funciona con cualquier nombre de repositorio y también con un dominio propio.
  base: './',
  plugins: [incluirParciales()],
  server: { port: 5173 },
});
