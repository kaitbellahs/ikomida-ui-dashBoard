<script lang="ts">
  import { Views, Utils, Stores, Types } from '@ikomida/shared-frontend'
  import { getSettings, setSettings } from '../../network/Settings'
  import { StatusBar } from '../../stores/Setup'
  import { onMount } from 'svelte'
  import Fa from 'svelte-fa'
  import { faEdit, faSearch } from '@fortawesome/free-solid-svg-icons'
  import { GetAddressByCep } from '../../network/Staff'

  interface IProfileInputs {
    phone: Views.TextEdit | null
    email: Views.TextEdit | null
    address: {
      postalCode: Views.TextEdit | null
      street: Views.TextEdit | null
      number: Views.TextEdit | null
      complement: Views.TextEdit | null
      neighborhood: Views.TextEdit | null
      city: Views.TextEdit | null
      stat: Views.TextEdit | null
    }
  }

  let profile: Types.Classes.CVendorProfile = Types.Classes.CVendorProfile.fillWith(null)

  let profileInputs = {
    phone: null,
    email: null,
    address: {
      postalCode: null,
      street: null,
      number: null,
      complement: null,
      neighborhood: null,
      city: null,
      stat: null
    }
  } as IProfileInputs
  let profileValidation = {
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
  let currentPostalCode: string | null = null

  $: canProceed = Utils.Objects.validateFields(profileValidation)

  $: if ((profile.address?.postalCode?.length ?? 0) === 8 && profile?.address?.postalCode != currentPostalCode) {
    // findAddress();
  }

  function findAddress() {
    Stores.Loading.instance.start()
    currentPostalCode = profile?.address?.postalCode
    GetAddressByCep(profile.address.postalCode)
      .then(response => {
        if (response?.success) {
          const address = response?.data
          currentPostalCode = address?.postalCode
          profile.address = { ...profile?.address, ...address }
          Utils?.Objects?.updateInputs(profileInputs, profile)
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
    if (!Utils.Objects.validateFields(profileValidation) || !profile.validate()) {
      Stores.MessageAlert.instance.show('Por favor preenche os dados do formulario corretamente')
      return
    }
    Stores.Loading.instance.start()
    let response = await setSettings(profile)
    Stores.MessageAlert.instance.show(
      response?.success ? 'As informações do estabelecimento foram atualizadas com sucesso' : response?.data
    )
    Stores.Loading.instance.stop()
  }

  onMount(async () => {
    Stores.Loading.instance.start()
    const response = await getSettings()
    if (response?.success) {
      currentPostalCode = response?.data?.profile?.address?.postalCode
      profile = Types.Classes.CVendorProfile.fromObject({ ...profile.toJSON(), ...response?.data?.profile.toJSON() })
      Utils.Objects.updateInputs(profileInputs, profile.toJSON())
      Stores.Loading.instance.stop()
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  })

  Stores.Title.instance.set('O estabelecimento')
</script>

<div class="profile">
  <Views.UploadablePhoto
    type={Types.TUploadablePhoto.VENDOR}
    bind:image={profile.mainPicture}
    title={profile?.contractName}
  />
  <div class="data">
    <h2>{profile?.contractName}</h2>
    <Views.Divider />
    <Views.TextValue
      text="CNPJ:"
      value={Utils?.Strings?.formatString(/\d/gi, '__.___.___/____-__', '_', profile?.contractIdentity)}
      fontSize="1.3em"
      leftMargin={30}
    />
    <Views.TextEdit
      type={Types.TTextEdit.PHONE}
      bind:value={profile.phone}
      bind:isValid={profileValidation.phone}
      initialValue={profile?.phone}
      placeHolder="Telefone"
      bind:this={profileInputs.phone}
    />
    <Views.TextEdit
      type={Types.TTextEdit.EMAIL}
      bind:value={profile.email}
      bind:isValid={profileValidation.email}
      initialValue={profile?.email}
      placeHolder="Email"
      bind:this={profileInputs.email}
    />
    <Views.Divider />
    <h2>Endereço</h2>
    <Views.TextEdit
      type={Types.TTextEdit.CEP}
      callback={findAddress}
      buttonIcon={faSearch}
      bind:value={profile.address.postalCode}
      bind:this={profileInputs.address.postalCode}
      bind:isValid={profileValidation.address.postalCode}
      placeHolder="CEP"
    />
    <Views.TextEdit
      disabled={true}
      placeHolder="Endereço"
      bind:value={profile.address.street}
      bind:this={profileInputs.address.street}
      bind:isValid={profileValidation.address.street}
      min={2}
      max={255}
    />
    <Views.TextEdit
      placeHolder="Número"
      bind:value={profile.address.number}
      bind:this={profileInputs.address.number}
      bind:isValid={profileValidation.address.number}
      min={1}
      max={255}
      empty={!profileValidation.address.postalCode}
    />
    <Views.TextEdit
      placeHolder="Complemento"
      bind:value={profile.address.complement}
      bind:this={profileInputs.address.complement}
    />
    <Views.TextEdit
      disabled={true}
      placeHolder="Bairro"
      bind:value={profile.address.neighborhood}
      bind:isValid={profileValidation.address.neighborhood}
      bind:this={profileInputs.address.neighborhood}
      min={2}
      max={255}
    />
    <Views.TextEdit
      disabled={true}
      placeHolder="Cidade"
      bind:value={profile.address.city}
      bind:isValid={profileValidation.address.city}
      bind:this={profileInputs.address.city}
      min={2}
      max={255}
    />
    <Views.TextEdit
      disabled={true}
      placeHolder="UF"
      bind:value={profile.address.stat}
      bind:this={profileInputs.address.stat}
      bind:isValid={profileValidation.address.stat}
      min={2}
      max={2}
    />
    <Views.Divider />
    <Views.Button disabled={!canProceed} on:click={submit} bottomPadding={$StatusBar.bottomPadding}
      ><Fa icon={faEdit} /> <span>Atualizar</span></Views.Button
    >
  </div>
</div>

<!-- {#if profile === {} || isLoading}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if} -->
<style>
  .profile > div {
    width: 100%;
  }
  .profile > div > h2 {
    margin-left: 20px;
  }
  .profile > .data {
    width: 100%;
    float: left;
    margin-top: 20px;
  }

  .profile > .data > h2 {
    text-align: center;
  }
</style>
