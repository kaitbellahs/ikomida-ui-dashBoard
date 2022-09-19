<script lang="ts">
  import Routes from '../../stores/Routes';
  import Fa from 'svelte-fa';
  import { faEdit } from '@fortawesome/free-solid-svg-icons';
  import { StatusBar } from '../../stores/Setup';
  import { Views, Types, Utils, Stores } from '@ikomida/shared-frontend';
  import { newCoupon } from '../../network/Payment';
  import { onMount } from 'svelte';

  let item: Types.Classes.CCoupon = Types.Classes.CCoupon.fromObject({
    name: null,
    value: null,
    valueType: null,
    quantity: null,
    validity: null,
  });
  let itemsValidation = {
    name: false,
    value: false,
    quantity: false,
    validity: false,
  };
  $: if (item.valueType) {
    item.value = 0;
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
  Stores.Title.instance.set('Novo cupom');
</script>

<div class="coupon">
  <Views.TextEdit
    type="alphanumeric"
    upper={true}
    placeHolder="Nome"
    bind:value={item.name}
    bind:isValid={itemsValidation.name}
    initialValue={item.name}
    min={3}
    max={255}
  />
  <Views.TextEdit
    type="number"
    placeHolder="Quantidade"
    bind:value={item.quantity}
    bind:isValid={itemsValidation.quantity}
    initialValue={item.quantity}
    min={1}
    max={11}
  />
  <Views.TextEdit
    type="date"
    placeHolder="Validade"
    bind:value={item.validity}
    bind:isValid={itemsValidation.validity}
  />
  <Views.Selector bind:selected={item.valueType} name="selecione uma opção" options={Types.Types.TDiscount.values()} />
  {#if item.valueType}
    {#if item.valueType === Types.Types.TDiscount.PERCENT}
      <Views.TextEdit
        type="percent"
        placeHolder="Valor"
        bind:value={item.value}
        bind:isValid={itemsValidation.value}
        initialValue={item.value}
        min={1}
        max={11}
      />
    {:else if item.valueType === Types.Types.TDiscount.VALUE}
      <Views.TextEdit
        placeHolder="Valor"
        bind:value={item.value}
        bind:isValid={itemsValidation.value}
        initialValue={item.value}
        type="currency"
        min={1}
        max={11}
      />
    {/if}
  {/if}
  <Views.Divider />
  <Views.Button disabled={!canContinue} on:click={submit} bottomPadding={$StatusBar.bottomPadding}
    ><Fa icon={faEdit} /> <span>Salvar</span></Views.Button
  >
</div>

<style>
  .coupon {
    padding-bottom: 50px;
  }
</style>
