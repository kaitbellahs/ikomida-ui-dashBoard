<script>
  import { Auth, ikomidaID, PushNotificationToken } from "../../stores/Auth";
  import * as AuthNetwork from "../../network/Auth";
  import { Routes, Navigation } from "../../stores/Navigation";
  import { Views } from "@ikomida/components";
  import {
    faPhone,
    faUnlock,
    faIdCardAlt,
  } from "@fortawesome/free-solid-svg-icons";
  import { Utils, Network } from "@ikomida/components";
  import { registerPushNotificationToken } from "../../network/PushNotification";
  import { onMount } from "svelte";

  let isLoading = false;
  let ikomidaid = "com.ikomida.br.";
  let ikomidaidInput;
  let phone;
  let password;

  let errorAlert;
  let showAlert = false;
  let isValidPhone = false;

  $: canLogin = isValidPhone;

  async function forgotPassword() {
    Navigation.goTo(Routes.forgotPassword);
  }

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  async function doLogin() {
    isLoading = true;
    await ikomidaID.set(ikomidaid);
    Network.instance.setIkomidaID(ikomidaid);
    const response = await AuthNetwork.doLogin(55, phone, password);
    if (response?.success) {
      const token = await Utils.Jws.extractToken(response?.data);
      if (token !== null) {
        Auth.setToken(response?.data);
        if ($PushNotificationToken && $PushNotificationToken !== {}) {
          await registerPushNotificationToken($PushNotificationToken);
        }
        Navigation.reset(Routes.home);
      } else {
        toggleErrorAlert("O token de acesso não é válido");
      }
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  onMount(async () => {
    const value = await ikomidaID.get();
    ikomidaid = value && value !== undefined ? value : ikomidaid;
    ikomidaidInput.updateValue(ikomidaid);
  });
</script>

{#if isLoading}
  <Views.Loading />
{/if}
<main>
  <div class="avatar">
    <img src="/Assets/Icons/transparent-logo-1.svg" alt="iKomida" />
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
    secret={true}
    type="password"
  />
  <div />
  <Views.Button on:click={doLogin} disabled={!canLogin}>Entrar</Views.Button>
  <Views.Button type="transparent" on:click={forgotPassword}
    >Recuperar a senha</Views.Button
  >
  <Views.GTerms />
  <Views.MessageAlert object={errorAlert} bind:show={showAlert} />
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
    max-width: 100%;
    border-radius: 45px;
    line-height: 90px;
    vertical-align: middle;
    display: table-cell;
    overflow: hidden;
  }
</style>
