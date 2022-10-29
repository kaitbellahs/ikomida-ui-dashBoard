<script lang="ts">
  import { App } from '@capacitor/app'
  import ikomidaID from './stores/ikomidaID'
  import { Network } from '@capacitor/network'
  import type { ConnectionStatus } from '@capacitor/network'
  import { onMount, tick } from 'svelte'
  import Routes from './stores/Routes'
  import { StatusBar as _StatusBar, Settings } from './stores/Setup'
  import type { StatusBarType } from './stores/Setup'
  import { StatusBar } from '@ikomida/capacitor-plugin-status-bar'
  import { Utils, Views, Network as iKomidaNetwork, Stores, Types } from '@ikomida/shared-frontend'
  import { registerPushNotificationToken } from './network/PushNotification'
  import Main from './pages/Main.svelte'
  import Login from './pages/Unlogged/Login.svelte'
  import Tac from './pages/Unlogged/Tac.svelte'
  import ForgotPassword from './pages/Unlogged/ForgotPassword.svelte'
  import { Capacitor } from '@capacitor/core'
  import type { IAlertButton } from '@ikomida/shared-frontend/lib/components/Alert.svelte'
  import { getOrder } from './network/Orders'
  import LaunchScreen from './pages/Unlogged/LaunchScreen.svelte'

  let initialazation = true
  let logedIn = false
  let showNotificationPopup = false
  let auth: Stores.Auth.IStore
  let router = Stores.Navigation.instance.router
  let notificationIds: string[] = []
  let networkStatus: ConnectionStatus | null = null
  let cache: Stores.Cache = Stores.Cache.instance
  let network: iKomidaNetwork | undefined = iKomidaNetwork.instance
  let navigation: Stores.Navigation = Stores.Navigation.instance
  let notificationPopup = {
    title: '',
    body: '',
    buttons: [] as IAlertButton[]
  }
  function togglePushNotificationPopup() {
    showNotificationPopup = !showNotificationPopup
  }
  let pushNotification = new Utils.PushNotification(
    hasRegisteredCallBack,
    receivedCallBack,
    actionPerformedCallBack,
    hasErrorCallBack,
    permissionStatus
  )

  $: route = $router.route
  $: if ($auth) {
    Utils.Jws.extractToken($auth).then(async token => {
      logedIn = token !== null
      if (token?.ikomidaID && token?.ikomidaID !== 'undefined') {
        await ikomidaID.set(token?.ikomidaID)
        network?.setIkomidaID(token?.ikomidaID)
      } else {
        await ikomidaID.set('com.ikomida.br.')
      }
    })
  } else if (!$auth && logedIn) {
    ikomidaID.get().then(id => (id && id !== 'undefined' ? network?.setIkomidaID(id) : null))
    logedIn = false
  }
  $: if (!networkStatus?.connected) {
    const statusBar = $_StatusBar
    statusBar.topMargin = 22
    _StatusBar.setStatusBar(statusBar)
  } else {
    const statusBar = $_StatusBar
    statusBar.topMargin = 0
    _StatusBar.setStatusBar(statusBar)
  }

  async function openNotification(notification: Types.Classes.CNotificationPayload) {
    if (logedIn) {
      if (notification?.data?.uri && ['/order/', '/orders/'].includes(notification.data?.uri)) {
        const cachedOrders = (cache.getObject(Stores.Cache.Types.ORDERS) ?? []) as Types.Classes.COrder[]
        if (cachedOrders.length > 0) {
          const order = cachedOrders.filter(cachedOrder => cachedOrder.id === notification.data?.payload)?.[0]
          navigation.goTo(Routes.order, order)
        }
      } else if (notification?.data?.uri && ['/subscription/'].includes(notification?.data?.uri)) {
        navigation.reset(Routes.home)
        await tick()
        Stores.Loading.instance.reset()
        navigation.goTo(Routes.subscription)
      }
    }
  }

  async function hasRegisteredCallBack(token: string, platform: string) {
    const tokenObject: Types.Classes.CRegisterPushNotification = Types.Classes.CRegisterPushNotification.fromObject({
      platform,
      token
    })
    Stores.PushNotificationToken.instance.setToken(token)
    await registerPushNotificationToken(tokenObject)
  }

  async function hasErrorCallBack(error: any) {
    //TODO: -- handle and report error
    console.error(`level: 'error', message: ${JSON.stringify(error)}`)
  }

  async function permissionStatus(permissionStatus: any) {
    //TODO: -- handle and report permissions
    console.log({
      level: 'info',
      message: `permissionStatusObject: ${JSON.stringify(permissionStatus)}`
    })
  }

  async function receivedCallBack(notification: Types.Classes.CNotificationPayload, go = false) {
    await tick()
    if (
      $Settings?.popups.newOrder &&
      notification?.id &&
      !notificationIds.includes(notification?.id) &&
      (logedIn || !((notification?.data?.logon ?? 'true') === 'true'))
    ) {
      notificationIds.push(notification?.id)
      notificationPopup.title = notification?.title ?? ''
      notificationPopup.body = notification?.body ?? ''
      notificationPopup.buttons = [
        {
          name: 'Fechar',
          callback: togglePushNotificationPopup,
          principal: false
        }
      ]
      if (notification?.data?.uri) {
        notificationPopup?.buttons?.push({
          name: 'Abrir',
          callback: () => {
            showNotificationPopup = false
            openNotification(notification)
          },
          principal: true
        })
      }
      notificationPopup = notificationPopup
      if (logedIn) {
        if (notification?.data?.uri && ['/order/', '/orders/'].includes(notification?.data?.uri)) {
          const response = await getOrder(notification.data.payload)
          let order: Types.Classes.COrder | undefined = undefined
          if (response?.success) {
            order = Types.Classes.COrder.fromObject(response?.data)
          }
          let cachedOrders = (cache.getObject(Stores.Cache.Types.ORDERS) ?? []) as Types.Classes.COrder[]
          if (order) {
            const cachedOrder = cachedOrders.filter(cachedOrder => cachedOrder.id === order?.id)?.[0]
            if (cachedOrder) {
              const orderIndex = cachedOrders.indexOf(cachedOrder)
              cachedOrders[orderIndex] = order
            } else {
              cachedOrders.push(order)
              cachedOrders = cachedOrders.sort((i1, i2) => (i2.timestamp ?? 0) - (i1.timestamp ?? 0))
            }
          }
          cache.setObject(Stores.Cache.Types.ORDERS, cachedOrders)
          if (route == Routes.order || go) {
            navigation.reset(Routes.orders)
            await tick()
            Stores.Loading.instance.reset()
            navigation.goTo(Routes.order, order)
          } else if (route == Routes.orders) {
            navigation.reset(Routes.home)
            await tick()
            Stores.Loading.instance.reset()
            navigation.reset(Routes.orders)
          } else {
            togglePushNotificationPopup()
          }
        } else if (notification?.data?.uri && ['/subscription/'].includes(notification?.data?.uri)) {
          if (route == Routes.subscription || go) {
            navigation.reset(Routes.home)
            await tick()
            Stores.Loading.instance.reset()
            navigation.goTo(Routes.subscription)
          } else {
            togglePushNotificationPopup()
          }
        } else {
          togglePushNotificationPopup()
        }
      }
    }
  }

  async function actionPerformedCallBack(notification: any) {
    await receivedCallBack(notification.notification, true)
  }

  onMount(async () => {
    auth = await Stores.Auth.Auth.instance.store()
    if ($auth) {
      const token = await Utils.Jws.extractToken($auth)
      logedIn = token !== null
      if (token?.ikomidaID && token?.ikomidaID !== 'undefined') {
        await ikomidaID.set(token?.ikomidaID)
        network?.setIkomidaID(token?.ikomidaID)
      } else {
        await ikomidaID.set('com.ikomida.br.')
      }
    } else {
      ikomidaID.get().then(async id => {
        if (id && id !== 'undefined') {
          network?.setIkomidaID(id)
        } else {
          await ikomidaID.set('com.ikomida.br.')
        }
      })
      logedIn = false
    }
    networkStatus = await Network.getStatus()
    if (Capacitor.isNativePlatform()) {
      const statusBar = (await StatusBar.getInfo()) as StatusBarType
      statusBar.topMargin = statusBar?.topMargin ?? 0
      _StatusBar.setStatusBar(statusBar)
      pushNotification.init()
    }
    initialazation = false
    await tick()
    // MARK: --test push notification
    // await actionPerformedCallBack({
    //   notification: {
    //     id: new Date().getTime(),
    //     title: 'test',
    //     body: 'test body',
    //     data: {
    //       logon: 'true',
    //       uri: '/order/',
    //       payload: 'c2445df0-1abe-4da9-836e-fb0108b396a7'
    //     }
    //   }
    // })
  })

  Network.addListener('networkStatusChange', status => {
    networkStatus = status
  })

  App.addListener('appUrlOpen', data => {
    navigation.goTo(Routes.settings, {
      callback: true,
      ...data
    })
  })
