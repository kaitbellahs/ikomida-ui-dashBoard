<script>
  import { Title, Navigation, Routes } from "../../stores/Navigation";
  import Fa from "svelte-fa";
  import { faRocket } from "@fortawesome/free-solid-svg-icons";
  import { StatusBar } from "../../stores/Setup";
  import { Views, Utils } from "@ikomida/components";
  import { newPushNotification } from "../../network/PushNotification";
  import Cache from "../../stores/Cache";

  const CACHE_NAME = "PUSH_NOTIFICATIONS";

  let item = {
    title: null,
    body: null,
  };

  let itemsValidation = {
    title: false,
    body: false,
  };
  let isLoading = false;

  let errorAlert;
  let showAlert = false;
  let selectedDiscountType;
  let oldSelectedDiscountType = null;
  $: if (
    selectedDiscountType &&
    (oldSelectedDiscountType === null ||
      oldSelectedDiscountType?.id !== selectedDiscountType?.id)
  ) {
    item.valueType = selectedDiscountType?.id;
    item.value = 0;
    oldSelectedDiscountType = selectedDiscountType;
  }
  $: canContinue = Utils.Objects.validateFields(itemsValidation);

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  const submit = async () => {
    isLoading = true;
    let response;
    response = await newPushNotification(item);
    if (response?.success) {
      Cache.setObject(CACHE_NAME, null);
      Navigation.reset(Routes.pushNotifications);
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  };
  Title.set("Novo cupom");
</script>

{#if isLoading}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if}
<div class="pushNotification">
  <Views.TextEdit
    placeHolder="Título"
    bind:value={item.title}
    bind:isValid={itemsValidation.title}
    min="3"
    max="55"
  />
  <Views.TextEdit
    type="text"
    placeHolder="texto"
    bind:value={item.body}
    bind:isValid={itemsValidation.body}
    min="1"
    max="255"
  />
  <Views.Divider />
  <Views.Button
    disabled={!canContinue}
    on:click={submit}
    bottomPadding={$StatusBar.bottomPadding}
    ><Fa icon={faRocket} /> <span>Enviar</span></Views.Button
  >
</div>
<Views.MessageAlert object={errorAlert} bind:show={showAlert} />

<style>
  .pushNotification {
    padding-bottom: 50px;
  }
</style>
