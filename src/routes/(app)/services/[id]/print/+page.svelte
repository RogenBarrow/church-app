<script>
	import ProgramItemRow from '$lib/components/ProgramItemRow.svelte';
	import {
		computeSchedule,
		computeProgramEnd,
		toMinutes,
		formatMinutes,
		formatDuration
	} from '$lib/program';

	/** @type {import('./$types').PageProps} */
	let { data } = $props();

	let schedule = $derived(
		computeSchedule(data.service.program_starts_at, data.service.service_sections)
	);
	let programStart = $derived(toMinutes(data.service.program_starts_at));
	let programEnd = $derived(computeProgramEnd(programStart, schedule));
</script>

<button class="print:hidden" type="button" onclick={() => window.print()}>Print</button>

<!-- ── HEADER (like the top of your Excel sheet) ── -->
<h1 class="text-xl font-bold">Service program</h1>
<p>
	{data.service.service_date} · {data.service.theme ?? data.service.title}
	· {formatMinutes(programStart)} – {formatMinutes(programEnd)}
	({formatDuration(programEnd - programStart)})
</p>

<ul>
	{#each data.service.service_assignments as person}
		<li>{person.role_name}: {person.person_label}</li>
	{/each}
</ul>

<!-- ── ONE TABLE for the whole program ── -->
<table class="w-full border-collapse text-sm print:text-xs">
	<thead>
		<tr>
			<th class="border px-2 py-1 text-left align-top">Time</th>
			<th class="border px-2 py-1 text-left align-top">Action</th>
			<th class="border px-2 py-1 text-left align-top">Who</th>
			<th class="border px-2 py-1 text-left align-top">Sound</th>
			<th class="border px-2 py-1 text-left align-top">Screen</th>
			<th class="border px-2 py-1 text-left align-top">Minutes</th>
		</tr>
	</thead>
	<tbody>
		{#each data.service.service_sections as section}
			<!-- The dark section row, spanning all 6 columns -->
			<tr class="break-inside-avoid bg-gray-800 text-white">
				<td colspan="6" class="px-2 py-1 font-bold">
					{section.title}
					{#if section.leader_label}
						<span> - {section.leader_label}</span>
					{/if}
				</td>
			</tr>

			{#each section.service_items as item}
				<ProgramItemRow {item} time={schedule[item.id]} isPastor={false} />
			{/each}
		{/each}
	</tbody>
</table>
