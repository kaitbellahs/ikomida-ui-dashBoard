<script>
  import { Title, Navigation, Routes, Menu } from "../../stores/Navigation";
  import Fa from "svelte-fa";
  import { faSync, faRocket } from "@fortawesome/free-solid-svg-icons";
  import { Views, Utils } from "@ikomida/components";
  import { getPushNotifications } from "../../network/PushNotification";
  import { StatusBar } from "../../stores/Setup";
  import { onMount } from "svelte";

  let items;
  let isLoading = false;
  let errorAlert;
  let showAlert = false;
  let localLoading = false;
  let canGetMore = true;

  async function getMore(e, refresh = false) {
    localLoading = true;
    [canGetMore, items] = await getPushNotifications(refresh);
    localLoading = false;
  }

  async function refresh() {
    await getMore(null, true);
  }

  onMount(async () => {
    Menu.addItem({ name: "Atualizar", icon: faSync, callback: refresh });
    isLoading = true;
    [canGetMore, items] = await getPushNotifications();
    isLoading = false;
  });

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  const newPushNotification = async () => {
    Navigation.goTo(Routes.newPushNotification);
  };

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
  {#if items && (items?.length ?? 0) > 0}
    <section>
      {#each items as pushNotification (pushNotification?.createdAt)}
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
      {#if localLoading}
        <Views.LocalLoading />
      {/if}
      {#if canGetMore}
        <Views.Button on:click={getMore}>carregar mais</Views.Button>
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
</style>
