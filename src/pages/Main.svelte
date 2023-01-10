<script lang="ts">
  import Routes from '../stores/Routes'
  import { Views, Utils, Stores, Types } from '@ikomida/shared-frontend'
  import Home from './Products/Home.svelte'
  import Orders from './Orders/Orders.svelte'
  import Order from './Orders/Order.svelte'
  import CompanyProfile from './User/CompanyProfile.svelte'
  import Profile from './User/Profile.svelte'
  import Settings from './Control/Settings.svelte'
  import Layout from './Control/Layout.svelte'
  import Coupons from './Coupons/Coupons.svelte'
  import NewCoupon from './Coupons/NewCoupon.svelte'
  import PushNotifications from './PushNotifications/PushNotifications.svelte'
  import NewPushNotification from './PushNotifications/NewPushNotification.svelte'
  import Limits from './Control/Limits.svelte'
  import Subscription from './Control/Subscription.svelte'
  import Product from './Products/Product.svelte'
  import Products from './Products/Products.svelte'
  import NewProduct from './Products/NewProduct.svelte'
  import NewCategory from './Products/NewCategory.svelte'
  import Staff from './Staff/Staff.svelte'
  import NewStaff from './Staff/NewStaff.svelte'
  import Apps from './Control/Apps.svelte'
  import { StatusBar } from '../stores/Setup'
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
    faMobile
  } from '@fortawesome/free-solid-svg-icons'
  import { onMount } from 'svelte'

  let screenWidth: number
  let userInfo: Types.Classes.CUser
  let router = Stores.Navigation.instance.router
  const tabs = [
    {
      name: 'Home',
      route: Routes.home,
      icon: faHome
    },
    {
      name: 'Produtos',
      route: Routes.products,
      icon: faList
    },
    {
      name: 'Pedidos',
      route: Routes.orders,
      icon: faBook
    }
  ]
  $: menuHamburgerItems = [
    [Types.Types.TRoles.VENDOR, Types.Types.TRoles.STAFF].includes(userInfo?.role)
      ? {
          name: 'Home',
          callback: () => Stores.Navigation.instance.reset(Routes.home),
          icon: faHome
        }
      : null,
    {
      name: 'Perfil',
      callback: () => Stores.Navigation.instance.goTo(Routes.profile),
      icon: faUser
    },
    userInfo?.role === Types.Types.TRoles.VENDOR
      ? {
          name: 'Estabelecimento',
          callback: () => Stores.Navigation.instance.goTo(Routes.company),
          icon: faShop
        }
      : null,
    userInfo?.role === Types.Types.TRoles.VENDOR
      ? {
          name: 'Assinatura',
          callback: () => Stores.Navigation.instance.goTo(Routes.subscription),
          icon: faMoneyBill1Wave
        }
      : null,
    userInfo?.role === Types.Types.TRoles.VENDOR
      ? {
          name: 'Meus apps',
          callback: () => Stores.Navigation.instance.goTo(Routes.apps),
          icon: faMobile
        }
      : null,
    [Types.Types.TRoles.VENDOR, Types.Types.TRoles.STAFF].includes(userInfo?.role)
      ? {
          name: 'Configurações',
          callback: () => Stores.Navigation.instance.goTo(Routes.settings),
          icon: faSlidersH
        }
      : null,
    [Types.Types.TRoles.VENDOR, Types.Types.TRoles.STAFF].includes(userInfo?.role)
      ? {
          name: 'Limites',
          callback: () => Stores.Navigation.instance.goTo(Routes.limits),
          icon: faChartColumn
        }
      : null,
    [Types.Types.TRoles.VENDOR, Types.Types.TRoles.STAFF].includes(userInfo?.role)
      ? {
          name: 'Comunicação',
          callback: () => Stores.Navigation.instance.goTo(Routes.pushNotifications),
          icon: faMessage
        }
      : null,
    userInfo?.role === Types.Types.TRoles.VENDOR
      ? {
          name: 'Colaboradores',
          callback: () => Stores.Navigation.instance.goTo(Routes.staff),
          icon: faUserGroup
        }
      : null,
    {
      name: 'Layout',
      callback: () => Stores.Navigation.instance.goTo(Routes.layout),
      icon: faIdCard
    }
  ]

  $: styleHeight = `${Number($StatusBar.height + ($StatusBar.topMargin ?? 0)) + 62}px`
  $: route = $router.route

  onMount(async () => {
    const auth = await Stores.Auth.Auth.instance.data()
    if (auth) {
      userInfo = Types.Classes.CUser.fromObject(await Utils.Jws.extractToken(auth))
    }
  })

  $: if (menuHamburgerItems) {
    Stores.MenuHamburger.instance.reset()
    menuHamburgerItems?.forEach(page => Stores.MenuHamburger.instance.addItem(page))
  }
  $: isPageList = [Routes.orders, Routes.coupons, Routes.orders, Routes.pushNotifications, Routes.staff].includes(route)
  $: style = `--padding: ${isPageList ? 0 : 16}px;--paddingTop:${styleHeight};--paddingBottom: ${
    (screenWidth > 480 ? 32 : 96) + $StatusBar.bottomPadding
  }px;`
</script>

<svelte:window bind:innerWidth={screenWidth} />
<Views.MainContainer {style}>
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
  {:else if route == Routes.apps}
    <Apps />
  {:else if [Types.Types.TRoles.VENDOR, Types.Types.TRoles.STAFF].includes(userInfo?.role)}
    <Home />
  {:else}
    <Orders />
  {/if}
</Views.MainContainer>
<Views.NavigationBar
  logo="/assets/icons/transparent-logo-1.svg"
  paddingTop={$StatusBar.height}
  topMargin={$StatusBar.topMargin}
  paddingBottom={$StatusBar.bottomPadding}
/>
{#if [Types.Types.TRoles.VENDOR, Types.Types.TRoles.STAFF].includes(userInfo?.role)}
  <Views.Tabs {tabs} bottomPadding={$StatusBar.bottomPadding} />
{/if}

<style>
  :global(*, *:before, *:after) {
    margin: 0;
    padding: 0;
    font-weight: normal;
    box-sizing: border-box;
  }
  :global(body) {
    padding-top: 0;
    padding-bottom: 0;
  }
</style>
