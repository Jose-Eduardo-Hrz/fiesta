import type { PageServerLoad } from './$types';
import { getEventStats, listFiles, listTables } from '$lib/server/db';

export const load: PageServerLoad = () => {
	return {
		stats: getEventStats(),
		tables: listTables(),
		recent: listFiles({ limit: 12 })
	};
};
