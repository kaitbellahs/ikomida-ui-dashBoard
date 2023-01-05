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
  import { Capacitor } from '@capacitor/core'

  const router = Stores.Navigation.instance.router
  const order: Types.Classes.COrder = $router.options

  let screenShot = false
  let orderScreen: HTMLElement

  $: tip = Number(Logics.Finances.calcDiscount(order.subtotal, order.tip ?? 0, Types.Types.TDiscount.PERCENT))
  $: total =
    Number(order.subtotal ?? 0) +
    Number(
      order.orderType === Types.Types.TOrderType.DELIVERY
        ? order.delivery
        : order.orderType === Types.Types.TOrderType.LOCAL
        ? Logics.Finances.calcDiscount(order.subtotal ?? 0, tip ?? 0, Types.Types.TDiscount.PERCENT)
        : 0
    ) -
    Number(order.discount ?? 0)
  $: change = (order.change ?? 0) - total

  const nextButtonText = (order: Types.Classes.COrder) => {
    switch (order?.status) {
      case Types.Types.TOrderStatus.WAITING_PAYMENT:
        return ''
      case Types.Types.TOrderStatus.OPEN:
        return 'Aceitar o pedido'
      case Types.Types.TOrderStatus.ACCEPTED:
        switch (order.orderType) {
          case Types.Types.TOrderType.LOCAL:
            return 'Esperando o garçom'
          case Types.Types.TOrderType.PICKUP:
            return 'Esperando o cliente'
          default:
            return 'Esperando o entregador'
        }
      case Types.Types.TOrderStatus.WAITING_DELIVERY:
        return 'Saiu para entrega'
      case Types.Types.TOrderStatus.WAITING_LOCAL:
        return 'Na mão do garçom'
      case Types.Types.TOrderStatus.WAITING_PICKUP:
        return 'Cliente retirou'
      case Types.Types.TOrderStatus.IN_DELIVERY:
      case Types.Types.TOrderStatus.IN_TABLE_DELIVERY:
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
    if (!order.orderType) {
      return
    }
    Stores.Loading.instance.start()
    const newStatus = order.status?.nextStatus(order.orderType)
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
      logging: true,
      backgroundColor: '#fff',
      allowTaint: true,
      useCORS: true
    })
    screenShot = false
    await tick()
    Stores.Loading.instance.stop()
    if (Capacitor.isNativePlatform()) {
      const data = canvas.toDataURL().split(',')
      const screenShotFile = await Filesystem.writeFile({
        path: `screenshots/order-${order?.customID}.png`,
        data: data?.[1],
        directory: Directory.Cache,
        recursive: true
      })
      //TODO: -- report identifier of the app that received the share action. Can be an empty string in some cases. On web it will be undefined.
      await Share.share({
        title: `Pedido #${order?.customID}`,
        text: `${order?.address?.street ?? '-'}, ${order?.address?.number ?? '-'}${
          order?.address?.complement ? ` - ${order?.address?.complement}` : ''
        }
          ${order?.address?.neighborhood ?? '-'}
          ${order?.address?.city ?? '-'}/${order?.address?.stat ?? '-'} CEP: ${order?.address?.postalCode ?? '-'}
          Tipo: ${order?.address?.kind?.name ?? '-'}
          Ref: ${order?.address?.reference ?? '-'}`,
        url: `file://${screenShotFile?.uri}`,
        dialogTitle: 'Compartilhar o pedido'
      })
    } else {
      canvas.toBlob(function (blob) {
        if (blob) {
          const url = URL.createObjectURL(blob)
          window.open(url, '_blank')
        }
      })
    }
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
    await tick()
    Stores.Loading.instance.stop()
  })

  Stores.Title.instance.set('Detalhes do pedido')
</script>

