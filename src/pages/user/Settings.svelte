<script>
  import { Title } from "../../stores/Navigation";
  import { Views } from "@tian/components";
  import {
    getSettings,
    updatePaymentGateway,
    updateBusinessHours,
    setDelivery,
  } from "../../network/Settings";
  import { StatusBar } from "../../stores/Setup";
  import Fa from "svelte-fa";
  import {
    faAt,
    faKey,
    faClock,
    faTrashAlt,
  } from "@fortawesome/free-solid-svg-icons";
  import { onMount } from "svelte";
  import { v4 as uuid } from "uuid";
  let paymentGateway = { publicKey: null, privateKey: null };
  let delivery = { value: 0, min: 0, free: false };
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

  async function setPaymentGateway() {
    isLoading = true;
    const response = await updatePaymentGateway(paymentGateway);
    if (!response?.success) {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  async function updateDelivery() {
    isLoading = true;
    const response = await setDelivery(delivery);
    if (!response?.success) {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  onMount(async () => {
    const response = await getSettings();
    paymentGateway = { ...paymentGateway, ...response?.paymentGateway };
    business = { ...business, ...response?.business };
    for (const index of business?.days || []) {
      days[index].checked = true;
    }
    delivery = { ...delivery, ...response?.delivery };
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
    <Views.Divider />
    <h2>Gateway de pagament</h2>
    <Views.TextEdit
      bind:value={paymentGateway.publicKey}
      bind:rawValue={paymentGateway.publicKey}
      icon={faAt}
      placeHolder="Pagseguro email:"
    />
    <Views.TextEdit
      bind:value={paymentGateway.privateKey}
      bind:rawValue={paymentGateway.privateKey}
      icon={faKey}
      placeHolder="Pagseguro token de acesso:"
    />
    <Views.Divider />
    <Views.Button on:click={setPaymentGateway}>Atualizar os dados</Views.Button>
    <Views.Divider />
    <h2>Delivery</h2>
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
    border: 1px solid red;
    background: red;
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
