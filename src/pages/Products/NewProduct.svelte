<script lang="ts">
  import Routes from '../../stores/Routes'
  import Fa from 'svelte-fa'
  import { faEdit, faQuestion } from '@fortawesome/free-solid-svg-icons'
  import { StatusBar } from '../../stores/Setup'
  import { Views, Types, Stores, Utils } from '@ikomida/shared-frontend'
  import {
    newProduct,
    updateProduct,
    getCategories,
    deleteProductOptionsCategory,
    deleteProductOption
  } from '../../network/Products'
  import { onMount } from 'svelte'
  import Divider from '@ikomida/shared-frontend/lib/components/Divider.svelte'

  const router = Stores.Navigation.instance.router
  const discountTypeOptions = Types.Types.TDiscount.values() as Types.SelectorOptions[]

  let product: Types.Classes.CProduct = $router.options.product
    ? $router.options.product
    : Types.Classes.CProduct.fillWith(null)
  const edit = $router.options.edit

  let categoriesOptions: Types.Classes.CProduct[] = []
  let productsValidation = product.toValidation()
  $: if (productsValidation) {
    for (const optionsCategoryValidation of productsValidation.optionsCategories ?? []) {
      delete optionsCategoryValidation.highlighted
      delete optionsCategoryValidation.order
      delete optionsCategoryValidation.image
      delete optionsCategoryValidation.id
      delete optionsCategoryValidation.timestamp

      for (const optionValidation of optionsCategoryValidation.options ?? []) {
        delete optionValidation.highlighted
        delete optionValidation.order
        delete optionValidation.image
        delete optionValidation.id
        delete optionValidation.timestamp
      }
    }
  }
  $: canContinue =
    product.category &&
    productsValidation.title &&
    productsValidation.description &&
    productsValidation.weight &&
    productsValidation.price &&
    (productsValidation.discount || product.discountType === Types.Types.TDiscount.NO) &&
    productsValidation.serves &&
    productsValidation.quantity &&
    validateOptionsCategory(undefined, false)

  $: for (let index = 0; index < (product.optionsCategories?.length ?? 0); index++) {
    const min = product.optionsCategories?.[index].min
    const max = product.optionsCategories?.[index].max
    let isValid = false
    try {
      isValid = Number(min) <= Number(max)
    } catch (exception: any) {}
    productsValidation.optionsCategories[index].min = isValid
    productsValidation.optionsCategories[index].max = isValid
  }

  async function submit() {
    if (!canContinue) {
      return
    }
    Stores.Loading.instance.start()
    let response
    if (edit) {
      response = await updateProduct(product)
    } else {
      response = await newProduct(product)
    }
    if (response?.success) {
      Stores.Navigation.instance.reset(Routes.products)
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  }

  async function generateOptions() {
    Stores.Loading.instance.start()
    categoriesOptions = await getCategories()
    Stores.Loading.instance.stop()
  }

  const currencyValidation = (value: string) => {
    return Number(value) > 0 && Number(value) < product.price
  }
  const percentValidation = (value: string) => {
    return Number(value) > 0 && Number(value) < 10000
  }
  function validateCategoriesOptions(index?: number) {
    for (const optionsCategorValidation of isNaN(Number(index))
      ? [productsValidation.optionsCategories[index ?? 0]]
      : productsValidation.optionsCategories) {
      if ((optionsCategorValidation.options?.length ?? 0) === 0) {
        Stores.MessageAlert.instance.show(
          'Precisa adicionar pelo menos uma opção na categoria de opções antes de adicionar nova categoria.'
        )
        return false
      }
    }
    return true
  }

  function validateOptionsCategory(index?: number, showMessage = true) {
    const toValidate = !isNaN(Number(index))
      ? [productsValidation.optionsCategories[index ?? 0]]
      : productsValidation.optionsCategories
    if (toValidate.length > 0) {
      if (!Utils.Objects.validateFields(toValidate)) {
        if (showMessage) {
          Stores.MessageAlert.instance.show(
            'Precisa preencher todos campos da categoria de opções e/ou opção corretamente antes de adicionar nova opção ou categoria.'
          )
        }
        return false
      }
      return !isNaN(Number(index)) || validateCategoriesOptions(index)
    }
    return true
  }

  function addOptionsCategory() {
    if (!Array.isArray(product.optionsCategories) || !Array.isArray(productsValidation.optionsCategories)) {
      product.optionsCategories = []
      productsValidation.optionsCategories = []
    }
    if (!validateOptionsCategory()) {
      return
    }
    const optionsCategory = Types.Classes.CProductOptionsCategory.init(
      '',
      false,
      0,
      1,
      product.optionsCategories?.length ?? 0,
      []
    )
    product.optionsCategories.push(optionsCategory)
    const optionsCategoryValidation = optionsCategory.toValidation()
    productsValidation.optionsCategories.push(optionsCategoryValidation)
    productsValidation = productsValidation
    product = product
  }

  function addOptions(index: number) {
    if (!validateOptionsCategory(index)) {
      return
    }
    if (!product.optionsCategories) {
      return
    }
    let optionsCategory = product.optionsCategories[index]
    if (
      !Array.isArray(optionsCategory.options) ||
      !Array.isArray(productsValidation.optionsCategories[index].options)
    ) {
      optionsCategory.options = []
      productsValidation.optionsCategories[index].options = []
    }
    const option = Types.Classes.CProductOption.init('', false, 0, 1, optionsCategory.options.length)
    optionsCategory.options.push(option)
    const optionValidation = option.toValidation()
    productsValidation.optionsCategories[index].options.push(optionValidation)
    productsValidation = productsValidation
    product = product
  }

  async function removeOptionsCategory(index: number) {
    let remove = true
    const optionsCategory = product.optionsCategories?.[index]
    if (optionsCategory?.id) {
      const response = await deleteProductOptionsCategory(optionsCategory.id)
      if (!response.success) {
        remove = false
        Stores.MessageAlert.instance.show('Não foi possível remover esta categoria de opções.')
      }
    }
    if (remove) {
      product.optionsCategories?.splice(index, 1)
      productsValidation.optionsCategories?.splice(index, 1)
      product = product
      Stores.MessageAlert.instance.show('A categoria de opções foi removida.')
    }
  }

  async function removeOption(index: number, optionIndex: number) {
    let remove = true
    const option = product.optionsCategories?.[index].options?.[index]
    if (option?.id) {
      const response = await deleteProductOption(option.id)
      if (!response.success) {
        remove = false
        Stores.MessageAlert.instance.show('Não foi possível remover esta opção.')
      }
    }
    if (remove) {
      product.optionsCategories?.[index].options?.splice(optionIndex, 1)
      productsValidation.optionsCategories?.[index].options?.splice(optionIndex, 1)
      product = product
      Stores.MessageAlert.instance.show('A opção foi removida.')
    }
  }

  function showOptionsCategoryMinExplication() {
    Stores.MessageAlert.instance.show(
      'Seta a quantidade mínima para maior que 0 se você quiser tornar esta categoria obrigatória.'
    )
  }

  function showOptionsCategoryMaxExplication() {
    Stores.MessageAlert.instance.show(
      'Defina a quantidade máxima de opções permitidas nesta categoria. É mandatório que este valor esteja maior que a quantidade mínima estabelecida no campo anterior.'
    )
  }

  function showOptionPriceExplication() {
    Stores.MessageAlert.instance.show(
      'Defina o valor desta opção, pode ser R$ 0,00 se você esta oferecendo esta opção de graça.'
    )
  }

  function showOptionUnitsExplication() {
    Stores.MessageAlert.instance.show(
      'Defina a quantidade máxima de unidades desta opção oferecidas para acompanhar este produto.'
    )
  }

  onMount(async () => {
    Stores.Loading.instance.stop()
  })

  generateOptions()

  $: Stores.Title.instance.set(edit ? 'Editar produto' : 'Novo produto')
</script>

{#if product}
  <div class="product">
    <Views.UploadablePhoto bind:image={product.image} title={product.title} />
    <Views.Selector bind:selected={product.category} name="Selecione uma opção" options={categoriesOptions} />
    <Views.TextEdit
      placeHolder="Nome do produto"
      bind:value={product.title}
      bind:isValid={productsValidation.title}
      initialValue={product.title}
      min={3}
      max={255}
    />
    <Views.TextEdit
      type={Types.TTextEdit.TEXT}
      placeHolder="Descrição do produto"
      bind:value={product.description}
      bind:isValid={productsValidation.description}
      initialValue={product.description}
      min={1}
      max={500}
    />
    <Views.TextEdit
      type={Types.TTextEdit.NUMBER}
      placeHolder="Peso do produto em gramas (g)"
      bind:value={product.weight}
      bind:isValid={productsValidation.weight}
      initialValue={product.weight}
      min={1}
      max={9}
    />
    <Views.TextEdit
      type={Types.TTextEdit.NUMBER}
      placeHolder="Serve quantas pessoas?"
      bind:value={product.serves}
      bind:isValid={productsValidation.serves}
      initialValue={product.serves}
      min={1}
      max={9}
    />
    <Views.TextEdit
      type={Types.TTextEdit.NUMBER}
      placeHolder="Quantos itens você tem?"
      bind:value={product.quantity}
      bind:isValid={productsValidation.quantity}
      initialValue={product.quantity}
      min={1}
      max={9}
    />
    <Views.TextEdit
      type={Types.TTextEdit.CURRENCY}
      placeHolder="Preço"
      bind:value={product.price}
      bind:isValid={productsValidation.price}
      initialValue={product.price}
      min={1}
      max={9}
    />
    <Views.Divider />
    <Views.Selector bind:selected={product.discountType} name="selecione uma opção" options={discountTypeOptions} />
    {#if product.discountType}
      {#if product.discountType === Types.Types.TDiscount.PERCENT}
        <Views.TextEdit
          type={Types.TTextEdit.PERCENT}
          placeHolder="Disconto"
          bind:value={product.discount}
          bind:isValid={productsValidation.discount}
          initialValue={product.discount}
          validation={percentValidation}
          error="A percentagem do desconto deve ser maior que % 0,00 e menor que % 100,00"
        />
      {:else if product.discountType === Types.Types.TDiscount.VALUE}
        <Views.TextEdit
          placeHolder="Disconto"
          bind:value={product.discount}
          bind:isValid={productsValidation.discount}
          initialValue={product.discount}
          type={Types.TTextEdit.CURRENCY}
          validation={currencyValidation}
          error="O valor do desconto deve ser maior que R$ 0,00 e menor que o valor do produto que é {Utils.Strings.currency(
            product.price
          )}"
        />
      {/if}
    {/if}

    {#if (product.optionsCategories?.length ?? 0) > 0}
      {#if product.discountType !== Types.Types.TDiscount.NO}
        <Views.Divider height={10} />
        <Views.Status type={Types.Status.WARNING}
          >Este desconto será aplicado nos valores das opções do produto.</Views.Status
        >
      {/if}
      {#each product.optionsCategories ?? [] as optionsCategory, index}
        <Views.Divider height={10} />
        <div class="optionsCategory">
          <Views.FloatRemove top={-10} right={-10} callback={() => removeOptionsCategory(index)} />
          <header>
            <div class="img">
              <Views.UploadablePhoto
                bind:image={optionsCategory.image}
                title={optionsCategory.name}
                type={Types.TUploadablePhoto.THUMB}
              />
            </div>
            <div class="items">
              <Views.TextEdit
                sizeMultiplier={0.7}
                marginTop={20}
                placeHolder="Nome"
                bind:value={optionsCategory.name}
                bind:isValid={productsValidation.optionsCategories[index].name}
                initialValue={optionsCategory.name}
                min={3}
                max={255}
              />
              <Views.Divider height={10} />
              <small>Limite de opções permitida</small>
              <Views.TextEdit
                sizeMultiplier={0.7}
                marginTop={20}
                placeHolder="mínimo"
                bind:value={optionsCategory.min}
                bind:isValid={productsValidation.optionsCategories[index].min}
                initialValue={optionsCategory.min}
                type={Types.TTextEdit.NUMBER}
                buttonIcon={faQuestion}
                callback={showOptionsCategoryMinExplication}
                error="Este campo deve conter um valor menor que o campo máximo"
                max={3}
              />
              <Views.TextEdit
                marginTop={20}
                sizeMultiplier={0.7}
                placeHolder="Máximo"
                bind:value={optionsCategory.max}
                bind:isValid={productsValidation.optionsCategories[index].max}
                initialValue={optionsCategory.max}
                type={Types.TTextEdit.NUMBER}
                error="Este campo deve conter um valor maior que o campo mínimo"
                buttonIcon={faQuestion}
                callback={showOptionsCategoryMaxExplication}
                max={3}
              />
            </div>
          </header>
          {#if (optionsCategory.options?.length ?? 0) > 0}
            {#each optionsCategory.options ?? [] as option, optionIndex}
              <Views.Divider height={15} />
              <div class="option">
                <Views.FloatRemove top={-10} right={-10} callback={() => removeOption(index, optionIndex)} />
                <div class="img">
                  <Views.UploadablePhoto
                    bind:image={option.image}
                    title={option.name}
                    type={Types.TUploadablePhoto.THUMB}
                  />
                </div>
                <div class="items">
                  <Views.TextEdit
                    marginTop={20}
                    sizeMultiplier={0.6}
                    placeHolder="Nome"
                    bind:value={option.name}
                    bind:isValid={productsValidation.optionsCategories[index].options[optionIndex].name}
                    initialValue={option.name}
                    min={3}
                    max={255}
                  />
                  <Views.TextEdit
                    marginTop={20}
                    sizeMultiplier={0.6}
                    placeHolder="Preço"
                    bind:value={option.price}
                    bind:isValid={productsValidation.optionsCategories[index].options[optionIndex].price}
                    initialValue={option.price}
                    type={Types.TTextEdit.CURRENCY}
                    buttonIcon={faQuestion}
                    callback={showOptionPriceExplication}
                  />
                  <Views.TextEdit
                    marginTop={20}
                    sizeMultiplier={0.6}
                    placeHolder="Unidades"
                    bind:value={option.units}
                    bind:isValid={productsValidation.optionsCategories[index].options[optionIndex].units}
                    initialValue={option.units}
                    type={Types.TTextEdit.NUMBER}
                    min={0}
                    max={99999}
                    buttonIcon={faQuestion}
                    callback={showOptionUnitsExplication}
                  />
                </div>
              </div>
            {/each}
          {:else}
            <Views.Divider />
            <Views.Status showIcon={false}>Não há opções cadastradas nesta categoria de opções.</Views.Status>
          {/if}
          <Views.Button on:click={() => addOptions(index)} sizeMultiplier={0.6}
            ><span>Adicionar nova opção</span></Views.Button
          >
        </div>
      {/each}
    {:else}
      <Views.Divider />
      <Views.Status showIcon={false}>Não há opções cadastradas neste produto.</Views.Status>
    {/if}
    <Views.Button on:click={addOptionsCategory} sizeMultiplier={0.7}
      ><span>Adicionar categoria de opções</span></Views.Button
    >
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
  .product > .optionsCategory {
    background-color: #ccccccfa;
    border: #ccd;
    border-radius: 5px;
    padding: 10px;
    position: relative;
  }
  .product > .optionsCategory > header {
    display: flex;
    flex-direction: row;
  }
  .product > .optionsCategory > header > .img {
    width: 45px;
    height: 45px;
  }
  .product > .optionsCategory > header > .items {
    width: calc(100% - 42px);
    margin-left: 10px;
  }
  .product > .optionsCategory > .option {
    background-color: #ffffff26;
    border: #ccd;
    border-radius: 5px;
    padding: 10px;
    position: relative;
  }
  .product > .optionsCategory > .option {
    display: flex;
    flex-direction: row;
  }
  .product > .optionsCategory > .option > .img {
    width: 45px;
    height: 45px;
  }
  .product > .optionsCategory > .option > .items {
    width: calc(100% - 42px);
    margin-left: 10px;
  }
</style>
