<script lang="ts">
  import { Stores, Utils, Views } from '@ikomida/shared-frontend'
  import { onMount } from 'svelte'
  import { Classes, Types } from '@ikomida/shared-types'
  import { faTicket, faShoppingBag, faBarcode, faCamera, faBroom } from '@fortawesome/free-solid-svg-icons'

  import Routes from '../../stores/Routes'
  import { search, all } from '../../network/Products'

  import HideContainer from '../Components/HideContainer.svelte'
  import Products from '../Products/Products.svelte'

  export let pos: Classes.CPos
  let ordersGroup: Classes.COrdersGroup | undefined
  const cache = Stores.Cache.createInstance('Products')

  let searchTerm: string = ''
  let oldValue: string
  let error = false

  let listableCategoryProducts: Classes.CCategoryProducts[] = []
  let categoriesAndProducts: Classes.CCategoryProducts[] = []

  $: if (searchTerm !== oldValue) {
    error = false
    if (searchTerm.length > 0) {
      Stores.Loading.instance.start()
      search(searchTerm).then(result => {
        listableCategoryProducts = result
      })
      oldValue = searchTerm
      Stores.Loading.instance.stop()
    } else {
      listableCategoryProducts = []
      oldValue = ''
    }
  }

  $: productCategoriesList = listableCategoryProducts.length > 0 ? listableCategoryProducts : categoriesAndProducts

  $: subTotal =
    ordersGroup?.orders
      ?.flatMap(order => {
        return order.subtotal
      })
      .reduce((i1, i2) => i1 + i2) ?? 0

  $: discount =
    ordersGroup?.orders
      ?.flatMap(order => {
        return order.discount
      })
      .reduce((i1, i2) => i1 + i2) ?? 0

  $: total = subTotal - discount

  function sortItems() {
    categoriesAndProducts = categoriesAndProducts
      .map(category => {
        category.products = category?.products?.sort((i1, i2) => (i1?.order ?? 0) - (i2?.order ?? 0))
        return category
      })
      .sort((i1, i2) => (i1.order ?? 0) - (i2.order ?? 0))
    cache.setObject(
      'Products',
      categoriesAndProducts.map(category => category.toJSON())
    )
  }

  function selectCategory(category: Classes.CCategoryProducts) {
    listableCategoryProducts = [category]
  }

  function clearFilter() {
    oldValue = ''
    searchTerm = ''
    listableCategoryProducts = []
  }

  function newOrdersGroup() {
    ordersGroup = Classes.COrdersGroup.init(
      Math.ceil(Math.random() * 10000).toString(),
      Types.TOrdersGroup.CASHIER,
      new Date(),
      new Date()
    )
  }
  function closeOrdersGroup() {
    ordersGroup = undefined
  }

  function getText() {
    const text = 'Item test dsfgdgsd gdfg fdg dfgh fdh fdh dfh fdg hgf jfdj'.split(' ')
    let start = Math.ceil(Math.random() * 10)
    start = start < text.length ? start : 0
    let end = Math.ceil(Math.random() * 10)
    end = end < text.length - start ? end : 1
    return text.splice(start, end).join(' ')
  }

  Stores.Title.instance.set('Produtos')

  onMount(async () => {
    categoriesAndProducts = await all()
    sortItems()
    const auth = await Stores.Auth.Auth.instance.data()
    if (auth) {
      const userInfo = await Utils.Jws.extractToken(auth)
    }
    Stores.Loading.instance.stop()
  })
</script>