<div class="order {screenShot ? 'screenShot' : ''}" bind:this={orderScreen}>
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
  </div>
  <Views.Divider />
  <h3 class="title">Pedido N˚: {order?.customID}</h3>
  <Views.Divider />
  <div class="info" data-html2canvas-ignore>
    <Views.Status type={Types.Status.INFO} showIcon={false}
      >Pedido para {order.orderType?.description ?? '-'}</Views.Status
    >
    {#if order.status && [Types.Types.TOrderStatus.WAITING_PAYMENT, Types.Types.TOrderStatus.OPEN, Types.Types.TOrderStatus.ACCEPTED, Types.Types.TOrderStatus.WAITING_DELIVERY, Types.Types.TOrderStatus.IN_DELIVERY].includes(order.status)}
      <Views.Divider height={8} />
      <Views.Status showIcon={false} type={Types.Status.WARNING}
        >Prepare o pedido antes de
        {Utils.Strings.dateToString(
          String(new Date((order?.createdAt?.getTime() ?? 0) + (order?.preparation?.max ?? 0) * 1000))
        )}</Views.Status
      >
    {/if}
  </div>

  {#if !order.status || ![Types.Types.TOrderStatus.DELIVERED, Types.Types.TOrderStatus.CANCELED].includes(order.status)}
    <Views.Divider height={8} />
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
          >{Utils.Strings.currency(Utils.Numbers.calcProductPrice(product))}</span
        >
      </header>
      {#if (product.options?.length ?? 0) > 0}
        <div>
          {#each product.options ?? [] as option}
            <div class="option">
              <span class="units">{option.units}</span><span class="name">{option.name}</span>
              <!-- <span class="price"
                >{Utils.Strings.currency((product.quantity ?? 0) * (option.units ?? 0) * (option.price ?? 0))}</span
              > -->
            </div>
          {/each}
          {#if product.observation}
            <small><b>Obs:</b> {product.observation}</small>
          {/if}
        </div>
      {/if}
    </button>
  {/each}
  {#if order.orderType === Types.Types.TOrderType.DELIVERY}
    <Views.Divider />
    <h3>Dados da entrega</h3>
    <Views.Divider />
    <div class="user">
      <span>Nome: <b>{Utils.Strings.formatAsName(`${order?.user?.name} ${order?.user?.lastName}`)}</b></span>
      <span>Contato: <b>{Utils.Strings.formatAsPhone(order?.user?.phone)}</b></span>
      <span data-html2canvas-ignore>Pedidos acomulados: <b>{order?.user?.orders ?? '-'}</b></span>
      <span data-html2canvas-ignore>Compras acomuladas: <b>{Utils.Strings.currency(order?.user?.billing)}</b></span>
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
        <span class="city">Tipo: {order?.address?.kind?.name ?? '-'}</span>
        <span class="city">Ref: {order?.address?.reference ?? '-'}</span>
      </span>
    </div>
  {:else if order.orderType === Types.Types.TOrderType.PICKUP}
    <Views.Divider />
    <h3>Seu cliente vai retirar o pedido no seu estabelecimento.</h3>
  {:else if order.orderType === Types.Types.TOrderType.LOCAL}
    <Views.Divider />
    <h3>Leva o pedido até a mesa: <b>{order.table}</b></h3>
  {:else}
    <Views.Status type={Types.Status.ERROR}
      >Não foi possível definir o tipo do pedido, entre em contato com o suporte.</Views.Status
    >
  {/if}
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
        <Views.Image source="/assets/cardBrand/{order?.payment.brand}.svg" name={order?.payment.brand} />
        **** {order?.payment.lastDigits}
      {:else if order.payment?.type === Types.Types.TPaymentMethod.CASH_ON_DELIVERY}
        Você receberia <b>{Utils.Strings.currency(order.change)}</b> do cliente e deve devolver
        <b>{Utils.Strings.currency(change)}</b> de troco.
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
      {#if order.orderType === Types.Types.TOrderType.DELIVERY}
        <tr>
          <td class="resumeText">Taxa de entrega</td>
          <td class="resumeValue"
            ><span class:deliveryFree={order?.delivery == 0}>{Utils.Strings.currency(order?.delivery)}</span></td
          >
        </tr>
      {:else if order.orderType === Types.Types.TOrderType.LOCAL}
        <tr>
          <td class="resumeText">Gorjeta sugerida ({Utils.Strings.percent(order?.tip ?? 0)})</td>
          <td class="resumeValue"><span class:deliveryFree={order?.tip == 0}>{Utils.Strings.currency(tip)}</span></td>
        </tr>
      {/if}
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
    padding-top: 16px;
  }
  .order.screenShot {
    padding: 16px;
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
    margin-top: 24px;
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
    margin-right: 8px;
    font-family: RobotoMedium;
    font-size: 1em;
    background: #ccc;
    width: 16px;
    height: 16px;
    padding: 4px;
    text-align: center;
    vertical-align: middle;
  }
  .product > header > .price {
    margin-left: 8px;
    font-family: RobotoMedium;
    font-size: 0.9em;
  }
  .product > div {
    margin-left: 18px;
    margin-bottom: 8px;
    margin-top: 8px;
    font-size: 0.9em;
  }
  .product > div > .option > .units {
    margin-right: 8px;
    font-family: RobotoMedium;
    font-size: 1em;
    background: rgba(204, 204, 204, 0.356);
    width: 16px;
    height: 16px;
    padding: 4px;
    text-align: center;
    vertical-align: middle;
  }
  .product > div > .option > .price {
    margin-left: 8px;
    font-family: RobotoMedium;
    font-size: 0.9em;
  }
  .address {
    font-size: 0.9em;
    margin-top: 16px;
    margin-bottom: 24px;
  }
  .address > .street {
    font-family: 'RobotoMedium';
    margin-bottom: 24px;
  }
  .address > .neighborhood {
    font-family: 'RobotoMedium';
    font-size: 1em;
    width: 100%;
  }
  .paymentMethod {
    font-size: 0.9em;
    margin-bottom: 8px;
    display: flex;
    flex-direction: column;
  }
  .paymentMethod > .brand > :global(img) {
    height: 16px;
    width: fit-content;
  }
  .paymentMethod > .brand {
    font-weight: lighter;
    font-size: 1em;
    width: 100%;
    margin-top: 8px;
  }
  .time {
    font-size: 0.8em;
    margin-top: 8px;
  }
  table {
    width: 100%;
    padding-bottom: 16px;
  }
  .resumeHead {
    font-size: 1.1em;
  }
  .resumeText {
    text-align: left;
    width: 70%;
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
    margin-top: 16px;
  }
  .order > .buttonGroup > :global(*) {
    flex: 1;
  }
  .order > .buttonGroup > :global(*):first-child {
    margin-right: 8px;
  }
  .order > .buttonGroup > :global(*):last-child {
    margin-left: 8px;
  }
  .order > .user {
    display: flex;
    flex-direction: column;
  }

  .order > h3 {
    border-left: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    padding: 0 16px;
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
  .avatar > :global(img) {
    font-size: 3em;
    width: 100%;
    max-width: 504px;
    border-radius: 40px;
    height: 208px;
    line-height: 88px;
    overflow: hidden;
    object-fit: contain;
  }
  .signature {
    display: none;
    flex-direction: column;
    align-items: center;
    place-content: center;
  }
  .screenShot {
    display: flex;
  }
  .signature > :global(img) {
    height: 48px;
  }
</style>
