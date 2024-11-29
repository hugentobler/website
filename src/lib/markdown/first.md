---
title: Svex up your markdown
count: 25
color: cadetblue
list: [1, 2, 3, 4, "boo"]
---

<script>
	let number = 45;
</script>

# { title }

## Good stuff in your markdown

Markdown is pretty good but sometimes you just need more.

Sometimes you need a {number} like this:

<ul>
{#each list as item}
  <li>{item}</li>
{/each}
</ul>
