<script>
  import { Title, Navigation, Routes, Menu } from "../../stores/Navigation";
  import { getStaff, removeStaff } from "../../network/Staff";
  import { Views, Utils } from "@ikomida/components";
  import { StatusBar } from "../../stores/Setup";
  import { onMount } from "svelte";
  import Fa from "svelte-fa";
  import { Auth } from "../../stores/Auth";
  import {
    faEdit,
    faSync,
    faTrashAlt,
  } from "@fortawesome/free-solid-svg-icons";
  let items;
  let userInfo;
  let isLoading = false;
  let errorAlert;
  let showAlert = false;
  let localLoading = false;
  let canGetMore = true;

  async function getMore(e, refresh = false) {
    localLoading = true;
    [canGetMore, items] = await getStaff(refresh);
    localLoading = false;
  }

  async function refresh() {
    isLoading = true;
    await getMore(null, true);
    isLoading = false;
  }

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  onMount(async () => {
    isLoading = true;
    Menu.addItem({ name: "Atualizar", icon: faSync, callback: refresh });
    [canGetMore, items] = await getStaff();
    userInfo = await Utils.Jws.extractToken($Auth);
    isLoading = false;
  });

  async function onRemoveClick(id) {
    isLoading = true;
    let response = await removeStaff(id);
    if (response.success) {
      await getMore(null, true);
    } else {
      toggleErrorAlert(response?.data);
      isLoading = false;
      return;
    }
    isLoading = false;
  }

  async function newStaff() {
    Navigation.goTo(Routes.newStaff);
  }

  function roleName(role) {
    switch (role.toLowerCase()) {
      case "vendor":
        return "Responsável";
      case "staff":
        return "Colaborador";
      default:
        return "-";
    }
  }
  Title.set("Lista de colaboradores");
</script>

{#if !items}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{:else}
  <Views.Button on:click={newStaff} bottomPadding={$StatusBar.bottomPadding}
    ><Fa icon={faEdit} /> <span>Novo colaborador</span></Views.Button
  >
  <Views.Divider />
  {#if items.length > 0}
    <section>
      {#each items as staff}
        <article>
          {#if userInfo?.id !== staff?.id}
            <Views.FloatRemove callback={() => onRemoveClick(staff?.id)} />
          {/if}
          <h2>{staff?.name} {staff?.lastName}</h2>
          <div>Telefone: {Utils?.Strings?.formatAsPhone(staff?.phone)}</div>
          <div>Título: {roleName(staff?.role)}</div>
        </article>
      {/each}
      <Views.Divider />
      {#if localLoading}
        <Views.LocalLoading />
      {/if}
      {#if canGetMore}
        <Views.Button on:click={getMore}>carregar mais</Views.Button>
      {/if}
    </section>
  {:else}
    <Views.CentredMessage
      text="Não há colaboradores cadastrados para exibir!"
    />
  {/if}
{/if}

<Views.MessageAlert object={errorAlert} bind:show={showAlert} />
{#if isLoading || !items}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if}

<style>
  section > article {
    position: relative;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-top: 10px;
    box-shadow: 2px 3px #cccccc7a;
    padding: 20px;
  }
  .remove {
    position: absolute;
    top: -8px;
    right: -10px;
    font-size: 0.9em;
    color: white;
    font-family: RobotoBold;
    border: 1px solid #4c0708;
    background: #4c0708;
    border-radius: 20px;
    width: 26px;
    height: 26px;
    vertical-align: middle;
    text-align: center;
    padding: 6px;
    display: flex;
    place-items: center;
    place-content: center;
  }
</style>
