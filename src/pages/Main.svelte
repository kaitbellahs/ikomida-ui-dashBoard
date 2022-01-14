<script>
  import { Store } from "../stores/Products";
  import { Router, Navigation, Title, Menu } from "../stores/Navigation";
  import { Views, Utils } from "@tian/components";
  import Home from "./products/Home.svelte";
  import Orders from "./Orders/Orders.svelte";
  import Order from "./Orders/Order.svelte";
  import Profile from "./user/Profile.svelte";
  import Product from "./products/Product.svelte";
  import Products from "./products/Products.svelte";
  import Edit from "./products/Edit.svelte";
  // import Checkout from "./cart/Checkout.svelte";
  // import Cart from "./cart/Cart.svelte";
  import { StatusBar } from "../stores/Setup";
  import {
    faHome,
    faList,
    faUser,
    faBook,
  } from "@fortawesome/free-solid-svg-icons";

  const tabs = [
    {
      name: "Home",
      route: Router.values.home,
      icon: faHome,
    },
    {
      name: "Produtos",
      route: Router.values.products,
      icon: faList,
    },
    {
      name: "Pedidos",
      route: Router.values.orders,
      icon: faBook,
    },
    {
      name: "Ajustes",
      route: Router.values.profile,
      icon: faUser,
    },
  ];

  $: styleHeight = $StatusBar.height + 55 + "px";
  $: route = $Router.route;

  function goToCart() {
    Navigation.goTo(Router.values.cart);
  }
</script>

<Views.NavigationBar
  {Menu}
  {Title}
  paddingTop={$StatusBar.height}
  {Navigation}
/>
<main
  style="padding: 20px; padding-top: {styleHeight}; padding-bottom: '50px'; overflow: hidden;max-width: 100%;"
>
  {#if route == Router.values.home}
    <Home />
  {:else if route == Router.values.orders}
    <Orders />
  {:else if route == Router.values.order}
    <Order />
  {:else if route == Router.values.search}
    <Search />
  {:else if route == Router.values.profile}
    <Profile />
  {:else if route == Router.values.products}
    <Products />
  {:else if route == Router.values.product}
    <Product />
  {:else if route == Router.values.editProduct}
    <Edit />
    <!-- {:else if route == Router.values.cart}
    <Cart />
  {:else if route == Router.values.checkout}
    <Checkout /> -->
  {:else}
    <Home />
  {/if}
</main>
<Views.Tabs {tabs} {Navigation} bottomPadding={$StatusBar.bottomPadding} />

<style global>
  * {
    margin: 0;
    padding: 0;
    font-weight: normal;
  }
</style>
