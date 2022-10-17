<script lang="ts">
  import { Share } from '@capacitor/share'
  import { onMount, tick } from 'svelte'
  import html2canvas from 'html2canvas'
  import { Views, Utils, Types, Logics, Stores } from '@ikomida/shared-frontend'
  import { faShare } from '@fortawesome/free-solid-svg-icons'
  import { Filesystem, Directory } from '@capacitor/filesystem'
  import Routes from '../../stores/Routes'
  import { OrderStatus, ChangeOrderStatus } from '../../network/Orders'
  import { getOrder } from '../../network/Products'
  import { Settings } from '../../stores/Setup'
  import { getSettings } from '../../network/Settings'

  const router = Stores.Navigation.instance.router
  const order: Types.Classes.COrder = $router.options

  let screenShot = false
  let orderScreen: HTMLElement
  let showCardBrand = false

  $: total = Number(order?.subtotal ?? 0) + Number(order?.delivery ?? 0) - Number(order?.discount ?? 0)

  const nextButtonText = (order: Types.Classes.COrder) => {
    switch (order?.status) {
      case Types.Types.TOrderStatus.WAITING_PAYMENT:
        return ''
      case Types.Types.TOrderStatus.OPEN:
        return 'Aceitar o pedido'
      case Types.Types.TOrderStatus.ACCEPTED:
        return 'Esperando o entregador'
      case Types.Types.TOrderStatus.WAITING_DELIVERY:
        return 'Saiu para entrega'
      case Types.Types.TOrderStatus.IN_DELIVERY:
        return 'Pedido entrege'
      default:
        return '-'
    }
  }

  async function cancel() {
    Stores.Loading.instance.start()
    const response = await ChangeOrderStatus(order?.id, Types.Types.TOrderStatus.CANCELED)
    if (response?.success) {
      order.status = Types.Types.TOrderStatus.CANCELED
      Stores.MessageAlert.instance.show('O pedido foi atualizado com sucesso!')
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  }

  async function next() {
    Stores.Loading.instance.start()
    const newStatus = order.status?.next()
    const response = await ChangeOrderStatus(order?.id, newStatus)
    if (response?.success) {
      order.status = newStatus
      Stores.MessageAlert.instance.show('O pedido foi atualizado com sucesso!')
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  }

  async function goToProduct(id?: string) {
    Stores.Loading.instance.start()
    if (!id) {
      Stores.Loading.instance.stop()
      return
    }
    const response = await getOrder(id)
    if (response?.success) {
      const product: Types.Classes.CProduct = Types.Classes.CProduct.fromObject(response?.data)
      Stores.Navigation.instance?.goTo(Routes.product, product)
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  }
  async function share() {
    Stores.Loading.instance.start()
    screenShot = true
    await tick()
    const canvas = await html2canvas(orderScreen, {
      logging: false,
      backgroundColor: '#fff',
      allowTaint: true,
      useCORS: true
    })
    screenShot = false
    await tick()
    Stores.Loading.instance.stop()
    const data = canvas.toDataURL('image/jpeg', 1.0).split(',')
    const screenShotFile = await Filesystem.writeFile({
      path: `screenshots/order-${order?.customID}.jpg`,
      data: data?.[1],
      directory: Directory.Cache,
      recursive: true
    })
    //TODO: -- report identifier of the app that received the share action. Can be an empty string in some cases. On web it will be undefined.
    await Share.share({
      title: `Pedido #${order?.customID}`,
      // text: "Eu estou compartilhando com você esse pedido",
      url: `file://${screenShotFile?.uri}`,
      dialogTitle: 'Compartilhar o pedido'
    })
  }

  onMount(async () => {
    if (await Share.canShare()) {
      Stores.Menu.instance.addItem({
        name: 'Compartilhar',
        icon: faShare,
        callback: share
      })
    }
    if (!('PROFILE' in $Settings) || !$Settings?.profile) {
      const response = await getSettings()
      if (response?.success) {
        $Settings.profile = response.data.profile
        Settings.set($Settings)
      }
    }
    tick()
    Stores.Loading.instance.stop()
  })

  Stores.Title.instance.set('Detalhes do pedido')
</script>

<div class="order screenShot {screenShot ? 'screenShot' : ''}" bind:this={orderScreen}>
  <div class="avatar {screenShot ? 'screenShot' : ''}">
    {#if $Settings?.profile?.mainPicture}
      <Views.Image
        source={$Settings?.profile?.mainPicture ?? 'assets/icons/transparent-logo-1.svg'}
        name={$Settings?.profile?.contractName ?? 'iKomida'}
      />
    {:else if $Settings?.profile?.contractName}
      <h1>{$Settings?.profile?.contractName}</h1>
    {:else}
      <Views.Image source="assets/icons/transparent-logo-1_144x45.png" name="iKomida" />
      <h2>{$Settings?.profile?.contractName}</h2>
    {/if}
    <Views.Divider height={30} />
  </div>
  <div class="orderStatus" data-html2canvas-ignore>
    {#if order.status && [Types.Types.TOrderStatus.WAITING_PAYMENT, Types.Types.TOrderStatus.OPEN, Types.Types.TOrderStatus.ACCEPTED, Types.Types.TOrderStatus.WAITING_DELIVERY, Types.Types.TOrderStatus.IN_DELIVERY].includes(order.status) && order?.createdAt && new Date(order?.createdAt.getTime() + (order?.preparation?.max ?? 0) * 1000) < new Date()}
      <Views.Status type={Types.Status.ERROR} circle={true}>Pedido atrasado</Views.Status>
    {/if}
    {#if order.status && [Types.Types.TOrderStatus.DELIVERED].includes(order.status)}
      <Views.Status type={Types.Status.SUCCESS} circle={true}>Pedido entregue</Views.Status>
    {/if}
    {#if order.status && [Types.Types.TOrderStatus.CANCELED].includes(order.status)}
      <Views.Status type={Types.Status.ERROR}>Pedido cancelado</Views.Status>
    {/if}
    <Views.Divider />
  </div>
  <h3 class="title">Pedido N˚: {order?.customID}</h3>
  <Views.Divider />
  <div class="info" data-html2canvas-ignore>
    {#if order.status && [Types.Types.TOrderStatus.WAITING_PAYMENT, Types.Types.TOrderStatus.OPEN, Types.Types.TOrderStatus.ACCEPTED, Types.Types.TOrderStatus.WAITING_DELIVERY, Types.Types.TOrderStatus.IN_DELIVERY].includes(order.status)}
      <Views.Status showIcon={false} type={Types.Status.WARNING}
        >Prepare o pedido antes de
        {Utils.Strings.dateToString(
          String(new Date((order?.createdAt?.getTime() ?? 0) + (order?.preparation?.max ?? 0) * 1000))
        )}</Views.Status
      >
      <Views.Divider />
    {/if}
  </div>

  {#if !order.status || ![Types.Types.TOrderStatus.DELIVERED, Types.Types.TOrderStatus.CANCELED].includes(order.status)}
    <div class="orderStatus" data-html2canvas-ignore>
      <Views.Status>
        Pedido {OrderStatus(order?.status)}
      </Views.Status>
      <Views.Divider />
    </div>
  {/if}
  <span class="time">Data: {Utils.Strings.dateToString(order?.createdAt)}</span>
  <Views.Divider />
  <h3>Itens do pedido</h3>
  {#each order?.products ?? [] as product}
    <button class="product" on:click={() => goToProduct(product.id)}>
      <header>
        <span class="quantity">{product.quantity}</span><span class="title">{product.title}</span><span class="price"
          >{Utils.Strings.currency(
            (product.quantity ?? 0) *
              ((product.price ?? 0) -
                Logics.Finances.calcDiscount(product.price ?? 0, product.discount ?? 0, product.discountType))
          )}</span
        >
      </header>
      {#if (product.options?.length ?? 0) > 0}
        <div>
          {#each product.options ?? [] as option}
            <div class="option">
              <span class="units">{option.units}</span><span class="name">{option.name}</span><span class="price"
                >{Utils.Strings.currency(
                  (option.units ?? 0) *
                    ((option.price ?? 0) -
                      Logics.Finances.calcDiscount(option.price ?? 0, product.discount ?? 0, product.discountType))
                )}</span
              >
            </div>
          {/each}
          {#if product.observation}
            <small><b>Obs:</b> {product.observation}</small>
          {/if}
        </div>
      {/if}
    </button>
  {/each}
  <Views.Divider />
  <h3>Dados da entrega</h3>
  <Views.Divider />
  <div class="user">
    <span>Nome: <b>{Utils.Strings.formatAsName(`${order?.user?.name} ${order?.user?.lastName}`)}</b></span>
    <span>Contato: <b>{Utils.Strings.formatAsPhone(order?.user?.phone)}</b></span>
  </div>
  <div class="address">
    Endereço:
    <span class="street"
      >{order?.address?.street ?? '-'}, {order?.address?.number ?? '-'}{order?.address?.complement
        ? ` - ${order?.address?.complement}`
        : ''}</span
    ><br />
    <span class="neighborhood"
      >{order?.address?.neighborhood ?? '-'}<br />
      <span class="city"
        >{order?.address?.city ?? '-'}/{order?.address?.stat ?? '-'} CEP: {order?.address?.postalCode ?? '-'}</span
      >
    </span>
  </div>
  <Views.Divider />
  <h3>Dados de pagamento</h3>
  <Views.Divider />
  <div class="paymentMethod">
    <span
      >Pago com <b
        >{order?.payment?.type?.name}
        {order?.payment?.type?.description}</b
      ></span
    >
    <span class="brand">
      {#if order?.payment?.type === Types.Types.TPaymentMethod.CREDIT_CARD_ONLINE}
        {#if showCardBrand}
          <div style="object-fit: contain;">
            <Views.Image source="/assets/cardBrand/{order?.payment.brand}.svg" name={order?.payment.brand} />
          </div>
        {/if}
        **** {order?.payment.lastDigits}
      {/if}
    </span>
  </div>
  <div data-html2canvas-ignore class="buttonGroup">
    {#if !order?.status || ![Types.Types.TOrderStatus.DELIVERED, Types.Types.TOrderStatus.CANCELED].includes(order?.status)}
      <Views.Button sizeMultiplier={0.8} type={Types.TButton.SECONDARY} on:click={cancel}>Cancelar</Views.Button>
    {/if}
    {#if !order?.status || ![Types.Types.TOrderStatus.DELIVERED, Types.Types.TOrderStatus.CANCELED, Types.Types.TOrderStatus.WAITING_PAYMENT].includes(order?.status)}
      <Views.Button sizeMultiplier={0.8} on:click={next}>{nextButtonText(order)}</Views.Button>
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
          <td class="resumeValue"><span class="deliveryFree">- {Utils.Strings.currency(order?.discount)}</span></td>
        </tr><tr>
          <td class="coupon" colspan="2"
            >{order?.coupon?.name?.toUpperCase()} (- {order?.coupon?.valueType === Types.Types.TDiscount?.PERCENT
              ? Utils.Strings.percent(order?.coupon?.value)
              : Utils.Strings.currency(order?.coupon?.value)})</td
          >
        </tr>
      {/if}
      <tr>
        <td class="resumeText">Taxa de entrega</td>
        <td class="resumeValue"
          ><span class:deliveryFree={order?.delivery == 0}>{Utils.Strings.currency(order?.delivery)}</span></td
        >
      </tr>
      <tr>
        <td class="resumeText"><b>Total</b></td>
        <td class="resumeValue"><b>{Utils.Strings.currency(total)}</b></td>
      </tr>
    </tbody>
  </table>
  <div class="signature {screenShot ? 'screenShot' : ''}">
    <Views.Divider height={30} />
    <span>Feito com carinho por</span><Views.Image source="/assets/icons/transparent-logo-1.png" name="iKomida" />
  </div>
</div>
<Views.GTerms />

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
    border: 0;
    border-bottom: 1px solid #ccc;
    border-left: 1px solid #ccc;
    display: flex;
    flex-direction: column;
    background-color: transparent;
  }
  .product > header > .quantity {
    margin-right: 5px;
    font-family: RobotoMedium;
    font-size: 1em;
    background: #ccc;
    width: 20px;
    height: 20px;
    padding: 2px;
    text-align: center;
    vertical-align: middle;
  }
  .product > header > .price {
    margin-left: 5px;
    font-family: RobotoMedium;
    font-size: 0.9em;
  }
  .product > div {
    margin-left: 15px;
    margin-bottom: 5px;
    margin-top: 5px;
    font-size: 0.9em;
  }
  .product > div > .option > .units {
    margin-right: 5px;
    font-family: RobotoMedium;
    font-size: 1em;
    background: rgba(204, 204, 204, 0.356);
    width: 20px;
    height: 20px;
    padding: 2px;
    text-align: center;
    vertical-align: middle;
  }
  .product > div > .option > .price {
    margin-left: 5px;
    font-family: RobotoMedium;
    font-size: 0.9em;
  }
  .address {
    font-size: 0.9em;
    margin-top: 20px;
    margin-bottom: 10px;
  }
  .address > .street {
    font-family: 'RobotoMedium';
    margin-bottom: 10px;
  }
  .address > .neighborhood {
    font-family: 'RobotoMedium';
    font-size: 1em;
    width: 100%;
  }
  .paymentMethod {
    font-size: 0.9em;
    margin-bottom: 5px;
    display: flex;
    flex-direction: column;
  }
  .paymentMethod > .brand > :global(img) {
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
  .avatar > :global(img) {
    font-size: 3em;
    width: 100%;
    max-width: 500px;
    border-radius: 40px;
    height: 210px;
    line-height: 90px;
    overflow: hidden;
    object-fit: contain;
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
  .signature > :global(img) {
    height: 45px;
  }
</style>
