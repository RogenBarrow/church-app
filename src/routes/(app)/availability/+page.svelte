<script>
	import { enhance } from '$app/forms';

	/** @type {import('./$types').PageProps} */
	let { data, form } = $props();
</script>

<h1 class="text-2xl font-bold">My availability</h1>
<p>Add the dates you're <strong>not</strong> available. On all other dates you can be scheduled.</p>

{#if form?.message}
	<p class={form?.success ? 'text-green-700' : 'text-red-600'}>{form.message}</p>
{/if}

<ul class="my-4">
	{#each data.blocks as block}
		<li class="flex items-center gap-2">
			{block.starts_on} – {block.ends_on}
			{#if block.note}· {block.note}{/if}

			<form
				method="POST"
				action="?/delete"
				use:enhance
				onsubmit={(event) => {
					if (!confirm('Remove this blockout date?')) event.preventDefault();
				}}
			>
				<input type="hidden" name="block_id" value={block.id} />
				<button class="text-red-600">✕</button>
			</form>
		</li>
	{:else}
		<li>No blockout dates. You're available every Sunday.</li>
	{/each}
</ul>

<h2 class="font-bold">Add a blockout</h2>
<form method="POST" action="?/add" use:enhance class="flex flex-wrap items-end gap-2">
	<label>
		Start date
		<input type="date" name="starts_on" required />
	</label>
	<label>
		End date
		<input type="date" name="ends_on" required />
	</label>
	<label>
		Note
		<input type="text" name="note" placeholder="Family trip" />
	</label>
	<button>Add</button>
</form>
