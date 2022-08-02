<script>
  import { Title, Navigation, Routes } from "../../stores/Navigation";
  import Fa from "svelte-fa";
  import { faEdit } from "@fortawesome/free-solid-svg-icons";
  import { StatusBar } from "../../stores/Setup";
  import { Views, Types, Utils } from "@ikomida/components";
  import { newCoupon } from "../../network/Payment";

  let item = {
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
  $: canContinue =
    item?.name &&
    (item?.name?.length ?? 0) <= 255 &&
    item?.validity &&
    selectedDiscountType &&
    selectedDiscountType.name !== Types.DiscountTypes.NO &&
    item?.value &&
    Utils.Numbers.toFinanceNumber(item?.value ?? 0) <= 99999999.99 &&
    item?.quantity &&
    Utils.Numbers.toFinanceNumber(item?.quantity ?? 0) <= 2147483647;

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  const submit = async () => {
    isLoading = true;
    let response;
    response = await newCoupon(item);
    if (response?.success) {
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
  <Views.TextEdit placeHolder="Nome" bind:value={item.name}
    initialValue={item.name} />
  <Views.TextEdit
    placeHolder="Quantidade"
    bind:value={item.quantity}
    initialValue={item.quantity}
   
  />
  <Views.TextEdit
    type="date"
    placeHolder="Validade"
    bind:value={item.validity}
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
    initialValue={item.value}
       
      />
    {:else if selectedDiscountType.name === Types.DiscountTypes.VALUE}
      <Views.TextEdit
        placeHolder="Valor"
        bind:value={item.value}
    initialValue={item.value}
        type="currency"
       
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
