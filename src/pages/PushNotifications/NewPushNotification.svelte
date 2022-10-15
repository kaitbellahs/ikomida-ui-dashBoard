<script lang="ts">
  import Fa from 'svelte-fa'
  import { faRocket } from '@fortawesome/free-solid-svg-icons'
  import { StatusBar } from '../../stores/Setup'
  import { Views, Utils, Stores, Types, Network } from '@ikomida/shared-frontend'
  import { newPushNotification } from '../../network/PushNotification'
  import { onMount } from 'svelte'

  let item = {
    title: undefined,
    body: undefined
  }

  let itemsValidation = {
    title: false,
    body: false
  }

  $: canContinue = Utils.Objects.validateFields(itemsValidation)

  const submit = async () => {
    Stores.Loading.instance.start()
    let response
    response = await newPushNotification(item)
    if (response?.success) {
      await Network.instance?.clearCache(Stores.Cache.Types.PUSH_NOTIFICATIONS)
      Stores.Navigation.instance.pop(1)
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  }

  onMount(() => {
    Stores.Loading.instance.stop()
  })

  Stores.Title.instance.set('Novo cupom')
</script>

<div class="pushNotification">
  <Views.TextEdit placeHolder="Título" bind:value={item.title} bind:isValid={itemsValidation.title} min={3} max={55} />
  <Views.TextEdit
    type={Types.TTextEdit.TEXT}
    placeHolder="texto"
    bind:value={item.body}
    bind:isValid={itemsValidation.body}
    min={1}
    max={255}
  />
  <Views.Divider />
  <Views.Button disabled={!canContinue} on:click={submit} bottomPadding={$StatusBar.bottomPadding}
    ><Fa icon={faRocket} /> <span>Enviar</span></Views.Button
  >
</div>

<style>
  .pushNotification {
    padding-bottom: 50px;
  }
</style>
