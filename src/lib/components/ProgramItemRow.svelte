<script>
	import { enhance } from '$app/forms';

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

	/** @type {{ item: Item, isPastor: boolean }} */
	let { item, isPastor } = $props();
</script>
                <tr>
                    <td class="border px-2 py-1 text-left align-top">{item.fixed_start ?? ''}</td>
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
					</td>
					{/if}
				</tr>
		