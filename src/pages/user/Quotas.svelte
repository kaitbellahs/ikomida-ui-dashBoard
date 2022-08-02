<script>
  import { Title } from "../../stores/Navigation";
  import { Views, Utils } from "@ikomida/components";
  import { StatusBar } from "../../stores/Setup";
  import { getQuotas } from "../../network/Settings";
  import { onMount } from "svelte";
  import Fa from "svelte-fa";
  import { faReceipt, faFileInvoice } from "@fortawesome/free-solid-svg-icons";
  import { AppLauncher } from "@capacitor/app-launcher";

  let quotas;
  let isLoading = false;
  let errorAlert;
  let showAlert = false;

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  onMount(async () => {
    quotas = await getQuotas();
  });

  Title.set("Cobranças");
  function color(percent) {
    return `rgb(${percent < 50 ? (255 / 100) * (percent * 2) : 255}, ${
      percent >= 50 ? (255 / 100) * ((100 - percent) * 2) : 255
    }, 0)`;
  }
  function percent(limit, quota) {
    return limit === 0 ? 0 : ((100 / (limit ?? 1)) * (limit === 0 ? 0 : (quota ?? 1))).toFixed(1);
  }
  function limit(limit){
    return limit === 0 ? '∞' : (limit ?? 0)
  }
  function limitCurrency(limit){
    return limit === 0 ? '∞' : Utils.Strings.currency(limit ?? 0)
  }
  $: staff = percent(quotas?.limits?.staff, quotas?.quotas?.staff);
  $: products = percent(quotas?.limits?.products, quotas?.quotas?.products);
  $: orders = percent(quotas?.limits?.orders, quotas?.quotas?.orders);
  $: coupons = percent(quotas?.limits?.coupons, quotas?.quotas?.coupons);
  $: billing = percent(quotas?.limits?.billing, quotas?.quotas?.billing);
</script>

<h2>Aqui você analisa métricas de uso do seu plano</h2>

<section>
  {#if quotas}
    <Views.Divider />
    <span
      >{quotas?.quotas?.staff ?? 0} / {limit(quotas?.limits?.staff)} Colaboradores
      ({staff}%) usado</span
    >
    <div class="chart">
      <div style="--width: {staff}%; --color: {color(staff)};" />
    </div>
    <Views.Divider />
    <span
      >{quotas?.quotas?.products ?? 0} / {limit(quotas?.limits?.products)} Produtos
      ({products}%) usado</span
    >
    <div class="chart">
      <div style="--width: {products}%; --color: {color(products)};" />
    </div>
    <Views.Divider />
    <span
      >{quotas?.quotas?.orders ?? 0} / {limit(quotas?.limits?.orders)} Pedidos por
      Mês ({orders}%) usado</span
    >
    <div class="chart">
      <div style="--width: {orders}%; --color: {color(orders)};" />
    </div>
    <Views.Divider />
    <span
      >{quotas?.quotas?.coupons ?? 0} / {limit(quotas?.limits?.coupons)} Cupons ({coupons}%)
      usado</span
    >
    <div class="chart">
      <div style="--width: {coupons}%; --color: {color(coupons)};" />
    </div>
    <Views.Divider />
    <span
      >Faturamento de {Utils.Strings.currency(quotas?.quotas?.billing) ?? 0} / {limitCurrency(
        quotas?.limits?.billing
      )} por Mês ({billing}%) usado</span
    >
    <div class="chart">
      <div style="--width: {billing}%; --color: {color(billing)};" />
    </div>
  {/if}
</section>

{#if !quotas || isLoading}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if}
<Views.MessageAlert object={errorAlert} bind:show={showAlert} />

<style>
  section > .chart {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #c1c0c1;
    position: relative;
    overflow: hidden;
    display: flex;
    place-content: center;
    align-content: center;
    justify-content: center;
    place-items: center;
    align-items: center;
    justify-items: center;
  }
  section > .chart > div {
    position: absolute;
    top: 0;
    left: 0;
    height: 6px;
    width: var(--width);
    background: var(--color);
  }
  section > span {
    color: #4c0708;
    z-index: 999;
    text-shadow: 1px 1px #000000cf;
  }
</style>
