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
  import { Auth } from "../stores/Auth";
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
    userInfo?.role === "vendor"
      ? {
          name: "Estabelecimento",
          callback: () => Navigation.goTo(Routes.company),
          icon: faShop,
        }
      : null,
    userInfo?.role === "vendor"
      ? {
          name: "Assinatura",
          callback: () => Navigation.goTo(Routes.subscription),
          icon: faMoneyBill1Wave,
        }
      : null,
    {
      name: "Configurações",
      callback: () => Navigation.goTo(Routes.settings),
      icon: faSlidersH,
    },
    {
      name: "Limites",
      callback: () => Navigation.goTo(Routes.limits),
      icon: faChartColumn,
    },
    {
      name: "Comunicação",
      callback: () => Navigation.goTo(Routes.pushNotifications),
      icon: faMessage,
    },
    userInfo?.role === "vendor"
      ? {
          name: "Colaboradores",
          callback: () => Navigation.goTo(Routes.staff),
          icon: faUserGroup,
        }
      : null,
    {
      name: "Layout",
      callback: () => Navigation.goTo(Routes.layout),
      icon: faIdCard,
    },
  ];

  $: styleHeight = `${Number($StatusBar.height) + 60}px`;
  $: route = $Router.route;
  let firstLaunch = true;

  function easeIn(node, { duration = 6000 }) {
    // node.style.display = "none";
    // setTimeout(() => (node.style.display = "flex"), duration / 2);
    // return {
    //   duration,
    //   css: (t) => {
    //     // if (firstLaunch && t === 1) {
    //     //   firstLaunch = false;
    //     // }
    //     // if (!firstLaunch && t > 0.5) {
    //     //   return;
    //     // }
    //     const localStyle = `
    // left: -${(t * 100).toFixed(0)}%;
    // `;
    //     console.log("easeIn:", localStyle);
    //     return localStyle;
    //   },
    // };
  }

  function easeOut(node, { duration = 6000 }) {
    // node.style.display = "flex";
    // setTimeout(() => (node.style.display = "none"), duration / 2);
    // return {
    //   duration,
    //   css: (t) => {
    //     const localStyle = `
    // `;
    //     console.log("easeOut:", localStyle);
    //     return localStyle;
    //   },
    // };
  }
  onMount(async () => {
    userInfo = await Utils.Jws.extractToken($Auth);
  });

  $: if (menuHamburgerItems) {
    MenuHamburger.reset();
    menuHamburgerItems?.forEach((page) => MenuHamburger.addItem(page));
  }
  $: style = `--paddingTop:${styleHeight};--paddingBottom: ${
    70 + $StatusBar.bottomPadding
  }px; overflow: scroll;`;
</script>

{#if route == Routes.home}
  <main in:easeIn out:easeOut {style}>
    <Home />
  </main>
{:else if route == Routes.orders}
  <main in:easeIn out:easeOut {style}>
    <Orders />
  </main>
{:else if route == Routes.order}
  <main in:easeIn out:easeOut {style}>
    <Order />
  </main>
{:else if route == Routes.settings}
  <main in:easeIn out:easeOut {style}>
    <Settings />
  </main>
{:else if route == Routes.company}
  <main in:easeIn out:easeOut {style}>
    <CompanyProfile />
  </main>
{:else if route == Routes.profile}
  <main in:easeIn out:easeOut {style}>
    <Profile />
  </main>
{:else if route == Routes.products}
  <main in:easeIn out:easeOut {style}>
    <Products />
  </main>
{:else if route == Routes.product}
  <main in:easeIn out:easeOut {style}>
    <Product />
  </main>
{:else if route == Routes.editProduct}
  <main in:easeIn out:easeOut {style}>
    <NewProduct />
  </main>
{:else if route == Routes.editCategory}
  <main in:easeIn out:easeOut {style}>
    <NewCategory />
  </main>
{:else if route == Routes.coupons}
  <main in:easeIn out:easeOut {style}>
    <Coupons />
  </main>
{:else if route == Routes.newCoupon}
  <main in:easeIn out:easeOut {style}>
    <NewCoupon />
  </main>
{:else if route == Routes.pushNotifications}
  <main in:easeIn out:easeOut {style}>
    <PushNotifications />
  </main>
{:else if route == Routes.newPushNotification}
  <main in:easeIn out:easeOut {style}>
    <NewPushNotification />
  </main>
{:else if route == Routes.layout}
  <main in:easeIn out:easeOut {style}>
    <Layout />
  </main>
{:else if route == Routes.subscription}
  <main in:easeIn out:easeOut {style}>
    <Subscription />
  </main>
{:else if route == Routes.staff}
  <main in:easeIn out:easeOut {style}>
    <Staff />
  </main>
{:else if route == Routes.newStaff}
  <main in:easeIn out:easeOut {style}>
    <NewStaff />
  </main>
{:else if route == Routes.limits}
  <main in:easeIn out:easeOut {style}>
    <Limits />
  </main>
{:else}
  <main in:easeIn out:easeOut {style}>
    <Home />
  </main>
{/if}
<Views.NavigationBar
  {MenuHamburger}
  logo="/assets/icons/transparent-logo-1.svg"
  {Menu}
  {Title}
  paddingTop={$StatusBar.height}
  topMargin={$StatusBar.height}
  paddingBottom={$StatusBar.bottomPadding}
  {Navigation}
/>
<Views.Tabs {tabs} {Navigation} bottomPadding={$StatusBar.bottomPadding} />

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
