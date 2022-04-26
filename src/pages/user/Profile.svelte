<script>
  import { Auth } from "../../stores/Auth";
  import { updatePassword } from "../../network/Auth";
  import { Title } from "../../stores/Navigation";
  import { Views } from "@tian/components";
  import { getSettings, setSettings } from "../../network/Settings";
  import { StatusBar } from "../../stores/Setup";
  import Fa from "svelte-fa";
  import {
    faPhone,
    faAt,
    faKey,
    faEnvelope,
  } from "@fortawesome/free-solid-svg-icons";
  import { onMount } from "svelte";
  let profile = {phone: null, email: null};
  let validPhone = false;

  let isLoading = false;
  let errorAlert;
  let showAlert = false;

let passwordObject = {
  oldPass: null,
  newPass: null,
  reNewPass: null,
};

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  onMount(async () => {
    const response = await getSettings();
    profile = {...profile, ...response?.profile};
  });

  function logout() {
    Auth.setToken(null);
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
  if (passwordObject.oldPass === null || passwordObject.oldPass.length < 6) {
    toggleErrorAlert("Senha atual invalida!");
    return;
  } else if (
    passwordObject.newPass === null ||
    passwordObject.newPass.length < 6
  ) {
    toggleErrorAlert("A nova senha invalida!");
    return;
  } else if (passwordObject.newPass !== passwordObject.reNewPass) {
    toggleErrorAlert("Senha nova e verifição não confirem");
    return;
  }
  isLoading = true;
  let response = await updatePassword(passwordObject);
  if (response.success) {
    toggleErrorAlert("Senha atualizada com sucesso!");
  } else {
    toggleErrorAlert(response?.data);
    isLoading = false;
    return;
  }
  isLoading = false;
}

  Title.set("Perfil");
</script>

  <div class="profile">
    {#if profile?.mainPicture}
      <img
        class="avatarCircle"
        src={profile?.mainPicture}
        alt={profile?.restaurantName}
      />
    {:else}
      <div class="avatarCircle">
        {profile?.restaurantName?.[0]}{profile?.restaurantName?.[1]}
      </div>
    {/if}
    <div class="data">
      <Views.TextValue
        text="Nome:"
        value={profile?.restaurantName}
        fontSize="1.5em"
      />
      <Views.TextValue
        text="CNPJ:"
        value={profile?.identity}
        fontSize="1.5em"
      />
      <Views.TextEdit
        bind:rawValue={profile.phone}
        bind:value={profile.phone}
        icon={faPhone}
        type="phone"
        placeHolder="Celular:"
        bind:isValid={validPhone}
      />
      <Views.TextEdit
        bind:rawValue={profile.email}
        bind:value={profile.email}
        icon={faEnvelope}
        placeHolder="Email:"
        bind:isValid={validPhone}
      />
      <Views.Divider />
      <Views.Button on:click={update}>Atualizar os dados</Views.Button>
      <Views.Divider />
      <h2>Senha</h2>
      <Views.TextEdit
        name="Senha atual:"
        bind:value={passwordObject.oldPass}
        secret={true}
        placeHolder=""
      />
      <Views.TextEdit
        name="Nova senha:"
        bind:value={passwordObject.newPass}
        secret={true}
        placeHolder=""
      />
      <Views.TextEdit
        name="Confirmação:"
        bind:value={passwordObject.reNewPass}
        secret={true}
        placeHolder=""
      />
      <Views.Divider />
      <Views.Button on:click={editPassword}>Atualizar senha</Views.Button>
    </div>
    <Views.Button type="transparent" on:click={logout}>Logout</Views.Button>
  </div>

  {#if profile === {} || isLoading}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if}
<Views.MessageAlert object={errorAlert} bind:show={showAlert} />

<style>
  .profile {
    padding-bottom: 50px;
  }
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
  .avatarCircle {
    font-size: 3em;
    height: 90px;
    width: 90px;
    background: #ccc;
    border-radius: 45px;
    float: left;
    line-height: 90px;
    text-align: center;
    vertical-align: middle;
    display: table-cell;
    overflow: hidden;
    margin-right: 10px;
  }
</style>
