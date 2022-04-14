<script>
  import { Auth } from "../../stores/Auth";
  import { Title } from "../../stores/Navigation";
  import { Views } from "@tian/components";
  import {
    getSettings,
    updatePaymentGateway,
    updateBusinessHours,
  } from "../../network/Settings";
  import { updatePassword } from "../../network/Auth";
  import { StatusBar } from "../../stores/Setup";
  import Fa from "svelte-fa";
  import {
    faPhone,
    faAt,
    faKey,
    faEnvelope,
    faClock,
    faTrashAlt,
  } from "@fortawesome/free-solid-svg-icons";
  import { HsvPicker } from "svelte-color-picker";
  import { onMount } from "svelte";

  let isLoading = false;
  let showPicker = false;
  let errorAlert;
  let showAlert = false;
  let pickerTop = 0;
  let currentItem;
  function onFocus(event, item) {
    const elementRect = event.target?.getBoundingClientRect();
    pickerTop = elementRect.top - 280;
    showPicker = true;
    currentItem = item;
  }
  function onBlur() {
    showPicker = false;
  }

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  let layout = {};

  onMount(async () => {
    layout = await getLayout();
  });

  async function setLaout() {
    isLoading = true;
    const response = await updatePaymentGateway(layout);
    if (!response?.success) {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }
  function colorCallback(rgba) {
    rgba = rgba.detail;
    console.log(rgba);
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
    // multiply before convert to HEX
    a = ((a * 255) | (1 << 8)).toString(16).slice(1);
    hex = hex + a;

    layout[currentItem] = `#${hex}`;
    layout = layout;
  }

  Title.set("Ajustes");
</script>

<div
  class="colorPicker {showPicker ? 'showPicker' : ''}"
  style="--pickerTop:{pickerTop}px"
>
  <HsvPicker on:colorChange={colorCallback} startColor={"#FBFBFB"} />
</div>
<div class="settings">
  <div class="data">
    <h2>Layout</h2>
    <div class="sample" style="--background:{layout.background};--color:{layout.color}">Texto exemplo</div>
    <Views.TextEdit
      on:focus={(event) => {
        onFocus(event, "background");
      }}
      on:blur={onBlur}
      name="A cor do fundo:"
      bind:value={layout.background}
      placeHolder=""
    />
    <Views.TextEdit
      on:focus={(event) => {
        onFocus(event, "color");
      }}
      on:blur={onBlur}
      name="A cor do texto:"
      bind:value={layout.color}
      placeHolder=""
    />
    <Views.Divider />
    <Views.Button on:click={setLaout}>Atualizar layout</Views.Button>
  </div>
</div>

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
    display: none;
    position: absolute;
    top: var(--pickerTop);
    right: 20px;
  }
  .colorPicker.showPicker {
    display: block;
  }
  .sample {
    height: 300px;
    background: var(--background);
    color: var(--color);
    padding: 20px;
  }
</style>
