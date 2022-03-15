<script>
  import { Auth } from "../../stores/Auth";
  import { Title } from "../../stores/Navigation";
  import { Views } from "@tian/components";
  import { getSettings, setSettings } from "../../network/Settings";
  import { StatusBar } from "../../stores/Setup";
  import Fa from "svelte-fa";
  import {
    faPhone, faAt, faKey, faEnvelope
  } from "@fortawesome/free-solid-svg-icons";
import { onMount } from "svelte";
  let settings = {};
  let validPhone = false;

  onMount(async () => {
    settings = await getSettings();
  });

  function logout() {
    Auth.setToken(null);
  }

  async function update() {
    const response = await setSettings(settings);
    if(response){
      settings = response;
    }
  }

  Title.set("Ajustes");
</script>

{#if settings}
  <div class="settings">
    {#if settings.mainPicture}
      <img class="avatarCircle" src={settings?.mainPicture} alt={settings?.restaurantName} />
    {:else}
      <div class="avatarCircle">
        {settings?.restaurantName?.[0]}{settings?.restaurantName?.[1]}
      </div>
    {/if}
    <div class="data">
      <Views.TextValue text="Nome:" value={settings?.restaurantName} fontSize="1.5em" />
      <Views.TextValue text="CNPJ:" value={settings?.cnpj} fontSize="1.5em" />
      <Views.TextEdit
        bind:rawValue={settings.phone}
        bind:value={settings.phone}
        icon={faPhone}
        type="phone"
        placeHolder="Celular:"
        bind:isValid={validPhone}
      />
      <Views.TextEdit
        bind:rawValue={settings.email}
        bind:value={settings.email}
        icon={faEnvelope}
        placeHolder="Email:"
        bind:isValid={validPhone}
      />
      <Views.TextEdit
        bind:rawValue={settings.pagSeguroEmail}
        bind:value={settings.pagSeguroEmail}
        icon={faAt}
        placeHolder="Pagseguro email:"
      />
      <Views.TextEdit
        bind:rawValue={settings.pagSeguroAccessToken}
        bind:value={settings.pagSeguroAccessToken}
        icon={faKey}
        placeHolder="Pagseguro token de acesso:"
      />
      <Views.Divider />
      <Views.Button on:click={update}>Atualizar os dados</Views.Button>
    </div>
    <Views.Button type="transparent" on:click={logout}>Logout</Views.Button>
  </div>
{:else}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if}

<style>
  .settings {
    padding-bottom: 50px;
  }
  .settings > div {
    width: 100%;
  }
  .settings > div > h2 {
    margin-left: 20px;
  }
  .settings > .data {
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
