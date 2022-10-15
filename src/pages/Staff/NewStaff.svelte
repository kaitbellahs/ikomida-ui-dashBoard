<script lang="ts">
  import Fa from 'svelte-fa'
  import { faEdit, faSearch } from '@fortawesome/free-solid-svg-icons'
  import { StatusBar } from '../../stores/Setup'
  import { Views, Utils, Stores, Types, Network } from '@ikomida/shared-frontend'
  import { addStaff, GetAddressByCep } from '../../network/Staff'
  import { onMount } from 'svelte'

  interface IItemsInputs {
    name: Views.TextEdit | undefined
    lastName: Views.TextEdit | undefined
    identity: Views.TextEdit | undefined
    phone: Views.TextEdit | undefined
    email: Views.TextEdit | undefined
    address: {
      postalCode: Views.TextEdit | undefined
      street: Views.TextEdit | undefined
      number: Views.TextEdit | undefined
      complement: Views.TextEdit | undefined
      neighborhood: Views.TextEdit | undefined
      city: Views.TextEdit | undefined
      stat: Views.TextEdit | undefined
    }
  }

  let items: Types.Classes.CUser = Types.Classes.CUser.fillWith(undefined)
  let itemsInputs: IItemsInputs = {
    name: undefined,
    lastName: undefined,
    identity: undefined,
    phone: undefined,
    email: undefined,
    address: {
      postalCode: undefined,
      street: undefined,
      number: undefined,
      complement: undefined,
      neighborhood: undefined,
      city: undefined,
      stat: undefined
    }
  }
  let itemsValidation = {
    name: false,
    lastName: false,
    identity: false,
    phone: false,
    email: false,
    address: {
      postalCode: false,
      street: false,
      number: false,
      neighborhood: false,
      city: false,
      stat: false
    }
  }
  let currentPostalCode: string | undefined = undefined

  $: if ((items.address?.postalCode?.length ?? 0) === 8 && items?.address?.postalCode != currentPostalCode) {
    findAddress()
  }
  $: canProceed = Utils.Objects.validateFields(itemsValidation)

  function findAddress() {
    Stores.Loading.instance.start()
    currentPostalCode = items?.address?.postalCode
    GetAddressByCep(items.address?.postalCode ?? '')
      .then(response => {
        if (response?.success) {
          const address = response?.data
          currentPostalCode = address?.postalCode
          items.address = { ...items?.address, ...address }
          Utils?.Objects?.updateInputs(itemsInputs, items)
        } else {
          Stores.MessageAlert.instance.show(response?.data)
        }
        Stores.Loading.instance.stop()
      })
      .catch(exception => {
        Stores.MessageAlert.instance.show(exception)
      })
  }

  const submit = async () => {
    if (!Utils.Objects.validateFields(itemsValidation)) {
      Stores.MessageAlert.instance.show('Por favor preenche os dados do formulario corretamente')
      return
    }
    Stores.Loading.instance.start()
    let response = await addStaff(items)
    if (response.success) {
      await Network.instance?.clearCache(Stores.Cache.Types.STAFF)
      Stores.Navigation.instance.pop()
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  }

  onMount(() => {
    Stores.Loading.instance.stop()
  })

  Stores.Title.instance.set('Novo colaborador')
</script>

<div class="staff">
  <h2>Dados pessoais</h2>
  <Views.TextEdit
    placeHolder="Nome"
    bind:value={items.name}
    bind:this={itemsInputs.name}
    bind:isValid={itemsValidation.name}
    type={Types.TTextEdit.NAME}
    min={2}
    max={255}
  />
  <Views.TextEdit
    placeHolder="Sobre nome"
    bind:value={items.lastName}
    bind:this={itemsInputs.lastName}
    bind:isValid={itemsValidation.lastName}
    type={Types.TTextEdit.NAME}
    min={2}
    max={255}
  />
  <Views.TextEdit
    placeHolder="Email"
    bind:value={items.email}
    bind:isValid={itemsValidation.email}
    bind:this={itemsInputs.email}
    type={Types.TTextEdit.EMAIL}
  />
  <Views.TextEdit
    bind:value={items.phone}
    bind:this={itemsInputs.phone}
    bind:isValid={itemsValidation.phone}
    type={Types.TTextEdit.PHONE}
    placeHolder="Número de celular"
  />
  <Views.TextEdit
    placeHolder="CPF"
    type={Types.TTextEdit.CPF}
    bind:value={items.identity}
    bind:this={itemsInputs.identity}
    bind:isValid={itemsValidation.identity}
  />
  {#if items.address}
    <Views.Divider />
    <h2>Endereço</h2>
    <Views.TextEdit
      type={Types.TTextEdit.CEP}
      callback={findAddress}
      buttonIcon={faSearch}
      bind:value={items.address.postalCode}
      bind:this={itemsInputs.address.postalCode}
      bind:isValid={itemsValidation.address.postalCode}
      placeHolder="CEP"
    />
    <Views.TextEdit
      disabled={true}
      placeHolder="Endereço"
      bind:value={items.address.street}
      bind:this={itemsInputs.address.street}
      bind:isValid={itemsValidation.address.street}
      min={2}
      max={255}
    />
    <Views.TextEdit
      placeHolder="Número"
      bind:value={items.address.number}
      bind:this={itemsInputs.address.number}
      bind:isValid={itemsValidation.address.number}
      min={1}
      max={255}
      empty={!itemsValidation.address.postalCode}
    />
    <Views.TextEdit
      placeHolder="Complemento"
      bind:value={items.address.complement}
      bind:this={itemsInputs.address.complement}
    />
    <Views.TextEdit
      disabled={true}
      placeHolder="Bairro"
      bind:value={items.address.neighborhood}
      bind:isValid={itemsValidation.address.neighborhood}
      bind:this={itemsInputs.address.neighborhood}
      min={2}
      max={255}
    />
    <Views.TextEdit
      disabled={true}
      placeHolder="Cidade"
      bind:value={items.address.city}
      bind:isValid={itemsValidation.address.city}
      bind:this={itemsInputs.address.city}
      min={2}
      max={255}
    />
    <Views.TextEdit
      disabled={true}
      placeHolder="UF"
      bind:value={items.address.stat}
      bind:this={itemsInputs.address.stat}
      bind:isValid={itemsValidation.address.stat}
      min={2}
      max={2}
    />
  {/if}
  <Views.Divider />
  <Views.Button disabled={!canProceed} on:click={submit} bottomPadding={$StatusBar.bottomPadding}
    ><Fa icon={faEdit} /> <span>Adicionar</span></Views.Button
  >
</div>

<style>
</style>
