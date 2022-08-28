<script>
  import Routes from "../../stores/Routes";
  import Fa from "svelte-fa";
  import { faEdit } from "@fortawesome/free-solid-svg-icons";
  import { StatusBar } from "../../stores/Setup";
  import { Views, Types, Utils, Stores } from "@ikomida/components";
  import { newCoupon } from "../../network/Payment";
  import { onMount } from "svelte";

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

  const submit = async () => {
    Stores.Loading.instance.start();
    let response;
    response = await newCoupon(item);
    if (response?.success) {
      Stores.Navigation.instance.pop(Routes.coupons);
    } else {
      Stores.MessageAlert.instance.show(response?.data);
    }
    Stores.Loading.instance.stop();
  };
  onMount(() => {
    Stores.Loading.instance.stop();
  });
  Stores.Title.instance.set("Novo cupom");
</script>

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
    {#if selectedDiscountType.id === Types.DiscountTypes.PERCENT}
      <Views.TextEdit
        type="percent"
        placeHolder="Valor"
        bind:value={item.value}
        bind:isValid={itemsValidation.value}
        initialValue={item.value}
        min="1"
        max="11"
      />
    {:else if selectedDiscountType.id === Types.DiscountTypes.VALUE}
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

<style>
  .coupon {
    padding-bottom: 50px;
  }
</style>
