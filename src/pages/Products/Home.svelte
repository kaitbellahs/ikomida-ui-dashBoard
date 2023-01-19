<script lang="ts">
  import { countProducts, getLowQuantityProducts } from '../../network/Products'
  import { countOrders } from '../../network/Orders'
  import { countUsers } from '../../network/User'
  import { countCoupons } from '../../network/Payment'
  import { Views, Stores, Types } from '@ikomida/shared-frontend'
  import { onMount, tick } from 'svelte'
  import Routes from '../../stores/Routes'
  import { isPosOpen } from '../../network/Pos'

  let products: Types.Classes.CProduct[]

  function onClick(product: Types.Classes.CProduct) {
    Stores.Navigation.instance?.goTo(Routes.product, { product, active: product.active })
  }
  onMount(async () => {
    const response = await getLowQuantityProducts()
    if (response.success) {
      products = Types.Classes.CProduct.fromObject(response.data)
    }
    await tick()
    Stores.Loading.instance.stop()
  })
  Stores.Title.instance.set('iKomida - Dashboard')
</script>

<Views.Divider />
<section>
  <Views.Button type={Types.TButton.CONTAINER} route={Routes.products}>
    {#await countProducts()}
      <Views.LocalLoading />
    {:then productsCount}
      <span class="count">{productsCount}</span>
      <span class="name">Produtos</span>
    {/await}
  </Views.Button>
  <Views.Button type={Types.TButton.CONTAINER} route={Routes.orders}>
    {#await countOrders()}
      <Views.LocalLoading />
    {:then ordersCount}
      <span class="count">{ordersCount}</span>
      <span class="name">Pedidos</span>
    {/await}
  </Views.Button>
  <Views.Button type={Types.TButton.CONTAINER}>
    {#await countUsers()}
      <Views.LocalLoading />
    {:then usersCount}
      <span class="count">{usersCount}</span>
      <span class="name">Clientes</span>
    {/await}
  </Views.Button>
  <Views.Button type={Types.TButton.CONTAINER} route={Routes.coupons}>
    {#await countCoupons()}
      <Views.LocalLoading />
    {:then couponsCount}
      <span class="count">{couponsCount}</span>
      <span class="name">Cupons</span>
    {/await}
  </Views.Button>
  <Views.Button type={Types.TButton.CONTAINER} route={Routes.pos}>
    {#await isPosOpen()}
      <Views.LocalLoading />
    {:then pos}
      <span class="count">Caixa</span>
      <span class="name">{pos ? 'aberto' : 'fechado'}</span>
    {/await}
  </Views.Button>
  <Views.Divider />
</section>
<section class="product shadow">
  <header>
    <h2>Área de atenção.</h2>
    <small>Produtos que precisam de atenção aparecerem aqui</small>
  </header>
  {#if !products}
    <Views.LocalLoading />
  {:else if (products?.length ?? 0) > 0}
    {#each products as product}<div
        class="leftShadow item"
        style="--itemBackground: #fffffffc;--buttonBackground:#4c0708;--buttonColor:#fff;"
      >
        <button on:click={() => onClick(product)}>
          <div>
            {#if product.image}
              <div class="image">
                <Views.Image source={product.image} name={product.title} />
              </div>
            {/if}
            <div class="body">
              <h3>{product.title}</h3>
              <div class="quantity">
                Resta{product.quantity > 1 ? 'm' : ''} <span>{product.quantity}</span>
                unidade{product.quantity > 1 ? 's' : ''}
              </div>
            </div>
          </div>
          {#if product.orderTypes}
            <Views.Divider height={7} />
            <div class="orderTypes">
              {#each product.orderTypes ?? [] as orderType}
                <span>{orderType.name}</span>
              {/each}
            </div>
          {/if}
        </button>
      </div>
    {/each}
  {:else}
    <Views.CentredMessage text="Por equanto ta tudo em ordem." />
  {/if}
</section>

<style>
  section {
    display: flex;
    flex-wrap: wrap;
    height: fit-content;
  }
  section.product {
    height: 100%;
    flex-direction: row;
    border: 1px solid red;
    padding: 16px;
    border-radius: 8px;
    overflow-y: scroll;
    overflow-x: hidden;
  }
  section.product > * {
    width: 100%;
  }
  section.product > header {
    height: fit-content;
    display: flex;
    flex-direction: column;
    place-items: center;
  }
  section > :global(button) {
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin: 8px;
    width: 50%;
    display: flex;
    flex-direction: column;
    flex-basis: 40%;
    text-shadow: 0.8px 1px #18056b66;
    box-shadow: 0 4px 8px #0000009e;
  }
  section.product > :global(button) {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }
  :global(button) > .name {
    width: 100%;
    font-size: 1.2em;
    font-family: RobotoBold;
    text-align: center;
  }
  :global(button) > .count {
    width: 100%;
    font-size: 3em;
    color: #4c0708;
    text-align: center;
  }
  h2 {
    text-align: center;
  }
  .item {
    width: 100%;
    margin: 16px 0;
    height: fit-content;
    padding: 8px;
    background: var(--itemBackground);
    position: relative;
    border-radius: 8px;
  }
  .item > button {
    background-color: transparent;
    border: 0;
    width: 100%;
    max-width: 100%;
    display: flex;
    flex-direction: column;
  }
  .item > button > .orderTypes {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .item > button > .orderTypes > span {
    padding: 4px;
    border-radius: 8px;
    margin: 4px;
    font-size: 0.9em;
    border: var(--buttonBackground) solid 1px;
  }
  .item > button > div > .body > h3 {
    padding: 0;
    margin: 0;
    font-size: 1.5em;
    text-align: center;
    margin-bottom: 16px;
  }
  .item > button > div {
    display: flex;
    flex-direction: row;
    justify-content: center;
    padding: 0;
    margin: 0;
  }
  .item > button > div > div {
    width: 100%;
    min-height: 1px;
    display: flex;
    -o-flex-wrap: wrap;
    flex-wrap: wrap;
  }
  .item > button > div > .image {
    flex: 1 25%;
    width: 25%;
  }
  .item > button > div > .body {
    flex: 1 75%;
    width: 75%;
  }
  .item > button > div > .body > * {
    width: 100%;
    min-width: 100%;
  }
  .item > button > div > .image > :global(img) {
    width: 100%;
    max-width: 100%;
    object-fit: contain;
  }
  @media (min-width: 481px) {
    section {
      flex-grow: 1;
      width: calc(50% - 16px);
      max-width: calc(50% - 16px);
      margin-left: 8px;
      margin-right: 8px;
    }
  }
</style>
