<script lang="ts">
  import ikomidaID from '../../stores/ikomidaID'
  import * as AuthNetwork from '../../network/Auth'
  import Routes from '../../stores/Routes'
  import { Views, Stores, Types } from '@ikomida/shared-frontend'
  import { faPhone, faUnlock, faIdCardAlt } from '@fortawesome/free-solid-svg-icons'
  import { Utils, Network } from '@ikomida/shared-frontend'
  import { registerPushNotificationToken } from '../../network/PushNotification'
  import { onMount } from 'svelte'
  import { Capacitor } from '@capacitor/core'
  import { AppLauncher } from '@capacitor/app-launcher'
  import { Clipboard } from '@capacitor/clipboard'
  import Divider from '@ikomida/shared-frontend/lib/components/Divider.svelte'

  let ikomidaid = 'com.ikomida.br.'
  let ikomidaidInput: Views.TextEdit
  let phone: string
  let password: string
  let isValidPhone = false
  let pushNotificationToken: Stores.PushNotificationToken = Stores.PushNotificationToken.instance

  $: canLogin = isValidPhone

  async function forgotPassword() {
    Stores.Navigation.instance.goTo(Routes.forgotPassword)
  }

  async function newAccount() {
    const url = 'https://ikomida.com/plans'
    const { value } = await AppLauncher.canOpenUrl({ url })
    await AppLauncher.openUrl({ url })
    if (!value) {
      await Clipboard.write({ string: url })
      Stores.MessageAlert.instance.show(
        `Se o navigador externo nao abriu: abra o e digitar essa URL: ${url}, também foi copiado para sua área de transferência para colar-lo!`
      )
    }
  }

  async function doLogin() {
    Stores.Loading.instance.start()
    await ikomidaID.set(ikomidaid)
    Network.instance?.setIkomidaID(ikomidaid)
    const response = await AuthNetwork.doLogin('55', phone, password)
    if (response?.success) {
      const token = await Utils.Jws.extractToken(response?.data)
      if (token !== null) {
        await Stores.Auth.Auth.instance.setToken(response?.data)
        const pNTData = pushNotificationToken.data
        if (pNTData) {
          const pNTObject = Types.Classes.CRegisterPushNotification.init(Capacitor.getPlatform(), pNTData)
          await registerPushNotificationToken(pNTObject)
        }
        Stores.Navigation.instance.reset(Routes.home)
      } else {
        Stores.MessageAlert.instance.show('O token de acesso não é válido')
      }
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  }

  onMount(async () => {
    const value = await ikomidaID.get()
    ikomidaid = value && value !== undefined ? value : ikomidaid
    ikomidaidInput.updateValue(ikomidaid)
    Stores.Loading.instance.stop()
  })
</script>

<main>
  <header class="mainPicture">
    <Views.Image source="assets/icons/transparent-logo-1.svg" name="iKomida" />
  </header>
  <section style="padding-bottom: 64pt;background-color: rgb(223, 223, 223);">
    <small>Digite aqui o ID do seu estabelecimento</small>
    <Views.TextEdit
      bind:value={ikomidaid}
      bind:this={ikomidaidInput}
      initialValue={ikomidaid}
      icon={faIdCardAlt}
      type={Types.TTextEdit.SLUG}
      placeHolder="Id do estabelecimento"
    />
    <Views.TextEdit
      bind:value={phone}
      icon={faPhone}
      type={Types.TTextEdit.PHONE}
      placeHolder="Número de celular"
      bind:isValid={isValidPhone}
    />
    <Views.TextEdit bind:value={password} icon={faUnlock} placeHolder="Sua senha" type={Types.TTextEdit.PASSWORD} />
    <Views.Divider />
    <Views.Button type={Types.TButton.SECONDARY} on:click={doLogin} disabled={!canLogin}>Entrar</Views.Button>
    <Views.Button type={Types.TButton.PRIMARY} on:click={newAccount}>Crie sua conta agora</Views.Button>
    <Views.Button type={Types.TButton.TRANSPARENT} on:click={forgotPassword}>Recuperar a senha</Views.Button>
    <Views.GTerms />
  </section>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    min-width: 90%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    place-content: center;
    height: 100vh;
  }
  header {
    max-height: 260pt;
    max-width: 480pt;
    object-fit: contain;
    width: 100%;
    position: fixed;
    left: 0;
    right: 0;
    top: 48pt;
  }
  header.mainPicture {
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 100%;
  }
  header.mainPicture > :global(img) {
    font-size: 3em;
    width: 100%;
    max-width: 500px;
    line-height: 90px;
    overflow: hidden;
    object-fit: contain;
  }
  section {
    position: absolute;
    padding: 16pt;
    padding-bottom: 64pt;
    left: 0;
    right: 0;
    top: 168pt;
    border-radius: 16pt 16pt 0 0;
    background: #fff;
    box-shadow: 0 -4pt 8pt #0000009e;
    height: fit-content;
    text-align: center;
    min-width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    place-content: center;
  }
</style>
