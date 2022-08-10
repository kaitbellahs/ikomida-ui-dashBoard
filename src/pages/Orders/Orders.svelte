<script>
  import {
    Title,
    Navigation,
    Router,
    Menu,
    Routes,
  } from "../../stores/Navigation";
  import { getOrders, OrderStatus } from "../../network/Orders";
  import { Views, Utils, Types } from "@ikomida/components";
  import { PaymentType } from "../../network/Payment";
  import { ChangeOrderStatus } from "../../network/Orders";
  import { StatusBar } from "../../stores/Setup";
  import { faHistory, faSync } from "@fortawesome/free-solid-svg-icons";
  import Cache from "../../stores/Cache";
  let orders;

  let hasMore = true;
  let canGetMore = true;
  let lastTimestamp = null;

  async function getMore(e, refresh = false) {
    if (refresh || (canGetMore && hasMore)) {
      isLoading = true;
      const timestamp = refresh
        ? 0
        : orders?.[orders.length - 1]?.timestamp ?? -1;
      canGetMore = false;
      orders = Cache.getObject(CACHE_NAME);
      const newOrders = await getOrders($Router.options, timestamp);
      hasMore = newOrders.length > 0;
      orders = refresh
        ? newOrders
        : orders
        ? [...orders, ...newOrders]
        : newOrders;
      orders = orders?.map((order) => {
        order.statusIndex = Types.OrderStatusType.keys.indexOf(order.status);
        return order;
      });
      orders.sort((item1, item2) => item2.timestamp - item1.timestamp);
      Cache.setObject(CACHE_NAME, orders);
      canGetMore = refresh || lastTimestamp !== timestamp;
      lastTimestamp = timestamp;
      isLoading = false;
    }
  }

  async function update() {
    orders = Cache.getObject(CACHE_NAME);
    if (!orders) {
      await getMore(null, true);
    }
  }

  async function refresh() {
    await getMore(null, true);
  }

  let isLoading = false;
  let errorAlert;
  let showAlert = false;

  $: CACHE_NAME = $Router?.options ? "ORDERS_HISTORY" : "ORDERS";
  $: if ($Router?.options === null || $Router?.options !== null) {
    // if (!$Router?.options) {
    //   Menu.addItem({
    //     icon: faHistory,
    //     name: "Pedidos concluídos",
    //     callback: goToOrdersHistory,
    //   });
    // }
    Menu.addItem({ name: "Atualizar", icon: faSync, callback: refresh });
    update();
  }

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

  async function cancel(order) {
    isLoading = true;
    const response = await ChangeOrderStatus(
      order?.id,
      Types.OrderStatusType.CANCELED
    );
    if (response?.success) {
      order.status = Types.OrderStatusType.CANCELED;
      toggleErrorAlert("O pedido foi atualizado com sucesso!");
      orders = orders;
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  async function next(order) {
    isLoading = true;
    let newStatus =
      Types.OrderStatusType.keys[
        Types.OrderStatusType.keys.indexOf(order?.status) + 1
      ];
    const response = await ChangeOrderStatus(order?.id, newStatus);
    if (response?.success) {
      order.status = newStatus;
      toggleErrorAlert("O pedido foi atualizado com sucesso!");
      orders = orders;
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  function goToOrder(id) {
    const order = orders?.find((order) => {
      return order?.id === id;
    });
    Navigation.goTo(Routes.order, order);
  }

  function goToOrdersHistory() {
    Navigation.goTo(Routes.orders, true);
  }

  Title.set(!$Router?.options ? "Pedidos abertos" : "Pedidos concluídos");
</script>

{#if isLoading}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if}
{#if orders && orders.length > 0}
  <section>
    {#each orders as order}
      <div class="leftShadow orderContainer">
        <div on:click={goToOrder(order?.id)}>
          <h3>#{order?.customID}: pedido {OrderStatus(order?.status)}</h3>
          {#if ["waitingPayment", "open", "accepted", "waitingDelivery", "delivery"].includes(order?.status)}
            {#if new Date(new Date(order?.createdAt).getTime() + order?.preparation?.max * 1000) < new Date()}
              <span class="lateOrder">Pedido atrasado</span>
            {/if}
            <span class="deliveryForecast">Prepare o pedido antes de </span>
            <span class="deliveryForecastValue">
              {Utils.Strings.dateToString(
                new Date(order?.createdAt).getTime() +
                  order?.preparation?.max * 1000
              )}</span
            >
          {/if}
          {#if order?.products?.length > 0}
            <div class="product">1. {order?.products?.[0]?.title}</div>
          {/if}
          {#if order?.products?.length > 1}
            <div class="product">
              e mais {order?.products?.length - 1}
              {order?.products?.length - 1 == 1 ? "item" : "itens"}
            </div>
          {/if}
          <div class="address">
            Entregue em: <b>{order?.address?.street}</b>
          </div>
          <div class="paymentMethod">
            Forma de pagamento: <b>{PaymentType(order?.payment?.type)}</b>
          </div>
          <div class="time">
            {Utils.Strings.timestampToString(order?.createdAt)}
          </div>
        </div>
        <div class="value">
          Total do pedido: <span
            >{Utils.Strings.currency(
              Number(order?.subtotal ?? 0) +
                Number(order?.delivery ?? 0) -
                Number(order?.discount ?? 0)
            )}</span
          >
        </div>
        <div class="buttonGroup">
          {#if ![Types.OrderStatusType.DELIVERED, Types.OrderStatusType.CANCELED].includes(order?.status)}
            <Views.Button
              multiplier="0.8"
              type="secondary"
              on:click={cancel(order)}>Cancelar</Views.Button
            >
          {/if}
          {#if ![Types.OrderStatusType.DELIVERED, Types.OrderStatusType.CANCELED, Types.OrderStatusType.WAITING_PAYMENT].includes(order?.status)}
            <Views.Button multiplier="0.8" on:click={next(order)}
              >{nextButtonText(order)}</Views.Button
            >
          {/if}
        </div>
      </div>
    {/each}
    <Views.Divider />
    {#if hasMore && !canGetMore}
      <Views.LocalLoading />
    {:else}
      <Views.Button disabled={!hasMore || !canGetMore} on:click={getMore}
        >carregar mais</Views.Button
      >
    {/if}
    <Views.GTerms />
  </section>
{:else}
  <Views.CentredMessage
    text="Não há pedido para exibir por enquanto, aproveite e divulgue seu app para seus clientes, e se precisar de ajuda para fazer suas campanhas de propaganda nos dê um toque pra gente, que vamos te ajudar a turbinar suas vendas!"
  >
    <Views.Link url="https://ikomida.com/contact"
      >Solicite seu orçamento agora!</Views.Link
    >
  </Views.CentredMessage>
{/if}
<Views.MessageAlert object={errorAlert} bind:show={showAlert} />

<style>
  section {
    display: flex;
    flex: 1;
    flex-direction: column;
  }
  .orderContainer {
    border-radius: 4px;
    border: 1px solid #ccc;
    padding: 20px;
    margin-bottom: 10px;
    margin-top: 10px;
    background: #eeeeee33;
    display: flex;
    flex-direction: column;
  }
  .orderContainer > div {
    display: flex;
    flex-direction: column;
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
  .orderContainer > div > .deliveryForecast {
    font-size: 1.1em;
    color: #00000099;
  }
  .orderContainer > div > .deliveryForecastValue {
    color: rgb(0, 177, 0);
    margin-bottom: 10px;
  }
  .orderContainer > div > .lateOrder {
    background-color: #4c0708;
    border-radius: 6px;
    color: white;
    padding: 4px 20px;
    align-self: center;
    margin-bottom: 10px;
  }
  .orderContainer > .buttonGroup {
    display: flex;
    flex-direction: row;
    margin-top: 20px;
  }
  .orderContainer > .buttonGroup > :global(*) {
    flex: 1;
  }
  .orderContainer > .buttonGroup > :global(*):first-child {
    margin-right: 5px;
  }
  .orderContainer > .buttonGroup > :global(*):last-child {
    margin-left: 5px;
  }
  .orderContainer > .value {
    margin-top: 10px;
    display: flex;
    flex-direction: row;
  }
  .orderContainer > .value > span {
    color: green;
    font-size: 1.1em;
  }
</style>
