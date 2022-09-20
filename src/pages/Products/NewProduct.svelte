<script lang="ts">
  import Routes from '../../stores/Routes';
  import Fa from 'svelte-fa';
  import { faEdit } from '@fortawesome/free-solid-svg-icons';
  import { StatusBar } from '../../stores/Setup';
  import { Views, Types, Stores, Utils } from '@ikomida/shared-frontend';
  import { newProduct, updateProduct, getCategories } from '../../network/Products';
  import { onMount } from 'svelte';

  const router = Stores.Navigation.instance.router;
  const discountTypeOptions = Types.Types.TDiscount.values() as Types.SelectorOptions[];

  const item: Types.Classes.CProduct = $router.options.item
    ? Types.Classes.CProduct.fromObject($router.options.item.toJSON())
    : Types.Classes.CProduct.fillWith(null);
  const edit = $router.options.edit;

  let categoriesOptions: Types.Classes.CProductCategory[] = [];
  const itemsValidation = {
    title: false,
    description: false,
    weight: false,
    price: false,
    discount: false,
    serves: false,
    quantity: false,
  };

  $: canContinue =
    item?.category &&
    itemsValidation?.title &&
    itemsValidation?.description &&
    itemsValidation?.weight &&
    itemsValidation?.price &&
    (itemsValidation?.discount || item.discountType === Types.Types.TDiscount.NO) &&
    itemsValidation?.serves &&
    itemsValidation?.quantity;

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
    categoriesOptions = await getCategories();
    Stores.Loading.instance.stop();
  }

  const currencyValidation = (value: string) => {
    return Number(value) > 0 && Number(value) < item.price;
  };
  const percentValidation = (value: string) => {
    return Number(value) > 0 && Number(value) < 10000;
  };

  onMount(async () => {
    Stores.Loading.instance.stop();
  });

  generateOptions();

  $: Stores.Title.instance.set(edit ? 'Editar produto' : 'Novo produto');
</script>

{#if (categoriesOptions?.length ?? 0) > 0}
  <div class="product">
    <Views.UploadablePhoto bind:image={item.image} title={item?.title} />
    <Views.Selector bind:selected={item.category} name="Selecione uma opção" options={categoriesOptions} />
    <Views.TextEdit
      placeHolder="Nome do produto"
      bind:value={item.title}
      bind:isValid={itemsValidation.title}
      initialValue={item.title}
      min={3}
      max={255}
    />
    <Views.TextEdit
      type={Types.TTextEdit.TEXT}
      placeHolder="Descrição do produto"
      bind:value={item.description}
      bind:isValid={itemsValidation.description}
      initialValue={item.description}
      min={1}
      max={500}
    />
    <Views.TextEdit
      type={Types.TTextEdit.NUMBER}
      placeHolder="Peso do produto em gramas (g)"
      bind:value={item.weight}
      bind:isValid={itemsValidation.weight}
      initialValue={item.weight}
      min={1}
      max={9}
    />
    <Views.TextEdit
      type={Types.TTextEdit.NUMBER}
      placeHolder="Serve quantas pessoas?"
      bind:value={item.serves}
      bind:isValid={itemsValidation.serves}
      initialValue={item.serves}
      min={1}
      max={9}
    />
    <Views.TextEdit
      type={Types.TTextEdit.NUMBER}
      placeHolder="Quantos itens você tem?"
      bind:value={item.quantity}
      bind:isValid={itemsValidation.quantity}
      initialValue={item.quantity}
      min={1}
      max={9}
    />
    <Views.TextEdit
      type={Types.TTextEdit.CURRENCY}
      placeHolder="Preço"
      bind:value={item.price}
      bind:isValid={itemsValidation.price}
      initialValue={item.price}
      min={1}
      max={9}
    />
    <Views.Divider />
    <Views.Selector bind:selected={item.discountType} name="selecione uma opção" options={discountTypeOptions} />
    {#if item.discountType}
      {#if item.discountType === Types.Types.TDiscount.PERCENT}
        <Views.TextEdit
          type={Types.TTextEdit.PERCENT}
          placeHolder="Disconto"
          bind:value={item.discount}
          bind:isValid={itemsValidation.discount}
          initialValue={item.discount}
          validation={percentValidation}
          error="A percentagem do desconto deve ser maior que % 0,00 e menor que % 100,00"
        />
        <Views.Divider />
      {:else if item.discountType === Types.Types.TDiscount.VALUE}
        <Views.TextEdit
          placeHolder="Disconto"
          bind:value={item.discount}
          bind:isValid={itemsValidation.discount}
          initialValue={item.discount}
          type={Types.TTextEdit.CURRENCY}
          validation={currencyValidation}
          error="O valor do desconto deve ser maior que R$ 0,00 e menor que o valor do produto que é {Utils.Strings.currency(
            item.price,
          )}"
        />
        <Views.Divider />
      {/if}
    {/if}
    <Views.Divider />
    <Views.Button on:click={submit} disabled={!canContinue} bottomPadding={$StatusBar.bottomPadding}
      ><Fa icon={faEdit} /> <span>Salvar</span></Views.Button
    >
  </div>
{:else}
  <Views.CentredMessage text="Precisa adicionar pelo menos uma categoria antes de adicionar um novo produto!" />
{/if}

<style>
  .product {
    display: flex;
    flex-direction: column;
    padding-bottom: 50px;
  }
</style>
