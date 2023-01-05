<script lang="ts">
  import { Clipboard } from '@capacitor/clipboard'
  import { Views, Utils, Types, Stores } from '@ikomida/shared-frontend'
  import { getSubscription } from '../../network/Payment'
  import { onMount } from 'svelte'
  import Fa from 'svelte-fa'
  import { faReceipt, faFileInvoice } from '@fortawesome/free-solid-svg-icons'
  import { AppLauncher } from '@capacitor/app-launcher'

  let subscription: Types.Classes.CSubscription

  async function open(url?: string) {
    const { value } = await AppLauncher.canOpenUrl({ url: url ?? '' })
    await AppLauncher.openUrl({ url: url ?? '' })
    if (!value) {
      await Clipboard.write({ string: url })
      Stores.MessageAlert.instance.show(
        `Se o navegador externo no for aberto automaticamente, por favor o abra e digite a URL: ${url}, que também foi copiado para sua área de transferência para colar-lo!`
      )
    }
  }

  onMount(async () => {
    const response = await getSubscription()
    if (response?.success) {
      subscription = Types.Classes.CSubscription.fromObject(response?.data)
    } else {
      Stores.MessageAlert.instance.show('Não foi possível carregar os dados da sua assinatura.')
    }
    Stores.Loading.instance.stop()
  })

  Stores.Title.instance.set('Assinatura')
</script>

<Views.Divider />
<h2>dados da sua assinatura</h2>
<Views.Divider />
{#if subscription}
  <Views.TextValue text="Plano" value=": {subscription.plan}" fontSize="1.2em" />
  <Views.TextValue text="Valor" value=": {Utils.Strings.currency(subscription.value)}" fontSize="1.2em" />
  <Views.TextValue
    text="Estado"
    value=": {subscription.status.description}"
    fontSize="1.2em"
    rightColor={subscription.status === Types.Types.TAsaasSignatureStatus.ACTIVE ? 'green' : 'yello'}
  />
  <Views.TextValue
    text="inscrição"
    value=": {Utils.Strings.dateToDateString(subscription.subscription.toString())}"
    fontSize="1.1em"
  />
  <Views.TextValue
    text="Proxima data de venceimento"
    value=": {Utils.Strings.dateToDateString(subscription.nextDueDate?.toString())}"
    fontSize="1.1em"
  />
  <Views.Divider />
  <h2>Ciclo de pagamento</h2>
  {#if subscription.charges}
    {#each subscription.charges.sort((i1, i2) => (i2?.dueDate.getTime() ?? 0) - (i1?.dueDate.getTime() ?? 0)) as charges (charges.invoiceUrl)}
      <div class="charge">
        {#if charges.invoiceUrl}
          <button name="Abrir comprovante de pagamento" on:click={() => open(charges.invoiceUrl)} class="invoice"
            ><Fa icon={faFileInvoice} /></button
          >
        {/if}
        {#if charges.transactionReceiptUrl}
          <button name="Abrir a nota fiscal" on:click={() => open(charges.transactionReceiptUrl)} class="receipt"
            ><Fa icon={faReceipt} /></button
          >
        {/if}
        <Views.TextValue text="Valor:" value={Utils.Strings.currency(charges.value)} fontSize="0.9em" leftMargin={50} />
        <Views.TextValue
          text="Forma de pagamento:"
          value="**** {charges.creditCardNumber} - {charges.creditCardBrand}"
          fontSize="0.9em"
          leftMargin={50}
        />
        <Views.TextValue
          text="Data de vencimento:"
          value={Utils.Strings.dateToDateString(charges.dueDate?.toString())}
          fontSize="0.9em"
          leftMargin={50}
        />

        <Views.TextValue
          text="Data de pagamento:"
          value={![
            Types.Types.TAsaasPaymentStatus.PENDING,
            Types.Types.TAsaasPaymentStatus.OVERDUE,
            Types.Types.TAsaasPaymentStatus.DUNNING_REQUESTED,
            Types.Types.TAsaasPaymentStatus.DUNNING_RECEIVED,
            Types.Types.TAsaasPaymentStatus.CANCELED
          ].includes(charges.status)
            ? Utils.Strings.dateToDateString(charges.confirmedDate?.toString())
            : '-'}
          fontSize="0.9em"
          leftMargin={50}
        />
        <Views.TextValue
          text="Status de pagamento:"
          value={charges.status.description}
          fontSize="0.9em"
          leftMargin={50}
          rightColor={charges.status === Types.Types.TAsaasPaymentStatus.CONFIRMED
            ? 'green'
            : charges.status === Types.Types.TAsaasPaymentStatus.PENDING
            ? 'yellow'
            : 'red'}
        />
      </div>
    {/each}
  {/if}
{/if}

<style>
  button {
    background-color: transparent;
    border: 0;
  }
  .charge {
    position: relative;
    background: #cccccc22;
    box-shadow: 0 4px 8px #0000009e;
    padding: 18px;
    margin-top: 16px;
    border-radius: 8px;
  }
  .invoice {
    position: absolute;
    top: -8px;
    right: -8px;
    font-size: 1.6em;
    color: white;
    font-family: RobotoBold;
    background: #1e1c1c;
    border-radius: 16px;
    width: 32px;
    height: 32px;
    vertical-align: middle;
    text-align: center;
    padding: 4px;
  }
  .receipt {
    position: absolute;
    top: -8px;
    right: 32px;
    font-size: 1.6em;
    color: white;
    font-family: RobotoBold;
    background: #1e1c1c;
    border-radius: 16px;
    width: 32px;
    height: 32px;
    vertical-align: middle;
    text-align: center;
    padding: 4px;
  }
</style>
