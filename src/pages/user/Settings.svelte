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
  import { onMount } from "svelte";
  import { v4 as uuid } from "uuid";
  let paymentGateway = {};
  let validPhone = false;

  let isLoading = false;
  let errorAlert;
  let showAlert = false;

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  const days = [
    { name: "Segunda-feira", checked: false },
    { name: "Terça-feira", checked: false },
    { name: "Quarta-feira", checked: false },
    { name: "Quinta-feira", checked: false },
    { name: "Sexta-feira", checked: false },
    { name: "Sabado", checked: false },
    { name: "Domingo", checked: false },
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

  const addHours = () => {
    business?.hours?.push({ id: uuid(), start: null, end: null });
    business.hours = business?.hours;
  };
  function onRemoveClick(id) {
    business.hours = business?.hours?.filter(
      (businessHour) => businessHour.id !== id
    );
  }

  let passwordObject = {
    oldPass: null,
    newPass: null,
    reNewPass: null,
  };

  async function editPassword() {
    if (passwordObject.oldPass === null || passwordObject.oldPass.length < 6) {
      toggleErrorAlert("Senha atual invalida!");
      return;
    } else if (
      passwordObject.newPass === null ||
      passwordObject.newPass.length < 6
    ) {
      toggleErrorAlert("A nova senha invalida!");
      return;
    } else if (passwordObject.newPass !== passwordObject.reNewPass) {
      toggleErrorAlert("Senha nova e verifição não confirem");
      return;
    }
    isLoading = true;
    let response = await updatePassword(passwordObject);
    if (response.success) {
      toggleErrorAlert("Senha atualizada com sucesso!");
    } else {
      toggleErrorAlert(response?.data);
      isLoading = false;
      return;
    }
    isLoading = false;
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

  onMount(async () => {
    const response = await getSettings();
    paymentGateway = response?.paymentGateway;
    business = response?.business || {
      days: [],
      hours: [
        {
          id: uuid(),
          start: null,
          end: null,
        },
      ],
    };
    for(const index of business.days){
      days[index].checked = true;
    }
  });

  async function setPaymentGateway() {
    isLoading = true;
    const response = await updatePaymentGateway(paymentGateway);
    if (!response?.success) {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  Title.set("Ajustes");
</script>

<div class="settings">
  <div class="data">
    <h2>horário de funcionamento</h2>
    {#each business?.hours as businessHour}
      <div class="busninessHours">
        <span on:click={onRemoveClick(businessHour.id)} class="remove"
          ><Fa icon={faTrashAlt} /></span
        >
        <div class="twoCells">
          <Views.TextEdit
            name="Abertura:"
            mask="__/__"
            bind:rawValue={businessHour.start}
            bind:value={businessHour.start}
            placeHolder=""
            type="number"
            rightPadding="10px"
          />
          <Views.TextEdit
            name="Fechamento:"
            bind:rawValue={businessHour.end}
            bind:value={businessHour.end}
            placeHolder=""
            mask="__/__"
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
      bind:rawValue={paymentGateway.publicKey}
      bind:value={paymentGateway.publicKey}
      icon={faAt}
      placeHolder="Pagseguro email:"
    />
    <Views.TextEdit
      bind:rawValue={paymentGateway.privateKey}
      bind:value={paymentGateway.privateKey}
      icon={faKey}
      placeHolder="Pagseguro token de acesso:"
    />
    <Views.Divider />
    <Views.Button on:click={setPaymentGateway}>Atualizar os dados</Views.Button>
    <Views.Divider />
    <h2>Senha</h2>
    <Views.TextEdit
      name="Senha atual:"
      bind:value={passwordObject.oldPass}
      secret={true}
      placeHolder=""
    />
    <Views.TextEdit
      name="Nova senha:"
      bind:value={passwordObject.newPass}
      secret={true}
      placeHolder=""
    />
    <Views.TextEdit
      name="Confirmação:"
      bind:value={passwordObject.reNewPass}
      secret={true}
      placeHolder=""
    />
    <Views.Divider />
    <Views.Button on:click={editPassword}>Atualizar senha</Views.Button>
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
    width: 16px;
    height: 16px;
    vertical-align: middle;
    text-align: center;
    padding: 6px;
  }
  .twoCells {
    display: flex;
  }
</style>
