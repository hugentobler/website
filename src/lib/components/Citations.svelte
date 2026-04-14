<!--
	Citations section for articles. Wraps {% cite %} entries in a numbered list.
	Use {% ref n=1 /%} inline to insert a superscript that smooth-scrolls here.

	Usage:
		{% citations %}
		{% cite n=1 %}Hannah Arendt, ["Labor, Work, Action"](url) (1964).{% /cite %}
		{% cite n=2 %}George Hotz, [LinkedIn](url) (2026). "Hello corporate participant."{% /cite %}
		{% /citations %}

	Link wraps the title of the cited work.
-->
<script lang="ts">
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
</script>

<section class="citations">
	<ol>{@render children()}</ol>
</section>

<style>
	.citations {
		padding: var(--baseline);
		margin: calc(var(--baseline) * 2) calc(-1 * var(--baseline));
		background-color: var(--color-charcoal-50);

		ol {
			padding-left: 2ch;
			list-style: decimal;
		}

		:global(li)::marker {
			font-size: var(--type-sm);
			font-weight: 500;
			font-stretch: expanded;
		}
	}
</style>
