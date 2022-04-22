<script>
  import {
    Title,
    Navigation,
    Router,
    Menu,
    Routes,
  } from "../../stores/Navigation";
  import { GetOrders, OrderStatus } from "../../network/Orders";
  import { Views, Utils } from "@tian/components";
  import { PaymentType } from "../../network/Payment";
  import { ChangeOrderStatus } from "../../network/Orders";
  import { StatusBar } from "../../stores/Setup";
  import { faHistory } from "@fortawesome/free-solid-svg-icons";

  const orderFinishedOptions = ["waitingPayment", "delivered", "canceled"];
  let isLoading = false;
  let orders = [];
  let selected = null;
  let oldSelected = null;
  const orderOptions = (orderID) => [
    { id: "accepted", name: "1. Aceitar o pedido", orderID },
    { id: "waitingDelivery", name: "2. Esperando o entregador", orderID },
    { id: "delivery", name: "3. Saiu para entrega", orderID },
    { id: "delivered", name: "4. Pedido entrege", orderID },
    { id: "canceled", name: "5. Cancelar o pedido", orderID },
  ];

  let errorAlert;
  let showAlert = false;

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  $: if ($Router.options === null || $Router.options !== null) {
    if ($Router.options === null || !$Router.options) {
      Menu.addItem({
        icon: faHistory,
        name: "Mostrar finalizados",
        callback: goToOrdersHistory,
      });
    }
    update();
  }
  $: if (selected !== oldSelected) {
    isLoading = true;
    ChangeOrderStatus(selected.orderID, selected.id).then((response) => {
      if (!response?.success) {
        toggleErrorAlert(response?.data);
      }
    }).catch(exception => {
      toggleErrorAlert(exception);
    });
    isLoading = false;
  }

  async function update() {
    isLoading = true;
    orders = await GetOrders($Router.options);
    isLoading = false;
  }

  function goToOrder(id) {
    const order = orders.find((order) => {
      return order.id === id;
    });
    Navigation.goTo(Routes.order, order);
  }

  function goToOrdersHistory() {
    Navigation.goTo(Routes.orders, true);
  }

  Title.set("Pedidos");
</script>

{#if isLoading}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if}
<div>
  {#if orders.length > 0}
    {#each orders as { id, status, stage, products, address, payment, createdAt, finishedAt, subtotal, coupon, delivery }}
      <div class="leftShadow orderContainer">
        <div on:click={goToOrder(id)}>
          <h3>#{id}: pedido {OrderStatus(status)}</h3>
          {#if products.length > 0}
            <div class="product">1. {products[0].title}</div>
          {/if}
          {#if products.length > 1}
            <div class="product">
              e mais {products.length - 1}
              {products.length - 1 == 1 ? "item" : "itens"}
            </div>
          {/if}
          <div class="address">Entregue em: <b>{address.street}</b></div>
          <div class="paymentMethod">
            Forma de pagamento: <b>{PaymentType(payment.type)}</b>
          </div>
          <div class="time">{Utils.Strings.timestampToString(createdAt)}</div>
        </div>
        {#if !orderFinishedOptions.includes(status)}
          <Views.Selector
            bind:selected
            name="Seleciona uma opção!"
            options={orderOptions(id)}
          />
        {/if}
      </div>
    {/each}
  {:else}
    <h2>Não ha pedidos por enquanto!</h2>
  {/if}
</div>
<Views.MessageAlert object={errorAlert} bind:show={showAlert} />

<style>
  .orderContainer {
    border-radius: 4px;
    border: 1px solid #ccc;
    padding: 20px;
    margin-bottom: 10px;
    margin-top: 10px;
    background: #eeeeee33;
  }
  .orderContainer > div > h3 {
    padding: 0;
    margin: 0;
    font-size: 1.1em;
    margin-bottom: 5px;
  }
  .orderContainer > div > .product {
    font-family: RobotoLight;
    font-size: 0.9em;
    margin-bottom: 2px;
  }
  .orderContainer > div > .address {
    font-family: RobotoThin;
    font-size: 0.9em;
    margin-bottom: 2px;
  }
  .orderContainer > div > .paymentMethod {
    font-family: RobotoThin;
    font-size: 0.9em;
    margin-bottom: 2px;
  }
  .orderContainer > div > .time {
    font-family: RobotoThin;
    font-size: 0.6em;
  }
</style>
