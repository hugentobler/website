<script lang="ts">
  let { children, data } = $props();
  console.log(data);
</script>

{@render children()}

<span>content footer</span>
