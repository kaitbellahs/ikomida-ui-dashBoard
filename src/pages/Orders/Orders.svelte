<script lang="ts">
  import Routes from '../../stores/Routes';
  import { OrderStatus } from '../../network/Orders';
  import { Views, Utils, Types, Stores } from '@ikomida/shared-frontend';
  import { ChangeOrderStatus } from '../../network/Orders';
  import { onMount } from 'svelte';

  onMount(async () => {
    Stores.Loading.instance.stop();
  });

  const nextButtonText = (order: Types.Interfaces.IOrder) => {
    switch (order?.status) {
      case Types.Types.TOrderStatus.WAITING_PAYMENT:
        return '';
      case Types.Types.TOrderStatus.OPEN:
        return 'Aceitar o pedido';
      case Types.Types.TOrderStatus.ACCEPTED:
        return 'Esperando o entregador';
      case Types.Types.TOrderStatus.WAITING_DELIVERY:
        return 'Saiu para entrega';
      case Types.Types.TOrderStatus.IN_DELIVERY:
        return 'Pedido entrege';
      default:
        return '-';
    }
  };

  async function cancel(order: Types.Interfaces.IOrder) {
    Stores.Loading.instance.start();
    const response = await ChangeOrderStatus(order?.id, Types.Types.TOrderStatus.CANCELED);
    if (response?.success) {
      order.status = Types.Types.TOrderStatus.CANCELED;
      Stores.MessageAlert.instance.show('O pedido foi atualizado com sucesso!');
      // items = items;
    } else {
      Stores.MessageAlert.instance.show(response?.data);
    }
    Stores.Loading.instance.stop();
  }

  async function next(order: Types.Interfaces.IOrder) {
    Stores.Loading.instance.start();
    let newStatus = [...Types.Types.TOrderStatus][
      (Types.Types.TOrderStatus.values().indexOf(order?.status ?? Types.Types.TOrderStatus.WAITING_PAYMENT) ?? 0) + 1
    ];
    const response = await ChangeOrderStatus(order?.id, newStatus);
    if (response?.success) {
      order.status = newStatus;
      Stores.MessageAlert.instance.show('O pedido foi atualizado com sucesso!');
      // items = items;
    } else {
      Stores.MessageAlert.instance.show(response?.data);
    }
    Stores.Loading.instance.stop();
  }

  function goToOrder(order: Types.Interfaces.IOrder) {
    Stores.Navigation.instance.goTo(Routes.order, order);
  }

  function handleItems(items: any[]): any {
    console.log('1:', items);
    for (let index = 0; index < items.length; index++) {
      items[index] = Types.Interfaces.IOrder.fromObject(items[index]);
    }
    console.log('2:', items[0].createdAt);
    return items;
  }

  Stores.Title.instance.set('Pedidos');
</script>

<Views.LoadMoreReusableList
  noItems="Não há pedido para exibir por enquanto, aproveite e divulgue seu app para seus clientes, e se precisar de ajuda para fazer suas campanhas de propaganda nos dê um toque pra gente, que vamos te ajudar a turbinar suas vendas!"
  cache={Stores.Cache.Types.ORDERS}
  url="/orders"
  {handleItems}
  hasRecaptcha={true}
  let:item
>
  <div class="leftShadow orderContainer">
    <div on:click={() => goToOrder(item)}>
      <h3 class="title">Pedido N˚: {item?.customID}</h3>
      {#if [Types.Types.TOrderStatus.WAITING_PAYMENT, Types.Types.TOrderStatus.OPEN, Types.Types.TOrderStatus.ACCEPTED, Types.Types.TOrderStatus.WAITING_DELIVERY, Types.Types.TOrderStatus.IN_DELIVERY].includes(item?.status) && new Date(new Date(item?.createdAt).getTime() + item?.preparation?.max * 1000) < new Date()}
        <Views.Status type={Types.Status.ERROR} circle={false} showIcon={false}>Pedido atrasado</Views.Status>
      {/if}
      {#if [Types.Types.TOrderStatus.DELIVERED].includes(item?.status)}
        <Views.Status type={Types.Status.SUCCESS} circle={false} showIcon={false}>Pedido entregue</Views.Status>
      {/if}
      {#if [Types.Types.TOrderStatus.CANCELED].includes(item?.status)}
        <Views.Status type={Types.Status.ERROR} circle={false} showIcon={false}>Pedido cancelado</Views.Status>
      {/if}
      <Views.Divider height={5} />
      <div class="info">
        {#if [Types.Types.TOrderStatus.WAITING_PAYMENT, Types.Types.TOrderStatus.OPEN, Types.Types.TOrderStatus.ACCEPTED, Types.Types.TOrderStatus.WAITING_DELIVERY, Types.Types.TOrderStatus.IN_DELIVERY].includes(item?.status)}
          <Views.Status showIcon={false} type={Types.Status.WARNING}
            >Prepare o pedido antes de
            {Utils.Strings.dateToString(
              new Date(item?.createdAt.getTime() + item?.preparation?.max * 1000).toString(),
            )}</Views.Status
          >
          <Views.Divider height={5} />
        {/if}
      </div>
      {#if ![Types.Types.TOrderStatus.DELIVERED, Types.Types.TOrderStatus.CANCELED].includes(item?.status)}
        <Views.Status>
          Pedido {item?.status?.description}
        </Views.Status>
        <Views.Divider height={5} />
      {/if}
      <div class="time">
        Data: {Utils.Strings.dateToString(item?.createdAt)}
      </div>
      <Views.Divider height={10} />
      {#if item?.products?.length > 0}
        <div class="product">1. {item?.products?.[0]?.title}</div>
      {/if}
      {#if item?.products?.length > 1}
        <div class="product">
          e mais {item?.products?.length - 1}
          {item?.products?.length - 1 == 1 ? 'item' : 'itens'}
        </div>
      {/if}
      <Views.Divider height={5} />
      <div class="address">
        Entregua na: <b>{item.address?.street ?? '-'}</b>
      </div>
      <div class="paymentMethod">
        Forma de pagamento: <b
          >{item.payment?.type?.name}
          {item.payment?.type?.description}</b
        >
      </div>
    </div>
    <Views.Divider height={10} />
    <div class="value">
      Total:&nbsp;<span
        >{Utils.Strings.currency(
          Number(item?.subtotal ?? 0) + Number(item?.delivery ?? 0) - Number(item?.discount ?? 0),
        )}</span
      >
    </div>
    {#if ![Types.Types.TOrderStatus.DELIVERED, Types.Types.TOrderStatus.CANCELED, Types.Types.TOrderStatus.WAITING_PAYMENT].includes(item?.status)}
      <Views.Divider height={10} />
      <div class="buttonGroup">
        {#if ![Types.Types.TOrderStatus.DELIVERED, Types.Types.TOrderStatus.CANCELED].includes(item?.status)}
          <Views.Button sizeMultiplier={0.8} type="secondary" on:click={() => cancel(item)}>Cancelar</Views.Button>
        {/if}
        {#if ![Types.Types.TOrderStatus.DELIVERED, Types.Types.TOrderStatus.CANCELED, Types.Types.TOrderStatus.WAITING_PAYMENT].includes(item?.status)}
          <Views.Button sizeMultiplier={0.8} on:click={() => next(item)}>{nextButtonText(item)}</Views.Button>
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
