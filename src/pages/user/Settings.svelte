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
  import { StatusBar, Settings } from "../../stores/Setup";
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
  import { Auth } from "../../stores/Auth";

  let paymentGateway = { type: null, data: null };
  let delivery = { value: 0, min: 0, free: false };
  let deliveryInputs = { value: null, min: null };
  let preparation = { min: 0, max: 0 };
  let preparationInputs = { min: null, max: null };
  let isLoading = false;
  let errorAlert;
  let showAlert = false;
  let popupNewOrder = $Settings?.popups?.newOrder;
  let userInfo;

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
    hours: [],
  };

  let integratePagSeguro = { callback: false, url: null };

  $: if (popupNewOrder || !popupNewOrder) {
    $Settings.popups.newOrder = popupNewOrder;
    Settings.set($Settings);
  }

  $: if ($Router.options) {
    integratePagSeguro = { ...integratePagSeguro, ...$Router.options };
  }

  $: if (integratePagSeguro?.callback && !paymentGateway?.type) {
    integratePagSeguro.callback = false;
    if (integratePagSeguro?.url) {
      isLoading = true;
      const url = new URL(integratePagSeguro?.url);
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const payload = { code, state };
      updatePaymentGateway(payload).then((response) => {
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
    if (!business?.hours) {
      business.hours = [];
    }
    business.hours.push({ id: uuid(), start: "08:00", end: "23:59" });
    business.hours = business.hours;
  };

  function onRemoveClick(id) {
    business.hours = business?.hours?.filter(
      (businessHour) => businessHour.id !== id
    );
  }

  function validateTime(timeString) {
    if (timeString.length === 4 && !timeString?.includes(":")) {
      timeString = timeString.slice(0, 2) + ":" + timeString.slice(2);
    }
    const timeArray = timeString?.split(":") ?? [];
    if ((timeArray?.length ?? 0) !== 2) {
      return false;
    }
    if (
      Number(Utils.Numbers.toNumber(timeArray?.[0])) < 0 ||
      Number(Utils.Numbers.toNumber(timeArray?.[0])) >= 24 ||
      Number(Utils.Numbers.toNumber(timeArray?.[1])) >= 60 ||
      Number(Utils.Numbers.toNumber(timeArray?.[1])) < 0
    ) {
      return false;
    }
    return true;
  }

  async function updateHours() {
    isLoading = true;
    if (business.hours === null || business.hours.length < 1) {
      toggleErrorAlert(
        "Precisa escolher pelo menos um horário de funcionamento!"
      );
      isLoading = false;
      return;
    }
    for (const businessHour of business?.hours) {
      if (!validateTime(businessHour?.start)) {
        toggleErrorAlert(
          "O horário de abertura é inválida, o formato deve ser HH:mm e entre 00:00 e 23:59!"
        );
        isLoading = false;
        return;
      } else if (!validateTime(businessHour?.end)) {
        toggleErrorAlert(
          "O horário de fechamento é inválida, o formato deve ser HH:mm e entre 00:00 e 23:59!"
        );
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
      toggleErrorAlert("O horário de funcionamento atualizado com sucesso!");
    } else {
      toggleErrorAlert(response?.data);
      isLoading = false;
      return;
    }
    isLoading = false;
  }

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
          `A integração dos nossos nossos sistemas com o pagseguro foi revogado com sucesso!`
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
            `Não foi possível obter a url de integração, tente novamente mais tarde!`
          );
          return;
        }
        const { value } = await AppLauncher.canOpenUrl({ url });
        if (value) {
          await AppLauncher.openUrl({ url });
        } else {
          await AppLauncher.openUrl({ url });
          await Clipboard.write({ string: url });
          toggleErrorAlert(
            `Se o navegador externo no for aberto automaticamente, por favor o abra e digita esa URL: ${url}, que também foi copiado para sua área de transferência!`
          );
        }
      }
    }
    isLoading = false;
    return null;
  }

  onMount(async () => {
    isLoading = true;
    userInfo = await Utils.Jws.extractToken($Auth);
    const response = await getSettings();
    paymentGateway = { ...paymentGateway, ...response?.paymentGateway };
    business = { ...business, ...response?.business };
    for (const index of business?.days || []) {
      days[index].checked = true;
    }
    delivery = { ...delivery, ...response?.delivery };
    deliveryInputs?.min?.updateValue(delivery?.min);
    deliveryInputs?.value?.updateValue(delivery?.value);
    preparation = { ...preparation, ...response?.preparation };
    preparationInputs?.min?.updateValue(preparation?.min);
    preparationInputs?.max?.updateValue(preparation?.max);
    isLoading = false;
  });

  Title.set("Seus ajustes");
