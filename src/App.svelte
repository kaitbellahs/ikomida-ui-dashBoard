<script>
  import { App } from "@capacitor/app";
  import ikomidaID from "./stores/ikomidaID";
  import { Network } from "@capacitor/network";
  import { onMount } from "svelte";
  import Routes from "./stores/Routes";
  import { StatusBar as _StatusBar, Settings } from "./stores/Setup";
  import { StatusBar } from "@ikomida/capacitor-plugin-status-bar";
  import {
    PushNotification,
    Utils,
    Views,
    Network as iKomidaNetwork,
    Stores,
  } from "@ikomida/components";
  import { registerPushNotificationToken } from "./network/PushNotification";
  import Main from "./pages/Main.svelte";
  import Login from "./pages/Unlogged/Login.svelte";
  import Tac from "./pages/Unlogged/Tac.svelte";
  import ForgotPassword from "./pages/Unlogged/ForgotPassword.svelte";

  let auth;
  let router = Stores.Navigation.instance.router;
  let notificationIds = [];
  let networkStatus = null;
  let logedIn = false;
  let showNotificationPopup = false;
  let notificationPopup = {
    title: null,
    body: null,
    buttons: [],
  };
  function togglePushNotificationPopup() {
    showNotificationPopup = !showNotificationPopup;
  }
  let pushNotification = new PushNotification(
    hasRegisteredCallBack,
    receivedCallBack,
    actionPerformedCallBack,
    hasErrorCallBack,
    permissionStatus
  );

  const checkAppLaunchUrl = async () => {
    const { url } = await App.getLaunchUrl();

    alert("App opened with URL: " + url);
  };

  $: route = $router.route;
  $: if (logedIn) {
    Utils.Jws.extractToken($auth).then(async (token) => {
      await ikomidaID.set(token?.ikomidaID);
      iKomidaNetwork.instance.setIkomidaID(token?.ikomidaID);
    });
  }
  $: if ($auth) {
    logedIn = false;
    Utils.Jws.extractToken($auth).then(async (token) => {
      logedIn = token !== null;
    });
  } else {
    ikomidaID
      .get()
      .then((id) =>
        id && id !== "undefined"
          ? iKomidaNetwork.instance.setIkomidaID(id)
          : null
      );
    logedIn = false;
  }

  async function openNotification(notification) {
    if (logedIn) {
      if (["/order/", "/orders/"].includes(notification?.data?.uri)) {
        await iKomidaNetwork.instance.clearStores.Cache(
          Stores.Cache.Types.ORDERS
        );
        Stores.Navigation.instance.goTo(Routes.orders, false);
      }
    }
  }

  async function hasRegisteredCallBack(token, platform) {
    const tokenObject = { platform, token };
    Stores.PushNotificationToken.setToken(tokenObject);
    await registerPushNotificationToken(tokenObject);
  }

  async function hasErrorCallBack(error) {
    //TODO: -- handle and report error
    console.log({ level: "error", message: JSON.stringify(error) });
  }

  async function permissionStatus(permissionStatus) {
    //TODO: -- handle and report permissions
    console.log({
      level: "info",
      message: `permissionStatusObject: ${JSON.stringify(permissionStatus)}`,
    });
  }

  function receivedCallBack(notification) {
    console.log({ level: "info", message: JSON.stringify(notification) });
    if (
      $Settings?.popups.newOrder &&
      !notificationIds.includes(notification?.id) &&
      (logedIn || !((notification?.data?.logon ?? "true") === "true"))
    ) {
      notificationIds.push(notification?.id);
      notificationPopup.title = notification?.title;
      notificationPopup.body = notification?.body;
      notificationPopup.buttons = [
        {
          name: "Fechar",
          callback: togglePushNotificationPopup,
        },
      ];
      if (notification?.data?.uri) {
        notificationPopup?.buttons?.push({
          name: "Abrir",
          callback: () => {
            showNotificationPopup = false;
            openNotification(notification);
          },
          principal: true,
        });
      }
      notificationPopup = notificationPopup;
      console.log({ level: "info", message: "Inside" });
      togglePushNotificationPopup();
    }
  }

  function actionPerformedCallBack(notification) {
    console.log({ level: "info", message: JSON.stringify(notification) });
    openNotification(notification?.notification);
  }

  onMount(async () => {
    auth = await Stores.Auth.instance.store();
    networkStatus = await Network.getStatus();
    if (Capacitor.isNativePlatform()) {
      pushNotification.init();
      const sbarInfo = await StatusBar.getInfo();
      _StatusBar.setStatusBar(sbarInfo);
    }
  });

  Network.addListener("networkStatusChange", (status) => {
    networkStatus = status;
  });

  App.addListener("appUrlOpen", (data) => {
    // console.log({
    //   level: "info",
    //   message: `App opened with URL: ${JSON.stringify(data)}`,
    // });
    Stores.Navigation.instance.goTo(Routes.settings, {
      callback: true,
      ...data,
    });
  });
</script>

<Views.LoadJS
  url="https://www.google.com/recaptcha/api.js?render=6LebYzshAAAAAIXhka3WrAjus5tDXtefR1QefVZS"
/>
{#if networkStatus == null || !networkStatus.connected}
  <div id="internetError">Esperando por conexão a internet...</div>
{/if}

{#if logedIn}
  <Main />
{:else if route == Routes.forgotPassword}
  <ForgotPassword />
{:else if route == Routes.tac}
  <Tac />
{:else}
  <Login />
{/if}
{#if showNotificationPopup}
  <Views.Alert
    title={notificationPopup?.title}
    message={notificationPopup?.body}
    closeCallBack={togglePushNotificationPopup}
    buttons={notificationPopup?.buttons}
  />
{/if}
<Views.Loading
  topPadding={$_StatusBar.height}
  bottomPadding={$_StatusBar.bottomPadding}
/>
<Views.MessageAlert />

<style>
  :global(.grecaptcha-badge) {
    visibility: hidden;
  }
  #internetError {
    background-color: #4c0708;
    color: white;
  }
</style>
