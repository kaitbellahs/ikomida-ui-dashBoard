<script lang="ts">
  import { Views, Stores, Types } from '@ikomida/shared-frontend'
  import { getApp, updateApp } from '../../network/App'
  import { onMount } from 'svelte'
  import Status from '@ikomida/shared-frontend/lib/components/Status.svelte'

  let apps: Types.Classes.CApp[] = []
  let appValidation = {
    icon: false,
    description: false
  }

  $: {
    appValidation.icon = !!apps?.[0]?.icon
  }

  async function updateAppValues() {
    Stores.Loading.instance.start()
    const response = await updateApp(apps)
    if (response.success) {
      Stores.MessageAlert.instance.show(
        'Os dados do seu app foram atualizados com sucesso, agora é só aguardar que a próxima atualização do seu app vai vir com os novos dados.'
      )
    } else {
      Stores.MessageAlert.instance.show(response.data)
    }
    Stores.Loading.instance.stop()
  }

  onMount(async () => {
    const response = await getApp()
    if (response.success) {
      apps = Types.Classes.CApp.fromObject(response.data)
    } else {
      Stores.MessageAlert.instance.show(response.data)
    }
    Stores.Loading.instance.stop()
  })

  Stores.Title.instance.set('Seus ajustes')
</script>

{#if apps?.length === 2}
  <Views.Divider />
  <h2>Meu app: <b>{apps?.[0].displayName}</b></h2>
  <Views.Divider />
  <div class="shadow data">
    <box><b>iOS Link:&nbsp;</b>{apps?.[0].iosLink ?? 'Em preparação.'} </box>
    <box><b>Android Link:&nbsp;</b>{apps?.[1].androidLink ?? 'Em preparação.'}</box>
  </div>
  <Views.Divider />
  <qrcode class="shadow data">
    <h3>Android App QrCode</h3>
    <Views.Divider height={8} />
    {#if apps?.filter(app => {
      return app.platform === 'android'
    })?.[0].androidLink}
      <qrCodeImage />
    {:else}
      <Views.Status>QrCode não está disponível por enquanto.</Views.Status>
    {/if}
    <Views.Divider />
    <h3>iOS App QrCode</h3>
    <Views.Divider height={8} />
    {#if apps?.filter(app => {
      return app.platform === 'ios'
    })?.[0].androidLink}
      <qrCodeImage />
    {:else}
      <Views.Status>QrCode não está disponível por enquanto.</Views.Status>
    {/if}
  </qrcode>
  <Views.Divider />
  <h2>Escolha icone do seu app.</h2>
  <Views.Divider />
  <Views.UploadablePhoto bind:image={apps[0].icon} name={apps?.[0].displayName} />
  <Views.Divider />
  <div class="shadow data">
    <h2>Escolha a descrição do seu app.</h2>
    <Views.TextEdit
      placeHolder="Descrição do app"
      bind:isValid={appValidation.description}
      min={100}
      max={3500}
      bind:value={apps[0].description}
      initialValue={apps?.[0].description}
      type={Types.TTextEdit.TEXT}
    />
    <Views.Divider />
    <Views.Button disabled={!(appValidation.icon && appValidation.description)} on:click={updateAppValues}
      >Atualizar</Views.Button
    >
  </div>
{:else}
  <Views.CentredMessage text="Não foi possível baixar os dados do seu app, tente novamente." />
{/if}

<style>
  .data {
    padding: 16pt;
    border-radius: 8pt;
  }
  box {
    display: flex;
    width: 100%;
  }
</style>
