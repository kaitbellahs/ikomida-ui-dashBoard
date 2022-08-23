<script>
  import Routes from "../../stores/Routes";
  import { getStaff, removeStaff } from "../../network/Staff";
  import { Views, Utils, Stores } from "@ikomida/components";
  import { StatusBar } from "../../stores/Setup";
  import { onMount } from "svelte";
  import Fa from "svelte-fa";
  import { faEdit, faSync } from "@fortawesome/free-solid-svg-icons";
  let items;
  let userInfo;
  let isLoading = true;
  let errorAlert;
  let showAlert = false;
  let localLoading = false;
  let canGetMore = true;
  let auth;

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
    auth = await Stores.Auth.instance.store();
    Stores.Menu.instance.addItem({
      name: "Atualizar",
      icon: faSync,
      callback: refresh,
    });
    [canGetMore, items] = await getStaff();
    userInfo = await Utils.Jws.extractToken($auth);
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
    Stores.Navigation.instance.goTo(Routes.newStaff);
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
  Stores.Title.instance.set("Lista de colaboradores");
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
      {#each items as staff (staff?.id)}
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
</style>
