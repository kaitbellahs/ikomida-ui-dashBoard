<script lang="ts">
  import { Views, Utils, Logics, Stores, Types } from '@ikomida/shared-frontend'
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
  import { faClock, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
  import { AppLauncher } from '@capacitor/app-launcher'
  import { Clipboard } from '@capacitor/clipboard'
  import { onMount } from 'svelte'

  let paymentGateway: Types.Classes.CVendorPaymentGateway | undefined =
    Types.Classes.CVendorPaymentGateway.fillWith(null)
  let delivery: Types.Classes.CVendorDelivery = Types.Classes.CVendorDelivery.init(false, 0, 0)
  let deliveryInputs: { min?: Views.TextEdit; value?: Views.TextEdit } = { value: undefined, min: undefined }
  let preparation: Types.Classes.CVendorPreparation | undefined = Types.Classes.CVendorPreparation.init(0, 0)
  let preparationInputs: { min?: Views.TextEdit; max?: Views.TextEdit } = { min: undefined, max: undefined }
  let popupNewOrder = $Settings?.popups?.newOrder
  let userInfo: Types.Classes.CUser
  let auth: Stores.Auth.IStore
  let showDeIntegrationPagSeguroAlert = false
  const router = Stores.Navigation.instance.router

  let business: Types.Classes.CBusinessTime | undefined = Types.Classes.CBusinessTime.fromObject({
    days: [],
    hours: []
  })

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

  function toggleDeIntegrationPagSeguroAlert() {
    showDeIntegrationPagSeguroAlert = !showDeIntegrationPagSeguroAlert
  }

  async function updateHours() {
    Stores.Loading.instance.start()
    if (!business?.hours || (business?.hours?.length ?? 0) < 1) {
      Stores.MessageAlert.instance.show('Precisa escolher pelo menos um horário de funcionamento!')
      Stores.Loading.instance.stop()
      return
    }
    for (const businessHour of business?.hours ?? []) {
      if (!Logics.DateTime.validateTime(businessHour?.start)) {
        Stores.MessageAlert.instance.show(
          'O horário de abertura é inválido, o formato deve ser HH:mm e entre 00:00 e 23:59!'
        )
        Stores.Loading.instance.stop()
        return
      } else if (!Logics.DateTime.validateTime(businessHour?.end)) {
        Stores.MessageAlert.instance.show(
          'O horário de fechamento é inválido, o formato deve ser HH:mm e entre 00:00 e 23:59!'
        )
        Stores.Loading.instance.stop()
        return
      } else if (Number(businessHour.start) > Number(businessHour.end)) {
        Stores.MessageAlert.instance.show(
          'O horário de abertura deve ser menor que o horário de fechamento, exemplo de abertura: 09:00 e fechamento: 18:00!'
        )
        Stores.Loading.instance.stop()
        return
      }
    }
    if (business) {
      if (!business.days || business.days.length < 1) {
        Stores.MessageAlert.instance.show('Precisa escolher pelo menos um dia de funcionamento!')
        Stores.Loading.instance.stop()
        return
      }
      let response = await updateBusinessHours(business)
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
    const vendorSettings: Types.Classes.CVendorSettings = Types.Classes.CVendorSettings.fromObject({
      preparation,
      delivery
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
    auth = await Stores.Auth.Auth.instance.store()
    userInfo = await Utils.Jws.extractToken($auth)
    const response = await getSettings()
    if (response.success) {
      const data: Types.Classes.CVendorSettings = Types.Classes.CVendorSettings.fromObject(response.data)
      paymentGateway = data.paymentGateway
      business = data.business
      delivery = Object.assign(delivery, data?.delivery)
      deliveryInputs.min?.updateValue(String(delivery?.min))
      deliveryInputs.value?.updateValue(String(delivery?.value))
      preparation = data?.preparation
      preparationInputs?.min?.updateValue(String(preparation?.min))
      preparationInputs?.max?.updateValue(String(preparation?.max))
    } else {
      Stores.MessageAlert.instance.show(response.data)
    }
    Stores.Loading.instance.stop()
  })

  Stores.Title.instance.set('Seus ajustes')
</script>

<div class="settings">
  <div class="data">
    <Views.DatePeriods mandatory={true} bind:business />
    <Views.Button on:click={updateHours}><Fa icon={faClock} /><span>Atualizar horários</span></Views.Button>
    {#if userInfo?.role === 'VENDOR'}
      <Views.Divider />
      <h2>Portais de pagamentos</h2>
      <Views.Divider />
      <Views.Button on:click={requestPagSeguroIntegration}>{integrateButtonName}</Views.Button>
    {/if}
    <Views.Divider />
    <h2>A entrega</h2>
    <Views.Divider />
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
      <Views.Divider />
    {/if}
    <h3>Valor de entrega</h3>
    <small
      >Vai querer pagar seus entregador quanto por entrega por Km? (o quanto mais você paga seus entregadores ficaram
      felizes e seus clientes tristes e vice versa)</small
    >
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
    <Views.Divider />
    <Views.Button on:click={updateDelivery}>Atualizar a entrega</Views.Button>
    <Views.Divider />
    <h3>Exibir popups</h3>
    <small>Aqui você escolhe quais popups vão ser exibidos a você:</small>
    <Views.Switch name="Mostrar novos pedidos:" bind:checked={popupNewOrder} />
  </div>
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
    padding-bottom: 50px;
  }
  .settings > div {
    width: 100%;
  }
  .settings > div > h2 {
    margin-left: 20px;
  }
  .settings > .data {
    width: 100%;
    float: left;
    margin-top: 20px;
  }
  .twoCells {
    display: flex;
  }
</style>
