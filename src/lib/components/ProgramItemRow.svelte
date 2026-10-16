<script>
	import { enhance } from '$app/forms';
	import { formatMinutes } from '$lib/program';
	

	/**
	 * @typedef {Object} Item
	 * @property {string} id
	 * @property {string | null} fixed_start
	 * @property {number | null} duration_min
	 * @property {string} action
	 * @property {string | null} who
	 * @property {string | null} sound
	 * @property {string | null} screen
	 */


	/** @type {{ item: Item, time: { start: number, end: number }, isPastor: boolean }} */
	let { item, time, isPastor } = $props();


	let editing = $state(false);
</script>


 {#if editing}
 <tr>
 <td colspan="7" class="border px-2 py-2">
	<form
		method="POST"
		action="?/updateItem"
		class="flex flex-wrap gap-2"
		use:enhance={() => {
			return async ({ result, update }) => {
				await update();
				if (result.type === 'success') editing = false;
			};
		}}
	>
		<input type="hidden" name="item_id" value={item.id} />


		<input type="time" name="fixed_start" value={item.fixed_start?.slice(0, 5) ?? ''}>
		<textarea name="action" value={item.action}></textarea>
		<input type="text" name="who" value={item.who ?? ''}>
		<input type="text" name="sound" value={item.sound ?? ''}>
		<input type="text" name="screen" value={item.screen ?? ''} min="0">
		<input type="number" name="duration_min" value={item.duration_min ?? ''}>

		<button>Save</button>
		<button type="button" onclick={() => (editing = false)}>Cancel</button>
	</form>
</td>
</tr>
 {:else}

                <tr>
                    <td class="border px-2 py-1 text-left align-top">
					{#if item.duration_min}
						{formatMinutes(time.start)} – {formatMinutes(time.end)}
					{:else}
						{formatMinutes(time.start)}
					{/if}
					{#if item.fixed_start}
					<span title="Fixed time">📌</span>
					{/if}
					
				</td>
					<td class="whitespace-pre-line border px-2 py-1 text-left align-top">{item.action}</td>
                    <td class="whitespace-pre-line border px-2 py-1 text-left align-top">{item.who}</td>
                    <td class="whitespace-pre-line border px-2 py-1 text-left align-top">{item.sound}</td>
                    <td class="whitespace-pre-line border px-2 py-1 text-left align-top">{item.screen}</td>
                    <td class="whitespace-pre-line border px-2 py-1 text-left align-top">{item.duration_min}</td>
                    {#if isPastor}
					<td class="border px-2 py-1">
						<form
							method="POST"
							action="?/deleteItem"
							use:enhance
							onsubmit={(event) => {
								if (!confirm('Delete this item?')) event.preventDefault();
							}}
						>
							<input type="hidden" name="item_id" value={item.id} />
							<button class="text-red-600">✕</button>
						</form>
					<form method="POST" action="?/moveItem" use:enhance>
					<input type="hidden" name="item_id" value={item.id}>
					<button name="direction" value="up">↑</button>
					<button name="direction" value="down">↓</button>
					</form>
					<button type="button" onclick={() => (editing = true)}>Edit</button>
					</td>
					{/if}
				</tr>
				{/if}