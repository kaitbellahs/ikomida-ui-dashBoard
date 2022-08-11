<script>
  import { Views, Utils, Types } from "@ikomida/components";
  import { faShare } from "@fortawesome/free-solid-svg-icons";
  import { Filesystem, Directory } from "@capacitor/filesystem";
  import {
    Navigation,
    Title,
    Router,
    Routes,
    Menu,
  } from "../../stores/Navigation";
  import { OrderStatus, ChangeOrderStatus } from "../../network/Orders";
  import { getOrder } from "../../network/Products";
  import { StatusBar } from "../../stores/Setup";
  import Cache from "../../stores/Cache";
  import { Share } from "@capacitor/share";
  import { onMount } from "svelte";
  import html2canvas from "html2canvas";

  $: CACHE_NAME = "ORDERS";

  const order = $Router.options;
  let isLoading = false;
  let orderScreen;

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
      toggleErrorAlert("O pedido foi atualizado com sucesso!");
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
      toggleErrorAlert("O pedido foi atualizado com sucesso!");
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

  async function goToProduct(id) {
    isLoading = true;
    const response = await getOrder(id);
    if (response?.success) {
      const product = response?.data;
      Navigation?.goTo(Routes.product, product);
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  async function share() {
    // const checkPermissions = await Filesystem.checkPermissions();
    // console.log(checkPermissions);
    // if (checkPermissions === "denied") {
    //   return;
    // }
    // if (
    //   checkPermissions !== "granted" &&
    //   (await Filesystem.requestPermissions()) !== "granted"
    // ) {
    //   return;
    // }
    const canvas = await html2canvas(orderScreen);
    const data = canvas.toDataURL().split(",");
    const screenShot = await Filesystem.writeFile({
      path: `screenshots/order-${order?.customID}.jpg`,
      data: data?.[1],
      directory: Directory.Cache,
      recursive: true,
    });
    //TODO: -- report identifier of the app that received the share action. Can be an empty string in some cases. On web it will be undefined.
    const activityType = await Share.share({
      title: `Pedido #${order?.customID}`,
      text: "Eu estou compartilhando com você esse pedido",
      url: `file://${screenShot?.uri}`,
      dialogTitle: "Compartilhar o pedido",
    });
  }
  onMount(async () => {
    if (await Share.canShare()) {
      Menu.addItem({ name: "Compartilhar", icon: faShare, callback: share });
    }
  });
  Title.set("Detalhes do predido");
</script>

<div class="order" bind:this={orderScreen}>
  <span class="time"
    >Feito {Utils.Strings.timestampToString(order?.createdAt)}</span
  >

  {#if [Types.OrderStatusType.WAITING_PAYMENT, Types.OrderStatusType.OPEN, Types.OrderStatusType.ACCEPTED, Types.OrderStatusType.WAITING_DELIVERY, Types.OrderStatusType.IN_DELIVERY].includes(order.status)}
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
  <h3>Itens a entregar</h3>
  {#each order?.products as { id, title, price, quantity, discount, discountType }, index}
    <div class="product" on:click={goToProduct(id)}>
      <span class="quantity">{quantity}</span><span class="title">{title}</span
      ><span class="price"
        >{Utils.Strings.currency(
          quantity *
            (price - Utils.Numbers.calcDiscount(price, discount, discountType))
        )}</span
      >
    </div>
  {/each}
  <Views.Divider />
  <h3>Dados para entregar</h3>
  <div class="user">
    <span
      >Nome: <b
        >{Utils.Strings.formatAsName(
          `${order?.user?.name} ${order?.user?.lastName}`
        )}</b
      ></span
    >
    <span
      >Contato: <b>{Utils.Strings.formatAsPhone(order?.user?.phone)}</b></span
    >
  </div>
  <div class="address">
    Endereço:
    <span class="street"
      >{order?.address?.street}, {order?.address?.number}{order?.address
        ?.complement
        ? ` - ${order?.address?.complement}`
        : ""}</span
    ><br />
    <span class="neighborhood"
      >{order?.address?.neighborhood}<br />
      <span class="city"
        >{order?.address?.city}/{order?.address?.stat} CEP: {order?.address
          ?.postalCode}</span
      >
    </span>
  </div>
  <h3>Dados de pagamento</h3>
  <div class="paymentMethod">
    <span
      >Pago com <b
        >{new Types.PaymentMethodType(order?.payment.type).name}
        {new Types.PaymentMethodType(order?.payment.type).description}</b
      ></span
    >
    <span class="brand">
      {#if order?.payment.type === Types.PaymentMethodType.CREDIT_CARD_ONLINE}
        <img
          src="/Assets/cardBrand/{order?.payment.brand}.svg"
          alt={order?.payment.brand}
        />
        **** {order?.payment.lastDigits}
      {/if}
    </span>
  </div>
  <div class="buttonGroup">
    {#if ![Types.OrderStatusType.DELIVERED, Types.OrderStatusType.CANCELED].includes(order?.status)}
      <Views.Button multiplier="0.8" type="secondary" on:click={cancel}
        >Cancelar</Views.Button
      >
    {/if}
    {#if ![Types.OrderStatusType.DELIVERED, Types.OrderStatusType.CANCELED, Types.OrderStatusType.WAITING_PAYMENT].includes(order?.status)}
      <Views.Button multiplier="0.8" on:click={next}
        >{nextButtonText(order)}</Views.Button
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
    margin-top: 10px;
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
    font-size: 0.9em;
    margin-top: 20px;
    margin-bottom: 10px;
  }
  .address > .street {
    font-family: "RobotoMedium";
    margin-bottom: 10px;
  }
  .address > .neighborhood {
    font-family: "RobotoMedium";
    font-size: 1em;
    width: 100%;
  }
  .paymentMethod {
    font-size: 0.9em;
    margin-bottom: 5px;
    display: flex;
    flex-direction: column;
  }
  .paymentMethod > .brand > img {
    height: 14px;
  }
  .paymentMethod > .brand {
    font-weight: lighter;
    font-size: 1em;
    width: 100%;
    margin-top: 5px;
  }
  .time {
    /* font-family: RobotoThin; */
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
  .order > .user {
    display: flex;
    flex-direction: column;
  }
  h3 {
    border-left: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    padding-left: 20px;
    margin-bottom: 10px;
  }
</style>
