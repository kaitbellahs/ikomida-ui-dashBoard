<script lang="ts">
  import { Views, Utils, Stores, Types } from '@ikomida/shared-frontend'
  import { getLayout, updateLayout } from '../../network/Layout'
  import { onMount } from 'svelte'
  import Divider from '@ikomida/shared-frontend/lib/components/Divider.svelte'

  interface ILayoutInputs {
    link: Views.TextEdit
    itemBackground: Views.TextEdit
    background: Views.TextEdit
    color: Views.TextEdit
    header: {
      color: Views.TextEdit
      background: Views.TextEdit
      menuHamburger: Views.TextEdit
    }
    tabs: { background: Views.TextEdit; color: Views.TextEdit }
    button: { background: Views.TextEdit; color: Views.TextEdit }
    dialog: { background: Views.TextEdit; color: Views.TextEdit }
  }

  let layout: Types.Classes.CLayout = Types.Classes.CLayout.fromObject({
    link: '#e8d130',
    itemBackground: '#fffffffc',
    background: '#dfdfdf',
    color: '#000000',
    header: {
      color: '#ffffff',
      background: '#4c0708',
      menuHamburger: '#ffffff'
    },
    tabs: { background: '#ffe4c4', color: '#4c0708' },
    button: { background: '#4c0708', color: '#ffffff' },
    dialog: { background: '#ffffffdf', color: '#4c0708' }
  })
  let layoutInputs = {
    link: {},
    itemBackground: {},
    background: {},
    color: {},
    header: {
      color: {},
      background: {},
      menuHamburger: {}
    },
    tabs: { background: {}, color: {} },
    button: { background: {}, color: {} },
    dialog: { background: {}, color: {} }
  } as ILayoutInputs

  async function setLaout() {
    Stores.Loading.instance.start()
    const response = await updateLayout(layout)
    if (!response?.success) {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  }

  onMount(async () => {
    let response = await getLayout()
    if (response.success && response.data) {
      layout = Object.assign(layout, response?.data)
    }
    Utils?.Objects?.updateInputs(layoutInputs, layout)
    Stores.Loading.instance.stop()
  })

  Stores.Title.instance.set('Ajustes')
</script>

<div class="settings">
  <div class="data">
    <div
      class="shadow sample"
      style="--background: {layout.background}; --color: {layout.color}; --header: {layout.header
        ?.background}; --headerTextColor: {layout.header?.color}; --menuHamburger: {layout.header?.menuHamburger}; "
    >
      <div class="iphone outSide">
        <div class="inSide">
          <div class="ear" />
          <div class="header">
            <div class="menuSandwich">
              <div />
              <div />
              <div />
            </div>
            <span>Título da página</span>
          </div>
          <div class="body">
            <div class="box">
              Aqui é uma simulação dos textos normais do seu app.<br />
              <span style="color: {layout.link};">Aqui está um link</span>
            </div>
            <div class="shadow box" style="background: {layout.itemBackground};">
              <h2>Produto</h2>
              <p>Aqui é uma simulação da caixa dos produtos.</p>
            </div>
            <Views.Divider height={16} />
            <button class="shadow" style="background: {layout.button?.background};color: {layout.button?.color}"
              >Aqui um texto dentro de um botão</button
            >
          </div>
          <div class="shadow tabs" style="background-color: {layout.tabs?.background};color: {layout.tabs?.color};">
            <div style="color: {layout.tabs?.background};background-color: {layout.tabs?.color};">Home</div>
            <div>Produtos</div>
            <div>Pedidos</div>
          </div>
        </div>
      </div>
    </div>
    <section style="padding-bottom: 64pt;background-color: rgb(223, 223, 223);">
      <h2>Layout</h2>
      <small>Aqui você pode alterar as cores do seu app como quiser</small>
      <div id="options">
        <Views.TextEdit
          type={Types.TTextEdit.COLOR}
          placeHolder="A cor do link"
          bind:value={layout.link}
          bind:this={layoutInputs.link}
          initialValue={layout.link}
        />
        <Views.TextEdit
          type={Types.TTextEdit.COLOR}
          placeHolder="A cor do fundo"
          bind:value={layout.background}
          bind:this={layoutInputs.background}
          initialValue={layout.background}
        />
        <Views.TextEdit
          type={Types.TTextEdit.COLOR}
          placeHolder="A cor da caixa dos produtos"
          bind:value={layout.itemBackground}
          bind:this={layoutInputs.itemBackground}
          initialValue={layout.itemBackground}
        />
        <Views.TextEdit
          type={Types.TTextEdit.COLOR}
          placeHolder="A cor do texto"
          bind:value={layout.color}
          bind:this={layoutInputs.color}
          initialValue={layout.color}
        />
        <Views.TextEdit
          type={Types.TTextEdit.COLOR}
          placeHolder="A cor do cabeçalho"
          bind:value={layout.header.background}
          bind:this={layoutInputs.header.background}
          initialValue={layout.header.background}
        />
        <Views.TextEdit
          type={Types.TTextEdit.COLOR}
          placeHolder="A cor do texto do cabeçalho"
          bind:value={layout.header.color}
          bind:this={layoutInputs.header.color}
          initialValue={layout.header.color}
        />
        <Views.TextEdit
          type={Types.TTextEdit.COLOR}
          placeHolder="A cor do menu hamburger"
          bind:value={layout.header.menuHamburger}
          bind:this={layoutInputs.header.menuHamburger}
          initialValue={layout.header.menuHamburger}
        />
        <Views.TextEdit
          type={Types.TTextEdit.COLOR}
          placeHolder="A cor do fundo do tabs"
          bind:value={layout.tabs.background}
          bind:this={layoutInputs.tabs.background}
          initialValue={layout.tabs.background}
        />
        <Views.TextEdit
          type={Types.TTextEdit.COLOR}
          placeHolder="A cor do texto do tabs"
          bind:value={layout.tabs.color}
          bind:this={layoutInputs.tabs.color}
          initialValue={layout.tabs.color}
        />
        <Views.TextEdit
          type={Types.TTextEdit.COLOR}
          placeHolder="A cor do fundo do botão"
          bind:value={layout.button.background}
          bind:this={layoutInputs.button.background}
          initialValue={layout.button.background}
        />
        <Views.TextEdit
          type={Types.TTextEdit.COLOR}
          placeHolder="A cor do botão"
          bind:value={layout.button.color}
          bind:this={layoutInputs.button.color}
          initialValue={layout.button.color}
        />
        <Views.TextEdit
          type={Types.TTextEdit.COLOR}
          placeHolder="A cor do fundo do alerta"
          bind:value={layout.dialog.background}
          bind:this={layoutInputs.dialog.background}
          initialValue={layout.dialog.background}
        />
        <Views.TextEdit
          type={Types.TTextEdit.COLOR}
          placeHolder="A cor do alerta"
          bind:value={layout.dialog.color}
          bind:this={layoutInputs.dialog.color}
          initialValue={layout.dialog.color}
        />
      </div>
      <Views.Divider />
      <Views.Button on:click={setLaout}>Atualizar o layout</Views.Button>
    </section>
  </div>