</script>

{#if initialazation}
  <LaunchScreen />
{:else if logedIn}
  <Main />
{:else if route == Routes.forgotPassword}
  <ForgotPassword />
{:else if route == Routes.tac}
  <Tac />
{:else}
  <Login />
{/if}
<Views.LoadJS url="https://www.google.com/recaptcha/api.js?render=6LebYzshAAAAAIXhka3WrAjus5tDXtefR1QefVZS" />
{#if networkStatus == null || !networkStatus.connected}
  <div id="internetError">Esperando por conexão a internet...</div>
{/if}
{#if showNotificationPopup}
  <Views.Alert
    title={notificationPopup?.title}
    message={notificationPopup?.body}
    closeCallBack={togglePushNotificationPopup}
    buttons={notificationPopup?.buttons}
  />
{/if}
<Views.Loading topPadding={$_StatusBar.height} bottomPadding={$_StatusBar.bottomPadding} />
<Views.MessageAlert />

<style>
  #internetError {
    background-color: #4c0708;
    color: white;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding-top: 1px;
    padding-bottom: 1px;
    padding-left: 10px;
    padding-right: 10px;
    z-index: 9999999999;
    text-align: center;
    border-bottom: 1px solid white;
  }
  :global(.grecaptcha-badge) {
    visibility: hidden;
  }
</style>
