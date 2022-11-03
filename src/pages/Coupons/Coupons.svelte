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
  bind:items
  let:index
>
  <article>
    <Views.FloatRemove callback={() => removeCoupon(items[index].id)} />
    <h2>{items[index].name}</h2>
    <div>
      Disconto: {Types.Types.TDiscount.VALUE === items[index].valueType
        ? Utils.Strings.currency(items[index].value)
        : Utils.Strings.percent(items[index].value)}
    </div>
    <div>Valor mínimo: {Utils.Strings.currency(items[index].minValue)}</div>
    <div>{Utils.Strings.dateToDateString(items[index].validity?.toString())}</div>
    {#if items[index].orderTypes}
      <Views.Divider height={7} />
      <div class="orderTypes">
        {#each items[index].orderTypes ?? [] as orderType}
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
    border: #4c0708 solid 1px;
  }
</style>
