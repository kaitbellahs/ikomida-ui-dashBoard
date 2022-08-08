<script>
  import { Title } from "../../stores/Navigation";
  import { Views, Utils, Types } from "@ikomida/components";
  import { StatusBar } from "../../stores/Setup";
  import { getSubscription } from "../../network/Payment";
  import { onMount } from "svelte";
  import Fa from "svelte-fa";
  import {
    faReceipt,
    faFileInvoice,
    faSterlingSign,
  } from "@fortawesome/free-solid-svg-icons";
  import { AppLauncher } from "@capacitor/app-launcher";

  let subscription;
  let isLoading = false;
  let errorAlert;
  let showAlert = false;

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  async function open(url) {
    const { value } = await AppLauncher.canOpenUrl({ url });
    await AppLauncher.openUrl({ url });
    if (!value) {
      await Clipboard.write({ string: url });
      toggleErrorAlert(
        `Se o navegador externo no for aberto automaticamente, por favor o abra e digita esa URL: ${url}, que também foi copiado para sua área de transferência para colar-lo!`
      );
    }
  }

  onMount(async () => {
    subscription = await getSubscription();
  });

  function subscriptionStatus(status) {
    if (typeof status === "string") {
      switch (status.toUpperCase()) {
        case Types.PaymentStatusTypes.AsaasSignature.ACTIVE:
          return "Ativo";
        case Types.PaymentStatusTypes.AsaasSignature.CANCELED:
          return "Cancelado";
        default:
          return "-";
      }
    }
    return "-";
  }
  function paymentStatus(status) {
    if (typeof status === "string") {
      switch (status.toUpperCase()) {
        case Types.PaymentStatusTypes.Asaas.CONFIRMED:
          return "Confirmado";
        case Types.PaymentStatusTypes.Asaas.PENDING:
          return "Aguardando";
        default:
          return "-";
      }
    }
    return "-";
  }

  Title.set("Assinatura");
</script>

<h2>dados da sua assinatura</h2>
<Views.TextValue text="plano" value=": {subscription?.plan}" fontSize="1.2em" />
<Views.TextValue
  text="Valor"
  value=": {Utils.Strings.currency(subscription?.value)}"
  fontSize="1.2em"
/>
<Views.TextValue
  text="Estado"
  value=": {subscriptionStatus(subscription?.status)}"
  fontSize="1.2em"
  rightColor={subscription?.status ===
  Types.PaymentStatusTypes.AsaasSignature.ACTIVE
    ? "green"
    : "yello"}
/>
<Views.TextValue
  text="inscrição"
  value=": {Utils.Strings.dateToDateString(subscription?.subscription)}"
  fontSize="1.1em"
/>
<Views.TextValue
  text="Proxima data de venceimento"
  value=": {Utils.Strings.dateToDateString(subscription?.nextDueDate)}"
  fontSize="1.1em"
/>
<Views.Divider />
<h2>Ciclo de pagamento</h2>
{#if subscription?.charges}
  {#each subscription?.charges?.sort((i1, i2) => new Date(i2?.dueDate) - new Date(i1?.dueDate)) as charges}
    <div class="charge">
      {#if charges?.invoiceUrl}
        <span
          alt="Abrir comprovante de pagamento"
          on:click={open(charges?.invoiceUrl)}
          class="invoice"><Fa icon={faFileInvoice} /></span
        >
      {/if}
      {#if charges?.transactionReceiptUrl}
        <span
          alt="Abrir a nota fiscal"
          on:click={open(charges?.transactionReceiptUrl)}
          class="receipt"><Fa icon={faReceipt} /></span
        >
      {/if}
      <Views.TextValue
        text="value:"
        value={Utils.Strings.currency(charges?.value)}
        fontSize="0.9em"
        leftMargin="50"
      />
      <Views.TextValue
        text="Forma de pagamento:"
        value="**** {charges?.creditCardNumber} - {charges?.creditCardBrand}"
        fontSize="0.9em"
        leftMargin="50"
      />
      <Views.TextValue
        text="Data de vencimento:"
        value={Utils.Strings.dateToDateString(charges?.dueDate)}
        fontSize="0.9em"
        leftMargin="50"
      />
      <Views.TextValue
        text="Data de pagamento:"
        value={Utils.Strings.dateToDateString(charges?.confirmedDate)}
        fontSize="0.9em"
        leftMargin="50"
      />
      <Views.TextValue
        text="Status de pagamento:"
        value={paymentStatus(charges?.status)}
        fontSize="0.9em"
        leftMargin="50"
        rightColor={charges?.status === Types.PaymentStatusTypes.Asaas.CONFIRMED
          ? "green"
          : charges?.status === Types.PaymentStatusTypes.Asaas.PENDING
          ? "yellow"
          : "red"}
      />
    </div>
  {/each}
{/if}

{#if !subscription || isLoading}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if}
<Views.MessageAlert object={errorAlert} bind:show={showAlert} />

<style>
  .charge {
    position: relative;
    background: #cccccc22;
    box-shadow: 2px 1.5px #00000044;
    padding: 15px;
    margin-top: 20px;
  }
  .invoice {
    position: absolute;
    top: -10px;
    right: -10px;
    font-size: 1.6em;
    color: white;
    font-family: RobotoBold;
    background: #1e1c1c;
    border-radius: 20px;
    width: 40px;
    height: 40px;
    vertical-align: middle;
    text-align: center;
    padding: 4px;
  }
  .receipt {
    position: absolute;
    top: -10px;
    right: 35px;
    font-size: 1.6em;
    color: white;
    font-family: RobotoBold;
    background: #1e1c1c;
    border-radius: 20px;
    width: 40px;
    height: 40px;
    vertical-align: middle;
    text-align: center;
    padding: 4px;
  }
</style>
