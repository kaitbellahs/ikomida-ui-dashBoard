<script>
  import { Title, Router } from "../../stores/Navigation";
  import { Views, Utils } from "@ikomida/components";
  import {
    getSettings,
    updatePaymentGateway,
    updateBusinessHours,
    setDelivery,
    getPagSeguroUrl,
    revokePaymentGateway,
  } from "../../network/Settings";
  import { StatusBar } from "../../stores/Setup";
  import Fa from "svelte-fa";
  import {
    faAt,
    faKey,
    faClock,
    faTrashAlt,
  } from "@fortawesome/free-solid-svg-icons";
  import { AppLauncher } from "@capacitor/app-launcher";
  import { Clipboard } from "@capacitor/clipboard";
  import { onMount } from "svelte";
  import { v4 as uuid } from "uuid";
  import { CAPNativeLog } from "capacitor-native-log";

  let paymentGateway = { type: null, data: null };
  let delivery = { value: 0, min: 0, free: false };
  let preparation = { min: 0, max: 0 };
  let isLoading = false;
  let errorAlert;
  let showAlert = false;

  const days = [
    { name: "Domingo", checked: false },
    { name: "Segunda-feira", checked: false },
    { name: "Terça-feira", checked: false },
    { name: "Quarta-feira", checked: false },
    { name: "Quinta-feira", checked: false },
    { name: "Sexta-feira", checked: false },
    { name: "Sabado", checked: false },
  ];

  let business = {
    days: [],
    hours: [
      {
        id: uuid(),
        start: null,
        end: null,
      },
    ],
  };

  let integratePagSeguro = { callback: false, url: null };

  $: if ($Router.options) {
    integratePagSeguro = { ...integratePagSeguro, ...$Router.options };
    CAPNativeLog.log({
      level: "info",
      message: `$Router.options: ${JSON.stringify($Router.options)}`,
    });
  }

  $: if (integratePagSeguro?.callback && !paymentGateway?.type) {
    integratePagSeguro.callback = false;
    CAPNativeLog.log({
      level: "info",
      message: `integratePagSeguro?.url: ${
        integratePagSeguro?.url
      }, typeof:${typeof integratePagSeguro}`,
    });
    console.log(integratePagSeguro);
    if (integratePagSeguro?.url) {
      isLoading = true;
      const url = new URL(integratePagSeguro?.url);
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const payload = { code, state };
      CAPNativeLog.log({
        level: "info",
        message: `updatePaymentGateway: ${JSON.stringify(payload)}`,
      });
      updatePaymentGateway(payload).then((response) => {
        CAPNativeLog.log({
          level: "info",
          message: `response: ${JSON.stringify(response)}`,
        });
        if (!response?.success) {
          toggleErrorAlert(response?.data);
        } else {
          paymentGateway = { ...paymentGateway, ...response?.data };
          toggleErrorAlert(`${response?.data?.type} foi integrado com sucesso`);
        }
        isLoading = false;
      });
    }
  }

  $: integrateButtonName = paymentGateway?.type
    ? "Cancelar a integgração com pagseguro"
    : "Integrar sua conta pagseguro";

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  const addHours = () => {
    business?.hours?.push({ id: uuid(), start: null, end: null });
    business.hours = business?.hours;
  };

  function onRemoveClick(id) {
    business.hours = business?.hours?.filter(
      (businessHour) => businessHour.id !== id
    );
  }

  async function updateHours() {
    isLoading = true;
    for (const businessHour of business?.hours) {
      if (businessHour?.start === null || businessHour?.start?.length < 4) {
        toggleErrorAlert("horario de abertura invalido!");
        isLoading = false;
        return;
      } else if (businessHour?.end === null || businessHour?.end?.length < 4) {
        toggleErrorAlert("horario de fechamento invalido!");
        isLoading = false;
        return;
      }
    }
    business.days = [];
    for (let i = 0; i < days.length; i++) {
      if (days[i].checked) {
        business.days.push(i);
      }
    }
    if (business.days === null || business.days.length < 1) {
      toggleErrorAlert("Precisa escolher pelo menos um dia de funcionamento!");
      isLoading = false;
      return;
    }
    let response = await updateBusinessHours(business);
    if (response.success) {
      toggleErrorAlert("horario de funcionamento atualizado com sucesso!");
    } else {
      toggleErrorAlert(response?.data);
      isLoading = false;
      return;
    }
    isLoading = false;
  }

  // async function setPaymentGateway() {
  //   isLoading = true;
  //   const response = await updatePaymentGateway(paymentGateway);
  //   if (!response?.success) {
  //     toggleErrorAlert(response?.data);
  //   }
  //   isLoading = false;
  // }

  async function updateDelivery() {
    isLoading = true;
    const response = await setDelivery(preparation, delivery);
    if (!response?.success) {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  async function requestPagSeguroIntegration() {
    isLoading = true;
    if (paymentGateway?.type) {
      const response = await revokePaymentGateway;
      if (response?.success) {
        toggleErrorAlert(
          `a integração do pagseguro com nossos sistemas foi revogado com sucesso!`
        );
      } else {
        toggleErrorAlert(
          `Não foi possível revogar a integração, tente novamente mais tarde!`
        );
      }
    } else {
      const response = await getPagSeguroUrl();
      if (response?.success) {
        const url = response?.data?.url;
        if (!url) {
          toggleErrorAlert(
            `Não foi possível obter url de integração, tente novamente mais tarde!`
          );
          return;
        }
        const { value } = await AppLauncher.canOpenUrl({ url });
        if (value) {
          await AppLauncher.openUrl({ url });
        } else {
          await Clipboard.write({ string: url });
          toggleErrorAlert(
            `Não foi possível abrir navigador externo: por favor abrir o seu navigaro e digitar esa URL: ${url}, também foi copiado para sua área de transferência!`
          );
        }
      }
    }
    isLoading = false;
    return null;
  }

  onMount(async () => {
    const response = await getSettings();
    paymentGateway = { ...paymentGateway, ...response?.paymentGateway };
    business = { ...business, ...response?.business };
    for (const index of business?.days || []) {
      days[index].checked = true;
    }
    delivery = { ...delivery, ...response?.delivery };
    preparation = { ...preparation, ...response?.preparation };
  });

  Title.set("Ajustes");
</script>

<div class="settings">
  <div class="data">
    <h2>horário de funcionamento</h2>
    {#each business?.hours || [] as businessHour}
      <div class="busninessHours">
        <span on:click={onRemoveClick(businessHour.id)} class="remove"
          ><Fa icon={faTrashAlt} /></span
        >
        <div class="twoCells">
          <Views.TextEdit
            name="Abertura:"
            mask="__:__"
            bind:value={businessHour.start}
            bind:rawValue={businessHour.start}
            placeHolder=""
            type="number"
            rightPadding="10px"
          />
          <Views.TextEdit
            name="Fechamento:"
            bind:value={businessHour.end}
            bind:rawValue={businessHour.end}
            placeHolder=""
            mask="__:__"
            type="number"
            leftPadding="10px"
          />
        </div>
      </div>
    {/each}
    <Views.Divider />
    <Views.Button on:click={addHours}
      ><Fa icon={faClock} /><span>Addicionar horarios</span></Views.Button
    >
    {#each days as day}
      <div class="address">
        <span
          ><input type="checkbox" bind:checked={day.checked} /> {day.name}</span
        >
      </div>
    {/each}
    <Views.Button on:click={updateHours}
      ><Fa icon={faClock} /><span>Atualizar horarios</span></Views.Button
    >
    <!-- <Views.Divider />
    <Views.Button on:click={setPaymentGateway}>Atualizar os dados</Views.Button> -->
    <Views.Divider />
    <h2>Gateway de pagament</h2>
    <Views.Button on:click={requestPagSeguroIntegration}
      >{integrateButtonName}</Views.Button
    >

    <Views.Divider />
    <h2>Delivery</h2>
    <Views.Divider />
    <h3>Tempo de preparação em minutos</h3>
    <div class="twoCells">
      <Views.TextEdit
        name="Tempo mínimo:"
        bind:value={preparation.min}
        bind:rawValue={preparation.min}
        placeHolder=""
        type="number"
        rightPadding="10px"
      />
      <Views.TextEdit
        name="Tempo máximo:"
        bind:value={preparation.max}
        bind:rawValue={preparation.max}
        placeHolder=""
        type="number"
        leftPadding="10px"
      />
    </div>
    <Views.Divider />
    <h3>Valor de entrega</h3>
    <Views.Switch name="Frete grátis:" bind:checked={delivery.free} />
    {#if !(delivery?.free || false)}
      <Views.TextEdit
        type="currency"
        bind:value={delivery.value}
        bind:rawValue={delivery.value}
        icon={faAt}
        name="Valor por KM:"
      />
      <Views.TextEdit
        type="currency"
        bind:value={delivery.min}
        bind:rawValue={delivery.min}
        icon={faAt}
        name="Valor mínimo:"
      />
    {/if}
    <Views.Divider />
    <Views.Button on:click={updateDelivery}>Atualizar delivery</Views.Button>
  </div>
</div>

{#if !paymentGateway || isLoading}
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
  .avatarCircle {
    font-size: 3em;
    height: 90px;
    width: 90px;
    background: #ccc;
    border-radius: 45px;
    float: left;
    line-height: 90px;
    text-align: center;
    vertical-align: middle;
    display: table-cell;
    overflow: hidden;
    margin-right: 10px;
  }
  .busninessHours {
    position: relative;
  }
  .remove {
    position: absolute;
    top: 26px;
    right: -10px;
    font-size: 0.9em;
    color: white;
    font-family: RobotoBold;
    border: 1px solid #b52124;
    background: #b52124;
    border-radius: 16px;
    width: 28px;
    height: 28px;
    vertical-align: middle;
    text-align: center;
    padding: 6px;
  }
  .twoCells {
    display: flex;
  }
</style>
