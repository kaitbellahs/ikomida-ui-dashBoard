<script lang="ts">
  import { Stores, Views } from '@ikomida/shared-frontend'
  import { onMount } from 'svelte'
  import type { Classes } from '@ikomida/shared-types'
  import { faTicket, faShoppingBag, faBarcode, faCamera } from '@fortawesome/free-solid-svg-icons'
  import { each } from 'svelte/internal'

  export let pos: Classes.CPos
  function getText() {
    const text = 'Item test dsfgdgsd gdfg fdg dfgh fdh fdh dfh fdg hgf jfdj'.split(' ')
    let start = Math.ceil(Math.random() * 10)
    start = start < text.length ? start : 0
    let end = Math.ceil(Math.random() * 10)
    end = end < text.length - start ? end : 1
    return text.splice(start, end).join(' ')
  }
  onMount(() => {
    Stores.Loading.instance.stop()
  })
</script>

<container>
  <box class="searchOrderGroup">
    <Views.TextEdit icon={faTicket} marginTop={24} placeHolder="Número da comanda" />
  </box>
  <box class="searchProduct">
    <Views.TextEdit icon={faShoppingBag} marginTop={24} placeHolder="Nome do produto" />
  </box>
  <box class="barCode">
    <Views.TextEdit marginTop={24} placeHolder="Código de barra" icon={faBarcode} buttonIcon={faCamera} />
  </box>
  <aside class="orderGroups shadow box">
    <h2>Comanda #000</h2>
    <list>
      <Views.TextValue text="CPF:" value="N/A" />
      <Views.TextValue text="Nome:" value="N/A" />
      <Views.Button sizeMultiplier={0.7}>Vincular cliente</Views.Button>
    </list>
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
      {#each Array.from('x'.repeat(15)) as a, i}
        <item>
          <div class="span2">12345678{i}</div>
          <div class="description span4 textOverflow">{getText()}</div>
          <div>2</div>
          <div class="span2">R$12,00</div>
          <div class="span1">R$0,00</div>
          <div class="span2">R$24,00</div>
        </item>
      {/each}
    </list>
  </box>
  <box class="resume shadow box">
    <h2>Resumo</h2>
    <list>
      <div>Subtotal</div>
      <div>R$100,00</div>
      <div>Disconto</div>
      <div>R$0,00</div>
      <div>Total</div>
      <div>R$100,00</div>
    </list>
  </box>
  <box class="action">
    <Views.Button>Finalizar</Views.Button>
  </box>
  <box class="productsCategories">
    <category class="shadow"> categoria 1</category>
    <category class="shadow"> categoria 2</category>
    <category class="shadow"> categoria 3</category>
    <category class="shadow"> categoria 4</category>
    <category class="shadow"> categoria 4 categoria 4 categoria 4</category>
    <category class="shadow"> categoria 4</category>
    <category class="shadow"> categoria 4</category>
    <category class="shadow"> categoria 4</category>
    <category class="shadow"> categoria 4</category>
    <category class="shadow"> categoria 4</category>
    <category class="shadow"> categoria 4</category>
    <category class="shadow"> categoria 4</category>
    <category class="shadow"> categoria 4</category>
    <category class="shadow"> categoria 4</category>
    <category class="shadow"> categoria 4</category>
    <category class="shadow"> categoria 4</category>
    <category class="shadow"> categoria 4</category>
    <category class="shadow"> categoria 4</category>
    <category class="shadow"> categoria 4</category>
    <category class="shadow"> categoria 4</category>
    <category class="shadow"> categoria 4</category>
    <category class="shadow"> categoria 4</category>
  </box>
  <box class="products">
    <productsContainer>
      <productBox> <productContent class="shadow box"> produto 1</productContent></productBox>
      <productBox> <productContent class="shadow box"> produto 2</productContent></productBox>
      <productBox> <productContent class="shadow box"> produto 3</productContent></productBox>
      <productBox> <productContent class="shadow box"> produto 4</productContent></productBox>
      <productBox> <productContent class="shadow box"> produto 5</productContent></productBox>
      <productBox> <productContent class="shadow box"> produto 6</productContent></productBox>
      <productBox> <productContent class="shadow box"> produto 7</productContent></productBox>
      <productBox> <productContent class="shadow box"> produto 8</productContent></productBox>
      <productBox> <productContent class="shadow box"> produto 9</productContent></productBox>
      <productBox> <productContent class="shadow box"> produto 10</productContent></productBox>
      <productBox> <productContent class="shadow box"> produto 11</productContent></productBox>
      <productBox> <productContent class="shadow box"> produto 13</productContent></productBox>
      <productBox>
        <productContent class="shadow box"> produto 14</productContent>
      </productBox>
    </productsContainer>
  </box>
</container>

<style>
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
    grid-column: 1 / span 3;
  }
  .searchProduct {
    grid-column: 4 / span 5;
  }
  .barCode {
    grid-column: 9 / span 4;
  }
  .orderGroups {
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
    grid-column: 10 / span 3;
    grid-row: 2 / span 4;
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
    grid-column: 10 / span 3;
    grid-row: 6 / span 1;
  }
  .productsCategories {
    grid-column: 1 / span 12;
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
