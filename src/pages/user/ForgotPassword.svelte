<script>
  import { Title, Navigation, Routes, Menu } from "../../stores/Navigation";
  import { Views, Utils } from "@ikomida/components";
  import { StatusBar } from "../../stores/Setup";
  import { faPhone, faUnlock } from "@fortawesome/free-solid-svg-icons";
  import {
    requestPasswordPhoneValidation,
    validatePasswordPhoneValidationCode,
    requestPassword,
  } from "../../network/Auth";
  import { onDestroy } from "svelte";

  const countdownWaitTime = 60;

  let isLoading = false;
  let requestPasswordObject = {
    phone: null,
    phoneValidationCode: null,
    signature: null,
    areaCode: 55,
  };
  let canDigitValidationCode = false;
  let canRequestPassword = false;
  let canRequestCode = false;
  let isValidationValid = false;
  let errorAlert;
  let showAlert = false;
  let timer = null;
  let countdownCanRequestCode = true;
  let countdown = 0;
  let showRequestValidatingCodeAlert = false;

  $: if (countdown === 0) {
    if (timer) {
      clearInterval(timer);
    }
    countdownCanRequestCode = true;
    countdown = countdownWaitTime;
  }

  $: styleHeight = `${Number($StatusBar.height) + 50}px`;

  function toggleshowRequestValidatingCodeAlert() {
    showRequestValidatingCodeAlert = !showRequestValidatingCodeAlert;
  }

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  function validateValidationCode(validationValid) {
    return (validationValid?.length ?? 0) == 4;
  }

  async function requestNewPassword() {
    isLoading = true;
    const response = await requestPassword(requestPasswordObject);
    if (response?.success) {
      Navigation.reset(Routes.login);
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  async function requestPhoneValidation() {
    isLoading = true;
    requestPasswordObject.phone = requestPasswordObject.phone;
    const response = await requestPasswordPhoneValidation(
      requestPasswordObject
    );
    if (response?.success) {
      requestPasswordObject = {
        ...requestPasswordObject,
        signature: response?.data,
      };
      canDigitValidationCode = true;
      countdownCanRequestCode = false;
      countdown = countdownWaitTime;
      timer = setInterval(() => {
        countdown--;
      }, 1000);
      toggleErrorAlert(
        `Digite o código que você receberá em instantes no seu celular no campo seguinte `
      );
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  async function ValidatePhoneCode() {
    isLoading = true;
    const response = await validatePasswordPhoneValidationCode(
      requestPasswordObject
    );
    if (response?.success) {
      canRequestPassword = true;
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  onDestroy(() => {
    if (timer) {
      clearInterval(timer);
    }
  });

  Title.set("Recuperar senha");
</script>

<main
  style="margin-top:{styleHeight};padding: 20px; padding-top: 0; padding-bottom: 0; overflow: hidden;max-width: 100%;height: 100%;"
>
  <Views.Divider />
  <h2>Por favor informe seu número de telefone cadastrado</h2>
  <small
    >clique em "<b>Solicitar</b>" para solicitar o código de validação</small
  >
  <Views.TextEdit
    type="phone"
    bind:value={requestPasswordObject.phone}
    buttonName="Solicitar"
    callback={toggleshowRequestValidatingCodeAlert}
    buttonDisabled={!canRequestCode || !countdownCanRequestCode}
    bind:isValid={canRequestCode}
    placeHolder="Número do telefone"
  />
  {#if !countdownCanRequestCode}
    <small
      >Caso não receber o código, espera {countdown} segundos para solicitar um novo
      código!</small
    >
  {/if}
  <Views.Divider />
  <Views.TextEdit
    type="number"
    bind:value={requestPasswordObject.phoneValidationCode}
    icon={faUnlock}
    mask="_ _ _ _"
    buttonName="Confirmar"
    callback={ValidatePhoneCode}
    buttonDisabled={!isValidationValid}
    disabled={!canDigitValidationCode}
    bind:isValid={isValidationValid}
    validation={validateValidationCode}
    placeHolder="Código de validação"
  />
  <Views.Divider />
  <Views.Divider />
  <Views.Button on:click={requestNewPassword} disabled={!canRequestPassword}
    >Solicitar nova senha</Views.Button
  >
  <Views.GTerms />
  <Views.MessageAlert object={errorAlert} bind:show={showAlert} />
  {#if showRequestValidatingCodeAlert}
    <Views.Alert
      title="Alerta"
      message={`Verifica se seu número de telefone inserido ${Utils.Strings.formatAsPhone(
        requestPasswordObject?.phone
      )} está correto para prosseguir`}
      closeCallBack={toggleshowRequestValidatingCodeAlert}
      buttons={[
        {
          name: "Quero corrigir",
          callback: toggleshowRequestValidatingCodeAlert,
        },
        {
          name: "Está correto",
          callback: requestPhoneValidation,
          principal: true,
        },
      ]}
    />
  {/if}
</main>

<Views.NavigationBar
  {Menu}
  {Title}
  paddingTop={$StatusBar.height}
  {Navigation}
/>
{#if isLoading}
  <Views.Loading />
{/if}

<style>
  main {
    padding: 1em;
    min-width: 90%;
    margin: 0 auto;
  }
  main > h2 {
    text-align: center;
  }
</style>
