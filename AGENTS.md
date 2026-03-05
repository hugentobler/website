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
- **Svelte 5**: Use runes (`$state`, `$props`, `$effect`), render blocks with `{@render}`- **Comments**: Minimal, only for complex logic or inspiration credits
- **File structure**: Components in `$lib/components/`, routes follow SvelteKit conventions

# MCP Guidelines

## Available Svelte MCP Tools:

1. list-sections
Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths. When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

2. get-documentation
Retrieves full documentation content for specific sections. Accepts single or multiple sections. After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user’s task.

3. svelte-autofixer
Analyzes Svelte code and returns issues and suggestions. You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

4. playground-link
Generates a Svelte Playground link with the provided code. After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

If your MCP client supports it, we also recommend using the svelte-task prompt to instruct the LLM on the best way to use the MCP server.
