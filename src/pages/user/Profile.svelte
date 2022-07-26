<script>
  import { Auth } from "../../stores/Auth";
  import { updatePassword } from "../../network/Auth";
  import { Title } from "../../stores/Navigation";
  import { Views, Image, Utils } from "@ikomida/components";
  import { getSettings, setSettings } from "../../network/Settings";
  import { StatusBar } from "../../stores/Setup";
  import { faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
  import { onMount } from "svelte";
  let profile = { phone: null, email: null };
  let validPhone = false;

  let isLoading = false;
  let errorAlert;
  let showAlert = false;

  let passwordObject = {
    oldPass: null,
    newPass: null,
    reNewPass: null,
  };
  let imageSrc = "/Assets/Images/food-plate.svg";
  let fileinput;

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

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
      toggleErrorAlert("A senha atual não está correta!");
      return;
    } else if (
      passwordObject.newPass === null ||
      passwordObject.newPass.length < 6
    ) {
      toggleErrorAlert("A nova senha não está correta!");
      return;
    } else if (passwordObject.newPass !== passwordObject.reNewPass) {
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

  async function onFileSelected(e) {
    isLoading = true;
    let imageSrcFile = e.target.files[0];
    isLoading = false;
    let reader = new FileReader();
    reader.readAsDataURL(imageSrcFile);
    reader.onload = async (e) => {
      const [dataType, data] = e.target.result.split(";");
      let imageType = "jpeg";
      switch (dataType) {
        case "image/jpeg":
        case "image/jpg":
          imageType = "jpeg";
          break;
        case "image/png":
          imageType = "png";
          break;
      }
      profile.mainPicture = await Image.resizeImage(
        imageSrcFile,
        400,
        400,
        imageType
      );
      imageSrc = profile?.mainPicture;
    };
  }

  onMount(async () => {
    const response = await getSettings();
    profile = { ...profile, ...response?.profile };
  });

  Title.set("Perfil");
</script>

<div class="profile">
  <div class="imageContainer">
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
      <Views.Divider />
      <small>
        Esse é o lugar da foto do logo do seu estabelecimento que vai aparecer no app dos seus clientes e para atualizá-la clica na câmera no canto superior esquerdo da foto</small>
    {/if}
    <img
      class="upload"
      src="/Assets/Images/upload.png"
      alt=""
      on:click={fileinput.click()}
    />
    <input
      style="display:none"
      type="file"
      accept=".jpg, .jpeg, .png"
      on:change={onFileSelected}
      bind:this={fileinput}
    />
  </div>
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
      value={Utils?.Strings?.formatAsPhone(
        profile?.phone
      )}
      fontSize="1.3em"
      leftMargin="30"
    />
    <Views.TextEdit
      bind:rawValue={profile.email}
      bind:value={profile.email}
      icon={faEnvelope}
      placeHolder="Email:"
      bind:isValid={validPhone}
    />
    <Views.Divider />
    </div>
    <Views.Button on:click={update}>Atualizar o email</Views.Button>
    <div class="data">
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
    <small
      >A senha deve ter um tamanho entre 8 e 40 caracteres e contendo no mínimo
      uma letra maiúscula, uma letra minúscula, um número e um símbolo</small
    >
    <Views.TextEdit
      name="Confirmação:"
      bind:value={passwordObject.reNewPass}
      secret={true}
      placeHolder=""
    />
    <Views.Divider />
  </div>
  <Views.Button on:click={editPassword}>Atualizar a senha</Views.Button>
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
  .profile > div {
    width: 100%;
  }
  .imageContainer {
    display: flex;
    align-items: center;
    flex-direction: column;
    position: relative;
    border-radius: 4px;
    width: 100%;
    overflow: hidden;
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
  .imageContainer > img {
    max-width: 100%;
    /* max-height: 200px; */
    width: 100%;
  }
  .imageContainer > img.upload {
    width: 60px;
    position: absolute;
    left: 0;
    background: #00000077;
    border-radius: 4px;
  }
</style>
