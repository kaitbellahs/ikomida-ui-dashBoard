<script lang="ts">
  import Routes from '../../stores/Routes'
  import { Views, Utils, Types, Stores, Logics } from '@ikomida/shared-frontend'
  import { ChangeOrderStatus } from '../../network/Orders'
  import { onMount } from 'svelte'
  const initailOrderStatus = Types.Types.TOrderStatus.WAITING_PAYMENT
  let items: Types.Classes.COrder[]
  let orderType: Types.Types.TOrderType | undefined = undefined

  $: if (orderType) {
    Stores.LoadMore.instance.refresh()
  }

  $: if (items) {
    for (let index = 0; index < items.length; index++) {
      items[index] = Types.Classes.COrder.fromObject(items[index])
    }
    items = items
  }

  const nextButtonText = (order: Types.Classes.COrder) => {
    switch (order?.status) {
      case initailOrderStatus:
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

  async function cancel(order: Types.Classes.COrder) {
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

  async function next(order: Types.Classes.COrder, index: number) {
    Stores.Loading.instance.start()
    if (order.orderType && order?.status && order?.status !== Types.Types.TOrderStatus.DELIVERED) {
      const newStatus = order?.status.nextStatus(order.orderType)
      const response = await ChangeOrderStatus(order?.id, newStatus)
      if (response?.success) {
        order.status = newStatus
        items[index] = order
        items = items
        Stores.MessageAlert.instance.show('O pedido foi atualizado com sucesso!')
      } else {
        Stores.MessageAlert.instance.show(response?.data)
      }
    } else {
      Stores.MessageAlert.instance.show('Aconteceu um erro inesperado, por favor reinicie o iKomida app.')
    }
    Stores.Loading.instance.stop()
  }

  function goToOrder(order: Types.Classes.COrder) {
    Stores.Navigation.instance.goTo(Routes.order, order)
  }

  onMount(() => {
    Stores.Loading.instance.stop()
  })

  Stores.Title.instance.set('Pedidos')
</script>

<div style="padding: 0 16px;" class="filters">
  <Views.Selector bind:selected={orderType} options={Types.Types.TOrderType.values()} name="Tipo dos pedidos" />
</div>
<Views.LoadMoreReusableList
  noItems="Não há pedido para exibir por enquanto, aproveite e divulgue seu app para seus clientes, e se precisar de ajuda para fazer suas campanhas de propaganda nos dê um toque pra gente, que vamos te ajudar a turbinar suas vendas!"
  cache={Stores.Cache.Types.ORDERS}
  url="/orders"
  params={orderType ? { orderType: orderType?.id } : undefined}
  bind:items
  hasRecaptcha={true}
  let:index
>
  <div class="shadow orderContainer">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div on:click={() => goToOrder(items[index])}>
      <h3 class="title">Pedido N˚: {items[index].customID}</h3>
      {#if [initailOrderStatus, Types.Types.TOrderStatus.OPEN, Types.Types.TOrderStatus.ACCEPTED, Types.Types.TOrderStatus.WAITING_DELIVERY, Types.Types.TOrderStatus.IN_DELIVERY].includes(items[index].status ?? initailOrderStatus) && new Date((items[index].createdAt?.getTime() ?? 0) + items[index].preparation?.max * 1000) < new Date()}
        <Views.Divider height={4} />
        <Views.Status type={Types.Status.ERROR} circle={false} showIcon={false}>Pedido atrasado</Views.Status>
      {/if}
      {#if [Types.Types.TOrderStatus.DELIVERED].includes(items[index].status ?? initailOrderStatus)}
        <Views.Divider height={4} />
        <Views.Status type={Types.Status.SUCCESS} circle={false} showIcon={false}>Pedido entregue</Views.Status>
      {/if}
      {#if [Types.Types.TOrderStatus.CANCELED].includes(items[index].status ?? initailOrderStatus)}
        <Views.Divider height={4} />
        <Views.Status type={Types.Status.ERROR} circle={false} showIcon={false}>Pedido cancelado</Views.Status>
      {/if}
      <Views.Divider height={4} />
      <Views.Status type={Types.Status.INFO} showIcon={false}
        >Pedido para {items[index].orderType?.description ?? '-'}</Views.Status
      >
      {#if [initailOrderStatus, Types.Types.TOrderStatus.OPEN, Types.Types.TOrderStatus.ACCEPTED, Types.Types.TOrderStatus.WAITING_DELIVERY, Types.Types.TOrderStatus.IN_DELIVERY].includes(items[index].status ?? initailOrderStatus)}
        <Views.Divider height={4} />
        <div class="info">
          <Views.Status showIcon={false} type={Types.Status.WARNING}
            >Prepare o pedido antes de
            {Utils.Strings.dateToString(
              new Date((items[index].createdAt?.getTime() ?? 0) + items[index].preparation?.max * 1000).toString()
            )}</Views.Status
          >
        </div>
      {/if}
      {#if items[index].status && ![Types.Types.TOrderStatus.DELIVERED, Types.Types.TOrderStatus.CANCELED].includes(items[index].status ?? initailOrderStatus)}
        <Views.Divider height={4} />
        <Views.Status>
          Pedido {items[index].status?.description}
        </Views.Status>
        <Views.Divider height={4} />
      {/if}
      <Views.Divider height={8} />
      <div class="time">
        Data: {Utils.Strings.dateToString(items[index].createdAt?.toString())}
      </div>
      <Views.Divider height={10} />
      {#if items[index].products?.length > 0}
        <div class="product">1. {items[index].products?.[0]?.title}</div>
      {/if}
      {#if items[index].products?.length > 1}
        <div class="product">
          e mais {items[index].products?.length - 1}
          {items[index].products?.length - 1 == 1 ? 'items[index]' : 'itens'}
        </div>
      {/if}
      {#if items[index].orderType === Types.Types.TOrderType.DELIVERY}
        <Views.Divider height={4} />
        <div class="address">
          Entregua na: <b>{items[index].address?.street ?? '-'}</b>
        </div>
      {:else if items[index].orderType === Types.Types.TOrderType.PICKUP}
        <Views.Divider height={4} />
        <h3>Seu cliente vai retirar o pedido no seu estabelecimento.</h3>
      {:else if items[index].orderType === Types.Types.TOrderType.LOCAL}
        <Views.Divider height={4} />
        <h3>Leva o pedido até a mesa: <b>{items[index].table}</b></h3>
      {:else}
        <Views.Status type={Types.Status.ERROR}
          >Não foi possível definir o tipo do pedido, entre em contato com o suporte.</Views.Status
        >
      {/if}
      <div class="paymentMethod">
        Forma de pagamento: <b
          >{items[index].payment?.type?.name}
          {items[index].payment?.type?.description}</b
        >
      </div>
    </div>
    <Views.Divider height={10} />
    <div class="value">
      Total:&nbsp;<span
        >{Utils.Strings.currency(
          Number(items[index].subtotal ?? 0) +
            Number(
              items[index].orderType === Types.Types.TOrderType.DELIVERY
                ? items[index].delivery
                : items[index].orderType === Types.Types.TOrderType.LOCAL
                ? Logics.Finances.calcDiscount(
                    items[index].subtotal ?? 0,
                    items[index].tip ?? 0,
                    Types.Types.TDiscount.PERCENT
                  )
                : 0
            ) -
            Number(items[index].discount ?? 0)
        )}</span
      >
    </div>
    {#if items[index].status && ![Types.Types.TOrderStatus.DELIVERED, Types.Types.TOrderStatus.CANCELED, initailOrderStatus].includes(items[index].status ?? initailOrderStatus)}
      <Views.Divider height={10} />
      <div class="buttonGroup">
        {#if items[index].status && ![Types.Types.TOrderStatus.DELIVERED, Types.Types.TOrderStatus.CANCELED].includes(items[index].status ?? initailOrderStatus)}
          <Views.Button sizeMultiplier={0.7} type={Types.TButton.SECONDARY} on:click={() => cancel(items[index])}
            >Cancelar</Views.Button
          >
        {/if}
        {#if items[index].status && ![Types.Types.TOrderStatus.DELIVERED, Types.Types.TOrderStatus.CANCELED, initailOrderStatus].includes(items[index].status ?? initailOrderStatus)}
          <Views.Button sizeMultiplier={0.7} on:click={() => next(items[index], index)}
            >{nextButtonText(items[index])}</Views.Button
          >
        {/if}
      </div>
    {/if}
  </div></Views.LoadMoreReusableList
>

<style>
  .orderContainer {
    border-radius: 8px;
    padding: 16px;
    background: #fffffffc;
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
    margin-right: 8px;
  }
  .orderContainer > .buttonGroup > :global(*):last-child {
    margin-left: 8px;
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
  .filters {
    width: 100%;
    height: 72px;
    display: flex;
    flex-direction: row;
  }
</style>
