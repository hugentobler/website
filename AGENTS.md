# Agent Guidelines

## Build/Test/Lint Commands (Bun Runtime)
- `bun run build` - Build the project
- `bun run dev` - Start development server  
- `bun run lint` - Run Biome linter
- `bun run format` - Format code with Biome
- `bun run check` - TypeScript and Svelte check
- `bun run check:watch` - Watch mode for checks
- `bun run pages:deploy` - Deploy to Cloudflare Pages
- **Note**: Use `bun` instead of `npm` for all commands during runtime transition

## Code Style
- **Indentation**: Tabs (width: 2) as per Biome config
- **Line width**: 100 characters max
- **TypeScript**: Strict mode enabled, prefer type imports
- **Imports**: Use SvelteKit aliases (`$lib/`, `$app/`)
- **Formatting**: Use Biome for all formatting
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Svelte 5**: Use runes (`$state`, `$props`, `$effect`), render blocks with `{@render}`
- **Styling**: Tailwind utilities preferred, use `@apply` for complex styles
- **Comments**: Minimal, only for complex logic or inspiration credits
- **File structure**: Components in `$lib/components/`, routes follow SvelteKit conventions