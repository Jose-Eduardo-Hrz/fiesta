import type { PageServerLoad } from './$types';
import type { MediaKind } from '$lib/config';
import { countFiles, listFiles } from '$lib/server/db';

const PAGE_SIZE = 48;

export const load: PageServerLoad = ({ url }) => {
	const tipo = url.searchParams.get('tipo');
	const kind: MediaKind | undefined = tipo === 'fotos' ? 'image' : tipo === 'videos' ? 'video' : undefined;

	const total = countFiles({ kind });
	const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const requested = Number(url.searchParams.get('pagina') ?? '1');
	const page = Number.isInteger(requested) ? Math.min(Math.max(requested, 1), pages) : 1;

	return {
		files: listFiles({ kind, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
		filter: tipo === 'fotos' || tipo === 'videos' ? tipo : 'todos',
		page,
		pages,
		total
	};
};
