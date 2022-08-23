<script>
  import Routes from "../../stores/Routes";
  import { getOrders, OrderStatus } from "../../network/Orders";
  import { Views, Utils, Types, Stores } from "@ikomida/components";
  import { ChangeOrderStatus } from "../../network/Orders";
  import { StatusBar } from "../../stores/Setup";
  import { faSync } from "@fortawesome/free-solid-svg-icons";
  import { onMount } from "svelte";

  let items;
  let isLoading = true;
  let errorAlert;
  let showAlert = false;
  let localLoading = false;
  let canGetMore = true;

  async function getMore(e, refresh = false) {
    localLoading = true;
    [canGetMore, items] = await getOrders(refresh);
    localLoading = false;
  }

  async function refresh() {
    await getMore(null, true);
  }

  onMount(async () => {
    Stores.Menu.instance.addItem({
      name: "Atualizar",
      icon: faSync,
      callback: refresh,
    });
    [canGetMore, items] = await getOrders(false);
    isLoading = false;
  });

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
      items = items;
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
      items = items;
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  function goToOrder(order) {
    Stores.Navigation.instance.goTo(Routes.order, order);
  }

  Stores.Title.instance.set("Pedidos");
</script>

{#if isLoading}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if}
{#if items && items.length > 0}
  <section>
    {#each items as order (order?.id)}
      <div class="leftShadow orderContainer">
        <div on:click={goToOrder(order)}>
          <h3 class="title">Pedido N˚: {order?.customID}</h3>
          {#if [Types.OrderStatusType.WAITING_PAYMENT, Types.OrderStatusType.OPEN, Types.OrderStatusType.ACCEPTED, Types.OrderStatusType.WAITING_DELIVERY, Types.OrderStatusType.IN_DELIVERY].includes(order.status) && new Date(new Date(order?.createdAt).getTime() + order?.preparation?.max * 1000) < new Date()}
            <Views.Status
              type={Views.Status.Types.ERROR}
              circle={false}
              showIcon={false}>Pedido atrasado</Views.Status
            >
          {/if}
          {#if [Types.OrderStatusType.DELIVERED].includes(order.status)}
            <Views.Status
              type={Views.Status.Types.SUCCESS}
              circle={false}
              showIcon={false}>Pedido entregue</Views.Status
            >
          {/if}
          {#if [Types.OrderStatusType.CANCELED].includes(order.status)}
            <Views.Status
              type={Views.Status.Types.ERROR}
              circle={false}
              showIcon={false}>Pedido cancelado</Views.Status
            >
          {/if}
          <Views.Divider height="5" />
          <div class="info">
            {#if [Types.OrderStatusType.WAITING_PAYMENT, Types.OrderStatusType.OPEN, Types.OrderStatusType.ACCEPTED, Types.OrderStatusType.WAITING_DELIVERY, Types.OrderStatusType.IN_DELIVERY].includes(order.status)}
              <Views.Status showIcon={false} type={Views.Status.Types.WARNING}
                >Prepare o pedido antes de
                {Utils.Strings.dateToString(
                  new Date(order?.createdAt).getTime() +
                    order?.preparation?.max * 1000
                )}</Views.Status
              >
              <Views.Divider height="5" />
            {/if}
          </div>
          {#if ![Types.OrderStatusType.DELIVERED, Types.OrderStatusType.CANCELED].includes(order.status)}
            <Views.Status>
              Pedido {OrderStatus(order?.status)}
            </Views.Status>
            <Views.Divider height="5" />
          {/if}
          <div class="time">
            Data: {Utils.Strings.dateToString(order?.createdAt)}
          </div>
          <Views.Divider height="10" />
          {#if order?.products?.length > 0}
            <div class="product">1. {order?.products?.[0]?.title}</div>
          {/if}
          {#if order?.products?.length > 1}
            <div class="product">
              e mais {order?.products?.length - 1}
              {order?.products?.length - 1 == 1 ? "item" : "itens"}
            </div>
          {/if}
          <Views.Divider height="5" />
          <div class="address">
            Entregua na: <b>{order?.address.street ?? "-"}</b>
          </div>
          <div class="paymentMethod">
            Forma de pagamento: <b
              >{new Types.PaymentMethodType(order?.payment.type).name}
              {new Types.PaymentMethodType(order?.payment.type).description}</b
            >
          </div>
        </div>
        <Views.Divider height="10" />
        <div class="value">
          Total:&nbsp;<span
            >{Utils.Strings.currency(
              Number(order?.subtotal ?? 0) +
                Number(order?.delivery ?? 0) -
                Number(order?.discount ?? 0)
            )}</span
          >
        </div>
        {#if ![Types.OrderStatusType.DELIVERED, Types.OrderStatusType.CANCELED, Types.OrderStatusType.WAITING_PAYMENT].includes(order?.status)}
          <Views.Divider height="10" />
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
        {/if}
      </div>
      <Views.Divider />
    {/each}
    {#if localLoading}
      <Views.LocalLoading />
    {/if}
    {#if canGetMore}
      <Views.Button on:click={getMore}>carregar mais</Views.Button>
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
    font-size: 1.1em;
    text-align: center;
  }
  .orderContainer > div > .product {
    font-family: RobotoLight;
    font-size: 0.9em;
  }
  .orderContainer > div > .address {
    font-family: RobotoThin;
    font-size: 0.9em;
  }
  .orderContainer > div > .paymentMethod {
    font-family: RobotoThin;
    font-size: 0.9em;
  }
  .time {
    font-size: 0.8em;
  }
  .orderContainer > .buttonGroup {
    display: flex;
    flex-direction: row;
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
    display: flex;
    flex-direction: row;
    align-self: center;
  }
  .orderContainer > .value > span {
    color: green;
    font-size: 1.1em;
  }
</style>
