<script>
  import { Auth } from "../../stores/Auth";
  import { Title } from "../../stores/Navigation";
  import { Views } from "@tian/components";
  import { getLayout, updateLayout } from "../../network/Layout";
  import { StatusBar } from "../../stores/Setup";
  import { HsvPicker } from "svelte-color-picker";
  import { onMount } from "svelte";

  let isLoading = false;
  let showPicker = false;
  let errorAlert;
  let showAlert = false;
  let pickerTop = 0;
  let currentItem;

  let layout = {
    background: "#ffffff",
    color: "#000000",
    header: {
      background: "#ffe4c4",
      color: "#a52a2a",
      menuHamburger: "#000000",
    },
    tabs: { background: "#ffe4c4" },
    button: { background: "#a52a2a", color: "#ffffff" },
    dialog: { background: "#ffffffdf", color: "#ffffff" },
  };

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  async function setLaout() {
    isLoading = true;
    const response = await updateLayout(layout);
    if (!response?.success) {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  function colorCallback(rgba) {
    rgba = rgba.detail;
    var a,
      isPercent,
      rgb = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`
        .replace(/\s/g, "")
        .match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
      alpha = ((rgb && rgb[4]) || "").trim(),
      hex = rgb
        ? (rgb[1] | (1 << 8)).toString(16).slice(1) +
          (rgb[2] | (1 << 8)).toString(16).slice(1) +
          (rgb[3] | (1 << 8)).toString(16).slice(1)
        : rgba;

    if (alpha !== "") {
      a = alpha;
    } else {
      a = 1;
    }
    a = ((a * 255) | (1 << 8)).toString(16).slice(1);
    hex = hex + a;
    getSetDescendantProp(layout, currentItem, `#${hex}`);
    layout = layout;
  }

  function getSetDescendantProp(object, description, value) {
    var array = description ? description.split(".") : [];

    while (array.length && object) {
      var comparation = array.shift();
      var match = new RegExp("(.+)\\[([0-9]*)\\]").exec(comparation);

      if ((match?.length || 0) == 3) {
        var arrayData = {
          arrayName: match[1],
          arrayIndex: match[2],
        };
        if (object[arrayData.arrayName] !== undefined) {
          if (typeof value !== "undefined" && array.length === 0) {
            object[arrayData.arrayName][arrayData.arrayIndex] = value;
          }
          object = object[arrayData.arrayName][arrayData.arrayIndex];
        } else {
          object = undefined;
        }

        continue;
      }
      if (typeof value !== "undefined") {
        if (object[comparation] === undefined) {
          object[comparation] = {};
        }

        if (array.length === 0) {
          object[comparation] = value;
        }
      }

      object = object[comparation];
    }

    return object;
  }

  onMount(async () => {
    let response = await getLayout();
    if (response?.success && response?.data) {
      layout = { ...layout, ...response?.data };
    }
  });

  Title.set("Ajustes");
</script>

<div class="settings">
  <div class="data">
    <div
      class="sample"
      style="--background: {layout.background}; --color: {layout.color}; --header: {layout
        .header.background}; --headerTextColor: {layout.header
        .color}; --menuHamburger: {layout.header.menuHamburger}; "
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
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s
        </div>
        <button
          style="background: {layout.button.background};color: {layout.button
            .color}">button text</button
        >
      </div>
      <div class="tabs">
        <div style="background-color: {layout.tabs.background};">Home</div>
        <div>produtos</div>
        <div>pedidos</div>
      </div>
    </div>
    <Views.Divider />
    <h2>Layout</h2>
    <Views.TextEdit
      type="color"
      name="A cor do fundo:"
      bind:value={layout.background}
      placeHolder=""
    />
    <Views.TextEdit
      type="color"
      name="A cor do texto:"
      bind:value={layout.color}
      placeHolder=""
    />
    <Views.TextEdit
      type="color"
      name="A cor do cabeçalho:"
      bind:value={layout.header.background}
      placeHolder=""
    />
    <Views.TextEdit
      type="color"
      name="A cor do texto do cabeçalho:"
      bind:value={layout.header.color}
      placeHolder=""
    />
    <Views.TextEdit
      type="color"
      name="A cor do menu hamburger:"
      bind:value={layout.header.menuHamburger}
      placeHolder=""
    />
    <Views.TextEdit
      type="color"
      name="A cor do fundo do tabs:"
      bind:value={layout.tabs.background}
      placeHolder=""
    />
    <Views.TextEdit
      type="color"
      name="A cor do fundo do button:"
      bind:value={layout.button.background}
      placeHolder=""
    />
    <Views.TextEdit
      type="color"
      name="A cor do button:"
      bind:value={layout.button.color}
      placeHolder=""
    />
    <Views.TextEdit
      type="color"
      name="A cor do fundo do alerta:"
      bind:value={layout.dialog.background}
      placeHolder=""
    />
    <Views.TextEdit
      type="color"
      name="A cor do alerta:"
      bind:value={layout.dialog.color}
      placeHolder=""
    />
    <Views.Divider />
    <Views.Button on:click={setLaout}>Atualizar layout</Views.Button>
  </div>
</div>

{#if showPicker}
  <div class="colorPicker" style="--pickerTop:{pickerTop}px">
    <HsvPicker on:colorChange={colorCallback} startColor={"#FBFBFB"} />
  </div>
{/if}

{#if !layout || isLoading}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if}
<Views.MessageAlert object={errorAlert} bind:show={showAlert} />

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
  .colorPicker {
    display: block;
    position: fixed;
    top: var(--pickerTop);
    right: 20px;
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
</style>
