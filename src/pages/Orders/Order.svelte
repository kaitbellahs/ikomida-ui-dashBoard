<script>
  import { Share } from "@capacitor/share";
  import { onMount } from "svelte";
  import html2canvas from "html2canvas";
  import { Views, Utils, Types, Logics } from "@ikomida/components";
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
  import { Settings } from "../../stores/Setup";
  import { getSettings } from "../../network/Settings";

  const order = $Router.options;
  let isLoading = false;
  let screenShot = false;
  let showImage = true;
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
      toggleErrorAlert("O pedido foi atualizado com sucesso!");
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  let errorAlert;
  let showAlert = false;
  let showCardBrand = false;
  $: total =
    Number(order?.subtotal ?? 0) +
    Number(order?.delivery ?? 0) -
    Number(order?.discount ?? 0);

  function hideCardBrand() {
    showCardBrand = false;
  }

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
    isLoading = true;
    screenShot = true;
    async function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    await sleep(3);
    const canvas = await html2canvas(orderScreen, {
      logging: false,
      backgroundColor: "#fff",
      allowTaint: true,
      useCORS: true,
    });
    screenShot = false;
    isLoading = false;
    const data = canvas.toDataURL("image/jpeg", 1.0).split(",");
    const screenShotFile = await Filesystem.writeFile({
      path: `screenshots/order-${order?.customID}.jpg`,
      data: data?.[1],
      directory: Directory.Cache,
      recursive: true,
    });
    //TODO: -- report identifier of the app that received the share action. Can be an empty string in some cases. On web it will be undefined.
    const activityType = await Share.share({
      title: `Pedido #${order?.customID}`,
      // text: "Eu estou compartilhando com você esse pedido",
      url: `file://${screenShotFile?.uri}`,
      dialogTitle: "Compartilhar o pedido",
    });
  }
  onMount(async () => {
    isLoading = true;
    if (await Share.canShare()) {
      Menu.addItem({ name: "Compartilhar", icon: faShare, callback: share });
    }
    if (!("profile" in $Settings) || !$Settings?.profile) {
      const response = await getSettings();
      if (response) {
        $Settings.profile = response?.profile;
        Settings.set($Settings);
      }
    }
    isLoading = false;
  });
  function erroLoadImage(event) {
    showImage = false;
  }
  Title.set("Detalhes do predido");
</script>

