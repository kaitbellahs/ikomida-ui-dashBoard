<script lang="ts">
  import Routes from '../../stores/Routes'
  import { Views, Utils, Types, Stores } from '@ikomida/shared-frontend'
  import { ChangeOrderStatus } from '../../network/Orders'
  import { onMount } from 'svelte'
  const initailOrderStatus = Types.Types.TOrderStatus.WAITING_PAYMENT
  let items: Types.Classes.COrder[]

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
        return 'Esperando o entregador'
      case Types.Types.TOrderStatus.WAITING_DELIVERY:
        return 'Saiu para entrega'
      case Types.Types.TOrderStatus.IN_DELIVERY:
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
    if (order?.status && order?.status !== Types.Types.TOrderStatus.DELIVERED) {
      const newStatus = order?.status.next()
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

<Views.LoadMoreReusableList
  noItems="Não há pedido para exibir por enquanto, aproveite e divulgue seu app para seus clientes, e se precisar de ajuda para fazer suas campanhas de propaganda nos dê um toque pra gente, que vamos te ajudar a turbinar suas vendas!"
  cache={Stores.Cache.Types.ORDERS}
  url="/orders"
  bind:items
  hasRecaptcha={true}
  let:index
>
  <div class="leftShadow orderContainer">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div on:click={() => goToOrder(items[index])} >
      <h3 class="title">Pedido N˚: {items[index].customID}</h3>
      {#if [initailOrderStatus, Types.Types.TOrderStatus.OPEN, Types.Types.TOrderStatus.ACCEPTED, Types.Types.TOrderStatus.WAITING_DELIVERY, Types.Types.TOrderStatus.IN_DELIVERY].includes(items[index].status ?? initailOrderStatus) && new Date((items[index].createdAt?.getTime() ?? 0) + items[index].preparation?.max * 1000) < new Date()}
        <Views.Status type={Types.Status.ERROR} circle={false} showIcon={false}>Pedido atrasado</Views.Status>
      {/if}
      {#if [Types.Types.TOrderStatus.DELIVERED].includes(items[index].status ?? initailOrderStatus)}
        <Views.Status type={Types.Status.SUCCESS} circle={false} showIcon={false}>Pedido entregue</Views.Status>
      {/if}
      {#if [Types.Types.TOrderStatus.CANCELED].includes(items[index].status ?? initailOrderStatus)}
        <Views.Status type={Types.Status.ERROR} circle={false} showIcon={false}>Pedido cancelado</Views.Status>
      {/if}
      <Views.Divider height={5} />
      <div class="info">
        {#if [initailOrderStatus, Types.Types.TOrderStatus.OPEN, Types.Types.TOrderStatus.ACCEPTED, Types.Types.TOrderStatus.WAITING_DELIVERY, Types.Types.TOrderStatus.IN_DELIVERY].includes(items[index].status ?? initailOrderStatus)}
          <Views.Status showIcon={false} type={Types.Status.WARNING}
            >Prepare o pedido antes de
            {Utils.Strings.dateToString(
              new Date((items[index].createdAt?.getTime() ?? 0) + items[index].preparation?.max * 1000).toString()
            )}</Views.Status
          >
          <Views.Divider height={5} />
        {/if}
      </div>
      {#if items[index].status && ![Types.Types.TOrderStatus.DELIVERED, Types.Types.TOrderStatus.CANCELED].includes(items[index].status ?? initailOrderStatus)}
        <Views.Status>
          Pedido {items[index].status?.description}
        </Views.Status>
        <Views.Divider height={5} />
      {/if}
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
      <Views.Divider height={5} />
      <div class="address">
        Entregua na: <b>{items[index].address?.street ?? '-'}</b>
      </div>
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
          Number(items[index].subtotal ?? 0) + Number(items[index].delivery ?? 0) - Number(items[index].discount ?? 0)
        )}</span
      >
    </div>
    {#if items[index].status && ![Types.Types.TOrderStatus.DELIVERED, Types.Types.TOrderStatus.CANCELED, initailOrderStatus].includes(items[index].status ?? initailOrderStatus)}
      <Views.Divider height={10} />
      <div class="buttonGroup">
        {#if items[index].status && ![Types.Types.TOrderStatus.DELIVERED, Types.Types.TOrderStatus.CANCELED].includes(items[index].status ?? initailOrderStatus)}
          <Views.Button sizeMultiplier={0.8} type={Types.TButton.SECONDARY} on:click={() => cancel(items[index])}
            >Cancelar</Views.Button
          >
        {/if}
        {#if items[index].status && ![Types.Types.TOrderStatus.DELIVERED, Types.Types.TOrderStatus.CANCELED, initailOrderStatus].includes(items[index].status ?? initailOrderStatus)}
          <Views.Button sizeMultiplier={0.8} on:click={() => next(items[index], index)}
            >{nextButtonText(items[index])}</Views.Button
          >
        {/if}
      </div>
    {/if}
  </div></Views.LoadMoreReusableList
>

<!-- <Views.Link url="https://ikomida.com/contact"
      >Solicite seu orçamento agora!</Views.Link
    > -->
<style>
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
