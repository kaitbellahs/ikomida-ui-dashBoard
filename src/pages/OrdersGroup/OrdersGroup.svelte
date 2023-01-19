<script lang="ts">
  import { Stores } from '@ikomida/shared-frontend'
  import { onMount } from 'svelte'

  onMount(() => {
    Stores.Loading.instance.stop()
  })
</script>

<style>
</style>
