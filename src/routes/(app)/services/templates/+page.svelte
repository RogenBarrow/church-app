<script>
	/** @type {import('./$types').PageProps} */
	let { data } = $props();
</script>

<h1 class="text-2xl font-bold">Templates</h1>

<a href="/services">← Back to services</a>

<ul>
	{#each data.templates as template}
		<li>
			<a href="/services/{template.id}">{template.title}</a>
		</li>
	{:else}
		<li>
			<p>No templates yet? Open service and click "Save as template".</p>
		</li>
	{/each}
</ul>
