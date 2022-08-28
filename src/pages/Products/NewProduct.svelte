<script>
  import Routes from "../../stores/Routes";
  import Fa from "svelte-fa";
  import { faEdit } from "@fortawesome/free-solid-svg-icons";
  import { StatusBar } from "../../stores/Setup";
  import { Views, Types, Stores, Utils } from "@ikomida/components";
  import {
    newProduct,
    updateProduct,
    getCategories,
  } from "../../network/Products";
  import { onMount } from "svelte";

  const router = Stores.Navigation.instance.router;
  let { item, edit } = $router.options;

  let categoriesOptions = [];
  let firstLaunch = true;
  let errorAlert;
  let showAlert = false;
  let selectedDiscountType;
  let oldSelectedDiscountType = null;

  let itemsValidation = {
    title: false,
    description: false,
    weight: false,
    price: false,
    discount: false,
    serves: false,
    quantity: false,
  };

  $: if (
    selectedDiscountType &&
    (oldSelectedDiscountType === null ||
      oldSelectedDiscountType?.id !== selectedDiscountType?.id)
  ) {
    item.discountType = selectedDiscountType?.id;
    item.discount = item.discount;
    oldSelectedDiscountType = selectedDiscountType;
  }

  $: canContinue =
    item?.category &&
    itemsValidation?.title &&
    itemsValidation?.description &&
    itemsValidation?.weight &&
    itemsValidation?.price &&
    (itemsValidation?.discount ||
      selectedDiscountType.id === Types.DiscountTypes.NO) &&
    itemsValidation?.serves &&
    itemsValidation?.quantity;

  $: if (firstLaunch) {
    if ((categoriesOptions?.length ?? 0) > 0) {
      const result = categoriesOptions.filter(
        (option) => option.id == item.categoryID
      );
      item.category = result.length > 0 ? result[0] : null;
    }

    if (!item?.image) {
      item.image = null;
    }

    if (Types.DiscountTypes.list.length > 0) {
      const result = Types.DiscountTypes.list.filter(
        (option) => option.id == item.discountType
      );

      selectedDiscountType = result.length > 0 ? result[0] : null;
    }
    firstLaunch = false;
  }

  async function submit() {
    if (!canContinue) {
      return;
    }
    Stores.Loading.instance.start();
    let response;
    if (edit) {
      response = await updateProduct(item);
    } else {
      response = await newProduct(item);
    }
    if (response?.success) {
      Stores.Navigation.instance.reset(Routes.products);
    } else {
      Stores.MessageAlert.instance.show(response?.data);
    }
    Stores.Loading.instance.stop();
  }

  async function generateOptions() {
    Stores.Loading.instance.start();
    const response = await getCategories();
    if (response) {
      categoriesOptions = response?.map((item) => {
        return { id: item.id, name: item.title };
      });
      if (categoriesOptions.length > 0) {
        const result = categoriesOptions.filter(
          (option) => option.id == item.categoryID
        );
        item.category = result.length > 0 ? result[0] : null;
      }
    }
    Stores.Loading.instance.stop();
  }

  onMount(async () => {
    if (!item.category) {
      item.category = null;
    }
    Stores.Loading.instance.stop();
  });

  generateOptions();

  $: Stores.Title.instance.set(edit ? "Editar produto" : "Novo produto");
</script>

{#if (categoriesOptions?.length ?? 0) > 0}
  <div class="product">
    <Views.UploadablePhoto bind:image={item.image} title={item?.title} />
    <Views.Selector
      bind:selected={item.category}
      name="Selecione uma opção"
      options={categoriesOptions}
    />
    <Views.TextEdit
      placeHolder="Nome do produto"
      bind:value={item.title}
      bind:isValid={itemsValidation.title}
      initialValue={item.title}
      min="3"
      max="255"
    />
    <Views.TextEdit
      type="text"
      placeHolder="Descrição do produto"
      bind:value={item.description}
      bind:isValid={itemsValidation.description}
      initialValue={item.description}
      min="1"
      max="500"
    />
    <Views.TextEdit
      type="number"
      placeHolder="Peso do produto em gramas (g)"
      bind:value={item.weight}
      bind:isValid={itemsValidation.weight}
      initialValue={item.weight}
      min="1"
      max="9"
    />
    <Views.TextEdit
      type="number"
      placeHolder="Serve quantas pessoas?"
      bind:value={item.serves}
      bind:isValid={itemsValidation.serves}
      initialValue={item.serves}
      min="1"
      max="9"
    />
    <Views.TextEdit
      type="number"
      placeHolder="Quantos itens você tem?"
      bind:value={item.quantity}
      bind:isValid={itemsValidation.quantity}
      initialValue={item.quantity}
      min="1"
      max="9"
    />
    <Views.TextEdit
      type="currency"
      placeHolder="Preço"
      bind:value={item.price}
      bind:isValid={itemsValidation.price}
      initialValue={item.price}
      min="1"
      max="9"
    />
    <Views.Divider />
    <Views.Selector
      bind:selected={selectedDiscountType}
      name="selecione uma opção"
      options={Types.DiscountTypes.list}
    />
    {#if selectedDiscountType}
      {#if selectedDiscountType.id === Types.DiscountTypes.PERCENT}
        <Views.TextEdit
          type="percent"
          placeHolder="Disconto"
          bind:value={item.discount}
          bind:isValid={itemsValidation.discount}
          initialValue={item.discount}
          validation={(value) => {
            return Number(value) > 0 && Number(value) < 10000;
          }}
          error="A percentagem do desconto deve ser maior que % 0,00 e menor que % 100,00"
        />
        <Views.Divider />
      {:else if selectedDiscountType.id === Types.DiscountTypes.VALUE}
        <Views.TextEdit
          placeHolder="Disconto"
          bind:value={item.discount}
          bind:isValid={itemsValidation.discount}
          initialValue={item.discount}
          type="currency"
          validation={(value) => {
            return Number(value) > 0 && Number(value) < item.price;
          }}
          error="O valor do desconto deve ser maior que R$ 0,00 e menor que o valor do produto que é {Utils.Strings.currency(
            item.price
          )}"
        />
        <Views.Divider />
      {/if}
    {/if}
    <Views.Divider />
    <Views.Button
      on:click={submit}
      disabled={!canContinue}
      bottomPadding={$StatusBar.bottomPadding}
      ><Fa icon={faEdit} /> <span>Salvar</span></Views.Button
    >
  </div>
{:else}
  <Views.CentredMessage
    text="Precisa adicionar pelo menos uma categoria antes de adicionar um novo produto!"
  />
{/if}

<style>
  .product {
    display: flex;
    flex-direction: column;
    padding-bottom: 50px;
  }
</style>
