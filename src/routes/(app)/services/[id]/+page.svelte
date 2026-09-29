<script>
    /** @type {import('./$types').PageProps} */
let { data } = $props();
</script>

<h1 class="text-2xl font-bold">{data.service.theme ?? data.service.title}</h1>

<p> { data.service.service_date } Program starts at { data.service?.program_starts_at}</p>

<ul>
    {#each data.service.service_assignments as person }
        <li>{person.person_label}:{person.role_name}</li>
    {/each}
</ul>

{#each data.service.service_sections as section}
	<h2 class="mt-6 font-bold">
		{section.title}
		{#if section.leader_label}
			<span> - {section.leader_label}</span>
		{/if}
	</h2>

	<table class="w-full border-collapse text-sm">
		<thead>
			<tr class="bg-gray-800 text-white">
				<th class="border px-2 py-1 text-left align-top">Time</th>
				<th class="border px-2 py-1 text-left align-top">Action</th>
				<th class="border px-2 py-1 text-left align-top">Who</th>
				<th class="border px-2 py-1 text-left align-top">Sound</th>
				<th class="border px-2 py-1 text-left align-top">Screen</th>
				<th class="border px-2 py-1 text-left align-top">Minutes</th>
			</tr>
		</thead>
		<tbody>
			{#each section.service_items as item}
				<tr>
					<td class="border px-2 py-1 text-left align-top">{item.fixed_start ?? ''}</td>
					<td class="whitespace-pre-line border px-2 py-1 text-left align-top">{item.action}</td>
                    <td class="whitespace-pre-line border px-2 py-1 text-left align-top">{item.who}</td>
                    <td class="whitespace-pre-line border px-2 py-1 text-left align-top">{item.sound}</td>
                    <td class="whitespace-pre-line border px-2 py-1 text-left align-top">{item.screen}</td>
                    <td class="whitespace-pre-line border px-2 py-1 text-left align-top">{item.duration_min}</td>
				</tr>
			{:else}
				<tr><td colspan="6">No items in this section</td></tr>
			{/each}
		</tbody>
	</table>
{/each}
