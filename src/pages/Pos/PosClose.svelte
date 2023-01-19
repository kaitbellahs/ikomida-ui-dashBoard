<script lang="ts">
  import { Stores, Types, Utils, Views } from '@ikomida/shared-frontend'
  import { onMount } from 'svelte'
  import { Classes } from '@ikomida/shared-types'

  export let pos: Classes.CPos
  let localPos: Classes.CPos
  function openPos() {
    console.log('localPos:', localPos)
  }
  onMount(() => {
    if (pos) {
      localPos = Classes.CPos.fromObject(pos.toJSON())
    } else {
      localPos = Classes.CPos.fromObject({ openBalance: 0, user: Classes.CUser.fromObject({}) })
    }
    Stores.Loading.instance.stop()
  })
</script>

<container>
  {#if localPos && pos}
    <Views.TextValue text="Data de abertura" value={Utils.Strings.dateToDateString(pos.createdAt)} />
    <Views.TextValue text="Data de fechamento" value={Utils.Strings.dateToDateString(pos.closeDate)} />
    <Views.TextValue text="Saldo inicial" value={Utils.Strings.currency(pos.openBalance)} />
    <Views.TextValue text="Saldo final" value={Utils.Strings.currency(pos.closeBalance)} />
    <!-- <Views.TextValue text="Total de vendas" value={Utils.Strings.currency(pos.createdAt)} />
    <Views.TextValue text="Total de vendas" value={Utils.Strings.currency(pos.createdAt)} /> -->
  {:else if localPos}
    <h2>Abrir caixa</h2>
    <Views.TextEdit placeHolder="Saldo inicial" bind:value={localPos.openBalance} type={Types.TTextEdit.CURRENCY} />
    <!-- <Views.TextEdit placeHolder="PIN do operador" bind:value={localPos.user?.pin} type={Types.TTextEdit.PASSWORD} /> -->
    <Views.Divider height={16} />
    <Views.Button on:click={openPos}>Abrir caixa</Views.Button>
  {/if}
</container>

<style>
</style>
