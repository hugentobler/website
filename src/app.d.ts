// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

declare global {
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
    }
  }
}

export {};
