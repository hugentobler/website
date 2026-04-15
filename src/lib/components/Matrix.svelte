<!--
	2×2 matrix with axis labels wrapping all four sides. Renders a 4×4
	HTML table using rowspan/colspan for the outer label cells. The four
	inner data cells form a 2×2 grid where the row dimension is the
	top↔bottom axis and the column dimension is the left↔right axis.

	Usage:
		{% matrix
			top="Easy to verify"
			bottom="Hard to verify"
			left="Low autonomy"
			right="High autonomy"
			topLeft="..."
			topRight="..."
			bottomLeft="..."
			bottomRight="..." /%}
-->
<script lang="ts">
	let {
		top,
		bottom,
		left,
		right,
		topLeft,
		topRight,
		bottomLeft,
		bottomRight,
	}: {
		top: string;
		bottom: string;
		left: string;
		right: string;
		topLeft: string;
		topRight: string;
		bottomLeft: string;
		bottomRight: string;
	} = $props();
</script>

<table class="matrix">
	<colgroup>
		<col style="width: 18%" />
		<col style="width: 32%" />
		<col style="width: 32%" />
		<col style="width: 18%" />
	</colgroup>
	<tbody>
		<tr>
			<td class="corner"></td>
			<th class="axis axis-h" colspan="2">{top}</th>
			<td class="corner"></td>
		</tr>
		<tr>
			<th class="axis axis-v" rowspan="2">{left}</th>
			<td class="cell">{topLeft}</td>
			<td class="cell">{topRight}</td>
			<th class="axis axis-v" rowspan="2">{right}</th>
		</tr>
		<tr>
			<td class="cell">{bottomLeft}</td>
			<td class="cell">{bottomRight}</td>
		</tr>
		<tr>
			<td class="corner"></td>
			<th class="axis axis-h" colspan="2">{bottom}</th>
			<td class="corner"></td>
		</tr>
	</tbody>
</table>

<style>
	.matrix {
		width: 100%;
		margin: var(--baseline) 0;
		font-size: var(--type-sm);
		line-height: var(--leading-sm);
		table-layout: fixed;
		border-collapse: collapse;
		border: 1px solid var(--color-charcoal-100);
	}

	.matrix :global(td),
	.matrix :global(th) {
		padding: calc(var(--baseline) / 4) calc(var(--baseline) / 2);
		vertical-align: middle;
		text-indent: 0;
		border: 1px solid var(--color-charcoal-100);
	}

	/* Four blank outer corners — fully borderless so the label cells
	   next to them appear flush against the outer table edge. */
	table.matrix td.corner {
		border: none;
	}

	/* Horizontal axis labels (top/bottom) should have no left/right
	   borders so they read as a single label across the column pair. */
	table.matrix th.axis-h {
		border-right: none;
		border-left: none;
	}

	/* Vertical axis labels (left/right) should have no top/bottom
	   borders so they read as a single label across the row pair. */
	table.matrix th.axis-v {
		border-top: none;
		border-bottom: none;
	}

	table.matrix th.axis {
		font-weight: 600;
		text-align: center;
	}

	table.matrix td.cell {
		vertical-align: top;
		text-align: left;
	}
</style>
