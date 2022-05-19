<script>
  import { Title } from "../../stores/Navigation";
  import { Views, Utils } from "@ikomida/components";
  import { StatusBar } from "../../stores/Setup";
  import { getSubscription } from "../../network/Payment";
  import { onMount } from "svelte";
  import Fa from "svelte-fa";
  import { faReceipt, faFileInvoice } from "@fortawesome/free-solid-svg-icons";

  let subscription;
  let isLoading = false;
  let errorAlert;
  let showAlert = false;

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  function openReceipt(url) {}

  function openInvoice(url) {}

  onMount(async () => {
    subscription = await getSubscription();
  });

  Title.set("Inscrição");
</script>

<Views.TextValue text="plano:" value={subscription?.plan} fontSize="1.2em" />
<Views.TextValue text="Valor:" value={subscription?.value} fontSize="1.2em" />
<Views.TextValue text="Estado:" value={subscription?.status} fontSize="1.2em" />
<Views.TextValue
  text="inscrição:"
  value={Utils.Strings.dateToDateString(subscription?.subscription)}
  fontSize="1.1em"
/>
<Views.TextValue
  text="Proximo venceimento:"
  value={Utils.Strings.dateToDateString(subscription?.nextDueDate)}
  fontSize="1.1em"
/>
{#if subscription?.charges}
  {#each subscription?.charges as charges}
    <div class="charge">
      <span
        on:click={openReceipt(charges?.transactionReceiptUrl)}
        class="receipt"><Fa icon={faReceipt} /></span
      >
      <span on:click={openInvoice(charges?.invoiceUrl)} class="invoice"
        ><Fa icon={faFileInvoice} /></span
      >
      <Views.TextValue
        text="value:"
        value={charges?.value}
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
        text="Date de vencimento:"
        value={Utils.Strings.dateToDateString(charges?.dueDate)}
        fontSize="0.9em"
        leftMargin="50"
      />
      <Views.TextValue
        text="Date de pagamento:"
        value={Utils.Strings.dateToDateString(charges?.confirmedDate)}
        fontSize="0.9em"
        leftMargin="50"
      />
      <Views.TextValue
        text="Status de pagamento:"
        value={charges?.status}
        fontSize="0.9em"
        leftMargin="50"
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
  .receipt {
    position: absolute;
    top: -10px;
    right: -10px;
    font-size: 1.6em;
    color: white;
    font-family: RobotoBold;
    /* border: 1px solid #b52124; */
    background: #1e1c1c;
    border-radius: 20px;
    width: 40px;
    height: 40px;
    vertical-align: middle;
    text-align: center;
    padding: 4px;
  }
  .invoice {
    position: absolute;
    top: -10px;
    right: 35px;
    font-size: 1.6em;
    color: white;
    font-family: RobotoBold;
    /* border: 1px solid #b52124; */
    background: #1e1c1c;
    border-radius: 20px;
    width: 40px;
    height: 40px;
    vertical-align: middle;
    text-align: center;
    padding: 4px;
  }
</style>
