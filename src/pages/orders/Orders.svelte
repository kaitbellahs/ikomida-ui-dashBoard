<script>
  import {
    Title,
    Navigation,
    Router,
    Menu,
    Routes,
  } from "../../stores/Navigation";
  import { getOrders , OrderStatus } from "../../network/Orders";
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
      const newOrders = (await getOrders($Router.options, timestamp))?.map(
        (order) => {
          order.selected = orderOptions(order?.id)?.filter(
            (option) => option?.id === order?.status
          )?.[0];
          order.oldSelected = order?.selected;
          return order;
        }
      );
      hasMore = newOrders.length > 0;
      orders = refresh
        ? newOrders
        : orders
        ? [...orders, ...newOrders]
        : newOrders;
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
  
  const orderFinishedOptions = ["waitingPayment", "canceled"];

  let isLoading = false;
  let errorAlert;
  let showAlert = false;
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


  $: CACHE_NAME = $Router?.options ? "ORDERS_HISTORY" : "ORDERS";
  $: if ($Router?.options === null || $Router?.options !== null) {
    if (!$Router?.options) {
      Menu.addItem({
        icon: faHistory,
        name: "Históricos",
        callback: goToOrdersHistory,
      });
    }
    Menu.addItem({ name: "Atualizar", icon: faSync, callback: refresh });
    update();
  }

  $: orders?.forEach((order) => {
    if (order?.selected && order?.selected?.id && order?.selected?.id !== order?.oldSelected?.id) {
      isLoading = true;
      ChangeOrderStatus(order?.selected?.orderID, order?.selected?.id)
        .then((response) => {
          if (!response?.success) {
            toggleErrorAlert(response?.data);
          } else {
            order.status = order?.selected.id;
            order.oldSelected = order?.selected;
          }
        })
        .catch((exception) => {
          toggleErrorAlert(exception);
        });
      isLoading = false;
    }
  });

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

  Title.set("Pedidos");
</script>

{#if isLoading}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if}
<div>
  {#if orders && orders.length > 0}
    {#each orders as order}
      <div class="leftShadow orderContainer">
        <div on:click={goToOrder(order?.id)}>
          <h3>#{order?.customID}: pedido {OrderStatus(order?.status)}</h3>
          {#if ["waitingPayment", "open", "accepted", "waitingDelivery", "delivery"].includes(order?.status)}
            {#if new Date(new Date(order?.createdAt).getTime() + order?.preparation?.max * 1000) < new Date()}
              <span class="lateOrder">Pedido atrasado</span>
            {/if}
            <span class="deliveryForecast">Preparar o pedido antes de </span>
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
        {#if !orderFinishedOptions.includes(order?.status)}
          <Views.Selector
            options={orderOptions(order?.id)}
            bind:selected={order.selected}
            name="Selecione uma opção!"
          />
        {/if}
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
  {:else}
    <div id="noOrders">
      <h2>
        Não há pedido para exibir por enquanto, aproveite e divulga ja seu app
        com seus clientes!
      </h2>
    </div>
  {/if}
</div>
<Views.MessageAlert object={errorAlert} bind:show={showAlert} />

<style>
  #noOrders {
    display: flex;
    flex-direction: row;
    height: calc(100vh - 150px);
  }
  #noOrders > h2 {
    place-self: center;
    align-self: center;
    justify-self: center;
    text-align: center;
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
</style>
