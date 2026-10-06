<script>
import { enhance } from '$app/forms';
    /** @type {import('./$types').PageProps} */
let { data, form } = $props();
</script>

{#if form?.message}
	<p class="text-red-600">{form.message}</p>
{/if}


<h1 class="text-2xl font-bold">{data.service.theme ?? data.service.title}</h1>

<p> { data.service.service_date } Program starts at { data.service?.program_starts_at}</p>

<ul>
    {#each data.service.service_assignments as person }
        <li>{person.role_name} : {person.person_label}</li>
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
    {#if data.profile?.role === 'pastor'}
	<form method="POST" action="?/addItem" use:enhance class="mt-2 flex flex-wrap gap-2">
		<input type="hidden" name="section_id" value={section.id} />
		<input type="hidden" name="position" value={section.service_items.length + 1} />
        <input type="time" name="fixed_start" placeholder="Time">
        <input type="text" name="who" placeholder="Who">
        <input type="text" name="sound" placeholder="Sound">
        <input type="text" name="screen" placeholder="Screen">
        <input type="number" name="duration_min" placeholder="Minutes" min="0">
        <textarea name="action" placeholder="Action / song" rows="2"></textarea>
		<button>Add item</button>
	</form>
{/if}

{/each}
{#if data.profile?.role === 'pastor'}
<form method="POST" action="?/addSection" use:enhance>
<input type="hidden" name="position" value="{data.service.service_sections.length + 1}">
<input type="text" name="title" placeholder="title">
<input type="text" name="leader_label" placeholder="leader">
<button>Add section</button>
</form>
{/if}
