<script lang="ts">
  import { Stores } from '@ikomida/shared-frontend'
  import { onMount } from 'svelte'
  import type { Classes } from '@ikomida/shared-types'

  export let pos: Classes.CPos

  onMount(() => {
    Stores.Loading.instance.stop()
  })
</script>

<ontainer> caixa </ontainer>

<style>
  ontainer {
    width: 100%;
  }
</style>
