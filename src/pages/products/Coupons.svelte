<script>
  import { Title, Navigation, Router, Routes } from "../../stores/Navigation";
  import Fa from "svelte-fa";
  import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
  import { Views, Utils } from "@ikomida/components";
  import { getCoupon, deleteCoupon } from "../../network/Payment";
  import { StatusBar } from "../../stores/Setup";
  import { onMount } from "svelte";

  const item = $Router.options;
  let isLoading = false;
  let coupons = [];

  let errorAlert;
  let showAlert = false;

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  onMount(async () => {
    isLoading = true;
    coupons = await getCoupon();
    isLoading = false;
  });

  const newCoupon = async () => {
    Navigation.goTo(Routes.newCoupon, { item, edit: false });
  };

  async function removeCoupon(id) {
    isLoading = true;
    const response = await deleteCoupon(id);
    if (response?.success) {
      coupons = await getCoupon();
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
  <section>
    <Views.Button on:click={newCoupon} bottomPadding={$StatusBar.bottomPadding}
      ><Fa icon={faEdit} /> <span>Novo cupom</span></Views.Button
    >
    <Views.Divider />
    {#if coupons.length > 0}
      {#each coupons as coupon}
        <article>
          <span on:click={removeCoupon(coupon.id)} class="remove"
            ><Fa icon={faTrashAlt} /></span
          >
          <h2>{coupon.name}</h2>
          <div>{Utils.Strings.currency(coupon.value)}</div>
          <div>{Utils.Strings.dateToDateString(coupon.validity)}</div>
        </article>
      {/each}
    {:else}
      <h2>Não há cupons encontrados</h2>
    {/if}
  </section>
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
    border: 1px solid #b52124;
    background: #b52124;
    border-radius: 20px;
    width: 25px;
    height: 25px;
    vertical-align: middle;
    text-align: center;
    padding: 4px;
  }
</style>