</script>

<div class="settings">
  <div class="data">
    <h2>horário de funcionamento</h2>
    {#if (business?.hours?.length ?? 0) > 0}
      {#each business?.hours ?? [] as businessHour}
        <div class="busninessHours">
          <span on:click={onRemoveClick(businessHour.id)} class="remove"
            ><Fa icon={faTrashAlt} /></span
          >
          <div class="twoCells">
            <Views.TextEdit
              placeHolder="Abertura"
              mask="__:__"
              initialValue={businessHour.start}
              bind:value={businessHour.start}
              type="number"
              rightPadding="10px"
            />
            <Views.TextEdit
              placeHolder="Fechamento"
              bind:value={businessHour.end}
              initialValue={businessHour.end}
              mask="__:__"
              type="number"
              leftPadding="10px"
            />
          </div>
        </div>
      {/each}
    {:else}
      <Views.Divider />
      <span>Você precisa definir seus horários de funcionamento</span>
    {/if}
    <Views.Divider />
    <Views.Button on:click={addHours}
      ><Fa icon={faClock} /><span>Adicionar horários</span></Views.Button
    >
    <div class="days">
      {#each days as day}
        <div class="day">
          <Views.Checkbox
            marginTop="0"
            bind:checked={day.checked}
            label={day.name}
          />
        </div>
      {/each}
    </div>
    <Views.Button on:click={updateHours}
      ><Fa icon={faClock} /><span>Atualizar horários</span></Views.Button
    >
    {#if userInfo?.role === "vendor"}
      <Views.Divider />
      <h2>Portais de pagamentos</h2>
      <Views.Divider />
      <Views.Button on:click={requestPagSeguroIntegration}
        >{integrateButtonName}</Views.Button
      >
    {/if}
    <Views.Divider />
    <h2>A entrega</h2>
    <Views.Divider />
    <h3>Tempo de preparação em minutos</h3>
    <small
      >Quanto tempo você vai precisar para preparar seus pedidos em média?</small
    >
    <div class="twoCells">
      <Views.TextEdit
        placeHolder="Tempo mínimo"
        bind:value={preparation.min}
        bind:this={preparationInputs.min}
        initialValue={preparation.min}
        type="number"
        rightPadding="10px"
      />
      <Views.TextEdit
        placeHolder="Tempo máximo"
        bind:value={preparation.max}
        bind:this={preparationInputs.max}
        initialValue={preparation.max}
        type="number"
        leftPadding="10px"
      />
    </div>
    <Views.Divider />
    <h3>Valor de entrega</h3>
    <small
      >Vai querer pagar seus entregador quanto por entrega por Km? (o quanto
      mais você paga seus entregadores ficaram felizes e seus clientes tristes e
      vice versa)</small
    >
    <Views.Switch placeHolder="Frete grátis" bind:checked={delivery.free} />
    {#if !(delivery?.free || false)}
      <Views.TextEdit
        type="currency"
        bind:value={delivery.value}
        bind:this={deliveryInputs.value}
        initialValue={delivery.value}
        placeHolder="Valor por KM"
      />
      <Views.TextEdit
        type="currency"
        bind:value={delivery.min}
        bind:this={deliveryInputs.min}
        initialValue={delivery.min}
        placeHolder="Valor mínimo"
      />
    {/if}
    <Views.Divider />
    <Views.Button on:click={updateDelivery}>Atualizar a entrega</Views.Button>
    <Views.Divider />
    <h3>Exibir popups</h3>
    <small>Aqui você escolhe quais popups vão ser exibidos a você:</small>
    <Views.Switch name="Mostrar novos pedidos:" bind:checked={popupNewOrder} />
  </div>
</div>

<Views.GTerms />
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
    border: 1px solid #4c0708;
    background: #4c0708;
    border-radius: 16px;
    width: 28px;
    height: 28px;
    vertical-align: middle;
    text-align: center;
    padding: 6px;
    z-index: 9;
  }
  .twoCells {
    display: flex;
  }
  .settings > .data > .days {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .settings > .data > .days > .day {
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
</style>
