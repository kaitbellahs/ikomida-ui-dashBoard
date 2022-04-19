<script>
  import { Title } from "../../stores/Navigation";
  import { countProducts } from "../../network/Products";
  import { countOrders } from "../../network/Orders";
  import { countUsers } from "../../network/User";
  import { countCoupons } from "../../network/Payment";
  import { Views } from "@tian/components";
  import { StatusBar } from "../../stores/Setup";

  Title.set("Home");
</script>

<section>
  <article>
    {#await countProducts()}
      <Views.LocalLoading />
    {:then productsCount}
      <span class="count">{productsCount}</span>
      <span class="name">produtos</span>
    {/await}
  </article>
  <article>
    {#await countOrders()}
      <Views.LocalLoading />
    {:then ordersCount}
      <span class="count">{ordersCount}</span>
      <span class="name">pedidos</span>
    {/await}
  </article>
  <article>
    {#await countUsers()}
      <Views.LocalLoading />
    {:then usersCount}
      <span class="count">{usersCount}</span>
      <span class="name">Clientes</span>
    {/await}
  </article>
  <article>
    {#await countCoupons()}
      <Views.LocalLoading />
    {:then couponsCount}
      <span class="count">{couponsCount}</span>
      <span class="name">Cupons</span>
    {/await}
  </article>
</section>

<style>
  section {
    display: flex;
    flex-wrap: wrap;
  }
  section > article {
    flex: 1;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin: 5px;
    width: 50%;
    display: flex;
    flex-direction: column;
    flex-basis: 40%;
    text-shadow: 0.5px 1px #18056b66;
    box-shadow: 1px 1.5px #00000099;
  }
  section > article > .name {
    width: 100%;
    font-size: 1.2em;
    font-family: RobotoBold;
    text-align: center;
  }
  section > article > .count {
    width: 100%;
    font-size: 3em;
    color: red;
    text-align: center;
  }
</style>
