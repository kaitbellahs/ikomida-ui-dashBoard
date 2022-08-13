<script>
  import { Auth } from "../../stores/Auth";
  import { updatePassword } from "../../network/Auth";
  import { Title } from "../../stores/Navigation";
  import { Views, Utils, Network } from "@ikomida/components";
  import { getSettings, setSettings } from "../../network/Settings";
  import { StatusBar } from "../../stores/Setup";
  import { onMount } from "svelte";
  let profile = { phone: null, email: null };
  let isLoading = false;
  let errorAlert;
  let showAlert = false;

  let passwordObject = {
    oldPass: null,
    newPass: null,
    reNewPass: null,
  };
  let passwordValidationObject = {
    newPass: false,
    reNewPass: false,
  };

  $: if (profile?.mainPicture) {
    update();
  }

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  async function logout() {
    Auth.setToken(null);
    await Network.instance.clearAllCache();
  }

  async function update() {
    isLoading = true;
    const response = await setSettings(profile);
    if (!response?.success) {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  async function editPassword() {
    if (!passwordValidationObject.newPass) {
      toggleErrorAlert("A nova senha não está correta!");
      return;
    } else if (!passwordValidationObject.reNewPass) {
      toggleErrorAlert("A confirmação da senha não está correta");
      return;
    }
    isLoading = true;
    let response = await updatePassword(passwordObject);
    if (response.success) {
      toggleErrorAlert("A sua senha foi atualizada com sucesso!");
    } else {
      toggleErrorAlert(response?.data);
      isLoading = false;
      return;
    }
    isLoading = false;
  }

  onMount(async () => {
    const response = await getSettings();
    profile = { ...profile, ...response?.profile };
    // emailInput.updateValue(profile?.email);
  });

  Title.set("Perfil");
</script>

<div class="profile">
  <Views.UploadablePhoto
    type="vendor"
    bind:image={profile.mainPicture}
    title={profile?.restaurantName}
  />
  <div class="data">
    <h2>{profile?.restaurantName}</h2>
    <Views.Divider />
    <Views.TextValue
      text="CNPJ:"
      value={Utils?.Strings?.formatString(
        /\d/gi,
        "__.___.___/____-__",
        "_",
        profile?.cnpj
      )}
      fontSize="1.3em"
      leftMargin="30"
    />
    <Views.TextValue
      text="CPF:"
      value={Utils?.Strings?.formatString(
        /\d/gi,
        "___.___.___-__",
        "_",
        profile?.identity
      )}
      fontSize="1.3em"
      leftMargin="30"
    />
    <Views.TextValue
      text="Celular:"
      value={Utils?.Strings?.formatAsPhone(profile?.phone)}
      fontSize="1.3em"
      leftMargin="30"
    />
    <Views.TextValue
      text="Email:"
      value={profile?.email}
      fontSize="1.3em"
      leftMargin="30"
    />
    <!-- <Views.TextEdit
      bind:value={profile.email}
      initialValue={profile?.email}
      icon={faEnvelope}
      placeHolder="Email"
      bind:isValid={validEmail}
      bind:this={emailInput}
    /> -->
    <Views.Divider />
  </div>
  <!-- <Views.Button on:click={update}>Atualizar o email</Views.Button> -->
  <div class="data">
    <h2>Senha</h2>
    <Views.TextEdit
      type="password"
      placeHolder="Senha atual"
      bind:value={passwordObject.oldPass}
    />
    <Views.TextEdit
      type="password"
      placeHolder="Nova senha"
      bind:value={passwordObject.newPass}
      bind:isValid={passwordValidationObject.newPass}
      error="A senha deve ter um tamanho entre 8 e 40 caracteres e contendo no mínimo
      uma letra maiúscula, uma letra minúscula, um número e um símbolo"
    />
    <Views.TextEdit
      type="password"
      placeHolder="Confirmação"
      bind:value={passwordObject.reNewPass}
      bind:isValid={passwordValidationObject.reNewPass}
      validation={(password) => passwordObject.newPass === password}
      error="A confirmação da senha não é válida"
    />
    <Views.Divider />
  </div>
  <Views.Button on:click={editPassword}>Atualizar a senha</Views.Button>
  <Views.Button type="transparent" on:click={logout}>Logout</Views.Button>
</div>
<Views.GTerms />

{#if profile === {} || isLoading}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if}
<Views.MessageAlert object={errorAlert} bind:show={showAlert} />

<style>
  .profile > div {
    width: 100%;
  }
  .profile > div > h2 {
    margin-left: 20px;
  }
  .profile > .data {
    width: 100%;
    float: left;
    margin-top: 20px;
  }

  .profile > .data > h2 {
    text-align: center;
  }
</style>
