<script>
    /** @type {import('./$types').PageProps} */
	let { data } = $props();
</script>

<h1>Services</h1>


<ul>
{#each data.services as service }
<a href="/services/{service.id}">
    <li>{service.service_date} {service.theme ?? service.title}</li>
</a>

{:else}
	<li>No upcoming services</li>

{/each}
</ul>

