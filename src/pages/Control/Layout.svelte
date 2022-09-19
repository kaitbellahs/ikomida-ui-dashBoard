<script lang="ts">
  import { Views, Utils, Stores, Types } from '@ikomida/shared-frontend';
  import { getLayout, updateLayout } from '../../network/Layout';
  import { onMount } from 'svelte';

  interface ILayoutInputs {
    link: Views.TextEdit;
    background: Views.TextEdit;
    color: Views.TextEdit;
    header: {
      color: Views.TextEdit;
      background: Views.TextEdit;
      menuHamburger: Views.TextEdit;
    };
    tabs: { background: Views.TextEdit; color: Views.TextEdit };
    button: { background: Views.TextEdit; color: Views.TextEdit };
    dialog: { background: Views.TextEdit; color: Views.TextEdit };
  }

  let layout: Types.Classes.CLayout = Types.Classes.CLayout.fromObject({
    link: '#e8d130',
    background: '#dfdfdf',
    color: '#000000',
    header: {
      color: '#ffffff',
      background: '#4c0708',
      menuHamburger: '#ffffff',
    },
    tabs: { background: '#ffe4c4', color: '#4c0708' },
    button: { background: '#4c0708', color: '#ffffff' },
    dialog: { background: '#ffffffdf', color: '#4c0708' },
  });
  let layoutInputs = {
    link: {},
    background: {},
    color: {},
    header: {
      color: {},
      background: {},
      menuHamburger: {},
    },
    tabs: { background: {}, color: {} },
    button: { background: {}, color: {} },
    dialog: { background: {}, color: {} },
  } as ILayoutInputs;

  async function setLaout() {
    Stores.Loading.instance.start();
    const response = await updateLayout(layout);
    if (!response?.success) {
      Stores.MessageAlert.instance.show(response?.data);
    }
    Stores.Loading.instance.stop();
  }

  onMount(async () => {
    let response = await getLayout();
    if (response?.success && response?.data) {
      layout = Object.assign(layout, response?.data);
      Utils?.Objects?.updateInputs(layoutInputs, layout);
    }
    Stores.Loading.instance.stop();
  });

  Stores.Title.instance.set('Ajustes');
</script>

<div class="settings">
  <div class="data">
    <div
      class="sample"
      style="--background: {layout.background}; --color: {layout.color}; --header: {layout.header
        ?.background}; --headerTextColor: {layout.header?.color}; --menuHamburger: {layout.header?.menuHamburger}; "
    >
      <div class="header">
        <div class="menuSandwich">
          <div />
          <div />
          <div />
        </div>
        <span>Page title</span>
      </div>
      <div class="body">
        <div class="box">
          Aqui é uma simulação dos textos normais do seu app.<br />
          <span style="color: {layout.link};">Aqui está um link</span>
        </div>
        <button style="background: {layout.button?.background};color: {layout.button?.color}"
          >Aqui um texto dentro de um botão</button
        >
      </div>
      <div style="background-color: {layout.tabs?.background};color: {layout.tabs?.color};" class="tabs">
        <div style="color: {layout.tabs?.background};background-color: {layout.tabs?.color};">Home</div>
        <div>produtos</div>
        <div>pedidos</div>
      </div>
    </div>
    <Views.Divider />
    <h2>Layout</h2>
    <small>Aqui você pode alterar as cores do seu app como quiser</small>
    <div id="options">
      <Views.TextEdit
        type="color"
        placeHolder="A cor do link"
        bind:value={layout.link}
        bind:this={layoutInputs.link}
        initialValue={layout.link}
      />
      <Views.TextEdit
        type="color"
        placeHolder="A cor do fundo"
        bind:value={layout.background}
        bind:this={layoutInputs.background}
        initialValue={layout.background}
      />
      <Views.TextEdit
        type="color"
        placeHolder="A cor do texto"
        bind:value={layout.color}
        bind:this={layoutInputs.color}
        initialValue={layout.color}
      />
      <Views.TextEdit
        type="color"
        placeHolder="A cor do cabeçalho"
        bind:value={layout.header.background}
        bind:this={layoutInputs.header.background}
        initialValue={layout.header.background}
      />
      <Views.TextEdit
        type="color"
        placeHolder="A cor do texto do cabeçalho"
        bind:value={layout.header.color}
        bind:this={layoutInputs.header.color}
        initialValue={layout.header.color}
      />
      <Views.TextEdit
        type="color"
        placeHolder="A cor do menu hamburger"
        bind:value={layout.header.menuHamburger}
        bind:this={layoutInputs.header.menuHamburger}
        initialValue={layout.header.menuHamburger}
      />
      <Views.TextEdit
        type="color"
        placeHolder="A cor do fundo do tabs"
        bind:value={layout.tabs.background}
        bind:this={layoutInputs.tabs.background}
        initialValue={layout.tabs.background}
      />
      <Views.TextEdit
        type="color"
        placeHolder="A cor do texto do tabs"
        bind:value={layout.tabs.color}
        bind:this={layoutInputs.tabs.color}
        initialValue={layout.tabs.color}
      />
      <Views.TextEdit
        type="color"
        placeHolder="A cor do fundo do botão"
        bind:value={layout.button.background}
        bind:this={layoutInputs.button.background}
        initialValue={layout.button.background}
      />
      <Views.TextEdit
        type="color"
        placeHolder="A cor do botão"
        bind:value={layout.button.color}
        bind:this={layoutInputs.button.color}
        initialValue={layout.button.color}
      />
      <Views.TextEdit
        type="color"
        placeHolder="A cor do fundo do alerta"
        bind:value={layout.dialog.background}
        bind:this={layoutInputs.dialog.background}
        initialValue={layout.dialog.background}
      />
      <Views.TextEdit
        type="color"
        placeHolder="A cor do alerta"
        bind:value={layout.dialog.color}
        bind:this={layoutInputs.dialog.color}
        initialValue={layout.dialog.color}
      />
    </div>
    <Views.Divider />
    <Views.Button on:click={setLaout}>Atualizar o layout</Views.Button>
  </div>
</div>

<style>
  .settings {
    padding-bottom: 50px;
  }
  .settings > div {
    width: 100%;
  }
  .settings > div > h2 {
    margin-left: 20px;
  }
  .settings > .data {
    width: 100%;
    float: left;
    margin-top: 20px;
  }
  .sample {
    height: 300px;
    background: var(--background);
    color: var(--color);
    padding: 20px;
    position: relative;
  }
  .sample > .header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 40px;
    background: var(--header);
    color: var(--headerTextColor);
    display: flex;
    align-items: center;
  }
  .sample > .header > span {
    margin-left: 20px;
  }
  .sample > .header > .menuSandwich {
    width: 40px;
    height: 40px;
  }
  .sample > .header > .menuSandwich > div {
    background: var(--menuHamburger);
    margin-bottom: 4px;
    height: 8px;
    border-radius: 4px;
  }
  .sample > .body > .box {
    margin-top: 30px;
  }
  .sample > .tabs {
    display: flex;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: gray;
  }
  .sample > .tabs > div {
    border: 0;
    background: transparent;
    display: flex;
    flex: 1 33%;
    align-self: center;
    margin: 0;
    height: 40px;
    text-align: center;
    justify-content: center;
    flex-direction: column;
  }
  #options {
    height: 100%;
    overflow-y: scroll;
  }
</style>
