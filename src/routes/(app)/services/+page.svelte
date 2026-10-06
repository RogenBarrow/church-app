<script>
    /** @type {import('./$types').PageProps} */
	let { data } = $props();
</script>

<h1>Services</h1>


<ul>
{#each data.services as service }
    <li><a href="/services/{service.id}">{service.service_date} {service.theme ?? service.title}</a></li>
{:else}
	<li>No upcoming services</li>

{/each}
</ul>

