<script>
  import { App } from "@capacitor/app";
  import { Auth, ikomidaID, PushNotificationToken } from "./stores/Auth";
  import { Network } from "@capacitor/network";
  import { onMount } from "svelte";
  import { Navigation, Router, Routes } from "./stores/Navigation";
  import { StatusBar as _StatusBar, Settings } from "./stores/Setup";
  import { StatusBar } from "@ikomida/capacitor-plugin-status-bar";
  import { PushNotification, Utils, Views } from "@ikomida/components";
  import { registerPushNotificationToken } from "./network/PushNotification";
  import { CAPNativeLog } from "capacitor-native-log";
  import Cache from "./stores/Cache";
  import { Network as iNetwork } from "@ikomida/components";

  import Main from "./pages/Main.svelte";
  import Login from "./pages/Unlogged/Login.svelte";
  import Tac from "./pages/Unlogged/Tac.svelte";
  import ForgotPassword from "./pages/Unlogged/ForgotPassword.svelte";

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

  $: route = $Router.route;
  $: if (logedIn) {
    Utils.Jws.extractToken($Auth).then(async (token) => {
      await ikomidaID.set(token?.ikomidaID);
      iNetwork.instance.setIkomidaID(token?.ikomidaID);
    });
  }
  $: if ($Auth) {
    logedIn = false;
    Utils.Jws.extractToken($Auth).then(async (token) => {
      logedIn = token !== null;
    });
  } else {
    ikomidaID
      .get()
      .then((id) =>
        id && id !== "undefined" ? iNetwork.instance.setIkomidaID(id) : null
      );
    logedIn = false;
  }

  async function openNotification(notification) {
    if (logedIn) {
      if (["/order/", "/orders/"].includes(notification?.data?.uri)) {
        Cache.setObject("ORDERS_HISTORY", null);
        Cache.setObject("ORDERS", null);
        Navigation.goTo(Routes.orders, false);
      }
    }
  }

  async function hasRegisteredCallBack(token, platform) {
    const tokenObject = { platform, token };
    PushNotificationToken.setToken(tokenObject);
    await registerPushNotificationToken(tokenObject);
  }

  async function hasErrorCallBack(error) {
    //TODO: -- handle and report error
    CAPNativeLog.log({ level: "error", message: JSON.stringify(error) });
  }

  async function permissionStatus(permissionStatus) {
    //TODO: -- handle and report permissions
    CAPNativeLog.log({
      level: "info",
      message: `permissionStatusObject: ${JSON.stringify(permissionStatus)}`,
    });
  }

  function receivedCallBack(notification) {
    CAPNativeLog.log({ level: "info", message: JSON.stringify(notification) });
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
      CAPNativeLog.log({ level: "info", message: "Inside" });
      togglePushNotificationPopup();
    }
  }

  function actionPerformedCallBack(notification) {
    CAPNativeLog.log({ level: "info", message: JSON.stringify(notification) });
    openNotification(notification?.notification);
  }

  onMount(async () => {
    networkStatus = await Network.getStatus();
    if (Capacitor.isNativePlatform()) {
      pushNotification.init();
      const sbarInfo = await StatusBar.getInfo()
      console.log("await StatusBar.getInfo():", sbarInfo)
      _StatusBar.setStatusBar(sbarInfo);
    }
  });

  Network.addListener("networkStatusChange", (status) => {
    networkStatus = status;
  });

  App.addListener("appUrlOpen", (data) => {
    // CAPNativeLog.log({
    //   level: "info",
    //   message: `App opened with URL: ${JSON.stringify(data)}`,
    // });
    Navigation.goTo(Routes.settings, { callback: true, ...data });
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
{:else if route == Routes.Auth}
  <Login />
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

<style>
  :global(.grecaptcha-badge) {
    visibility: hidden;
  }
  #internetError {
    background-color: #4c0708;
    color: white;
  }
</style>
