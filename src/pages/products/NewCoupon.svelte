<script>
  import { Title, Navigation, Routes } from "../../stores/Navigation";
  import Fa from "svelte-fa";
  import { faEdit } from "@fortawesome/free-solid-svg-icons";
  import { StatusBar } from "../../stores/Setup";
  import { Views, Types } from "@ikomida/components";
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
  item?.name && (item?.name?.length || 0) <= 255 &&
  item?.validity &&
  ((selectedDiscountType && selectedDiscountType.name !== Types.DiscountTypes.NO) ? (item?.value && (Number(item?.value || 0)) <= 99999999.99) : true) &&
  item?.quantity && (Number(item?.quantity || 0)) <= 2147483647;

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
  <Views.TextEdit name="Nome:" bind:value={item.name} placeHolder="" />
  <Views.TextEdit
    name="Quantidade:"
    bind:value={item.quantity}
    placeHolder=""
  />
  <Views.TextEdit
    type="date"
    name="Validade:"
    bind:value={item.validity}
    placeHolder=""
  />
  <Views.Selector
    bind:selected={selectedDiscountType}
    name="seleciona uma opção"
    options={Types.DiscountTypes.list}
  />
  {#if selectedDiscountType}
    {#if selectedDiscountType.name === Types.DiscountTypes.PERCENT}
      <Views.TextEdit
        type="percent"
        name="Valor:"
        bind:value={item.value}
        placeHolder=""
      />
    {:else if selectedDiscountType.name === Types.DiscountTypes.VALUE}
      <Views.TextEdit
        name="Valor:"
        bind:value={item.value}
        type="currency"
        placeHolder=""
      />
    {/if}
  {/if}
  <Views.Divider />
  <Views.Button disabled={!canContinue} on:click={submit} bottomPadding={$StatusBar.bottomPadding}
    ><Fa icon={faEdit} /> <span>Salvar</span></Views.Button
  >
</div>
<Views.MessageAlert object={errorAlert} bind:show={showAlert} />

<style>
  .coupon {
    padding-bottom: 50px;
  }
</style>
