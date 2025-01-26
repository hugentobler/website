<script lang="ts">
  let { children, data } = $props();
  console.log(data);
</script>

{@render children()}

<span>I am the default layout</span>
