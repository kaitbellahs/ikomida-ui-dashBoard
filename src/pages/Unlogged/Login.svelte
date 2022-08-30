<script>
  import ikomidaID from "../../stores/ikomidaID";
  import * as AuthNetwork from "../../network/Auth";
  import Routes from "../../stores/Routes";
  import { Views, Stores } from "@ikomida/components";
  import {
    faPhone,
    faUnlock,
    faIdCardAlt,
  } from "@fortawesome/free-solid-svg-icons";
  import { Utils, Network } from "@ikomida/components";
  import { registerPushNotificationToken } from "../../network/PushNotification";
  import { onMount } from "svelte";

  let ikomidaid = "com.ikomida.br.";
  let ikomidaidInput;
  let phone;
  let password;
  let isValidPhone = false;
  let pushNotificationToken = Stores.PushNotificationToken.instance.store;

  $: canLogin = isValidPhone;

  async function forgotPassword() {
    Stores.Navigation.instance.goTo(Routes.forgotPassword);
  }

  async function doLogin() {
    Stores.Loading.instance.start();
    await ikomidaID.set(ikomidaid);
    Network.instance.setIkomidaID(ikomidaid);
    const response = await AuthNetwork.doLogin(55, phone, password);
    if (response?.success) {
      const token = await Utils.Jws.extractToken(response?.data);
      if (token !== null) {
        await Stores.Auth.instance.setToken(response?.data);
        if ($pushNotificationToken && $pushNotificationToken !== {}) {
          await registerPushNotificationToken($pushNotificationToken);
        }
        Stores.Navigation.instance.reset(Routes.home);
      } else {
        Stores.MessageAlert.instance.show("O token de acesso não é válido");
      }
    } else {
      Stores.MessageAlert.instance.show(response?.data);
    }
    Stores.Loading.instance.stop();
  }

  onMount(async () => {
    const value = await ikomidaID.get();
    ikomidaid = value && value !== undefined ? value : ikomidaid;
    ikomidaidInput.updateValue(ikomidaid);
    Stores.Loading.instance.stop();
  });
</script>

<main>
  <div class="avatar">
    <img src="/assets/icons/transparent-logo-1.svg" alt="iKomida" />
  </div>
  <small>Digite aqui o ID do seu estabelecimento</small>
  <Views.TextEdit
    bind:value={ikomidaid}
    bind:this={ikomidaidInput}
    initialValue={ikomidaid}
    icon={faIdCardAlt}
    type="slug"
    placeHolder="Id do estabelecimento"
  />
  <Views.TextEdit
    bind:value={phone}
    icon={faPhone}
    type="phone"
    placeHolder="Número de celular"
    bind:isValid={isValidPhone}
  />
  <Views.TextEdit
    bind:value={password}
    icon={faUnlock}
    placeHolder="Sua senha"
    type="password"
  />
  <div />
  <Views.Button on:click={doLogin} disabled={!canLogin}>Entrar</Views.Button>
  <Views.Button type="transparent" on:click={forgotPassword}
    >Recuperar a senha</Views.Button
  >
  <Views.GTerms />
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
  main > div {
    margin-bottom: 30px;
  }
  .avatar {
    display: flex;
    align-items: center;
    flex-direction: column;
  }
  .avatar > img {
    font-size: 3em;
    width: 100%;
    max-width: 500px;
    border-radius: 40px;
    height: 210px;
    line-height: 90px;
    overflow: hidden;
    object-fit: contain;
  }
</style>
