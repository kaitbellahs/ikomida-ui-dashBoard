<script lang="ts">
  import { Views, Utils, Stores, Types } from '@ikomida/shared-frontend'
  import { getLayout, updateLayout } from '../../network/Layout'
  import { onMount, tick } from 'svelte'
  import { StatusBar } from '../../stores/Setup'

  const ANIMATION_PREFIX = 'animate__'

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
    backgroundImage: '',
    header: {
      color: '#ffffff',
      background: '#4c0708',
      menuHamburger: '#ffffff'
    },
    product: {
      animation: {
        in: undefined,
        out: undefined
      }
    },
    tabs: { background: '#e5e4e3', color: '#4c0708' },
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

  let ExpandableBox: Stores.ExpandableBox
  let inAnimation: Types.Types.TAnimation | undefined = undefined
  let outAnimation: Types.Types.TAnimation | undefined = undefined
  let backgroundImage: Views.UploadablePhoto

  let product: HTMLDivElement

  $: styleHeight = `--height:${Number($StatusBar.height + ($StatusBar.topMargin ?? 0)) + 44}px;`

  $: if (inAnimation && product) {
    layout.product.animation.in = inAnimation.id
    Utils.Objects.animateCSS(product, layout.product.animation.in, ANIMATION_PREFIX)
  }

  $: if (outAnimation && product) {
    layout.product.animation.out = outAnimation.id
    Utils.Objects.animateCSS(product, layout.product.animation.out, ANIMATION_PREFIX)
  }
  $: console.log(inAnimation)
  $: if ($ExpandableBox) {
    updateInputs()
  }
  async function updateInputs() {
    await tick()
    Utils?.Objects?.updateInputs(layoutInputs, layout)
  }

  function resetBackgroundImage() {
    layout.backgroundImage = ''
  }

  async function setLaout() {
    Stores.Loading.instance.start()
    const response = await updateLayout(layout)
    if (!response?.success) {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  }

  onMount(async () => {
    ExpandableBox = Stores.ExpandableBox.createInstance().store
    let response = await getLayout()
    if (response.success && response.data) {
      layout = Types.Classes.CLayout.fromObject({ ...layout.toJSON(), ...response?.data })
      if (layout.product.animation.in) {
        inAnimation =
          Types.Types.TAnimation.values().filter(value => value.id === layout.product.animation.in)?.[0] ?? undefined
      }
      if (layout.product.animation.out) {
        outAnimation =
          Types.Types.TAnimation.values().filter(value => value.id === layout.product.animation.out)?.[0] ?? undefined
      }
    }
    Utils?.Objects?.updateInputs(layoutInputs, layout)
    Stores.Loading.instance.stop()
  })

  Stores.Title.instance.set('Ajustes')
</script>

<data style={styleHeight}>
  <sample
    class="shadow"
    style="--background: {layout.background}; --color: {layout.color}; --header: {layout.header
      ?.background}; --headerTextColor: {layout.header?.color}; --menuHamburger: {layout.header?.menuHamburger};"
  >
    <iphone>
      <inSide>
        <ear />
        <div class="header">
          <div class="menuSandwich">
            <div />
            <div />
            <div />
          </div>
          <span>Título da página</span>
        </div>
        <div class="body" style="--backgroundImage: url('{layout.backgroundImage ? layout.backgroundImage : 'none'}');">
          <Views.Divider height={16} />
          <div class="box">
            Aqui é uma simulação dos textos normais do seu app.<br />
            <span style="color: {layout.link};">Aqui está um link</span>
          </div>
          <Views.Divider height={8} />
          <div
            class="shadow box {ANIMATION_PREFIX}animated"
            style="background: {layout.itemBackground};"
            bind:this={product}
          >
            <h2>Produto</h2>
            <p>Aqui é uma simulação da caixa dos produtos.</p>
          </div>
          <Views.Divider height={8} />
          <button class="button shadow" style="background: {layout.button?.background};color: {layout.button?.color}"
            >Aqui um texto dentro de um botão</button
          >
        </div>
        <div class="shadow tabs" style="background-color: {layout.tabs?.background};color: {layout.tabs?.color};">
          <div style="color: {layout.tabs?.background};background-color: {layout.tabs?.color};">Home</div>
          <div>Produtos</div>
          <div>Pedidos</div>
        </div>
      </inSide>
    </iphone>
  </sample>
  <section style="padding-bottom: 64px;background-color: rgb(223, 223, 223);">
    <h2>Layout</h2>
    <small>Aqui você pode alterar as cores do seu APP como quiser</small>
    <Views.ExpandableBox title="Cabeçalho">
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
    </Views.ExpandableBox>
    <Views.ExpandableBox title="Geral">
      <div class="image">
        <Views.FloatRemove top={0} right={0} callback={resetBackgroundImage} />
        <span>Imagem do fundo</span>
        <Views.UploadablePhoto
          bind:this={backgroundImage}
          bind:image={layout.backgroundImage}
          title="Imagem do fundo"
          type={Types.TUploadablePhoto.THUMB}
        />
      </div>
      <Views.TextEdit
        type={Types.TTextEdit.COLOR}
        placeHolder="A cor do fundo"
        bind:value={layout.background}
        bind:this={layoutInputs.background}
        initialValue={layout.background}
      />
      <Views.TextEdit
        type={Types.TTextEdit.COLOR}
        placeHolder="A cor do link"
        bind:value={layout.link}
        bind:this={layoutInputs.link}
        initialValue={layout.link}
      />
      <Views.TextEdit
        type={Types.TTextEdit.COLOR}
        placeHolder="A cor do texto"
        bind:value={layout.color}
        bind:this={layoutInputs.color}
        initialValue={layout.color}
      />
    </Views.ExpandableBox>
    <Views.ExpandableBox title="Botão">
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
    </Views.ExpandableBox>
    <Views.ExpandableBox title="Produtos">
      <Views.TextEdit
        type={Types.TTextEdit.COLOR}
        placeHolder="A cor da caixa dos produtos"
        bind:value={layout.itemBackground}
        bind:this={layoutInputs.itemBackground}
        initialValue={layout.itemBackground}
      />
      <Views.Selector
        bind:selected={inAnimation}
        options={Types.Types.TAnimation.values()}
        name="Animação de entrada"
      />
      <Views.Selector bind:selected={outAnimation} options={Types.Types.TAnimation.values()} name="animação de saída" />
    </Views.ExpandableBox>
    <Views.ExpandableBox title="Alerta">
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
    </Views.ExpandableBox>
    <Views.ExpandableBox title="Rodapé">
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
    </Views.ExpandableBox>
    <Views.Divider />
    <Views.Button on:click={setLaout}>Atualizar o layout</Views.Button>
  </section>
