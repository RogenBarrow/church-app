<script>

/** @type {import('./$types').PageProps} */
let { form } = $props();

</script>


<form method="POST">
<label for="service_date" >Date</label>
<input type="date" name="service_date" id="service_date">
<label for="theme"  >Theme</label>
<input type="text" id="theme">
<label for="program_starts_at" >Program starts at:</label>
<input type="time" name="program_starts_at" value="08:30" id="program_starts_at" >
<label for="coordinator"  >Coordinator</label>
<input type="text" name="coordinator" id="coordinator">
<label for="preacher" >Preacher</label>
<input type="text" name="preacher" id="preacher">
<label for="open_church">Open church</label>
<input type="text" name="open_church" id="open_church">
<label for="close_church" >Close church</label>
<input type="text" name="close_church" id="close_church">
<button>Create</button>
{#if form?.message}
    <p>{ form.message }</p>
{/if}
</form>