<container>
  <box class="searchOrderGroup">
    <Views.TextEdit icon={faTicket} marginTop={24} placeHolder="Número da comanda" />
  </box>
  <box class="searchProduct">
    <Views.TextEdit
      icon={faShoppingBag}
      bind:value={searchTerm}
      marginTop={24}
      placeHolder="Nome do produto"
      buttonIcon={faBroom}
      callback={clearFilter}
    />
    <HideContainer hide={!ordersGroup} />
  </box>
  <box class="barCode">
    <Views.TextEdit marginTop={24} placeHolder="Código de barra" icon={faBarcode} buttonIcon={faCamera} />
    <HideContainer hide={!ordersGroup} />
  </box>
  <aside class="orderGroups shadow box">
    {#if ordersGroup}
      <h2>Comanda #000</h2>
      <list>
        <Views.TextValue text="CPF:" value={ordersGroup.user?.identity ?? 'N/A'} />
        <Views.TextValue text="Nome:" value={ordersGroup.user?.name ?? 'N/A'} />
        <Views.TextValue text="Tipo:" value={ordersGroup.kind?.name ?? 'N/A'} />
        <Views.TextValue text="Data:" value={Utils.Strings.dateToDateString(ordersGroup.createdAt)} />
        <Views.Button sizeMultiplier={0.7}>Vincular cliente responsável</Views.Button>
        <Views.Button sizeMultiplier={0.7}>Adicionar cliente acompanhante</Views.Button>
        <Views.Button sizeMultiplier={0.7}>Comanda abandonada</Views.Button>
      </list>
    {:else}
      <h2>Para realizar nova venda. escaneie ou digite o código ou abra uma nova comanda.</h2>
      <Views.Divider />
      <Views.Button sizeMultiplier={0.7} on:click={newOrdersGroup}>Abrir comanda caixa</Views.Button>
    {/if}
  </aside>
  <box class="cartProducts shadow box">
    <header>
      <item class="header">
        <div class="span2 textOverflow">Código</div>
        <div class="description span4 textOverflow">Descrição</div>
        <div class="textOverflow">Quantidade</div>
        <div class="span2 textOverflow">Preço unitário</div>
        <div class="span1 textOverflow">Disconto</div>
        <div class="span2 textOverflow">Total</div>
      </item>
    </header>
    <list>
      {#each ordersGroup?.orders ?? [] as order}
        {#each order.products as product}
          <item>
            <div class="span2">{product.code}</div>
            <div class="description span4 textOverflow">{product.title}</div>
            <div>{product.quantity}</div>
            <div class="span2">{Utils.Strings.currency(product.price)}</div>
            <div class="span2">{Utils.Strings.currency(product.discount)}</div>
            <div class="span2">{Utils.Strings.currency(product.price)}</div>
          </item>
        {/each}
      {/each}
    </list>
    <HideContainer hide={!ordersGroup} message="Abra comanda" />
  </box>
  <box class="resume shadow box">
    <h2>Resumo</h2>
    <list>
      <div>Subtotal</div>
      <div>{Utils.Strings.currency(subTotal)}</div>
      <div>Disconto</div>
      <div>{Utils.Strings.currency(discount)}</div>
      <div>Total</div>
      <div>{Utils.Strings.currency(total)}</div>
    </list>
    <HideContainer hide={!ordersGroup} />
  </box>
  <box class="action">
    <Views.Button>Finalizar</Views.Button>
    <Views.Button on:click={closeOrdersGroup}>Cancelar</Views.Button>
    <HideContainer hide={!ordersGroup} message="Abra comanda" />
  </box>
  <box class="clearCategoriesFilter">
    <Views.Button sizeMultiplier={0.6} on:click={clearFilter}>Limpar</Views.Button>
    <HideContainer hide={!ordersGroup} />
  </box>
  <box class="productsCategories">
    {#each categoriesAndProducts as productCategory}
      <category class="shadow" on:click={() => selectCategory(productCategory)}>{productCategory.title}</category>
    {/each}
    <HideContainer hide={!ordersGroup} />
  </box>
  <box class="products">
    <productsContainer>
      {#each productCategoriesList as productCategory}
        {#each productCategory.products ?? [] as product}
          <productBox>
            <productContent class="shadow box">
              <Views.Image
                styleString="min-height:100%;position:absolute;object-fit:cover;"
                source={product.image}
                name={product.title}
              />
              <description>
                <h3>{product.title}</h3>
                <span>{Utils.Strings.currency(product.price)}</span>
              </description>
            </productContent>
          </productBox>
        {/each}
      {/each}
    </productsContainer>
    <HideContainer hide={!ordersGroup} message="Abra comanda" />
  </box>
</container>

<style>
  *::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
  *::-webkit-scrollbar:disabled {
    width: 0px;
    height: 0px;
  }

  *::-webkit-scrollbar-track {
    box-shadow: inset 0 0 5px #555;
    border-radius: 2px;
    width: 2px;
    height: 2px;
  }

  *::-webkit-scrollbar-thumb {
    background: #4c0708;
    border-radius: 4px;
    width: 8px;
    height: 8px;
  }
  *::-webkit-scrollbar-thumb:hover {
    background: yellow;
  }
  list {
    overflow: scroll;
  }
  header > item,
  list > item {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 4px;
    text-align: center;
  }
  list > item {
    padding: 4px 0;
    border-top: 1px solid #ccc;
  }
  list > item:nth-child(even) {
    background-color: #cccccc1c;
  }
  list > item:first-of-type {
    border-top: unset;
  }
  header > item.header {
    padding: 0 0 4px 0;
    border-top: unset;
    font-family: 'RobotoMedium', 'Courier New', Courier, monospace;
  }
  header > item.header > div {
    background: #ccc;
    padding: 4px 8px;
    color: #000000ba;
    box-shadow: 0px 0px 4px #0000003b;
  }
  list > item > div {
    grid-column: span 1;
  }
  .span2 {
    grid-column: span 2;
  }
  .span3 {
    grid-column: span 3;
  }
  .span4 {
    grid-column: span 4;
  }
  .description {
    text-align: start;
  }
  description {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    place-content: center;
    place-items: center;
    text-shadow: 0 1px 14px #000;
    color: #fff;
    font-size: 1.3em;
    background: #00000075;
    text-align: center;
    flex-direction: column;
    padding: 8px;
  }
  description > h3 {
    margin-bottom: 16px;
  }
  .textOverflow {
    text-overflow: ellipsis;
    max-width: 100%;
    max-height: min-content;
    white-space: nowrap;
    overflow: hidden;
  }
  .box {
    padding: 16px;
    border-radius: 8px;
  }
  container {
    width: 100%;
    min-height: 100%;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: 64px repeat(5, 1fr) 48px repeat(5, 1fr);
    gap: 8px;
    max-height: 100%;
  }
  .searchOrderGroup {
    position: relative;
    grid-column: 1 / span 3;
  }
  .searchProduct {
    position: relative;
    grid-column: 4 / span 5;
  }
  .barCode {
    position: relative;
    grid-column: 9 / span 4;
  }
  .orderGroups {
    position: relative;
    grid-column: 1 / span 3;
    grid-row: 2 / span 5;
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    grid-template-rows: repeat(12, 1fr);
  }
  .orderGroups > h2 {
    grid-column: span 1;
  }
  .orderGroups > list {
    grid-column: span 1;
    grid-row: 2 / span 11;
  }
  .cartProducts {
    position: relative;
    grid-column: 4 / span 6;
    grid-row: 2 / span 5;
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    grid-template-rows: repeat(12, 1fr);
  }
  .cartProducts > list:first-of-type {
    grid-column: span 1;
  }
  .cartProducts > list:last-of-type {
    grid-column: span 1;
    grid-row: 2 / span 11;
  }
  .resume {
    position: relative;
    grid-column: 10 / span 3;
    grid-row: 2 / span 3;
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    grid-template-rows: repeat(12, 1fr);
  }
  .resume > h2 {
    grid-column: span 1;
  }
  .resume > list {
    grid-column: span 1;
    grid-row: 2 / span 11;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
  .action {
    position: relative;
    grid-column: 10 / span 3;
    grid-row: 5 / span 2;
  }
  .clearCategoriesFilter {
    position: relative;
    grid-column: 1 / span 1;
    grid-row: 7 / span 1;
  }
  .productsCategories {
    position: relative;
    grid-column: 2 / span 11;
    grid-row: 7 / span 1;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    padding: 4px 4px 12px 4px;
    overflow-x: scroll;
  }
  .productsCategories > category {
    margin-left: 16px;
    padding: 8px 24px;
    border-radius: 16px;
    display: flex;
    place-content: center;
    place-items: center;
    min-width: max-content;
    max-height: min-content;
  }
  .productsCategories > category:first-of-type {
    margin-left: 0;
  }
  .products {
    position: relative;
    grid-column: 1 / span 12;
    grid-row: 8 / span 5;
    overflow-y: hidden;
    height: 100%;
  }
  .products > productsContainer {
    display: grid;
    height: 100%;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    align-items: stretch;
    grid-auto-flow: row dense;
    padding: 4px 4px 12px 4px;
    overflow-y: scroll;
  }
  .products > productsContainer > productBox {
    position: relative;
  }
  .products > productsContainer > productBox::before {
    content: '';
    display: block;
    padding-top: 100%;
  }
  .products > productsContainer > productBox > productContent {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    display: flex;
    place-items: center;
    place-content: center;
  }
  @media (min-width: 481px) {
    container {
      display: grid;
    }
    .products > productsContainer {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  @media (min-width: 769px) {
    .products > productsContainer {
      grid-template-columns: repeat(6, 1fr);
    }
  }
  /* @media (min-width: 1025px) {
    .products > productsContainer {
      grid-template-columns: repeat(7, 1fr);
    }
  } */
  @media (min-width: 1201px) {
    .products > productsContainer {
      grid-template-columns: repeat(7, 1fr);
    }
  }
  @media (min-width: 1451px) {
    .products > productsContainer {
      grid-template-columns: repeat(9, 1fr);
    }
  }
</style>
