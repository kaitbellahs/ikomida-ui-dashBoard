<script lang="ts">
  import Fa from 'svelte-fa'
  import { faEdit } from '@fortawesome/free-solid-svg-icons'
  import { StatusBar } from '../../stores/Setup'
  import { Views, Types, Utils, Stores, Network, Logics } from '@ikomida/shared-frontend'
  import { newCoupon } from '../../network/Payment'
  import { onMount } from 'svelte'
  import { Capacitor } from '@capacitor/core'

  let valueType: Types.Types.TDiscount | null = null
  let item: Types.Classes.CCoupon = Types.Classes.CCoupon.fromObject({
    name: null,
    value: 0,
    valueType: null,
    quantity: null,
    orderTypes: null,
    validity: null
  })
  let itemsValidation = {
    name: false,
    value: false,
    quantity: false,
    validity: false
  }

  $: if (valueType !== item.valueType) {
    valueType = item.valueType
    item.value = 0
  }
  $: canContinue =
    Utils.Objects.validateFields(itemsValidation) &&
    item.valueType !== Types.Types.TDiscount.NO &&
    (item.orderTypes?.length ?? 0) > 0

  const submit = async () => {
    Stores.Loading.instance.start()
    let response
    response = await newCoupon(item)
    if (response?.success) {
      await Network.instance?.clearCache(Stores.Cache.Types.COUPONS)
      Stores.Navigation.instance.pop(1)
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  }

  function validateCouponValidation(date: string) {
    let dateString = `${date.substring(4, 8)}-${date.substring(2, 4)}-${date.substring(0, 2)}`
    if (!Capacitor.isNativePlatform()) {
      dateString = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`
    }
    if (date.length !== 8 || !Logics.Validations.validateDate(dateString) || new Date(dateString) < new Date()) {
      return false
    }
    return true
  }

  onMount(() => {
    Stores.Loading.instance.stop()
  })

  Stores.Title.instance.set('Novo cupom')
</script>

<div class="coupon">
  <Views.TextEdit
    type={Types.TTextEdit.ALPHA_NUMERIC}
    upper={true}
    placeHolder="Nome"
    bind:value={item.name}
    bind:isValid={itemsValidation.name}
    initialValue={item.name}
    min={3}
    max={255}
  />
  <Views.TextEdit
    type={Types.TTextEdit.NUMBER}
    placeHolder="Quantidade"
    bind:value={item.quantity}
    bind:isValid={itemsValidation.quantity}
    initialValue={item.quantity}
    min={1}
    max={11}
  />
  <Views.TextEdit
    type={Types.TTextEdit.DATE}
    placeHolder="Validade"
    bind:value={item.validity}
    bind:isValid={itemsValidation.validity}
    validation={validateCouponValidation}
  />
  <Views.Selector bind:selected={item.valueType} name="selecione uma opção" options={Types.Types.TDiscount.values()} />
  {#if item.valueType}
    {#if item.valueType === Types.Types.TDiscount.PERCENT}
      <Views.TextEdit
        type={Types.TTextEdit.PERCENT}
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
        type={Types.TTextEdit.CURRENCY}
        min={1}
        max={11}
      />
    {/if}
    <Views.TextEdit
      placeHolder="Valor mínimo"
      bind:value={item.minValue}
      initialValue={item.minValue}
      type={Types.TTextEdit.CURRENCY}
      min={1}
      max={11}
    />
  {/if}
  <Views.Divider />
  <Views.CheckBoxList
    title="Tipos dos pedidos"
    bind:selected={item.orderTypes}
    options={Types.Types.TOrderType.values()}
  />
  <Views.Divider />
  <Views.Button disabled={!canContinue} on:click={submit} bottomPadding={$StatusBar.bottomPadding}
    ><Fa icon={faEdit} /> <span>Salvar</span></Views.Button
  >
</div>

<style>
  .coupon {
    padding-bottom: 48px;
  }
</style>
