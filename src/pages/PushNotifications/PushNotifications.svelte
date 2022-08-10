<script>
  import {
    Title,
    Navigation,
    Router,
    Routes,
    Menu,
  } from "../../stores/Navigation";
  import Fa from "svelte-fa";
  import { faSync, faRocket } from "@fortawesome/free-solid-svg-icons";
  import { Views, Utils } from "@ikomida/components";
  import { getPushNotifications } from "../../network/PushNotification";
  import { StatusBar } from "../../stores/Setup";
  import { onMount } from "svelte";
  import Cache from "../../stores/Cache";
  let pushNotifications;

  const CACHE_NAME = "PUSH_NOTIFICATIONS";
  let hasMore = true;
  let canGetMore = true;
  let lastTimestamp = null;

  async function getMore(e, refresh = false) {
    if (refresh || (canGetMore && hasMore)) {
      isLoading = true;
      const timestamp = refresh
        ? 0
        : pushNotifications?.[pushNotifications.length - 1]?.timestamp ?? -1;
      canGetMore = false;
      pushNotifications = Cache.getObject(CACHE_NAME);
      const newPushNotifications = await getPushNotifications(timestamp);
      hasMore = (newPushNotifications?.length ?? 0) > 0;
      pushNotifications = refresh
        ? newPushNotifications
        : pushNotifications
        ? [...pushNotifications, ...newPushNotifications]
        : newPushNotifications;
      pushNotifications.sort(
        (item1, item2) => new Date(item2.createdAt) - new Date(item1.createdAt)
      );
      Cache.setObject(CACHE_NAME, pushNotifications);
      canGetMore = refresh || lastTimestamp !== timestamp;
      lastTimestamp = timestamp;
      isLoading = false;
    }
  }

  onMount(async () => {
    pushNotifications = Cache.getObject(CACHE_NAME);
    if (!pushNotifications) {
      await getMore(null, true);
    }
  });

  async function refresh() {
    await getMore(null, true);
  }

  Menu.addItem({ name: "Atualizar", icon: faSync, callback: refresh });

  let isLoading = false;

  let errorAlert;
  let showAlert = false;

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  const newPushNotification = async () => {
    Navigation.goTo(Routes.newPushNotification);
  };

  async function removePushNotification(id) {
    isLoading = true;
    const response = await deletePushNotification(id);
    if (response?.success) {
      await getMore(null, true);
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  Title.set("Mensagens push");
</script>

{#if isLoading}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{:else}
  <Views.Button
    on:click={newPushNotification}
    bottomPadding={$StatusBar.bottomPadding}
    ><Fa icon={faRocket} /> <span>Enviar mensagem</span></Views.Button
  >
  <Views.Divider />
  {#if pushNotifications && (pushNotifications?.length ?? 0) > 0}
    <section>
      {#each pushNotifications as pushNotification}
        <article>
          <h2>{pushNotification?.title}</h2>
          <div>{pushNotification?.body}</div>
          <div>Enviados: {pushNotification?.sends}</div>
          <div>Falhas: {pushNotification?.fails}</div>
          <div>Abertos: {pushNotification?.opens}</div>
          <div>
            {Utils.Strings.dateToDateString(pushNotification?.createdAt)}
          </div>
        </article>
      {/each}
      <Views.Divider />
      {#if hasMore && !canGetMore}
        <Views.LocalLoading />
      {:else}
        <Views.Button disabled={!hasMore || !canGetMore} on:click={getMore}
          >carregar mais</Views.Button
        >
      {/if}
    </section>
  {:else}
    <Views.CentredMessage
      text="Não há mensagens para exibir por enquanto, Aproveite e mande uma mensagem com um cupom de desconto para incentivar seus clientes!"
    />
  {/if}
{/if}

<Views.MessageAlert object={errorAlert} bind:show={showAlert} />

<style>
  section > article {
    position: relative;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-top: 10px;
    padding: 10px;
  }
  section > article > .remove {
    position: absolute;
    top: -8px;
    right: -10px;
    font-size: 0.9em;
    color: white;
    font-family: RobotoBold;
    border: 1px solid #4c0708;
    background: #4c0708;
    border-radius: 20px;
    width: 25px;
    height: 25px;
    vertical-align: middle;
    text-align: center;
    padding: 4px;
  }
</style>
