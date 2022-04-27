<script>
  import {
    Routes,
    Router,
    Navigation,
    Title,
    Menu,
    MenuHamburger,
  } from "../stores/Navigation";
  import { Views } from "@tian/components";
  import Home from "./products/Home.svelte";
  import Orders from "./Orders/Orders.svelte";
  import Order from "./Orders/Order.svelte";
  import Profile from "./user/Profile.svelte";
  import Settings from "./user/Settings.svelte";
  import Subscription from "./user/Subscription.svelte";
  import Product from "./products/Product.svelte";
  import Products from "./products/Products.svelte";
  import Layout from "./user/Layout.svelte";
  import Edit from "./products/Edit.svelte";
  import Coupons from "./products/Coupons.svelte";
  import NewCoupon from "./products/NewCoupon.svelte";
  import EditCategory from "./products/EditCategory.svelte";
  import { StatusBar } from "../stores/Setup";
  import {
    faHome,
    faList,
    faUser,
    faBook,
    faIdCard,
    faSlidersH,
  } from "@fortawesome/free-solid-svg-icons";

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
  ];
  const menuHamburgerItems = [
    {
      name: "Home",
      callback: () => Navigation.goTo(Routes.home),
      icon: faHome,
    },
    {
      name: "Perfil",
      callback: () => Navigation.goTo(Routes.profile),
      icon: faUser,
    },
    {
      name: "Cobranças",
      callback: () => Navigation.goTo(Routes.subscription),
      icon: faUser,
    },
    {
      name: "Configurações",
      callback: () => Navigation.goTo(Routes.settings),
      icon: faSlidersH,
    },
    {
      name: "Layout",
      callback: () => Navigation.goTo(Routes.layout),
      icon: faIdCard,
    },
  ];
  MenuHamburger.reset();
  menuHamburgerItems.forEach((page) => MenuHamburger.addItem(page));

  $: styleHeight = `${Number($StatusBar.height) + 60}px`;
  $: route = $Router.route;
</script>

<main
  style="margin-top:{styleHeight};padding: 20px; padding-top: 0; padding-bottom: 60px; overflow: hidden;max-width: 100%;position: relative;"
>
  {#if route == Routes.home}
    <Home />
  {:else if route == Routes.orders}
    <Orders />
  {:else if route == Routes.order}
    <Order />
  {:else if route == Routes.settings}
    <Settings />
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
  {:else if route == Routes.coupons}
    <Coupons />
  {:else if route == Routes.newCoupon}
    <NewCoupon />
  {:else if route == Routes.layout}
    <Layout />
  {:else if route == Routes.subscription}
    <Subscription />
  {:else}
    <Home />
  {/if}
</main>
<Views.NavigationBar
  {MenuHamburger}
  logo="/Assets/Icons/logo.png"
  {Menu}
  {Title}
  paddingTop={$StatusBar.height}
  paddingBottom={$StatusBar.bottomPadding}
  {Navigation}
/>
<Views.Tabs {tabs} {Navigation} bottomPadding={$StatusBar.bottomPadding} />

<style global>
  *,
  *:before,
  *:after {
    margin: 0;
    padding: 0;
    font-weight: normal;
  }
</style>
