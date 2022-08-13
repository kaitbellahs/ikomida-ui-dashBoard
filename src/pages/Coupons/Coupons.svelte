<script>
  import {
    Title,
    Navigation,
    Router,
    Routes,
    Menu,
  } from "../../stores/Navigation";
  import Fa from "svelte-fa";
  import {
    faEdit,
    faTrashAlt,
    faSync,
  } from "@fortawesome/free-solid-svg-icons";
  import { Views, Utils } from "@ikomida/components";
  import { getCoupons, deleteCoupon } from "../../network/Payment";
  import { StatusBar } from "../../stores/Setup";
  import { onMount } from "svelte";
  let items;
  let isLoading = false;
  let errorAlert;
  let showAlert = false;
  let localLoading = false;
  let canGetMore = true;

  async function getMore(e, refresh = false) {
    localLoading = true;
    [canGetMore, items] = await getCoupons(refresh);
    localLoading = false;
  }

  async function refresh() {
    await getMore(null, true);
  }

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  onMount(async () => {
    Menu.addItem({ name: "Atualizar", icon: faSync, callback: refresh });
    isLoading = true;
    [canGetMore, items] = await getCoupons();
    isLoading = false;
  });

  const newCoupon = async () => {
    Navigation.goTo(Routes.newCoupon);
  };

  async function removeCoupon(id) {
    isLoading = true;
    const response = await deleteCoupon(id);
    if (response?.success) {
      await getMore(null, true);
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  Title.set("Cupons");
</script>

{#if isLoading}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{:else}
  <Views.Button on:click={newCoupon} bottomPadding={$StatusBar.bottomPadding}
    ><Fa icon={faEdit} /> <span>Novo cupom</span></Views.Button
  >
  <Views.Divider />
  {#if items && items.length > 0}
    <section>
      {#each items as coupon}
        <article>
          <span on:click={removeCoupon(coupon.id)} class="remove"
            ><Fa icon={faTrashAlt} /></span
          >
          <h2>{coupon.name}</h2>
          <div>{Utils.Strings.currency(coupon.value)}</div>
          <div>{Utils.Strings.dateToDateString(coupon.validity)}</div>
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
      text="Não há cupons para exibir por enquanto, aproveite e cadastre novos
    cupons para agradar seus clientes!"
    />
  {/if}
{/if}

<Views.MessageAlert object={errorAlert} bind:show={showAlert} />

<style>
  section > article {
    position: relative;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-top: 10px;
    padding: 10px;
  }
  section > article > .remove {
    position: absolute;
    top: -8px;
    right: -10px;
    font-size: 0.9em;
    color: white;
    font-family: RobotoBold;
    border: 1px solid #4c0708;
    background: #4c0708;
    border-radius: 20px;
    width: 25px;
    height: 25px;
    vertical-align: middle;
    text-align: center;
    padding: 4px;
  }
</style>
