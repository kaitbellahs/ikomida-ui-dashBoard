<script>
  import { Title, Router } from "../../stores/Navigation";
  import { OrderStatus, ChangeOrderStatus } from "../../network/Orders";
  import { Views, Utils, Types } from "@ikomida/components";
  import { PaymentType } from "../../network/Payment";
  import { StatusBar } from "../../stores/Setup";
  import Cache from "../../stores/Cache";

  $: CACHE_NAME = "ORDERS";

  const order = $Router.options;
  let isLoading = false;

  const nextButtonText = (order) => {
    switch (order?.status) {
      case Types.OrderStatusType.WAITING_PAYMENT:
        return "";
      case Types.OrderStatusType.OPEN:
        return "Aceitar o pedido";
      case Types.OrderStatusType.ACCEPTED:
        return "Esperando o entregador";
      case Types.OrderStatusType.WAITING_DELIVERY:
        return "Saiu para entrega";
      case Types.OrderStatusType.IN_DELIVERY:
        return "Pedido entrege";
      default:
        return "-";
    }
  };

  async function cancel() {
    isLoading = true;
    const response = await ChangeOrderStatus(
      order?.id,
      Types.OrderStatusType.CANCELED
    );
    if (response?.success) {
      order.status = Types.OrderStatusType.CANCELED;
      Cache.setObject(CACHE_NAME, null);
      toggleErrorAlert("O pedido foi atualizado con sucesso!");
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  async function next() {
    isLoading = true;
    let newStatus =
      Types.OrderStatusType.keys[
        Types.OrderStatusType.keys.indexOf(order?.status) + 1
      ];
    const response = await ChangeOrderStatus(order?.id, newStatus);
    if (response?.success) {
      order.status = newStatus;
      Cache.setObject(CACHE_NAME, null);
      toggleErrorAlert("O pedido foi atualizado con sucesso!");
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  let errorAlert;
  let showAlert = false;
  $: total =
    Number(order?.subtotal ?? 0) +
    Number(order?.delivery ?? 0) -
    Number(order?.discount ?? 0);

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  Title.set("Detalhes do predido");
</script>

<div class="order">
  <span class="time"
    >Feito {Utils.Strings.timestampToString(order?.createdAt)}</span
  >

  {#if ["waitingPayment", "open", "accepted", "waitingDelivery", "delivery"].includes(order?.status)}
    {#if new Date(new Date(order?.createdAt).getTime() + order?.preparation?.max * 1000) < new Date()}
      <span class="lateOrder">Pedido atrasado</span>
    {/if}
    <span class="deliveryForecast">Prepare o pedido antes de </span>
    <span class="deliveryForecastValue">
      {Utils.Strings.dateToString(
        new Date(order?.createdAt).getTime() + order?.preparation?.max * 1000
      )}</span
    >
  {/if}

  <h3>Pedido #{order?.customID}:</h3>
  <span class="status">
    {#if order?.status == Types.OrderStatusType.OPEN}
      O pedido está
      <span>{OrderStatus(order?.status)}</span>
    {:else}
      {OrderStatus(order?.status)} em
      <span class="time"
        >{Utils.Strings.timestampToString(order?.finishedAt)}</span
      >
    {/if}
  </span>
  {#each order?.products as { title, price, quantity, discount, discountType }, index}
    <div class="product">
      <span class="quantity">{quantity}</span><span class="title">{title}</span
      ><span class="price"
        >{Utils.Strings.currency(
          quantity *
            (price - Utils.Numbers.calcDiscount(price, discount, discountType))
        )}</span
      >
    </div>
  {/each}
  <div class="address">Entregue em: <b>{order?.address?.street}</b></div>
  <div class="paymentMethod">
    Forma de pagamento: <b>{PaymentType(order?.payment?.type)}</b>
  </div>
  <div class="buttonGroup">
    {#if ![Types.OrderStatusType.DELIVERED, Types.OrderStatusType.CANCELED].includes(order?.status)}
      <Views.Button type="secondary" on:click={cancel}
        >Cancelar</Views.Button
      >
    {/if}
    {#if ![Types.OrderStatusType.DELIVERED, Types.OrderStatusType.CANCELED, Types.OrderStatusType.WAITING_PAYMENT].includes(order?.status)}
      <Views.Button on:click={next}>{nextButtonText(order)}</Views.Button
      >
    {/if}
  </div>
  <Views.Divider />
  <table>
    <thead>
      <tr>
        <th colspan="2" class="resumeHead">Resumo</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="resumeText">Subtotal</td>
        <td class="resumeValue">{Utils.Strings.currency(order?.subtotal)}</td>
      </tr>
      {#if Number(order?.discount) > 0}
        <tr>
          <td class="resumeText">Desconto</td>
          <td class="resumeValue"
            ><span class="deliveryFree"
              >- {Utils.Strings.currency(order?.discount)}</span
            ></td
          >
        </tr>
      {/if}
      <tr>
        <td class="resumeText">Taxa de entrega</td>
        <td class="resumeValue"
          ><span class:deliveryFree={order?.delivery == 0}
            >{Utils.Strings.currency(order?.delivery)}</span
          ></td
        >
      </tr>
      <tr>
        <td class="resumeText"><b>Total</b></td>
        <td class="resumeValue"><b>{Utils.Strings.currency(total)}</b></td>
      </tr>
    </tbody>
  </table>
</div>
<Views.GTerms />
<Views.MessageAlert object={errorAlert} bind:show={showAlert} />

{#if isLoading}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if}

<style>
  .order {
    display: flex;
    flex-direction: column;
  }
  h3 {
    padding: 0;
    margin: 0;
    font-size: 1.1em;
    margin-bottom: 5px;
    margin-top: 10px;
  }
  .status {
    margin-bottom: 10px;
  }
  .product {
    font-family: RobotoLight;
    font-size: 0.9em;
    margin-top: 20px;
    margin-bottom: 0;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #ccc;
  }
  .product > .quantity {
    font-family: RobotoMedium;
    font-size: 1em;
    background: #ccc;
    width: 20px;
    height: 20px;
    padding: 2px;
    text-align: center;
    vertical-align: middle;
  }
  .product > .quantity {
    font-family: RobotoMedium;
    font-size: 1em;
  }
  .address {
    font-family: RobotoThin;
    font-size: 0.9em;
    margin-top: 20px;
    margin-bottom: 10px;
  }
  .paymentMethod {
    font-family: RobotoThin;
    font-size: 0.9em;
    margin-bottom: 5px;
  }
  .time {
    font-family: RobotoThin;
    font-size: 0.8em;
    margin-top: 5px;
  }
  table {
    width: 100%;
    padding-bottom: 10px;
  }
  .resumeHead {
    font-size: 1.1em;
  }
  .resumeText {
    text-align: left;
    width: 50%;
    font-size: 0.9em;
    font-weight: lighter;
  }
  .resumeValue {
    text-align: right;
    font-size: 0.9em;
  }
  .deliveryFree {
    color: green;
  }
  .deliveryForecast {
    margin-top: 10px;
    font-size: 1.1em;
    color: #00000099;
  }
  .deliveryForecastValue {
    color: rgb(0, 177, 0);
    margin-bottom: 10px;
  }
  .lateOrder {
    background-color: #4c0708;
    border-radius: 6px;
    color: white;
    padding: 4px 20px;
    align-self: center;
    margin-bottom: 10px;
  }
  .order > .buttonGroup {
    display: flex;
    flex-direction: row;
    margin-top: 20px;
  }
  .order > .buttonGroup > :global(*) {
    flex: 1;
  }
  .order > .buttonGroup > :global(*):first-child {
    margin-right: 5px;
  }
  .order > .buttonGroup > :global(*):last-child {
    margin-left: 5px;
  }
</style>
