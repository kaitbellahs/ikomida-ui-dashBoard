<script lang="ts">
  import Fa from 'svelte-fa'
  import { faEdit, faSearch } from '@fortawesome/free-solid-svg-icons'
  import { StatusBar } from '../../stores/Setup'
  import { Views, Utils, Stores, Types, Network } from '@ikomida/shared-frontend'
  import { addStaff, GetAddressByCep } from '../../network/Staff'
  import { onMount } from 'svelte'

  interface IitemInputs {
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

  let item: Types.Classes.CUser = Types.Classes.CUser.fillWith(undefined)
  let itemInputs: IitemInputs = {
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
  let itemValidation = {
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

  $: if ((item.address?.postalCode?.length ?? 0) === 8 && item?.address?.postalCode != currentPostalCode) {
    findAddress()
  }
  $: canProceed = Utils.Objects.validateFields(itemValidation)

  function findAddress() {
    Stores.Loading.instance.start()
    currentPostalCode = item?.address?.postalCode
    GetAddressByCep(item.address?.postalCode ?? '')
      .then(response => {
        if (response?.success) {
          const address = response?.data
          currentPostalCode = address?.postalCode
          item.address = { ...item?.address, ...address }
          Utils?.Objects?.updateInputs(itemInputs, item)
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
    if (!Utils.Objects.validateFields(itemValidation)) {
      Stores.MessageAlert.instance.show('Por favor preenche os dados do formulario corretamente')
      return
    }
    Stores.Loading.instance.start()
    let response = await addStaff(item)
    if (response.success) {
      await Network.instance?.clearCache(Stores.Cache.Types.STAFF)
      Stores.Navigation.instance.pop()
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  }

  onMount(() => {
    item.areaCode = '55'
    Stores.Loading.instance.stop()
  })

  Stores.Title.instance.set('Novo colaborador')
</script>

<div class="staff">
  <h2>Dados pessoais</h2>
  <Views.Selector bind:selected={item.role} options={Types.Types.TRoles.vendors} name="Tipo do colaborador" />
  <Views.TextEdit
    placeHolder="Nome"
    bind:value={item.name}
    bind:this={itemInputs.name}
    bind:isValid={itemValidation.name}
    type={Types.TTextEdit.NAME}
    min={2}
    max={255}
  />
  <Views.TextEdit
    placeHolder="Sobrenome"
    bind:value={item.lastName}
    bind:this={itemInputs.lastName}
    bind:isValid={itemValidation.lastName}
    type={Types.TTextEdit.NAME}
    min={2}
    max={255}
  />
  <Views.TextEdit
    placeHolder="Email"
    bind:value={item.email}
    bind:isValid={itemValidation.email}
    bind:this={itemInputs.email}
    type={Types.TTextEdit.EMAIL}
  />
  <Views.TextEdit
    bind:value={item.phone}
    bind:this={itemInputs.phone}
    bind:isValid={itemValidation.phone}
    type={Types.TTextEdit.PHONE}
    placeHolder="Número de celular"
  />
  <Views.TextEdit
    placeHolder="CPF"
    type={Types.TTextEdit.CPF}
    bind:value={item.identity}
    bind:this={itemInputs.identity}
    bind:isValid={itemValidation.identity}
  />
  {#if item.address}
    <Views.Divider />
    <h2>Endereço</h2>
    <Views.TextEdit
      type={Types.TTextEdit.CEP}
      callback={findAddress}
      buttonIcon={faSearch}
      bind:value={item.address.postalCode}
      bind:this={itemInputs.address.postalCode}
      bind:isValid={itemValidation.address.postalCode}
      placeHolder="CEP"
    />
    <Views.TextEdit
      disabled={true}
      placeHolder="Endereço"
      bind:value={item.address.street}
      bind:this={itemInputs.address.street}
      bind:isValid={itemValidation.address.street}
      min={2}
      max={255}
    />
    <Views.TextEdit
      placeHolder="Número"
      bind:value={item.address.number}
      bind:this={itemInputs.address.number}
      bind:isValid={itemValidation.address.number}
      min={1}
      max={255}
      empty={!itemValidation.address.postalCode}
    />
    <Views.TextEdit
      placeHolder="Complemento"
      bind:value={item.address.complement}
      bind:this={itemInputs.address.complement}
    />
    <Views.TextEdit
      disabled={true}
      placeHolder="Bairro"
      bind:value={item.address.neighborhood}
      bind:isValid={itemValidation.address.neighborhood}
      bind:this={itemInputs.address.neighborhood}
      min={2}
      max={255}
    />
    <Views.TextEdit
      disabled={true}
      placeHolder="Cidade"
      bind:value={item.address.city}
      bind:isValid={itemValidation.address.city}
      bind:this={itemInputs.address.city}
      min={2}
      max={255}
    />
    <Views.TextEdit
      disabled={true}
      placeHolder="UF"
      bind:value={item.address.stat}
      bind:this={itemInputs.address.stat}
      bind:isValid={itemValidation.address.stat}
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
