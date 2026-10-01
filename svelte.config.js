import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// adapter-node: servidor Node propio, necesario para recibir archivos
		// grandes en streaming y escribirlos en disco.
		adapter: adapter({ out: 'build', precompress: true }),
		// El sitio se publica bajo este prefijo (p. ej. https://dominio/pagina_temporal).
		paths: {
			base: '/pagina_temporal'
		},
		// La comprobación CSRF propia de SvelteKit compara la cabecera Origin, que
		// algunos túneles y proxies (p. ej. VS Code Dev Tunnels) reescriben. La
		// reemplazamos por una basada en Sec-Fetch-Site en src/hooks.server.ts.
		csrf: {
			trustedOrigins: ['*']
		},
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'script-src': ['self'],
				'style-src': ['self', 'unsafe-inline'],
				'img-src': ['self', 'data:', 'blob:'],
				'media-src': ['self', 'blob:'],
				'font-src': ['self', 'data:'],
				'connect-src': ['self'],
				'object-src': ['none'],
				'base-uri': ['self'],
				'form-action': ['self'],
				'frame-ancestors': ['none']
			}
		}
	}
};

export default config;
