<script>
	/** @type {import('./$types').PageProps} */
	let { data } = $props();
</script>

<p>Welcome, {data.user?.email}</p>
<pre>{JSON.stringify(data.profile, null, 2)}</pre>
