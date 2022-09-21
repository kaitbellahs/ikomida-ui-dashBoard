<script lang="ts">
  import { Views, Utils, Logics, Stores, Types } from '@ikomida/shared-frontend';
  import {
    getSettings,
    updatePaymentGateway,
    updateBusinessHours,
    setDelivery,
    getPagSeguroUrl,
    revokePaymentGateway,
  } from '../../network/Settings';
  import { Settings } from '../../stores/Setup';
  import Fa from 'svelte-fa';
  import { faClock, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
  import { AppLauncher } from '@capacitor/app-launcher';
  import { Clipboard } from '@capacitor/clipboard';
  import { onMount } from 'svelte';
  import { v4 as uuid } from 'uuid';

  let paymentGateway: Types.Classes.CVendorPaymentGateway = Types.Classes.CVendorPaymentGateway.fillWith(null);
  let delivery: Types.Classes.CVendorDelivery = Types.Classes.CVendorDelivery.init(false, 0, 0);
  let deliveryInputs: { min?: Views.TextEdit; value?: Views.TextEdit } = { value: undefined, min: undefined };
  let preparation: Types.Classes.CVendorPreparation = Types.Classes.CVendorPreparation.init(0, 0);
  let preparationInputs: { min?: Views.TextEdit; max?: Views.TextEdit } = { min: undefined, max: undefined };
  let popupNewOrder = $Settings?.popups?.newOrder;
  let userInfo: Types.Classes.CUser;
  let auth: Stores.Auth.IStore;
  const router = Stores.Navigation.instance.router;

  const days = [
    { name: 'Domingo', checked: false },
    { name: 'Segunda-feira', checked: false },
    { name: 'Terça-feira', checked: false },
    { name: 'Quarta-feira', checked: false },
    { name: 'Quinta-feira', checked: false },
    { name: 'Sexta-feira', checked: false },
    { name: 'Sabado', checked: false },
  ];

  let business: Types.Classes.CBusinessTime = Types.Classes.CBusinessTime.fromObject({
    days: [],
    hours: [],
  });

  let integratePagSeguro = { callback: false, url: null };

  $: if (popupNewOrder || !popupNewOrder) {
    $Settings.popups.newOrder = popupNewOrder;
    Settings.set($Settings);
  }

  $: if ($router.options) {
    integratePagSeguro = {
      ...integratePagSeguro,
      ...$router.options,
    };
  }

  $: if (integratePagSeguro.callback) {
    integratePagSeguro.callback = false;
    if (integratePagSeguro.url) {
      Stores.Loading.instance.start();
      Stores.MessageAlert.instance.hide();
      const url = new URL(integratePagSeguro.url);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const payload = { code, state };
      updatePaymentGateway(payload).then((response) => {
        if (!response.success) {
          Stores.MessageAlert.instance.show(response.data);
        } else {
          paymentGateway = Types.Classes.CVendorPaymentGateway.fromObject(response.data);
          Stores.MessageAlert.instance.show(`${(response.data as any)?.type} foi integrado com sucesso`);
        }
        Stores.Loading.instance.reset();
      });
    }
  }

  $: integrateButtonName = paymentGateway.integrated
    ? 'Cancelar a integgração com pagseguro'
    : 'Integrar sua conta pagseguro';

  const addHours = () => {
    if (!business?.hours) {
      business.hours = [];
    }
    business.hours.push(Types.Classes.CBusinessTimeHours.fromObject({ id: uuid(), start: '08:00', end: '23:59' }));
    business.hours = business.hours;
  };

  function onRemoveClick(id?: string) {
    business.hours = business?.hours?.filter((businessHour) => businessHour.id !== id);
  }

  function validateTime(timeString?: string) {
    if (timeString && timeString.length === 4 && !timeString?.includes(':')) {
      timeString = timeString.slice(0, 2) + ':' + timeString.slice(2);
    }
    const timeArray = timeString?.split(':') ?? [];
    if ((timeArray?.length ?? 0) !== 2) {
      return false;
    }
    if (
      Number(Logics.Finances.toNumber(timeArray?.[0])) < 0 ||
      Number(Logics.Finances.toNumber(timeArray?.[0])) >= 24 ||
      Number(Logics.Finances.toNumber(timeArray?.[1])) >= 60 ||
      Number(Logics.Finances.toNumber(timeArray?.[1])) < 0
    ) {
      return false;
    }
    return true;
  }

  async function updateHours() {
    Stores.Loading.instance.start();
    if (business.hours === null || (business?.hours?.length ?? 0) < 1) {
      Stores.MessageAlert.instance.show('Precisa escolher pelo menos um horário de funcionamento!');
      Stores.Loading.instance.stop();
      return;
    }
    for (const businessHour of business?.hours ?? []) {
      console.log(businessHour);
      if (!validateTime(businessHour?.start)) {
        Stores.MessageAlert.instance.show(
          'O horário de abertura é inválida, o formato deve ser HH:mm e entre 00:00 e 23:59!',
        );
        Stores.Loading.instance.stop();
        return;
      } else if (!validateTime(businessHour?.end)) {
        Stores.MessageAlert.instance.show(
          'O horário de fechamento é inválida, o formato deve ser HH:mm e entre 00:00 e 23:59!',
        );
        Stores.Loading.instance.stop();
        return;
      } else if (Number(businessHour.start) > Number(businessHour.end)) {
        Stores.MessageAlert.instance.show(
          'O horário de abertura deve estar menor que o horário de fechamento, exemplo de abertura: 09:00 e fechamento: 18:00!',
        );
        Stores.Loading.instance.stop();
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
      Stores.MessageAlert.instance.show('Precisa escolher pelo menos um dia de funcionamento!');
      Stores.Loading.instance.stop();
      return;
    }
    let response = await updateBusinessHours(business);
    if (response.success) {
      Stores.MessageAlert.instance.show('O horário de funcionamento atualizado com sucesso!');
    } else {
      Stores.MessageAlert.instance.show(response.data);
      Stores.Loading.instance.stop();
      return;
    }
    Stores.Loading.instance.stop();
  }

  async function updateDelivery() {
    const vendorSettings = Types.Classes.CVendorSettings.fromObject({ preparation, delivery });
    if (!vendorSettings.validate()) {
      Stores.MessageAlert.instance.show(`Algum dos dados fornecidos não é válido!`);
      return;
    }
    Stores.Loading.instance.start();
    const response = await setDelivery(vendorSettings);
    if (!response.success) {
      Stores.MessageAlert.instance.show(response.data);
    }
    Stores.Loading.instance.stop();
  }

  async function requestPagSeguroIntegration() {
    Stores.Loading.instance.start();
    if (paymentGateway.integrated) {
      const response = await revokePaymentGateway();
      if (response.success) {
        paymentGateway = Types.Classes.CVendorPaymentGateway.fromObject(response.data);
        Stores.MessageAlert.instance.show(
          `A integração dos nossos nossos sistemas com sua conta no pagseguro foi revogada com sucesso!`,
        );
      } else {
        Stores.MessageAlert.instance.show(`Não foi possível revogar a integração, tente novamente mais tarde!`);
      }
    } else {
      const response = await getPagSeguroUrl();
      if (response.success) {
        const url = (response.data as any)?.url;
        if (!url) {
          Stores.MessageAlert.instance.show(`Não foi possível obter a url de integração, tente novamente mais tarde!`);
          return;
        }
        const { value } = await AppLauncher.canOpenUrl({ url });
        if (value) {
          await AppLauncher.openUrl({ url });
        } else {
          await AppLauncher.openUrl({ url });
          await Clipboard.write({ string: url });
          Stores.MessageAlert.instance.show(
            `Se o navegador externo no for aberto automaticamente, por favor o abra e digita esa URL: ${url}, que também foi copiado para sua área de transferência!`,
          );
        }
      }
    }
    Stores.Loading.instance.stop();
    return null;
  }

  onMount(async () => {
    auth = await Stores.Auth.Auth.instance.store();
    userInfo = await Utils.Jws.extractToken($auth);
    const response = await getSettings();
    if (response.success) {
      const data = Types.Classes.CVendorSettings.fromObject(response.data);
      paymentGateway = data.paymentGateway;
      business = data.business;
      for (const index of business.days ?? []) {
        days[index].checked = true;
      }
      delivery = Object.assign(delivery, data?.delivery);
      deliveryInputs.min?.updateValue(String(delivery?.min));
      deliveryInputs.value?.updateValue(String(delivery?.value));
      preparation = data?.preparation;
      preparationInputs?.min?.updateValue(String(preparation?.min));
      preparationInputs?.max?.updateValue(String(preparation?.max));
    } else {
      Stores.MessageAlert.instance.show(response.data);
    }
    Stores.Loading.instance.stop();
  });

  Stores.Title.instance.set('Seus ajustes');
</script>

<div class="settings">
  <div class="data">
    <h2>horário de funcionamento</h2>
    {#if (business?.hours?.length ?? 0) > 0}
      {#each business?.hours ?? [] as businessHour}
        <div class="busninessHours">
          <span on:click={() => onRemoveClick(businessHour.id)} class="remove"><Fa icon={faTrashAlt} /></span>
          <div class="twoCells">
            <Views.TextEdit
              placeHolder="Abertura"
              initialValue={businessHour.start}
              bind:value={businessHour.start}
              type={Types.TTextEdit.TIME}
              rightPadding={10}
            />
            <Views.TextEdit
              placeHolder="Fechamento"
              bind:value={businessHour.end}
              initialValue={businessHour.end}
              type={Types.TTextEdit.TIME}
              leftPadding={10}
            />
          </div>
        </div>
      {/each}
    {:else}
      <Views.Divider />
      <span>Você precisa definir seus horários de funcionamento</span>
    {/if}
    <Views.Divider />
    <Views.Button on:click={addHours}><Fa icon={faClock} /><span>Adicionar horários</span></Views.Button>
    <div class="days">
      {#each days as day}
        <div class="day">
          <Views.Checkbox marginTop={0} bind:checked={day.checked} label={day.name} />
        </div>
      {/each}
    </div>
    <Views.Button on:click={updateHours}><Fa icon={faClock} /><span>Atualizar horários</span></Views.Button>
    {#if userInfo?.role === 'VENDOR'}
      <Views.Divider />
      <h2>Portais de pagamentos</h2>
      <Views.Divider />
      <Views.Button on:click={requestPagSeguroIntegration}>{integrateButtonName}</Views.Button>
    {/if}
    <Views.Divider />
    <h2>A entrega</h2>
    <Views.Divider />
    <h3>Tempo de preparação em minutos</h3>
    <small>Quanto tempo você vai precisar para preparar seus pedidos em média?</small>
    <div class="twoCells">
      <Views.TextEdit
        placeHolder="Tempo mínimo"
        bind:value={preparation.min}
        bind:this={preparationInputs.min}
        initialValue={preparation.min}
        type={Types.TTextEdit.NUMBER}
        rightPadding={10}
      />
      <Views.TextEdit
        placeHolder="Tempo máximo"
        bind:value={preparation.max}
        bind:this={preparationInputs.max}
        initialValue={preparation.max}
        type={Types.TTextEdit.NUMBER}
        leftPadding={10}
      />
    </div>
    <Views.Divider />
    <h3>Valor de entrega</h3>
    <small
      >Vai querer pagar seus entregador quanto por entrega por Km? (o quanto mais você paga seus entregadores ficaram
      felizes e seus clientes tristes e vice versa)</small
    >
    <Views.Switch name="Frete grátis" bind:checked={delivery.free} />
    {#if !(delivery?.free || false)}
      <Views.TextEdit
        type={Types.TTextEdit.CURRENCY}
        bind:value={delivery.value}
        bind:this={deliveryInputs.value}
        initialValue={delivery.value}
        placeHolder="Valor por KM"
      />
      <Views.TextEdit
        type={Types.TTextEdit.CURRENCY}
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
