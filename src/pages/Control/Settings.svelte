<script lang="ts">
  import { Views, Utils, Stores, Types } from '@ikomida/shared-frontend'
  import {
    getSettings,
    updatePaymentGateway,
    updateBusinessHours,
    setDelivery,
    getPagSeguroUrl,
    revokePaymentGateway
  } from '../../network/Settings'
  import { Settings } from '../../stores/Setup'
  import Fa from 'svelte-fa'
  import { faClock } from '@fortawesome/free-solid-svg-icons'
  import { AppLauncher } from '@capacitor/app-launcher'
  import { Clipboard } from '@capacitor/clipboard'
  import { onMount } from 'svelte'

  let paymentGateway: Types.Classes.CVendorPaymentGateway | undefined =
    Types.Classes.CVendorPaymentGateway.fillWith(null)
  let delivery: Types.Classes.CVendorDelivery = Types.Classes.CVendorDelivery.init(false, 9, 0, 0)
  let deliveryInputs: {
    min?: Views.TextEdit
    value?: Views.TextEdit
    orderMinValue?: Views.TextEdit
  } = { value: undefined, min: undefined, orderMinValue: undefined }
  let preparation: Types.Classes.CVendorPreparation | undefined = Types.Classes.CVendorPreparation.init(0, 0)
  let preparationInputs: { min?: Views.TextEdit; max?: Views.TextEdit } = { min: undefined, max: undefined }
  let popupNewOrder = $Settings?.popups?.newOrder
  let userInfo: Types.Classes.CUser
  let auth: Stores.Auth.IStore
  let showDeIntegrationPagSeguroAlert = false
  let ExpandableBox: Stores.ExpandableBox
  const router = Stores.Navigation.instance.router

  let business: Types.Classes.CBusinessTime[] = Types.Classes.CBusinessTime.fromObject([])

  let order: { types: Types.Types.TOrderType[] | undefined; tip: number | undefined } = { types: [], tip: 0 }
  let orderInputs: { tip?: Views.TextEdit } = { tip: undefined }

  let integratePagSeguro = { callback: false, url: null }

  $: if (popupNewOrder || !popupNewOrder) {
    $Settings.popups.newOrder = popupNewOrder
    Settings.set($Settings)
  }

  $: if ($router.options) {
    integratePagSeguro = {
      ...integratePagSeguro,
      ...$router.options
    }
  }

  $: if (integratePagSeguro.callback) {
    integratePagSeguro.callback = false
    if (integratePagSeguro.url) {
      Stores.Loading.instance.start()
      Stores.MessageAlert.instance.hide()
      const url = new URL(integratePagSeguro.url)
      const code = url.searchParams.get('code')
      const state = url.searchParams.get('state')
      const payload = { code, state }
      updatePaymentGateway(payload).then(response => {
        if (!response.success) {
          Stores.MessageAlert.instance.show(response.data)
        } else {
          paymentGateway = Types.Classes.CVendorPaymentGateway.fromObject(response.data)
          Stores.MessageAlert.instance.show(`${(response.data as any)?.type} foi integrado com sucesso`)
        }
        Stores.Loading.instance.reset()
      })
    }
  }

  $: integrateButtonName = paymentGateway?.integrated
    ? 'Cancelar a integgração com pagseguro'
    : 'Integrar sua conta pagseguro'

  $: if ($ExpandableBox) {
    updateInputs()
  }

  function updateInputs() {
    deliveryInputs.min?.updateValue?.(String(delivery?.min))
    deliveryInputs.orderMinValue?.updateValue?.(String(delivery?.orderMinValue))
    deliveryInputs.value?.updateValue?.(String(delivery?.value))
    preparationInputs?.min?.updateValue?.(String(preparation?.min))
    preparationInputs?.max?.updateValue?.(String(preparation?.max))
    business = business
  }

  function toggleDeIntegrationPagSeguroAlert() {
    showDeIntegrationPagSeguroAlert = !showDeIntegrationPagSeguroAlert
  }

  async function updateHours() {
    Stores.Loading.instance.start()
    if (business && Utils.Objects.validateBusinessTime(business)) {
      let response = await updateBusinessHours(
        business.filter(expedient => expedient && JSON.stringify(expedient.toJSON()) !== '{}')
      )
      if (response.success) {
        Stores.MessageAlert.instance.show('O horário de funcionamento atualizado com sucesso!')
      } else {
        Stores.MessageAlert.instance.show(response.data)
        Stores.Loading.instance.stop()
        return
      }
    }
    Stores.Loading.instance.stop()
  }

  async function updateDelivery() {
    if ((preparation?.min ?? 0) > (preparation?.max ?? 0)) {
      Stores.MessageAlert.instance.show(`O tempo máximo de preparação deve ser maior ou igual ao tempo mínimo!`)
      return
    }
    const vendorSettings: Types.Classes.CVendorSettings = Types.Classes.CVendorSettings.fromObject({
      preparation,
      delivery,
      orderTypes: order.types,
      tip: order.tip
    })
    if (!vendorSettings.validate()) {
      Stores.MessageAlert.instance.show(`Algum dos dados fornecidos não é válido!`)
      return
    }
    Stores.Loading.instance.start()
    const response = await setDelivery(vendorSettings)
    if (!response.success) {
      Stores.MessageAlert.instance.show(response.data)
    }
    Stores.Loading.instance.stop()
  }

  async function deIntegrationPagSeguro() {
    const response = await revokePaymentGateway()
    if (response.success) {
      paymentGateway = Types.Classes.CVendorPaymentGateway.fromObject(response.data)
      Stores.MessageAlert.instance.show(
        `A integração dos nossos nossos sistemas com sua conta no pagseguro foi revogada com sucesso!`
      )
    } else {
      Stores.MessageAlert.instance.show(`Não foi possível revogar a integração, tente novamente mais tarde!`)
    }
  }

  async function requestPagSeguroIntegration() {
    Stores.Loading.instance.start()
    if (paymentGateway?.integrated) {
      toggleDeIntegrationPagSeguroAlert()
    } else {
      const response = await getPagSeguroUrl()
      if (response.success) {
        const url = (response.data as any)?.url
        if (!url) {
          Stores.MessageAlert.instance.show(`Não foi possível obter a url de integração, tente novamente mais tarde!`)
          return
        }
        const { value } = await AppLauncher.canOpenUrl({ url })
        if (value) {
          await AppLauncher.openUrl({ url })
        } else {
          await AppLauncher.openUrl({ url })
          await Clipboard.write({ string: url })
          Stores.MessageAlert.instance.show(
            `Se o navegador externo no for aberto automaticamente, por favor o abra e digita esa URL: ${url}, que também foi copiado para sua área de transferência!`
          )
        }
      }
    }
    Stores.Loading.instance.stop()
    return null
  }

  onMount(async () => {
    ExpandableBox = Stores.ExpandableBox.createInstance().store
    auth = await Stores.Auth.Auth.instance.store()
    userInfo = Types.Classes.CUser.fromObject(await Utils.Jws.extractToken($auth))
    const response = await getSettings()
    if (response.success) {
      const data: Types.Classes.CVendorSettings = Types.Classes.CVendorSettings.fromObject(response.data)
      paymentGateway = data.paymentGateway
      if (data.business) {
        business = Types.Classes.CBusinessTime.fromObject(data.business)
      }
      delivery = Object.assign(delivery, data?.delivery)
      preparation = data?.preparation
      order.types = data?.orderTypes
      order.tip = data?.tip
      updateInputs()
    } else {
      Stores.MessageAlert.instance.show(response.data)
    }
    Stores.Loading.instance.stop()
  })

  Stores.Title.instance.set('Seus ajustes')
