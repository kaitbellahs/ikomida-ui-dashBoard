<script lang="ts">
  import Routes from '../../stores/Routes'
  import Fa from 'svelte-fa'
  import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
  import { Views, Utils, Types, Logics, Stores } from '@ikomida/shared-frontend'
  import { deleteProduct, getProduct } from '../../network/Products'
  import { onMount } from 'svelte'

  const router = Stores.Navigation.instance.router
  let product: Types.Classes.CProduct
  let initalProduct: Types.Classes.CProduct = $router.options
  const edit = async () => {
    Stores.Navigation.instance.goTo(Routes.editProduct, {
      product,
      edit: true
    })
  }

  let showImage: any = { image: true, optionsCategories: [] }

  function generateShowImage() {
    for (const index in product.optionsCategories ?? []) {
      showImage.optionsCategories.push({
        image: true,
        options: []
      })
      for (const optionIndex in product.optionsCategories?.[index].options ?? []) {
        showImage.optionsCategories[index].options.push({ image: true })
      }
    }
  }

  const newProduct = async () => {
    Stores.Navigation.instance.goTo(Routes.editProduct, {
      product,
      edit: false
    })
  }

  async function removeProduct() {
    Stores.Loading.instance.start()
    const response = await deleteProduct(product.id)
    if (response?.success) {
      Stores.Navigation.instance.pop()
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  }

  function erroLoadImage(index?: number, optionIndex?: number) {
    if (Utils.Objects.isTrue(index)) {
      if (Utils.Objects.isTrue(optionIndex)) {
        showImage.optionsCategories[index ?? 0].options[optionIndex ?? 0].image = false
      } else {
        showImage.optionsCategories[index ?? 0].image = false
      }
    } else {
      showImage.image = false
    }
  }

  onMount(async () => {
    if (!initalProduct.id) {
      Stores.Loading.instance.stop()
      return
    }
    const response = await getProduct(initalProduct.id)
    if (response?.success) {
      product = Types.Classes.CProduct.fromObject({ ...initalProduct.toJSON(), ...response?.data })
      generateShowImage()
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  })

  $: Stores.Title.instance.set(product?.title ?? '')
</script>

{#if product}
  <div class="product">
    {#if showImage.image && product.image}
      <img on:error={() => erroLoadImage()} src={product.image} alt={product.title} />
    {/if}
    <h2>{product.title}</h2>
    <p>{product.description}</p>
    <span class="serves">Aproximadamente {Logics.Finances.formatWeight(product.weight ?? 0)}</span>
    <div class="price">
      {#if [Types.Types.TDiscount.PERCENT, Types.Types.TDiscount.VALUE].includes(product.discountType)}
        <span class="oldPrice">{Utils.Strings.currency(product.price)}</span>
      {/if}
      <span class="current"
        >{Utils.Strings.currency(
          product.price - Logics.Finances.calcDiscount(product.price, product.discount, product.discountType)
        )}</span
      >
    </div>
    <div class="quantity">
      Resta{product.quantity > 1 ? 'm' : ''} <span>{product.quantity}</span>
      unidade{product.quantity > 1 ? 's' : ''}
    </div>
    <Views.Divider />
    <h2>Opções do produto:</h2>
    {#if (product.optionsCategories?.length ?? 0) > 0}
      {#each product.optionsCategories ?? [] as optionsCategory, index}
        <Views.Divider />
        <div class="optionsCategory">
          <header>
            {#if showImage.optionsCategories[index].image && optionsCategory.image}
              <img on:error={() => erroLoadImage(index)} src={optionsCategory.image} alt={optionsCategory.name} />
            {/if}
            <div>
              <h3>{optionsCategory.name}</h3>
              Escolher entre {optionsCategory.min} e {optionsCategory.max} opções
            </div>
          </header>
          {#if (optionsCategory.options?.length ?? 0) > 0}
            {#each optionsCategory.options ?? [] as option, optionIndex}
              <Views.Divider />
              <div class="option">
                {#if showImage.optionsCategories[index].options[optionIndex].image && option.image}
                  <img on:error={() => erroLoadImage(index, optionIndex)} src={option.image} alt={option.name} />
                {/if}
                <div>
                  <h3>{option.name}</h3>
                  {#if [Types.Types.TDiscount.PERCENT, Types.Types.TDiscount.VALUE].includes(product.discountType) && option.price > 0}
                    <span class="oldPrice">Preço original: {Utils.Strings.currency(option.price)}</span>
                  {/if}
                  <Views.TextValue
                    text="Preço:"
                    value={Utils.Strings.currency(
                      option.price - Logics.Finances.calcDiscount(option.price, product.discount, product.discountType)
                    )}
                    leftMargin={50}
                  />
                  <Views.TextValue text="Por ptoduto:" value={`${option.units} unidades`} leftMargin={50} />
                </div>
              </div>
            {/each}
          {:else}
            <Views.Divider />
            <Views.Status>Não há opções cadastradas nesta categoria de opções.</Views.Status>
          {/if}
        </div>
      {/each}
    {:else}
      <Views.Divider />
      <Views.Status>Não há opções cadastradas neste produto.</Views.Status>
    {/if}
    <Views.Divider />
    <Views.Button on:click={removeProduct}><Fa icon={faTrashAlt} /> <span>Remover este produto</span></Views.Button>
    <Views.Button on:click={edit}><Fa icon={faEdit} /> <span>Editar</span></Views.Button>
    <Views.Button on:click={newProduct}><Fa icon={faEdit} /> <span>Novo produto Similar</span></Views.Button>
  </div>
{/if}

<style>
  .product {
    padding-bottom: 50px;
  }
  .quantity {
    margin-top: 10px;
    align-items: center;
    font-size: 1.8em;
    text-align: center;
  }
  .quantity > span {
    padding: 0;
    border: 0;
    background: transparent;
    margin-right: 10px;
    margin-left: 10px;
  }
  .price {
    margin-top: 20px;
    width: 100%;
    min-width: 100%;
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
  }
  .oldPrice {
    text-decoration: line-through;
    color: #717171;
    font-size: 0.8rem;
  }
  .current {
    color: green;
    font-size: 1.5em;
    margin-top: 10px;
  }
  p {
    font-size: 0.8rem;
    font-weight: lighter;
    margin: 10px 0;
  }
  .serves {
    font-size: 0.8rem;
  }
  img {
    width: 100%;
    max-width: 100%;
    object-fit: contain;
    border-radius: 4px;
  }
  .product > .optionsCategory {
    background-color: #d6d6d6d4;
    border: #ccd;
    border-radius: 5px;
    padding: 10px;
    position: relative;
  }
  .product > .optionsCategory > header {
    display: flex;
    flex-direction: row;
  }
  .product > .optionsCategory > header > img {
    width: 45px;
    height: 45px;
  }
  .product > .optionsCategory > header > div {
    width: calc(100% - 42px);
    margin-left: 10px;
  }
  .product > .optionsCategory > .option {
    background-color: rgb(208 208 208);
    border: #ccd;
    border-radius: 5px;
    padding: 10px;
    position: relative;
  }
  .product > .optionsCategory > .option {
    display: flex;
    flex-direction: row;
  }
  .product > .optionsCategory > .option > img {
    width: 45px;
    height: 45px;
  }
  .product > .optionsCategory > .option > div {
    width: calc(100% - 42px);
    margin-left: 10px;
  }
  .product > .optionsCategory > .option > div > h3 {
    text-align: center;
  }
</style>
