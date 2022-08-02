<script>
  import {
    Routes,
    Router,
    Navigation,
    Title,
    Menu,
    MenuHamburger,
  } from "../stores/Navigation";
  import { Views, Utils } from "@ikomida/components";
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
  import Quotas from "./user/Quotas.svelte";
  import EditCategory from "./products/EditCategory.svelte";
  import Staff from "./Staff/Staff.svelte";
  import NewStaff from "./Staff/NewStaff.svelte";
  import { StatusBar } from "../stores/Setup";
  import { Auth } from "../stores/Auth";
  import {
    faHome,
    faList,
    faUser,
    faBook,
    faIdCard,
    faSlidersH,
  } from "@fortawesome/free-solid-svg-icons";
  import { onMount } from "svelte";
let userInfo
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
  $: menuHamburgerItems = [
    {
      name: "Home",
      callback: () => Navigation.reset(Routes.home),
      icon: faHome,
    },
    {
      name: "Perfil",
      callback: () => Navigation.goTo(Routes.profile),
      icon: faUser,
    },
    userInfo?.role === 'vendor' ? {
      name: "Cobranças",
      callback: () => Navigation.goTo(Routes.subscription),
      icon: faUser,
    } : null,
    {
      name: "Configurações",
      callback: () => Navigation.goTo(Routes.settings),
      icon: faSlidersH,
    },
    {
      name: "Quotas",
      callback: () => Navigation.goTo(Routes.quotas),
      icon: faIdCard,
    },
    userInfo?.role === 'vendor' ? {
      name: "Colaboradores",
      callback: () => Navigation.goTo(Routes.staff),
      icon: faIdCard,
    } : null,
    {
      name: "Layout",
      callback: () => Navigation.goTo(Routes.layout),
      icon: faIdCard,
    },
  ];

  $: styleHeight = `${Number($StatusBar.height) + 60}px`;
  $: route = $Router.route;

  onMount(async () => {
    userInfo = await Utils.Jws.extractToken($Auth);
    const style = document.createElement("style");
    style.innerHTML = `
    body {
      --paddingTop: ${styleHeight};
      --paddingBottom: 60px;
    }
  `;
    document.head.appendChild(style);
  });

  $: if(menuHamburgerItems){
    MenuHamburger.reset();
    menuHamburgerItems?.forEach((page) => MenuHamburger.addItem(page));
  }
</script>

<main
  style="--paddingTop:{styleHeight};padding: 20px; padding-top: 0; padding-bottom: 0; --paddingBottom: 50px; overflow: scroll;max-width: 100%;height: 100%;"
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
  {:else if route == Routes.staff}
    <Staff />
  {:else if route == Routes.newStaff}
    <NewStaff />
  {:else if route == Routes.quotas}
    <Quotas />
  {:else}
    <Home />
  {/if}
</main>
<Views.NavigationBar
  {MenuHamburger}
  logo="/Assets/Icons/transparent-logo-1.svg"
  {Menu}
  {Title}
  paddingTop={$StatusBar.height}
  paddingBottom={$StatusBar.bottomPadding}
  {Navigation}
/>
<Views.Tabs {tabs} {Navigation} bottomPadding={$StatusBar.bottomPadding} />

<style>
  main {
    padding: 20px;
    padding-top: 0;
    overflow: hidden;
    max-width: 100%;
    position: relative;
    padding-bottom: 55px;
    display: flex;
    flex-direction: column;
  }
  :global(*, *:before, *:after) {
    margin: 0;
    padding: 0;
    font-weight: normal;
    box-sizing: border-box;
  }
  :global(body) {
    padding-top: var(--paddingTop);
    padding-bottom: var(--paddingBottom);
  }
</style>
