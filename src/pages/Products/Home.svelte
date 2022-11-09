<script lang="ts">
  import { countProducts, getLowQuantityProducts } from '../../network/Products'
  import { countOrders } from '../../network/Orders'
  import { countUsers } from '../../network/User'
  import { countCoupons } from '../../network/Payment'
  import { Views, Stores, Types } from '@ikomida/shared-frontend'
  import { onMount, tick } from 'svelte'
  import Routes from '../../stores/Routes'
  import Image from '@ikomida/shared-frontend/lib/components/Image.svelte'
  import Divider from '@ikomida/shared-frontend/lib/components/Divider.svelte'

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

<h2>Estatísticas</h2>
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
</section>
<Views.Divider />
<section class="product">
  <header>
    <h2>Área de atenção.</h2>
    <small>Produtos que precisam de atenção aparecerem aqui</small>
  </header>
  {#if (products?.length ?? 0) > 0}
    {#each products as product}<div
        class="leftShadow item"
        style="--itemBackground: #ffffffab;--buttonBackground:#4c0708;--buttonColor:#fff;"
      >
        <button on:click={() => onClick(product)}>
          <div>
            {#if product.image}
              <div class="image">
                <Image source={product.image} name={product.title} />
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
  }
  section.product {
    height: 100%;
    flex-direction: row;
    border: 1px solid red;
    padding: 10px;
    border-radius: 10px;
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
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin: 5px;
    width: 50%;
    display: flex;
    flex-direction: column;
    flex-basis: 40%;
    text-shadow: 0.5px 1px #18056b66;
    box-shadow: 1px 1.5px #00000099;
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
    margin: 15px 0;
    border: 1px solid #ccc;
    padding: 10px;
    background: var(--itemBackground);
    position: relative;
    border-radius: 10px;
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
  }
  .item > button > .orderTypes > span {
    padding: 2px;
    border-radius: 5px;
    margin: 5px;
    font-size: 0.9em;
    border: var(--buttonBackground) solid 1px;
  }
  .item > button > div > .body > h3 {
    padding: 0;
    margin: 0;
    font-size: 1.5em;
    text-align: center;
    margin-bottom: 20px;
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
</style>
