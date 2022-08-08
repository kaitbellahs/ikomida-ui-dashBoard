<script>
  import { Title, Navigation, Routes } from "../../stores/Navigation";
  import Fa from "svelte-fa";
  import { faEdit } from "@fortawesome/free-solid-svg-icons";
  import { StatusBar } from "../../stores/Setup";
  import { Views, Types, Utils } from "@ikomida/components";
  import { newCoupon } from "../../network/Payment";
  import Cache from "../../stores/Cache";

  const CACHE_NAME = "COUPONS";

  let item = {
    name: null,
    value: null,
    quantity: null,
    validity: null,
  };
  let itemsValidation = {
    name: null,
    value: null,
    quantity: null,
    validity: null,
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
    response = await newCoupon(item);
    if (response?.success) {
      Cache.setObject(CACHE_NAME, null);
      Navigation.reset(Routes.coupons);
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
<div class="coupon">
  <Views.TextEdit
    type="alphanumeric"
    upper={true}
    placeHolder="Nome"
    bind:value={item.name}
    bind:isValid={itemsValidation.name}
    initialValue={item.name}
    min="3"
    max="255"
  />
  <Views.TextEdit
    placeHolder="Quantidade"
    bind:value={item.quantity}
    bind:isValid={itemsValidation.quantity}
    initialValue={item.quantity}
    min="1"
    max="11"
  />
  <Views.TextEdit
    type="date"
    placeHolder="Validade"
    bind:value={item.validity}
    bind:isValid={itemsValidation.validity}
    initialValue={item.validity}
  />
  <Views.Selector
    bind:selected={selectedDiscountType}
    name="selecione uma opção"
    options={Types.DiscountTypes.list}
  />
  {#if selectedDiscountType}
    {#if selectedDiscountType.name === Types.DiscountTypes.PERCENT}
      <Views.TextEdit
        type="percent"
        placeHolder="Valor"
        bind:value={item.value}
        bind:isValid={itemsValidation.value}
        initialValue={item.value}
        min="1"
        max="11"
      />
    {:else if selectedDiscountType.name === Types.DiscountTypes.VALUE}
      <Views.TextEdit
        placeHolder="Valor"
        bind:value={item.value}
        bind:isValid={itemsValidation.value}
        initialValue={item.value}
        type="currency"
        min="1"
        max="11"
      />
    {/if}
  {/if}
  <Views.Divider />
  <Views.Button
    disabled={!canContinue}
    on:click={submit}
    bottomPadding={$StatusBar.bottomPadding}
    ><Fa icon={faEdit} /> <span>Salvar</span></Views.Button
  >
</div>
<Views.MessageAlert object={errorAlert} bind:show={showAlert} />

<style>
  .coupon {
    padding-bottom: 50px;
  }
</style>
