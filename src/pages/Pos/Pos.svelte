<script lang="ts">
  import { Stores } from '@ikomida/shared-frontend'
  import { Classes } from '@ikomida/shared-types'
  import { onMount } from 'svelte'
  import { getPos } from '../../network/Pos'
  import PosClose from './PosClose.svelte'
  import PosOpen from './PosOpen.svelte'

  let pos: Classes.CPos = Classes.CPos.fromObject({})
  let ready = false

  onMount(async () => {
    pos = await getPos()
    pos = Classes.CPos.fromObject({})
    ready = true
    Stores.Loading.instance.stop()
  })
</script>

{#if ready}
  {#if pos}
    <PosOpen {pos} />
  {:else}
    <PosClose bind:pos />
  {/if}
{/if}

<style>
</style>
