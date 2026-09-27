<script>
	/** @type {import('./$types').PageProps} */
	let { data, form } = $props();
</script>

<form method="POST">
	<label for="full_name">Full Name</label>
	<input type="text" name="full_name" value={data.profile?.full_name} id="full_name" />
	<label for="phone">Phone</label>
	<input type="text" name="phone" value={data.profile?.phone} id="phone" />
	<button>Save</button>
	{#if form?.success}
		<p class="text-green-600">Saved ✓</p>
	{/if}
	{#if form?.message}
		<p class="text-red-600">{form.message}</p>
	{/if}
</form>
