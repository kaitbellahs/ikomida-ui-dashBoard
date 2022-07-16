<script>
  import { App } from "@capacitor/app";
  import { Auth, PushNotificationToken } from "./stores/Auth";
  import Login from "./pages/user/Login.svelte";
  import Main from "./pages/Main.svelte";
  import Tac from "./pages/user/Tac.svelte";
  import { Network } from "@capacitor/network";
  import { onMount } from "svelte";
  import { Navigation, Router, Routes } from "./stores/Navigation";
  import { StatusBar as _StatusBar } from "./stores/Setup";
  import { StatusBar } from "@capacitor/status-bar";
  import { PushNotification, Utils } from "@ikomida/components";
  import { registerPushNotificationToken } from "./network/PushNotification";
  import ForgotPassword from "./pages/user/ForgotPassword.svelte";
  import { CAPNativeLog } from "capacitor-native-log";

  let networkStatus = null;
  let logedIn = false;
  let pushNotification = new PushNotification(
    hasRegisteredCallBack,
    pushNotificationReceivedCallBack,
    pushNotificationActionPerformedCallBack
  );

  const checkAppLaunchUrl = async () => {
    const { url } = await App.getLaunchUrl();

    alert("App opened with URL: " + url);
  };

  $: route = $Router.route;

  $: if ($Auth) {
    logedIn = false;
    Utils.Jws.extractToken($Auth).then((token) => {
      logedIn = token !== null;
    });
  } else {
    logedIn = false;
  }

  async function hasRegisteredCallBack(token, platform) {
    CAPNativeLog.log({ level: "info", message: JSON.stringify(token) });
    const tokenObject = { platform, token };
    PushNotificationToken.setToken(tokenObject);
    await registerPushNotificationToken(tokenObject);
  }

  function pushNotificationReceivedCallBack(notification) {
    CAPNativeLog.log({ level: "info", message: JSON.stringify(notification) });
  }

  function pushNotificationActionPerformedCallBack(notification) {
    CAPNativeLog.log({ level: "info", message: JSON.stringify(notification) });
  }

  onMount(async () => {
    networkStatus = await Network.getStatus();
    if (Capacitor.isNativePlatform()) {
      pushNotification.init();
      _StatusBar.setStatusBar(await StatusBar.getInfo());
    }
  });

  Network.addListener("networkStatusChange", (status) => {
    networkStatus = status;
  });
  // App.addListener("appStateChange", ({ isActive }) => {
  //   console.log("App state changed. Is active?", isActive);
  // });

  App.addListener("appUrlOpen", (data) => {
    console.log("App opened with URL:", data);
    CAPNativeLog.log({
      level: "info",
      message: `App opened with URL: ${JSON.stringify(data)}`,
    });
    Navigation.goTo(Routes.settings, { callback: true, ...data });
  });

  // App.addListener("appRestoredResult", (data) => {
  //   console.log("Restored state:", data);
  // });
</script>

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

<style>
  #internetError {
    background-color: #4c0708;
    color: white;
  }
</style>
