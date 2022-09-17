<script lang="ts">
  import { Views, Utils, Stores, Types } from '@ikomida/shared-frontend';
  import { getLimits } from '../../network/Settings';
  import { onMount } from 'svelte';
  import Fa from 'svelte-fa';
  import {
    faTruck,
    faUserGroup,
    faMoneyBill1Wave,
    faPercent,
    faCartShopping,
    faRocket,
    faTableList,
  } from '@fortawesome/free-solid-svg-icons';

  let limits: Types.Classes.CVendorLimits;

  onMount(async () => {
    const response = await getLimits();
    if (response?.success) {
      limits = response.data as Types.Classes.CVendorLimits;
    } else {
      Stores.MessageAlert.instance.show(response?.data);
    }
    Stores.Loading.instance.stop();
  });

  Stores.Title.instance.set('Limites');
  function color(value?: number) {
    const percent = value ?? 0;
    return `rgb(${percent < 50 ? (255 / 100) * (percent * 2) : 255}, ${
      percent >= 50 ? (255 / 100) * ((100 - percent) * 2) : 255
    }, 0)`;
  }
  function percent(limit?: number, quota?: number) {
    return Number(limit === 0 ? 0 : ((100 / (limit ?? 1)) * (limit === 0 ? 0 : quota ?? 1)).toFixed(1));
  }
  function limit(limit?: number) {
    return limit === 0 ? '∞' : limit ?? 0;
  }
  function limitCurrency(limit?: number) {
    return limit === 0 ? '∞' : Utils.Strings.currency(limit ?? 0);
  }
  $: staff = percent(limits?.limits?.staff, limits?.used?.staff);
  $: products = percent(limits?.limits?.products, limits?.used?.products);
  $: orders = percent(limits?.limits?.orders, limits?.used?.orders);
  $: coupons = percent(limits?.limits?.coupons, limits?.used?.coupons);
  $: categories = percent(limits?.limits?.categories, limits?.used?.categories);
  $: pushNotifications = percent(limits?.limits?.pushNotifications, limits?.used?.pushNotifications);
  $: billing = percent(limits?.limits?.billing, limits?.used?.billing);
</script>

<h2>Aqui você analisa métricas de uso do seu plano</h2>

<section>
  {#if limits}
    <Views.Divider />
    <article>
      <h4>
        <Fa style="color: #4c0708;" icon={faTruck} /> Pedidos
      </h4>
      <span><b>Usado:</b> {limits?.used?.orders ?? 0} Pedidos este Mês</span><span>
        <b>Limite:</b> {limit(limits?.limits?.orders)} Pedidos por Mês</span
      ><span><b>Percentagem:</b> {orders}% saturado</span>
      <div class="chart">
        <div style="--width: {orders}%; --color: {color(orders)};" />
      </div>
    </article>
    <Views.Divider />
    <article>
      <h4>
        <Fa style="color: #4c0708;" icon={faMoneyBill1Wave} /> Faturamento
      </h4>
      <span
        ><b>Usado:</b>
        {Utils.Strings.currency(limits?.used?.billing) ?? 0} este Mês</span
      ><span> <b>Limite:</b> {limitCurrency(limits?.limits?.billing)} por Mês</span><span
        ><b>Percentagem:</b> {billing}% saturado</span
      >
      <div class="chart">
        <div style="--width: {billing}%; --color: {color(billing)};" />
      </div>
    </article>
    <Views.Divider />
    <article>
      <h4>
        <Fa style="color: #4c0708;" icon={faCartShopping} /> Produtos
      </h4>
      <span><b>Usado:</b> {limits?.used?.products ?? 0}</span><span>
        <b>Limite:</b> {limit(limits?.limits?.products)}</span
      ><span><b>Percentagem:</b> {products}% saturado</span>
      <div class="chart">
        <div style="--width: {products}%; --color: {color(products)};" />
      </div>
    </article>
    <Views.Divider />
    <article>
      <h4>
        <Fa style="color: #4c0708;" icon={faRocket} /> Mensagens push
      </h4>
      <span><b>Usado:</b> {limits?.used?.pushNotifications ?? 0} este Mês</span><span>
        <b>Limite:</b> {limit(limits?.limits?.pushNotifications)} por Mês</span
      ><span><b>Percentagem:</b> {pushNotifications}% saturado</span>
      <div class="chart">
        <div style="--width: {pushNotifications}%; --color: {color(pushNotifications)};" />
      </div>
    </article>
    <Views.Divider />
    <article>
      <h4>
        <Fa style="color: #4c0708;" icon={faPercent} /> Cupons
      </h4>
      <span><b>Usado:</b> {limits?.used?.coupons ?? 0}</span><span>
        <b>Limite:</b> {limit(limits?.limits?.coupons)}</span
      ><span><b>Percentagem:</b> {coupons}% saturado</span>
      <div class="chart">
        <div style="--width: {coupons}%; --color: {color(coupons)};" />
      </div>
    </article>
    <Views.Divider />
    <article>
      <h4>
        <Fa style="color: #4c0708;" icon={faUserGroup} /> Colaboradores
      </h4>
      <span><b>Usado:</b> {limits?.used?.staff ?? 0}</span><span>
        <b>Limite:</b> {limit(limits?.limits?.staff)}</span
      ><span><b>Percentagem:</b> {staff}% saturado</span>
      <div class="chart">
        <div style="--width: {staff}%; --color: {color(staff)};" />
      </div>
    </article>
    <Views.Divider />
    <article>
      <h4>
        <Fa style="color: #4c0708;" icon={faTableList} /> Categorias
      </h4>
      <span><b>Usado:</b> {limits?.used?.categories ?? 0}</span><span>
        <b>Limite:</b> {limit(limits?.limits?.categories)}</span
      ><span><b>Percentagem:</b> {categories}% saturado</span>
      <div class="chart">
        <div style="--width: {categories}%; --color: {color(categories)};" />
      </div>
    </article>
  {/if}
</section>

<style>
  section > article > .chart {
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
    margin-top: 10px;
  }
  section > article {
    border: 1px solid #ccc;
    box-shadow: 2px 3px #cccccc7a;
    padding: 20px;
    display: flex;
    flex-direction: column;
  }
  section > article > h4 {
    margin-bottom: 10px;
  }
  section > article > .chart > div {
    position: absolute;
    top: 0;
    left: 0;
    height: 6px;
    width: var(--width);
    background: var(--color);
  }
  section > article > span {
    color: #4c0708;
    z-index: 999;
  }
</style>
