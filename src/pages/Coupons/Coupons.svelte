<script lang="ts">
  import Routes from '../../stores/Routes'
  import Fa from 'svelte-fa'
  import { faEdit } from '@fortawesome/free-solid-svg-icons'
  import { Views, Utils, Stores, Types } from '@ikomida/shared-frontend'
  import { deleteCoupon } from '../../network/Payment'
  import { StatusBar } from '../../stores/Setup'
  import { onMount } from 'svelte'
  let items: Types.Classes.CCoupon[]
  onMount(async () => {
    Stores.Loading.instance.stop()
  })

  const newCoupon = async () => {
    Stores.Navigation.instance.goTo(Routes.newCoupon)
  }

  async function removeCoupon(id?: string) {
    Stores.Loading.instance.start()
    const response = await deleteCoupon(id)
    if (response?.success) {
      Stores.LoadMore.instance.refresh()
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  }

  $: if (items) {
    items = Types.Classes.CCoupon.fromObject(items)
  }

  Stores.Title.instance.set('Cupons')
</script>

<Views.Button on:click={newCoupon} bottomPadding={$StatusBar.bottomPadding}
  ><Fa icon={faEdit} /> <span>Novo cupom</span></Views.Button
>
<Views.Divider />
<Views.LoadMoreReusableList
  noItems="Não há cupons para exibir por enquanto, aproveite e cadastre novos cupons para agradar seus clientes!"
  cache={Stores.Cache.Types.COUPONS}
  url="/coupons"
  {items}
  let:item
>
  <article>
    <Views.FloatRemove callback={() => removeCoupon(item?.id)} />
    <h2>{item.name}</h2>
    <div>
      Disconto: {Types.Types.TDiscount.VALUE === item.valueType
        ? Utils.Strings.currency(item.value)
        : Utils.Strings.percent(item.value)}
    </div>
    <div>Valor mínimo: {Utils.Strings.currency(item.minValue)}</div>
    <div>{Utils.Strings.dateToDateString(item.validity?.toString())}</div>
    {#if item.orderTypes}
      <Views.Divider height={7} />
      <div class="orderTypes">
        {#each item.orderTypes ?? [] as orderType}
          <span>{orderType.name}</span>
        {/each}
      </div>
    {/if}
  </article>
</Views.LoadMoreReusableList>

<style>
  article {
    position: relative;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-top: 10px;
    padding: 10px;
  }
  article > .orderTypes {
    display: flex;
    flex-direction: row;
  }
  article > .orderTypes > span {
    padding: 2px;
    border-radius: 5px;
    margin: 5px;
    font-size: 0.9em;
    border: var(--buttonBackground) solid 1px;
  }
</style>
