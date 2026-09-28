import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		// Permite probar desde el celular en la misma red: pnpm dev --host
		host: false
	}
});
