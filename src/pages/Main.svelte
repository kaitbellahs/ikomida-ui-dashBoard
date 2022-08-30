<script>
  import Routes from "../stores/Routes";
  import { Views, Utils, Stores } from "@ikomida/components";
  import Home from "./Products/Home.svelte";
  import Orders from "./Orders/Orders.svelte";
  import Order from "./Orders/Order.svelte";
  import CompanyProfile from "./User/CompanyProfile.svelte";
  import Profile from "./User/Profile.svelte";
  import Settings from "./Control/Settings.svelte";
  import Subscription from "./Control/Subscription.svelte";
  import Product from "./Products/Product.svelte";
  import Products from "./Products/Products.svelte";
  import Layout from "./Control/Layout.svelte";
  import NewProduct from "./Products/NewProduct.svelte";
  import Coupons from "./Coupons/Coupons.svelte";
  import NewCoupon from "./Coupons/NewCoupon.svelte";
  import PushNotifications from "./PushNotifications/PushNotifications.svelte";
  import NewPushNotification from "./PushNotifications/NewPushNotification.svelte";
  import Limits from "./Control/Limits.svelte";
  import NewCategory from "./Products/NewCategory.svelte";
  import Staff from "./Staff/Staff.svelte";
  import NewStaff from "./Staff/NewStaff.svelte";
  import { StatusBar } from "../stores/Setup";
  import {
    faHome,
    faList,
    faUser,
    faBook,
    faIdCard,
    faSlidersH,
    faMoneyBill1Wave,
    faChartColumn,
    faUserGroup,
    faMessage,
    faShop,
  } from "@fortawesome/free-solid-svg-icons";
  import { onMount } from "svelte";

  let userInfo;
  let router = Stores.Navigation.instance.router;
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
      callback: () => Stores.Navigation.instance.reset(Routes.home),
      icon: faHome,
    },
    {
      name: "Perfil",
      callback: () => Stores.Navigation.instance.goTo(Routes.profile),
      icon: faUser,
    },
    userInfo?.role === "vendor"
      ? {
          name: "Estabelecimento",
          callback: () => Stores.Navigation.instance.goTo(Routes.company),
          icon: faShop,
        }
      : null,
    userInfo?.role === "vendor"
      ? {
          name: "Assinatura",
          callback: () => Stores.Navigation.instance.goTo(Routes.subscription),
          icon: faMoneyBill1Wave,
        }
      : null,
    {
      name: "Configurações",
      callback: () => Stores.Navigation.instance.goTo(Routes.settings),
      icon: faSlidersH,
    },
    {
      name: "Limites",
      callback: () => Stores.Navigation.instance.goTo(Routes.limits),
      icon: faChartColumn,
    },
    {
      name: "Comunicação",
      callback: () => Stores.Navigation.instance.goTo(Routes.pushNotifications),
      icon: faMessage,
    },
    userInfo?.role === "vendor"
      ? {
          name: "Colaboradores",
          callback: () => Stores.Navigation.instance.goTo(Routes.staff),
          icon: faUserGroup,
        }
      : null,
    {
      name: "Layout",
      callback: () => Stores.Navigation.instance.goTo(Routes.layout),
      icon: faIdCard,
    },
  ];

  $: styleHeight = `${Number($StatusBar.height) + 60}px`;
  $: route = $router.route;

  onMount(async () => {
    userInfo = await Utils.Jws.extractToken(await Stores.Auth.instance.data());
  });

  $: if (menuHamburgerItems) {
    Stores.MenuHamburger.instance.reset();
    menuHamburgerItems?.forEach((page) =>
      Stores.MenuHamburger.instance.addItem(page)
    );
  }
  $: style = `--paddingTop:${styleHeight};--paddingBottom: ${
    70 + $StatusBar.bottomPadding
  }px; overflow: scroll;`;
</script>

<main {style}>
  {#if route == Routes.home}
    <Home />
  {:else if route == Routes.orders}
    <Orders />
  {:else if route == Routes.order}
    <Order />
  {:else if route == Routes.settings}
    <Settings />
  {:else if route == Routes.company}
    <CompanyProfile />
  {:else if route == Routes.profile}
    <Profile />
  {:else if route == Routes.products}
    <Products />
  {:else if route == Routes.product}
    <Product />
  {:else if route == Routes.editProduct}
    <NewProduct />
  {:else if route == Routes.editCategory}
    <NewCategory />
  {:else if route == Routes.coupons}
    <Coupons />
  {:else if route == Routes.newCoupon}
    <NewCoupon />
  {:else if route == Routes.pushNotifications}
    <PushNotifications />
  {:else if route == Routes.newPushNotification}
    <NewPushNotification />
  {:else if route == Routes.layout}
    <Layout />
  {:else if route == Routes.subscription}
    <Subscription />
  {:else if route == Routes.staff}
    <Staff />
  {:else if route == Routes.newStaff}
    <NewStaff />
  {:else if route == Routes.limits}
    <Limits />
  {:else}
    <Home />
  {/if}
</main>
<Views.NavigationBar
  logo="/assets/icons/transparent-logo-1.svg"
  paddingTop={$StatusBar.height}
  topMargin={$StatusBar.height}
  paddingBottom={$StatusBar.bottomPadding}
/>
<Views.Tabs {tabs} bottomPadding={$StatusBar.bottomPadding} />

<style>
  main {
    padding: 20px;
    padding-top: var(--paddingTop);
    overflow: hidden;
    max-width: 100%;
    position: relative;
    /* padding-bottom: calc(55px + var(--marginBottom)); */
    display: flex;
    flex-direction: column;
    /* flex: 1; */
    padding-bottom: var(--paddingBottom);
  }
  :global(*, *:before, *:after) {
    margin: 0;
    padding: 0;
    font-weight: normal;
    box-sizing: border-box;
  }
  :global(body) {
    padding-top: 0; /*var(--paddingTop)*/
    padding-bottom: 0;
  }
</style>