</script>

<div class="settings">
  <Views.ExpandableBox title="Expediente" expand={true}>
    <Views.DatePeriods mandatory={true} bind:value={business} />
    <Views.Divider height={8} />
    <Views.Button on:click={updateHours}><Fa icon={faClock} /><span>Salvar horários</span></Views.Button>
  </Views.ExpandableBox>
  {#if userInfo?.role === Types.Types.TRoles.VENDOR}
    <Views.ExpandableBox title="Pagamentos">
      <Views.Divider height={16} />
      <p>Conecte sua conta do PagSeguro aqui para poder receber pagamentos via cartão de crédito online.</p>
      <Views.Divider height={8} />
      <Views.Button on:click={requestPagSeguroIntegration}>{integrateButtonName}</Views.Button>
    </Views.ExpandableBox>
  {/if}
  <Views.ExpandableBox title="Delivery">
    <Views.Divider height={16} />
    <h3>Tempo de preparação em minutos</h3>
    <small>Quanto tempo você vai precisar para preparar seus pedidos em média?</small>
    {#if preparation}
      <div class="twoCells">
        <Views.TextEdit
          placeHolder="Tempo mínimo"
          bind:value={preparation.min}
          bind:this={preparationInputs.min}
          initialValue={preparation.min}
          type={Types.TTextEdit.NUMBER}
          rightPadding={10}
        />
        <Views.TextEdit
          placeHolder="Tempo máximo"
          bind:value={preparation.max}
          bind:this={preparationInputs.max}
          initialValue={preparation.max}
          type={Types.TTextEdit.NUMBER}
          leftPadding={10}
        />
      </div>
    {/if}
    <Views.Divider />
    <Views.CheckBoxList
      title="Tipos dos pedidos"
      bind:selected={order.types}
      options={Types.Types.TOrderType.values()}
    />
    {#if order.types?.includes(Types.Types.TOrderType.DELIVERY)}
      <Views.Divider />
      <h3>Valor de entrega</h3>
      <small
        >Vai querer pagar seus entregador quanto por entrega por Km? (o quanto mais você paga seus entregadores ficaram
        felizes e seus clientes tristes e vice versa)</small
      >
      <Views.TextEdit
        type={Types.TTextEdit.CURRENCY}
        bind:value={delivery.orderMinValue}
        bind:this={deliveryInputs.orderMinValue}
        initialValue={delivery.orderMinValue}
        placeHolder="Valor mínimo dos pedidos"
      />
      <Views.Switch name="Frete grátis" bind:checked={delivery.free} />
      {#if !(delivery?.free || false)}
        <Views.TextEdit
          type={Types.TTextEdit.CURRENCY}
          bind:value={delivery.value}
          bind:this={deliveryInputs.value}
          initialValue={delivery.value}
          placeHolder="Valor por KM"
        />
        <Views.TextEdit
          type={Types.TTextEdit.CURRENCY}
          bind:value={delivery.min}
          bind:this={deliveryInputs.min}
          initialValue={delivery.min}
          placeHolder="Valor mínimo"
        />
      {/if}
    {/if}
    {#if order.types?.includes(Types.Types.TOrderType.LOCAL)}
      <Views.TextEdit
        type={Types.TTextEdit.PERCENT}
        bind:value={order.tip}
        bind:this={orderInputs.tip}
        initialValue={order.tip}
        placeHolder="Percentagem da gorjeta"
      />
    {/if}
    <Views.Divider />
    <Views.Button on:click={updateDelivery}>Salvar</Views.Button>
  </Views.ExpandableBox>
  <Views.ExpandableBox title="Exibir popups">
    <Views.Divider height={16} />
    <small>Aqui você escolhe quais popups vão ser exibidos a você:</small>
    <Views.Switch name="Mostrar novos pedidos:" bind:checked={popupNewOrder} />
  </Views.ExpandableBox>
</div>
{#if showDeIntegrationPagSeguroAlert}
  <Views.Alert
    title="Alerta"
    message={`Você quer realmente desfazer a integração dos nossos sistemas com a sua conta pagseguro?`}
    closeCallBack={toggleDeIntegrationPagSeguroAlert}
    buttons={[
      {
        name: 'Sim',
        callback: deIntegrationPagSeguro
      },
      {
        name: 'Não quero',
        callback: toggleDeIntegrationPagSeguroAlert,
        principal: true
      }
    ]}
  />
{/if}

<Views.GTerms />

<style>
  .settings {
    padding-bottom: 48pt;
  }
  .settings > div {
    width: 100%;
  }
  .twoCells {
    display: flex;
  }
</style>