</data>

<style>
  data {
    position: relative;
    padding-bottom: 48px;
    width: 100%;
    float: left;
    margin-top: 16px;
  }
  sample {
    background: var(--background) url(/assets/images/paint.jpg) center center/cover no-repeat;
    height: 320px;
    color: var(--color);
    padding: 16px 16px 40px 16px;
    position: fixed;
    left: 0;
    right: 0;
    top: var(--height);
    display: flex;
    align-items: center;
    place-content: center;
  }
  iphone {
    position: relative;
    width: 160px;
    height: 100%;
    background-color: black;
    padding: 2px;
    border-radius: 4px;
    overflow: hidden;
  }
  iphone > inSide {
    background-color: var(--background);
    font-size: 0.7rem;
    padding: 0;
    position: absolute;
    left: 2px;
    right: 2px;
    width: unset;
    height: unset;
    bottom: 2px;
    border-radius: 4px;
    top: 2px;
  }
  iphone > inSide > ear {
    top: -2px;
    background-color: #fff;
    border-radius: 0 0px 4px 4px;
    height: 7px;
    left: 40%;
    position: absolute;
    right: 40%;
    z-index: 999999;
  }
  iphone > inSide > .header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 32px;
    padding: 4px;
    background: var(--header);
    color: var(--headerTextColor);
    display: flex;
    align-items: center;
    z-index: 999998;
  }
  iphone > inSide > .header > span {
    margin-left: 16px;
  }
  iphone > inSide > .header > .menuSandwich {
    height: 32px;
    width: 24px;
    padding-top: 2px;
  }
  iphone > inSide > .header > .menuSandwich > div {
    background: var(--menuHamburger);
    margin-top: 6px;
    height: 2px;
    border-radius: 2px;
  }
  iphone > inSide > .body {
    position: relative;
    top: 0;
    left: 0;
    right: 0;
    overflow: hidden;
    overflow-y: scroll;
    max-height: 100%;
    padding: 8px;
    padding-bottom: 32px;
    z-index: 9;
    padding-top: 16px;
    height: 100%;
  }
  iphone > inSide > .body > .button {
    z-index: 999998;
    position: relative;
  }
  iphone > inSide > .body::before {
    content: '';
    background-image: var(--backgroundImage);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: -52px;
    opacity: 0.3;
  }
  iphone > inSide > .body > .box {
    background-color: var(--background);
    position: relative;
    margin-top: 8px;
    border-radius: 4px;
    padding: 16px;
  }
  iphone > inSide > .body > .box.shadow {
    margin-top: 0;
  }
  iphone > inSide > .tabs {
    display: flex;
    position: absolute;
    left: 8px;
    right: 8px;
    bottom: 8px;
    border-radius: 4px;
    background: gray;
    overflow: hidden;
    z-index: 999997;
  }
  iphone > inSide > .tabs > div {
    border: 0;
    background: transparent;
    display: flex;
    flex: 1 33%;
    align-self: center;
    margin: 0;
    height: 24px;
    text-align: center;
    justify-content: center;
    flex-direction: column;
  }
  section {
    position: absolute;
    padding: 16px;
    padding-bottom: 104px;
    left: 0;
    right: 0;
    top: calc(222px + var(--height));
    border-radius: 16px 16px 0 0;
    background: #fff;
    box-shadow: 0 -4px 8px #0000009e;
    text-align: center;
    min-width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-height: 60vh;
    overflow-x: scroll;
  }

  @media (min-width: 481px) {
    data {
      flex-wrap: wrap;
      display: flex;
      height: 100%;
    }
    iphone {
      width: 25vw;
      max-width: 25vw;
    }
    sample {
      height: unset;
      position: relative;
      left: unset;
      right: unset;
      top: unset;
      width: 40%;
      flex-grow: 1;
    }
    section {
      position: relative;
      left: unset;
      right: unset;
      top: unset;
      min-width: 40%;
      margin: unset;
      max-height: 100%;
      width: 40%;
      flex-grow: 1;
      border-radius: 0;
    }
  }
</style>
