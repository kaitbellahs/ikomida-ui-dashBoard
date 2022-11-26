<script lang="ts">
  import { Views, Utils, Stores, Types } from '@ikomida/shared-frontend'
  import { getLimits } from '../../network/Settings'
  import { onMount } from 'svelte'
  import Fa from 'svelte-fa'
  import {
    faTruck,
    faUserGroup,
    faMoneyBill1Wave,
    faPercent,
    faCartShopping,
    faRocket,
    faTableList
  } from '@fortawesome/free-solid-svg-icons'

  let limits: Types.Classes.CVendorLimits

  onMount(async () => {
    const response = await getLimits()
    if (response?.success) {
      limits = Types.Classes.CVendorLimits.fromObject(response.data)
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  })

  Stores.Title.instance.set('Limites')
  function color(value?: number) {
    const percent = value ?? 0
    return `rgb(${percent < 50 ? (255 / 100) * (percent * 2) : 255}, ${
      percent >= 50 ? (255 / 100) * ((100 - percent) * 2) : 255
    }, 0)`
  }
  function percent(limit?: number, quota?: number) {
    limit = limit ?? -1
    return Number(limit === -1 ? 0 : ((100 / (limit ?? 1)) * (limit === -1 ? 0 : quota ?? 1)).toFixed(1))
  }
  function limit(limit?: number) {
    limit = limit ?? -1
    return limit === -1 ? '∞' : limit ?? 0
  }
  function limitCurrency(limit?: number) {
    limit = limit ?? -1
    return limit === -1 ? '∞' : Utils.Strings.currency(limit ?? 0.0)
  }
  $: staff = percent(limits?.staff?.limits, limits?.staff?.used)
  $: products = percent(limits?.products?.limits, limits?.products?.used)
  $: orders = percent(limits?.orders?.limits, limits?.orders?.used)
  $: coupons = percent(limits?.coupons?.limits, limits?.coupons?.used)
  $: categories = percent(limits?.categories?.limits, limits?.categories?.used)
  $: pushNotifications = percent(limits?.pushNotifications?.limits, limits?.pushNotifications?.used)
  $: billing = percent(limits?.billing?.limits, limits?.billing?.used)
</script>

<Views.Divider />
<h2>Métricas do uso do seu plano</h2>

<section>
  {#if limits}
    <Views.Divider />
    <article>
      <h4>
        <Fa style="color: #4c0708;" icon={faTruck} /> Pedidos
      </h4>
      <span><b>Usado:</b> {limits?.orders?.used ?? 0} Pedidos este Mês</span><span>
        <b>Limite:</b> {limit(limits?.orders?.limits)} Pedidos por Mês</span
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
        {Utils.Strings.currency(limits?.billing?.used) ?? 0} este Mês</span
      ><span> <b>Limite:</b> {limitCurrency(limits?.billing?.limits)} por Mês</span><span
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
      <span><b>Usado:</b> {limits?.products?.used ?? 0}</span><span>
        <b>Limite:</b> {limit(limits?.products?.limits)}</span
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
      <span><b>Usado:</b> {limits?.pushNotifications?.used ?? 0} este Mês</span><span>
        <b>Limite:</b> {limit(limits?.pushNotifications?.limits)} por Mês</span
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
      <span><b>Usado:</b> {limits?.coupons?.used ?? 0}</span><span>
        <b>Limite:</b> {limit(limits?.coupons?.limits)}</span
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
      <span><b>Usado:</b> {limits?.staff?.used ?? 0}</span><span>
        <b>Limite:</b> {limit(limits?.staff?.limits)}</span
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
      <span><b>Usado:</b> {limits?.categories?.used ?? 0}</span><span>
        <b>Limite:</b> {limit(limits?.categories?.limits)}</span
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
    height: 8pt;
    border-radius: 4pt;
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
    margin-top: 24pt;
  }
  section > article {
    border-radius: 8pt;
    box-shadow: 0 4pt 8pt #0000009e;
    padding: 16pt;
    display: flex;
    flex-direction: column;
  }
  section > article > h4 {
    margin-bottom: 24pt;
  }
  section > article > .chart > div {
    position: absolute;
    top: 0;
    left: 0;
    height: 8pt;
    width: var(--width);
    background: var(--color);
  }
  section > article > span {
    color: #4c0708;
    z-index: 999;
  }
</style>
