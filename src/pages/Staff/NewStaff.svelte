<script>
  import { Title, Navigation } from "../../stores/Navigation";
  import Fa from "svelte-fa";
  import { faEdit, faSearch, faPhone } from "@fortawesome/free-solid-svg-icons";
  import { StatusBar } from "../../stores/Setup";
  import { Views, Utils } from "@ikomida/components";
  import { addStaff, GetAddressByCep } from "../../network/Staff";

  let items = {
    name: null,
    lastName: null,
    cpf: null,
    areaCode: 55,
    phone: null,
    email: null,
    address: {
      postalCode: null,
      street: null,
      number: null,
      complement: null,
      neighborhood: null,
      city: null,
      stat: null,
    },
  };
  let itemsInputs = {
    name: null,
    lastName: null,
    cpf: null,
    phone: null,
    email: null,
    address: {
      postalCode: null,
      street: null,
      number: null,
      complement: null,
      neighborhood: null,
      city: null,
      stat: null,
    },
  };
  $: canProceed = Utils.Objects.validateFields(itemsValidation);
  let itemsValidation = {
    name: false,
    lastName: false,
    cpf: false,
    phone: false,
    email: false,
    address: {
      postalCode: false,
      street: false,
      number: false,
      neighborhood: false,
      city: false,
      stat: false,
    },
  };
  let isLoading = false;
  let currentPostalCode = null;
  let errorAlert;
  let showAlert = false;
  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  $: if (
    (items?.address?.postalCode?.length ?? 0) === 8 &&
    items?.address?.postalCode != currentPostalCode
  ) {
    findAddress();
  }
  function findAddress() {
    isLoading = true;
    currentPostalCode = items?.address?.postalCode;
    GetAddressByCep(items.address.postalCode)
      .then((response) => {
        if (response?.success) {
          const address = response?.data;
          currentPostalCode = address?.postalCode;
          items.address = { ...items?.address, ...address };
          itemsInputs.address.street.updateValue(items?.address?.street);
          itemsInputs.address.number.updateValue(items?.address?.number);
          itemsInputs.address.complement.updateValue(
            items?.address?.complement
          );
          itemsInputs.address.neighborhood.updateValue(
            items?.address?.neighborhood
          );
          itemsInputs.address.city.updateValue(items?.address?.city);
          itemsInputs.address.stat.updateValue(items?.address?.stat);
        } else {
          toggleErrorAlert(response?.data);
        }
        isLoading = false;
      })
      .catch((exception) => {
        toggleErrorAlert(exception);
      });
  }

  const submit = async () => {
    if (!Utils.Objects.validateFields(itemsValidation)) {
      toggleErrorAlert(
        "Por favor preenche os dados do formulario corretamente"
      );
      return;
    }
    isLoading = true;
    let response = await addStaff(items);
    if (response.success) {
      Navigation.pop();
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  };
  Title.set("Novo colaborador");
</script>

{#if isLoading}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if}
<div class="staff">
  <h2>Dados pessoais</h2>
  <Views.TextEdit
    placeHolder="Nome"
    bind:value={items.name}
    bind:this={itemsInputs.name}
    bind:isValid={itemsValidation.name}
    type="name"
    min="2"
    max="255"
  />
  <Views.TextEdit
    placeHolder="Sobre nome"
    bind:value={items.lastName}
    bind:this={itemsInputs.lastName}
    bind:isValid={itemsValidation.lastName}
    type="name"
    min="2"
    max="255"
  />
  <Views.TextEdit
    placeHolder="Email"
    bind:value={items.email}
    bind:isValid={itemsValidation.email}
    bind:this={itemsInputs.email}
    type="email"
  />
  <Views.TextEdit
    bind:value={items.phone}
    bind:this={itemsInputs.phone}
    bind:isValid={itemsValidation.phone}
    type="phone"
    placeHolder="Número de celular"
  />
  <Views.TextEdit
    placeHolder="CPF"
    type="cpf"
    bind:value={items.cpf}
    bind:this={itemsInputs.cpf}
    bind:isValid={itemsValidation.cpf}
  />
  <Views.Divider />
  <h2>Endereço</h2>
  <Views.TextEdit
    type="cep"
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
    min="2"
    max="255"
  />
  <Views.TextEdit
    placeHolder="Número"
    bind:value={items.address.number}
    bind:this={itemsInputs.address.number}
    bind:isValid={itemsValidation.address.number}
    min="1"
    max="255"
    empty={false}
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
    min="2"
    max="255"
  />
  <Views.TextEdit
    disabled={true}
    placeHolder="Cidade"
    bind:value={items.address.city}
    bind:isValid={itemsValidation.address.city}
    bind:this={itemsInputs.address.city}
    min="2"
    max="255"
  />
  <Views.TextEdit
    disabled={true}
    placeHolder="UF"
    bind:value={items.address.stat}
    bind:this={itemsInputs.address.stat}
    bind:isValid={itemsValidation.address.stat}
    min="2"
    max="2"
  />
  <Views.Divider />
  <Views.Button
    disabled={!canProceed}
    on:click={submit}
    bottomPadding={$StatusBar.bottomPadding}
    ><Fa icon={faEdit} /> <span>Adicionar</span></Views.Button
  >
  <Views.MessageAlert object={errorAlert} bind:show={showAlert} />
</div>

<style>
</style>
