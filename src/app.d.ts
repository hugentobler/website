// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

declare global {
	// Cloudflare Workers extends CacheStorage with a default cache instance.
	interface CacheStorage {
		default: Cache;
	}

	// Build-time constant injected by Vite's define config.
	const __BUILD_TIMESTAMP__: string;

	namespace App {
		interface Error {
			message: string;
			json?: Record<string, any>;
		}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				DB: D1Database;
			};
			cf: CfProperties;
			ctx: ExecutionContext;
			caches: CacheStorage & { default: Cache };
		}
	}
}

export {};