<div class="order {screenShot ? 'screenShot' : ''}" bind:this={orderScreen}>
  <div class="avatar {screenShot ? 'screenShot' : ''}">
    {#if $Settings?.profile?.mainPicture && showImage}
      <img
        on:error={erroLoadImage}
        src={$Settings?.profile?.mainPicture ??
          "Assets/icons/transparent-logo-1.svg"}
        alt={$Settings?.profile?.restaurantName ?? "iKomida"}
      />
    {:else if $Settings?.profile?.restaurantName}
      <h1>{$Settings?.profile?.restaurantName}</h1>
    {:else}
      <img src="Assets/icons/transparent-logo-1_144x45.png" alt="iKomida" />
      <h2>{$Settings?.profile?.restaurantName}</h2>
    {/if}
    <Views.Divider height="30" />
  </div>
  <div class="orderStatus" data-html2canvas-ignore>
    {#if [Types.OrderStatusType.WAITING_PAYMENT, Types.OrderStatusType.OPEN, Types.OrderStatusType.ACCEPTED, Types.OrderStatusType.WAITING_DELIVERY, Types.OrderStatusType.IN_DELIVERY].includes(order.status) && new Date(new Date(order?.createdAt).getTime() + order?.preparation?.max * 1000) < new Date()}
      <Views.Status type={Views.Status.Types.ERROR} circle={true}
        >Pedido atrasado</Views.Status
      >
    {/if}
    {#if [Types.OrderStatusType.DELIVERED].includes(order.status)}
      <Views.Status type={Views.Status.Types.SUCCESS} circle={true}
        >Pedido entregue</Views.Status
      >
    {/if}
    {#if [Types.OrderStatusType.CANCELED].includes(order.status)}
      <Views.Status type={Views.Status.Types.ERROR}
        >Pedido cancelado</Views.Status
      >
    {/if}
    <Views.Divider />
  </div>
  <h3 class="title">Pedido N˚: {order?.customID}</h3>
  <Views.Divider />
  <div class="info" data-html2canvas-ignore>
    {#if [Types.OrderStatusType.WAITING_PAYMENT, Types.OrderStatusType.OPEN, Types.OrderStatusType.ACCEPTED, Types.OrderStatusType.WAITING_DELIVERY, Types.OrderStatusType.IN_DELIVERY].includes(order.status)}
      <Views.Status showIcon={false} type={Views.Status.Types.WARNING}
        >Prepare o pedido antes de
        {Utils.Strings.dateToString(
          new Date(order?.createdAt).getTime() + order?.preparation?.max * 1000
        )}</Views.Status
      >
      <Views.Divider />
    {/if}
  </div>

  {#if ![Types.OrderStatusType.DELIVERED, Types.OrderStatusType.CANCELED].includes(order.status)}
    <div class="orderStatus" data-html2canvas-ignore>
      <Views.Status>
        Pedido {OrderStatus(order?.status)}
      </Views.Status>
      <Views.Divider />
    </div>
  {/if}
  <span class="time"
    >Data: {Utils.Strings.timestampToString(order?.createdAt)}</span
  >
  <Views.Divider />
  <h3>Itens a entregar</h3>
  {#each order?.products as { id, title, price, quantity, discount, discountType }, index}
    <div class="product" on:click={goToProduct(id)}>
      <span class="quantity">{quantity}</span><span class="title">{title}</span
      ><span class="price"
        >{Utils.Strings.currency(
          quantity *
            (price -
              Logics.Finances.calcDiscount(price, discount, discountType))
        )}</span
      >
    </div>
  {/each}
  <Views.Divider />
  <h3>Dados da entrega</h3>
  <Views.Divider />
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
      >{order?.address?.street ?? "-"}, {order?.address?.number ?? "-"}{order
        ?.address?.complement
        ? ` - ${order?.address?.complement}`
        : ""}</span
    ><br />
    <span class="neighborhood"
      >{order?.address?.neighborhood ?? "-"}<br />
      <span class="city"
        >{order?.address?.city ?? "-"}/{order?.address?.stat ?? "-"} CEP: {order
          ?.address?.postalCode ?? "-"}</span
      >
    </span>
  </div>
  <Views.Divider />
  <h3>Dados de pagamento</h3>
  <Views.Divider />
  <div class="paymentMethod">
    <span
      >Pago com <b
        >{new Types.PaymentMethodType(order?.payment.type).name}
        {new Types.PaymentMethodType(order?.payment.type).description}</b
      ></span
    >
    <span class="brand">
      {#if order?.payment.type === Types.PaymentMethodType.CREDIT_CARD_ONLINE}
        {#if showCardBrand}
          <img
            on:error={hideCardBrand}
            style="object-fit: cover;"
            src="/assets/cardBrand/{order?.payment.brand}.svg"
            alt={order?.payment.brand}
          />
        {/if}
        **** {order?.payment.lastDigits}
      {/if}
    </span>
  </div>
  <div data-html2canvas-ignore class="buttonGroup">
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
        </tr><tr>
          <td class="coupon" colspan="2"
            >{order?.coupon?.name?.toUpperCase()} (- {order?.coupon?.type?.toUpperCase() ===
            Types?.DiscountTypes?.PERCENT?.toUpperCase()
              ? Utils.Strings.percent(order?.coupon?.value)
              : Utils.Strings.currency(order?.coupon?.value)})</td
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
  <div class="signature {screenShot ? 'screenShot' : ''}">
    <Views.Divider height="30" />
    <span>Feito com carinho por</span><img
      src="/assets/Icons/transparent-logo-1.png"
      alt="iKomida"
    />
  </div>
</div>
<Views.GTerms />
<Views.MessageAlert object={errorAlert} bind:show={showAlert} />

{#if isLoading}
  <Views.Loading
    opacity="0.99"
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if}

<style>
  .order {
    display: flex;
    flex-direction: column;
  }
  .order.screenShot {
    padding: 20px;
  }
  .order > .info {
    display: flex;
    flex-direction: column;
  }
  .order > .orderStatus {
    display: flex;
    flex-direction: column;
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
    font-size: 1em;
    font-weight: lighter;
  }
  .resumeValue {
    text-align: right;
    font-size: 1.1em;
  }
  .coupon {
    text-align: center;
    font-size: 0.8em;
  }
  .deliveryFree {
    color: green;
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

  .order > h3 {
    border-left: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    padding: 0 20px;
    margin: 0;
    font-size: 1.1em;
  }

  .order > h3.title {
    text-align: center;
    border: 0;
  }
  .avatar {
    display: none;
    align-items: center;
    flex-direction: column;
  }
  .avatar.screenShot {
    display: flex;
  }
  .avatar > img {
    font-size: 3em;
    width: 100%;
    max-width: 100%;
    border-radius: 45px;
    line-height: 90px;
    vertical-align: middle;
    display: table-cell;
    overflow: hidden;
  }
  .signature {
    display: none;
    flex-direction: column;
    align-items: center;
    place-content: center;
  }
  .signature.screenShot {
    display: flex;
  }
  .signature > img {
    height: 45px;
  }
</style>