</div>

<style>
  .settings {
    padding-bottom: 48pt;
  }
  .settings > div {
    width: 100%;
  }
  .settings > div > h2 {
    margin-left: 16pt;
  }
  .settings > .data {
    width: 100%;
    float: left;
    margin-top: 16pt;
  }
  .sample {
    height: 320pt;
    background: var(--background);
    color: var(--color);
    padding: 16pt 16pt 40pt 16pt;
    position: fixed;
    left: 0;
    right: 0;
    top: 48pt;
    display: flex;
    align-items: center;
    place-content: center;
  }
  .iphone.outSide {
    position: relative;
    width: 160pt;
    height: 100%;
    background-color: black;
    padding: 2pt;
    border-radius: 4pt;
  }
  .iphone > .inSide {
    position: relative;
    top: -0;
    width: 100%;
    height: 100%;
    background-color: var(--background);
    font-size: 0.7rem;
    padding: 16pt;
  }
  .iphone > .inSide > .ear {
    top: -2pt;
    background-color: #fff;
    border-radius: 0 0pt 4pt 4pt;
    height: 7pt;
    left: 40%;
    position: absolute;
    right: 40%;
    z-index: 999999;
  }
  .iphone > .inSide > .header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 32pt;
    padding: 4pt;
    background: var(--header);
    color: var(--headerTextColor);
    display: flex;
    align-items: center;
  }
  .iphone > .inSide > .header > span {
    margin-left: 16pt;
  }
  .iphone > .inSide > .header > .menuSandwich {
    height: 32pt;
    width: 24pt;
    padding-top: 2pt;
  }
  .iphone > .inSide > .header > .menuSandwich > div {
    background: var(--menuHamburger);
    margin-top: 6pt;
    height: 2pt;
    border-radius: 2pt;
  }
  .iphone > .inSide > .body > .box {
    margin-top: 8pt;
    border-radius: 4pt;
    padding: 16pt;
  }
  .iphone > .inSide > .body > .box.shadow {
    margin-top: 0;
  }
  .iphone > .inSide > .tabs {
    display: flex;
    position: absolute;
    left: 8pt;
    right: 8pt;
    bottom: 8pt;
    border-radius: 4pt;
    background: gray;
    overflow: hidden;
  }
  .iphone > .inSide > .tabs > div {
    border: 0;
    background: transparent;
    display: flex;
    flex: 1 33%;
    align-self: center;
    margin: 0;
    height: 24pt;
    text-align: center;
    justify-content: center;
    flex-direction: column;
  }
  #options {
    height: 100%;
    overflow-y: scroll;
  }
  section {
    position: absolute;
    padding: 16pt;
    padding-bottom: 64pt;
    left: 0;
    right: 0;
    top: 336pt;
    border-radius: 16pt 16pt 0 0;
    background: #fff;
    box-shadow: 0 -4pt 8pt #0000009e;
    height: fit-content;
    text-align: center;
    min-width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    place-content: center;
  }
</style>
