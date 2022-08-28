<script>
  import Routes from "../../stores/Routes";
  import Fa from "svelte-fa";
  import { faEdit } from "@fortawesome/free-solid-svg-icons";
  import { Views, Utils, Stores } from "@ikomida/components";
  import { getCoupons, deleteCoupon } from "../../network/Payment";
  import { StatusBar } from "../../stores/Setup";
  import { onMount } from "svelte";

  onMount(async () => {
    Stores.Loading.instance.stop();
  });

  const newCoupon = async () => {
    Stores.Navigation.instance.goTo(Routes.newCoupon);
  };

  async function removeCoupon(id) {
    Stores.Loading.instance.start();
    const response = await deleteCoupon(id);
    if (response?.success) {
      await getMore(null, true);
    } else {
      Stores.MessageAlert.instance.show(response?.data);
    }
    Stores.Loading.instance.stop();
  }

  Stores.Title.instance.set("Cupons");
</script>

<Views.Button on:click={newCoupon} bottomPadding={$StatusBar.bottomPadding}
  ><Fa icon={faEdit} /> <span>Novo cupom</span></Views.Button
>
<Views.Divider />
<Views.LoadMore
  noItems="Não há cupons para exibir por enquanto, aproveite e cadastre novos cupons para agradar seus clientes!"
  cache={Stores.Cache.Types.COUPONS}
  url="/coupons"
  let:item
>
  <article>
    <Views.FloatRemove callback={() => removeCoupon(item?.id)} />
    <h2>{item?.name}</h2>
    <div>{Utils.Strings.currency(item?.value)}</div>
    <div>{Utils.Strings.dateToDateString(item?.validity)}</div>
  </article>
</Views.LoadMore>

<style>
  article {
    position: relative;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-top: 10px;
    padding: 10px;
  }
</style>
