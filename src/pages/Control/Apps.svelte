<script lang="ts">
  import { Views, Stores, Types } from '@ikomida/shared-frontend'
  import { getApp, updateApp, getIcon } from '../../network/Apps'
  import { onMount } from 'svelte'
  import QRCode from 'easyqrcodejs'

  const logo = getIcon()

  let apps: Types.Classes.CApp[] = []
  let appValidation = {
    icon: false,
    description: false
  }
  let androidQrCode: string
  let androidQrCodeContainer: HTMLElement
  let iosQrCode: string
  let iosQrCodeContainer: HTMLElement

  let androidApp: Types.Classes.CApp
  let iosApp: Types.Classes.CApp

  $: {
    appValidation.icon = !!androidApp?.icon
    if (apps.length === 2) {
      androidApp = apps?.filter(app => {
        return app.platform === 'android'
      })?.[0]
      iosApp = apps?.filter(app => {
        return app.platform === 'ios'
      })?.[0]
    }
  }

  $: if (androidApp?.androidLink) {
    const options = {
      logo,
      logoWidth: 48,
      logoHeight: 48,
      logoBackgroundColor: '#fffff',
      maxWidth: 256,
      maxHeight: 256,
      text: androidApp?.androidLink,
      onRenderingEnd: (options: any, dataURL: string) => {
        androidQrCode = dataURL
        androidQrCodeContainer.style.display = 'none'
        androidQrCodeContainer.remove()
      }
    }
    androidQrCodeContainer = document.createElement('div')
    androidQrCodeContainer.style.visibility = 'hidden'
    androidQrCodeContainer.style.display = 'block'
    new QRCode(androidQrCodeContainer, options)
  }

  $: if (iosApp?.iosLink) {
    const options = {
      logo,
      logoWidth: 48,
      logoHeight: 48,
      logoBackgroundColor: '#fffff',
      maxWidth: 256,
      maxHeight: 256,
      text: androidApp?.iosLink,
      onRenderingEnd: (options: any, dataURL: string) => {
        iosQrCode = dataURL
        iosQrCodeContainer.style.display = 'none'
        iosQrCodeContainer.remove()
      }
    }
    iosQrCodeContainer = document.createElement('div')
    iosQrCodeContainer.style.visibility = 'hidden'
    iosQrCodeContainer.style.display = 'block'
    new QRCode(iosQrCodeContainer, options)
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
  <Views.ExpandableBox title="Meus apps">
    <Views.Divider />
    <div class="shadow data">
      <box><b>Android Link:&nbsp;</b>{androidApp.iosLink ?? 'Em preparação.'} </box>
      <box><b>iOS Link:&nbsp;</b>{iosApp.androidLink ?? 'Em preparação.'}</box>
    </div>
    <Views.Divider />
    <qrcode class="shadow data">
      <h3>Android App QrCode</h3>
      <Views.Divider height={8} />
      {#if androidApp?.androidLink}
        <Views.Image source={androidQrCode} />
      {:else}
        <Views.Status>QrCode não está disponível por enquanto.</Views.Status>
      {/if}
      <Views.Divider />
      <h3>iOS App QrCode</h3>
      <Views.Divider height={8} />
      {#if iosApp?.iosLink}
        <Views.Image source={iosQrCode} />
      {:else}
        <Views.Status>QrCode não está disponível por enquanto.</Views.Status>
      {/if}
    </qrcode>
  </Views.ExpandableBox>
  <Views.ExpandableBox title="Configure a loja de apps">
    <Views.Divider />
    <Views.UploadablePhoto bind:image={androidApp.icon} name={androidApp.displayName} />
    <Views.Divider />
    <div class="shadow data">
      <h2>Escolha a descrição do seu app.</h2>
      <Views.TextEdit
        placeHolder="Descrição do app"
        bind:isValid={appValidation.description}
        min={100}
        max={3500}
        bind:value={androidApp.description}
        initialValue={androidApp.description}
        type={Types.TTextEdit.TEXT}
      />
      <Views.Divider />
      <Views.Button disabled={!(appValidation.icon && appValidation.description)} on:click={updateAppValues}
        >Atualizar</Views.Button
      >
    </div>
  </Views.ExpandableBox>
{:else}
  <Views.CentredMessage text="Não foi possível baixar os dados do seu app, tente novamente." />
{/if}

<style>
  .data {
    padding: 16px;
    border-radius: 8px;
  }
  box {
    display: flex;
    width: 100%;
  }
</style>
