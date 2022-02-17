<script>
  import {
    Routes,
    Router,
    Navigation,
    Title,
    Menu,
  } from "../stores/Navigation";
  import { Views } from "@tian/components";
  import Home from "./products/Home.svelte";
  import Orders from "./Orders/Orders.svelte";
  import Order from "./Orders/Order.svelte";
  import Profile from "./user/Profile.svelte";
  import Product from "./products/Product.svelte";
  import Products from "./products/Products.svelte";
  import Edit from "./products/Edit.svelte";
  import EditCategory from "./products/EditCategory.svelte";
  import { StatusBar } from "../stores/Setup";
  import {
    faHome,
    faList,
    faUser,
    faBook,
  } from "@fortawesome/free-solid-svg-icons";
  import { get } from "svelte/store";
  import { onMount } from "svelte";

  const tabs = [
    {
      name: "Home",
      route: Routes.home,
      icon: faHome,
    },
    {
      name: "Produtos",
      route: Routes.products,
      icon: faList,
    },
    {
      name: "Pedidos",
      route: Routes.orders,
      icon: faBook,
    },
    {
      name: "Ajustes",
      route: Routes.profile,
      icon: faUser,
    },
  ];

  $: styleHeight = $StatusBar.height + 55 + "px";
  $: route = $Router.route;
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
  {#if route == Routes.home}
    <Home />
  {:else if route == Routes.orders}
    <Orders />
  {:else if route == Routes.order}
    <Order />
  {:else if route == Routes.profile}
    <Profile />
  {:else if route == Routes.products}
    <Products />
  {:else if route == Routes.product}
    <Product />
  {:else if route == Routes.editProduct}
    <Edit />
  {:else if route == Routes.editCategory}
    <EditCategory />
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
