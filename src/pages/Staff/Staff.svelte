<script>
  import { Title, Navigation, Routes, Menu } from "../../stores/Navigation";
  import { getStaff } from "../../network/Staff";
  import { Views, Utils } from "@ikomida/components";
  import { StatusBar } from "../../stores/Setup";
  import { onMount } from "svelte";
  import Fa from "svelte-fa";
  import { faEdit, faSync } from "@fortawesome/free-solid-svg-icons";
  import Cache from "../../stores/Cache";
  let staffs;

  const CACHE_NAME = "STAFF";
  let hasMore = true;
  let canGetMore = true;
  let lastTimestamp = null;

  async function getMore(e, refresh = false) {
    if (refresh || (canGetMore && hasMore)) {
      const timestamp = refresh
        ? 0
        : staffs?.[staffs.length - 1]?.timestamp ?? -1;
      canGetMore = false;
      staffs = Cache.getObject(CACHE_NAME);
      const newStaffs = await getStaff(timestamp);
      hasMore = newStaffs.length > 0;
      staffs = refresh
        ? newStaffs
        : staffs
        ? [...staffs, ...newStaffs]
        : newStaffs;
      staffs.sort((item1, item2) => item2.timestamp - item1.timestamp);
      Cache.setObject(CACHE_NAME, staffs);
      canGetMore = refresh || lastTimestamp !== timestamp;
      lastTimestamp = timestamp;
    }
  }

  onMount(async () => {
    staffs = Cache.getObject(CACHE_NAME);
    if (!staffs) {
      await getMore(null, true);
    }
  });

  async function refresh() {
    await getMore(null, true);
  }

  Menu.addItem({ name: "Atualizar", icon: faSync, callback: refresh });

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

{#if !staffs}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{:else}
  <Views.Button on:click={newStaff} bottomPadding={$StatusBar.bottomPadding}
    ><Fa icon={faEdit} /> <span>Novo colaborador</span></Views.Button
  >
  <Views.Divider />
  <section>
    {#if staffs.length > 0}
      {#each staffs as staff}
        <article>
          <h2>{staff.name} {staff.lastName}</h2>
          <div>Telefone: {Utils.Strings.formatAsPhone(staff.phone)}</div>
          <div>Título: {roleName(staff.role)}</div>
        </article>
      {/each}
      <Views.Divider />
      {#if hasMore && !canGetMore}
        <Views.LocalLoading />
      {:else}
        <Views.Button disabled={!hasMore || !canGetMore} on:click={getMore}
          >carregar mais</Views.Button
        >
      {/if}
    {:else}
      Não há colaboradores cadastrados para exibir!
    {/if}
  </section>
{/if}

<style>
  section > article {
    position: relative;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-top: 10px;
    padding: 10px;
  }
</style>
