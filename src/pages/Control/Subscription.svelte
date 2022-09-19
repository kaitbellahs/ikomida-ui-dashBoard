<script lang="ts">
  import { Clipboard } from '@capacitor/clipboard';
  import { Views, Utils, Types, Stores } from '@ikomida/shared-frontend';
  import { getSubscription } from '../../network/Payment';
  import { onMount } from 'svelte';
  import Fa from 'svelte-fa';
  import { faReceipt, faFileInvoice } from '@fortawesome/free-solid-svg-icons';
  import { AppLauncher } from '@capacitor/app-launcher';

  let subscription: Types.Classes.CSubscription;

  async function open(url?: string) {
    const { value } = await AppLauncher.canOpenUrl({ url: url ?? '' });
    await AppLauncher.openUrl({ url: url ?? '' });
    if (!value) {
      await Clipboard.write({ string: url });
      Stores.MessageAlert.instance.show(
        `Se o navegador externo no for aberto automaticamente, por favor o abra e digita esa URL: ${url}, que também foi copiado para sua área de transferência para colar-lo!`,
      );
    }
  }

  onMount(async () => {
    subscription = Types.Classes.CSubscription.fromObject(await getSubscription());
    Stores.Loading.instance.stop();
  });

  function subscriptionStatus(status?: Types.Types.Asaas.TAsaasSubscriptionStatus) {
    console.log(status);
    switch (status) {
      case Types.Types.Asaas.TAsaasSubscriptionStatus.ACTIVE:
        return 'Ativo';
      case Types.Types.Asaas.TAsaasSubscriptionStatus.EXPIRED:
        return 'Expirado';
      default:
        return '-';
    }
  }
  function paymentStatus(status?: Types.Types.TAsaasPaymentStatus) {
    switch (status) {
      case Types.Types.TAsaasPaymentStatus.CONFIRMED:
        return 'Confirmado';
      case Types.Types.TAsaasPaymentStatus.PENDING:
        return 'Aguardando';
      default:
        return '-';
    }
  }

  Stores.Title.instance.set('Assinatura');
</script>

<h2>dados da sua assinatura</h2>
<Views.TextValue text="plano" value=": {subscription?.plan}" fontSize="1.2em" />
<Views.TextValue text="Valor" value=": {Utils.Strings.currency(subscription?.value)}" fontSize="1.2em" />
<Views.TextValue
  text="Estado"
  value=": {subscriptionStatus(subscription?.status)}"
  fontSize="1.2em"
  rightColor={subscription?.status === Types.Types.TAsaasSignatureStatus.ACTIVE ? 'green' : 'yello'}
/>
<Views.TextValue
  text="inscrição"
  value=": {Utils.Strings.dateToDateString(subscription?.subscription?.toString())}"
  fontSize="1.1em"
/>
<Views.TextValue
  text="Proxima data de venceimento"
  value=": {Utils.Strings.dateToDateString(subscription?.nextDueDate?.toString())}"
  fontSize="1.1em"
/>
<Views.Divider />
<h2>Ciclo de pagamento</h2>
{#if subscription?.charges}
  {#each subscription?.charges?.sort((i1, i2) => (i2?.dueDate.getTime() ?? 0) - (i1?.dueDate.getTime() ?? 0)) as charges (charges?.invoiceUrl)}
    <div class="charge">
      {#if charges?.invoiceUrl}
        <span alt="Abrir comprovante de pagamento" on:click={() => open(charges?.invoiceUrl)} class="invoice"
          ><Fa icon={faFileInvoice} /></span
        >
      {/if}
      {#if charges?.transactionReceiptUrl}
        <span alt="Abrir a nota fiscal" on:click={() => open(charges?.transactionReceiptUrl)} class="receipt"
          ><Fa icon={faReceipt} /></span
        >
      {/if}
      <Views.TextValue text="value:" value={Utils.Strings.currency(charges?.value)} fontSize="0.9em" leftMargin={50} />
      <Views.TextValue
        text="Forma de pagamento:"
        value="**** {charges?.creditCardNumber} - {charges?.creditCardBrand}"
        fontSize="0.9em"
        leftMargin={50}
      />
      <Views.TextValue
        text="Data de vencimento:"
        value={Utils.Strings.dateToDateString(charges?.dueDate?.toString())}
        fontSize="0.9em"
        leftMargin={50}
      />

      <Views.TextValue
        text="Data de pagamento:"
        value={Utils.Strings.dateToDateString(charges?.confirmedDate?.toString())}
        fontSize="0.9em"
        leftMargin={50}
      />
      <Views.TextValue
        text="Status de pagamento:"
        value={paymentStatus(charges?.status)}
        fontSize="0.9em"
        leftMargin={50}
        rightColor={charges?.status === Types.Types.TAsaasPaymentStatus.CONFIRMED
          ? 'green'
          : charges?.status === Types.Types.TAsaasPaymentStatus.PENDING
          ? 'yellow'
          : 'red'}
      />
    </div>
  {/each}
{/if}

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
