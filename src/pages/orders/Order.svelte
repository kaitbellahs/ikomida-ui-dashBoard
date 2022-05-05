<script>
  import { Title, Router } from "../../stores/Navigation";
  import { OrderStatus } from "../../network/Orders";
  import { Views, Utils, Types } from "@tian/components";
  import { PaymentType } from "../../network/Payment";
  import { ChangeOrderStatus } from "../../network/Orders";
  import { StatusBar } from "../../stores/Setup";
  import { beforeUpdate } from "svelte";

  const orderFinishedOptions = ["delivered", "canceled"];
  const order = $Router.options;
  let selected = null;
  let oldSelected = null;
  let isLoading = false;
  const orderOptions = (orderID) => [
    new Types.SelectorOptions({
      id: "accepted",
      name: "1. Aceitar o pedido",
      selectedName: "Pedido aceito",
      orderID,
    }),
    new Types.SelectorOptions({
      id: "waitingDelivery",
      name: "2. Esperando o entregador",
      selectedName: "Pedido a Espera do entregador",
      orderID,
    }),
    new Types.SelectorOptions({
      id: "delivery",
      name: "3. Saiu para entrega",
      selectedName: "Pedido a caminho",
      orderID,
    }),
    new Types.SelectorOptions({
      id: "delivered",
      name: "4. Pedido entrege",
      selectedName: "Pedido entrege",
      orderID,
    }),
    new Types.SelectorOptions({
      id: "canceled",
      name: "5. Cancelar o pedido",
      selectedName: "Pedido cancelado",
      orderID,
    }),
  ];

  let errorAlert;
  let showAlert = false;
  $: total = (order?.subtotal || 0) + (order?.delivery || 0) - (order?.discount || 0);

  $: if (selected !== oldSelected) {
    isLoading = true;
    ChangeOrderStatus(selected?.orderID, selected?.id).then((response) => {
      if (!response?.success) {
        toggleErrorAlert(response?.data);
      } else {
        order.status = order?.selected?.id;
      }
    });
    isLoading = false;
  }

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  beforeUpdate(() => {
    selected = orderOptions(order?.id)?.filter(
      (option) => option?.id === order?.status
    )?.[0];
    oldSelected = selected;
  });

  Title.set("Detalhes do predido");
</script>

{#if isLoading}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if}
<div class=order>
<span class="time"
  >Feito {Utils.Strings.timestampToString(order?.createdAt)}</span
>

{#if ["waitingPayment", "open", "accepted", "waitingDelivery", "delivery"].includes(order?.status)}
{#if new Date(new Date(order?.createdAt).getTime() + (order?.preparation?.max) * 1000) < new Date()}
  <span class="lateOrder">Pedido atrasado</span>
{/if}
<span class="deliveryForecast">Preparar o pedido antes de </span>
<span class="deliveryForecastValue">
  {Utils.Strings.dateToString(
    new Date(order?.createdAt).getTime() +
      (order?.preparation?.max) * 1000
  )}</span
>
{/if}

<h3>Pedido #{order?.customID}: </h3>
<span class="status">
  {#if order?.status == "open"}
    Seu pedido está
    <span>{order?.stage}</span>
  {:else}
    {OrderStatus(order?.status)} em
    <span class="time">{Utils.Strings.timestampToString(order?.finishedAt)}</span
    >
  {/if}
</span>
{#each order?.products as { title, price, quantity, discount, discountType }, index}
  <div class="product">
    <span class="quantity">{quantity}</span><span class="title">{title}</span
    ><span class="price"
      >{Utils.Strings.currency(
        quantity * Utils.Numbers.calcDiscount(price, discount, discountType)
      )}</span
    >
  </div>
{/each}
<div class="address">Entregue em: <b>{order?.address?.street}</b></div>
<div class="paymentMethod">
  Forma de pagamento: <b>{PaymentType(order?.payment?.type)}</b>
</div>
{#if !orderFinishedOptions.includes(order?.status)}
  <Views.Selector
    bind:selected
    name="seleciona uma opção"
    options={orderOptions(order?.id)}
  />
{/if}
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
<Views.MessageAlert object={errorAlert} bind:show={showAlert} />

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
    background-color: red;
    border-radius: 6px;
    color: white;
    padding: 4px 20px;
    align-self: center;
    margin-bottom: 10px;
  }
</style>
