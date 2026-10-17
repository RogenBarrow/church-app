<script>
import ProgramItemRow from '$lib/components/ProgramItemRow.svelte';
import { enhance } from '$app/forms';
import { computeSchedule, toMinutes, formatMinutes, formatDuration, computeProgramEnd } from '$lib/program';
import { page } from '$app/state';
    /** @type {import('./$types').PageProps} */
let { data, form } = $props();
let schedule = $derived(computeSchedule(data.service.program_starts_at, data.service.service_sections));
let programStart = $derived(toMinutes(data.service.program_starts_at));
let programEnd = $derived(computeProgramEnd(programStart, schedule));
let copying = $state(false);
let editingDetails = $state(false);
</script>

{#if form?.message}
	<p class="text-red-600">{form.message}</p>
{/if}

{#if page.url.searchParams.has('copied')}
	<p class="rounded bg-green-100 px-3 py-2 text-green-800">
		✓ Program copied. You are now editing the copy for {data.service.service_date}.
	</p>
{/if}

{#if page.url.searchParams.has('template')}
	<p class="rounded bg-green-100 px-3 py-2 text-green-800">
		✓ Template saved. You are now editing the template.
	</p>
{/if}



{#if data.profile?.role === 'pastor'}
<form
	method="POST"
	action="?/copy"
	class="flex gap-2"
	use:enhance={() => {
		copying = true;                         
		return async ({ update }) => {           
			await update();
			copying = false;
		};
	}}
>
	<input type="date" name="new_date" required />
	<button disabled={copying}>{copying ? 'Copying…' : (data.service.is_template ? 'Use for date' : 'Copy to date')}
</button>
</form>

{/if}

<a href="/services/{data.service.id}/print">Print view</a>

{#if data.service.is_template}
	<h1 class="text-2xl font-bold">Template: {data.service.title}</h1>
{:else}
	<h1 class="text-2xl font-bold">{data.service.theme ?? data.service.title}</h1>
	<p>{data.service.service_date}</p>
{/if}


<p>
	Program: {formatMinutes(programStart)} – {formatMinutes(programEnd)}
	({formatDuration(programEnd - programStart)})
</p>

<ul>
    {#each data.service.service_assignments as person }
        <li>{person.role_name} : {person.person_label}</li>
    {/each}
</ul>

{#if data.profile?.role === 'pastor'}
	{#if editingDetails}
		<form
			method="POST"
			action="?/updateDetails"
			class="my-4 flex flex-col gap-2 rounded border p-4"
			use:enhance={() => {
				return async ({ result, update }) => {
					await update();
					if (result.type === 'success') editingDetails = false;
				};
			}}
		>
			<label>
				Title
				<input type="text" name="title" value={data.service.title} required />
			</label>

			
			<label>
			Theme
				<input type="text" name="theme" value={data.service.theme ?? ''}>
			</label> 

			{#if !data.service.is_template}
				
				<label>
				Date
					<input type="date" name="service_date" value={data.service.service_date} required>
				</label>

			{/if}

				 <label>
					Program starts at
					<input type="time" name="program_starts_at" value={data.service.program_starts_at.slice(0, 5)} required>
				 </label>

			<h3 class="font-bold">Key people</h3>
			{#each data.service.service_assignments as person}
				<input type="hidden" name="assignment_id" value={person.id} />
				<label>
					{person.role_name}
					<input type="text" name="person_label" value={person.person_label ?? ''} />
				</label>
			{/each}

			<div class="flex gap-2">
				<button>Save</button>
				<button type="button" onclick={() => (editingDetails = false)}>Cancel</button>
			</div>
		</form>
	{:else}
	<button type="button" onclick={() => (editingDetails = true)}>Edit details</button>
	{/if}
{/if}


{#each data.service.service_sections as section}
	<h2 class="mt-6 font-bold">
		{section.title}
		{#if section.leader_label}
			<span> - {section.leader_label}</span>
		{/if}
	</h2>
	{#if data.profile?.role === 'pastor'}
<form method="POST" action="?/deleteSection" use:enhance onsubmit={(event) => {
	if (!confirm('Delete this section and all its items?')) event.preventDefault();
}}>
<input type="hidden" name="section_id" value={section.id}>
<button>Delete section</button>
</form>
{/if}

	<table class="w-full border-collapse text-sm">
		<thead>
			<tr class="bg-gray-800 text-white">
				<th class="border px-2 py-1 text-left align-top">Time</th>
				<th class="border px-2 py-1 text-left align-top">Action</th>
				<th class="border px-2 py-1 text-left align-top">Who</th>
				<th class="border px-2 py-1 text-left align-top">Sound</th>
				<th class="border px-2 py-1 text-left align-top">Screen</th>
				<th class="border px-2 py-1 text-left align-top">Minutes</th>
				<th class="border px-2 py-1 text-left align-top"></th>
			</tr>
		</thead>
		<tbody>
			{#each section.service_items as item}
				<ProgramItemRow {item} time={schedule[item.id]} isPastor={data.profile?.role === 'pastor'}/>
			{:else}
				<tr><td colspan="7">No items in this section</td></tr>
			{/each}
		</tbody>
	</table>
    {#if data.profile?.role === 'pastor'}
	<form method="POST" action="?/addItem" use:enhance class="mt-2 flex flex-wrap gap-2">
		<input type="hidden" name="section_id" value={section.id} />
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
<input type="text" name="title" placeholder="title">
<input type="text" name="leader_label" placeholder="leader">
<button>Add section</button>
</form>
{/if}

{#if data.profile?.role === 'pastor' && !data.service.is_template}
	<form method="POST" action="?/saveTemplate" use:enhance class="flex gap-2">
		<input type="text" name="title" placeholder="Template name, e.g. Regular Sunday" required />
		<button>Save as template</button>
	</form>
{/if}

{#if data.profile?.role === 'pastor'}
	<form
		method="POST"
		action="?/deleteService"
		use:enhance
		onsubmit={(event) => {
			if (!confirm('Delete this whole service, with all its sections and items? This cannot be undone.')) event.preventDefault();
		}}
		class="mt-10"
	>
		<button class="text-red-600">Delete service</button>
	</form>
{/if}



