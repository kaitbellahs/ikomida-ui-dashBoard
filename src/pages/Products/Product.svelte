<script lang="ts">
  import Routes from '../../stores/Routes'
  import Fa from 'svelte-fa'
  import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
  import { Views, Utils, Types, Logics, Stores } from '@ikomida/shared-frontend'
  import { activateProduct, deleteProduct, getProduct } from '../../network/Products'
  import { onMount } from 'svelte'

  let userInfo: Types.Classes.CUser
  const router = Stores.Navigation.instance.router
  let product: Types.Classes.CProduct
  let initalProduct: Types.Classes.CProduct = $router.options.product
  let working = false

  const edit = async () => {
    Stores.Navigation.instance.goTo(Routes.editProduct, {
      product,
      edit: true
    })
  }

  const newProduct = async () => {
    Stores.Navigation.instance.goTo(Routes.editProduct, {
      product,
      edit: false
    })
  }

  $: productStatus = `Produto ${product?.active ? 'habilitado' : 'desabilitado'}`

  async function removeProduct() {
    if (!working) {
      working = true
      Stores.Loading.instance.start()
      const response = await deleteProduct(product.id)
      if (response?.success) {
        Stores.Navigation.instance.pop()
      } else {
        Stores.MessageAlert.instance.show(response?.data)
      }
      Stores.Loading.instance.stop()
      working = false
    }
  }

  async function enableProduct() {
    if (!working) {
      working = true
      Stores.Loading.instance.start()
      const response = await activateProduct(product.id)
      if (!response?.success) {
        product.active = !product.active
        Stores.MessageAlert.instance.show(response?.data)
      }
      Stores.Loading.instance.stop()
      working = false
    }
  }

  onMount(async () => {
    if (!working) {
      working = true
      if (!initalProduct.id) {
        Stores.Loading.instance.stop()
        return
      }
      const response = await getProduct(initalProduct.id)
      if (response?.success) {
        product = Types.Classes.CProduct.fromObject({ ...initalProduct.toJSON(), ...response?.data })
        const auth = await Stores.Auth.Auth.instance.data()
        if (auth) {
          userInfo = await Utils.Jws.extractToken(auth)
          const role = Types.Types.TRoles.valueOf(String(userInfo.role))
          if (role) {
            userInfo.role = role
          }
        }
      } else {
        Stores.MessageAlert.instance.show(response?.data)
      }
      Stores.Loading.instance.stop()
      working = false
    }
  })

  $: Stores.Title.instance.set(product?.title ?? '')
</script>

{#if product}
  <div class="productImage">
    <Views.Image source={product.image ?? '/assets/images/food-plate.svg'} name={product.title} />
  </div>
  <div class="product" style="background: #dfdfdf;">
    <h2>{product.title}</h2>
    <p>{product.description}</p>
    <span class="serves"
      >Aproximadamente {product.measureUnit && product.measure
        ? Logics.Finances.formatMeasure(product.measure, product.measureUnit)
        : '-'}</span
    >
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
    <Views.Divider height={16} />
    {#if (product.optionsCategories?.length ?? 0) > 0}
      <h2>Opções do produto:</h2>
      {#each product.optionsCategories ?? [] as optionsCategory}
        <Views.Divider height={16} />
        <div class="shadow optionsCategory">
          <header>
            <Views.Image source={optionsCategory.image} name={optionsCategory.name} height="48pt" width="48pt" />
            <div>
              <h3>{optionsCategory.name}</h3>
              Escolher entre {optionsCategory.min} e {optionsCategory.max} opções
            </div>
          </header>
          {#if (optionsCategory.options?.length ?? 0) > 0}
            {#each optionsCategory.options ?? [] as option}
              <Views.Divider height={15} />
              <div class="shadow option">
                <Views.Image source={option.image} name={option.name} height="48pt" width="48pt" />
                <div>
                  <h3>{option.name}</h3>
                  <div>
                    <div>
                      <span>Valor</span>
                      {#if [Types.Types.TDiscount.PERCENT, Types.Types.TDiscount.VALUE].includes(product.discountType) && option.price > 0}
                        <span class="oldPrice">{Utils.Strings.currency(option.price)}</span>
                      {/if}
                      <b
                        >{Utils.Strings.currency(
                          option.price -
                            Logics.Finances.calcDiscount(option.price, product.discount, product.discountType)
                        )}</b
                      >
                    </div>
                    <div>
                      <span>Unidades</span>
                      <b>{option.units}</b>
                    </div>
                  </div>
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
    <Views.Switch bind:name={productStatus} bind:checked={product.active} on:check={enableProduct} />
    {#if userInfo?.role === Types.Types.TRoles.VENDOR}
      <Views.Button on:click={removeProduct}><Fa icon={faTrashAlt} /> <span>Remover este produto</span></Views.Button>
      <Views.Button on:click={edit}><Fa icon={faEdit} /> <span>Editar</span></Views.Button>
    {/if}
    <Views.Button on:click={newProduct}><Fa icon={faEdit} /> <span>Novo produto Similar</span></Views.Button>
  </div>
{/if}

<style>
  .productImage {
    position: fixed;
    left: 0;
    right: 0;
    top: 64px;
  }
  .product {
    position: absolute;
    padding: 16pt;
    padding-bottom: 128pt;
    left: 0;
    right: 0;
    top: 100vw;
    border-radius: 16pt 16pt 0 0;
    background: #fff;
    box-shadow: 0 -4pt 8pt #0000009e;
    height: fit-content;
    padding-bottom: 72pt;
  }
  .quantity {
    margin-top: 16pt;
    align-items: center;
    font-size: 1.8em;
    text-align: center;
  }
  .quantity > span {
    padding: 0;
    border: 0;
    background: transparent;
    margin-right: 16pt;
    margin-left: 16pt;
  }
  .price {
    margin-top: 16pt;
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
    margin-top: 16pt;
  }
  p {
    font-size: 0.8rem;
    font-weight: lighter;
    margin: 16pt 0;
  }
  .serves {
    font-size: 0.8rem;
  }
  .product > :global(img) {
    width: 100%;
    max-width: 100%;
    object-fit: contain;
    border-radius: 4pt;
  }
  .product > .optionsCategory {
    border-radius: 4pt;
    padding: 16pt;
    background-color: #fffffffa;
    position: relative;
  }
  .product > .optionsCategory > header {
    display: flex;
    flex-direction: row;
  }
  .product > .optionsCategory > header > :global(img) {
    width: 48pt;
    height: 48pt;
  }
  .product > .optionsCategory > header > div {
    width: calc(100% - 40pt);
    margin-left: 16pt;
  }
  .product > .optionsCategory > .option {
    background-color: #fffffffa;
    border-radius: 8pt;
    padding: 16pt;
    position: relative;
  }
  .product > .optionsCategory > .option {
    display: flex;
    flex-direction: row;
    border-radius: 4pt;
    padding: 16pt;
    background: #fffffffc;
  }
  .product > .optionsCategory > .option > :global(img) {
    width: 48pt;
    height: 48pt;
  }
  .product > .optionsCategory > .option > div {
    width: 100%;
    margin-left: 16pt;
  }
  .product > .optionsCategory > .option > div > div {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    text-align: center;
  }
  .product > .optionsCategory > .option > div > div > div {
    display: flex;
    flex-direction: column;
  }
  .product > .optionsCategory > .option > div > div > div > b {
    font-size: 1.1em;
    font-family: RobotoBold;
  }
  .product > .optionsCategory > .option > div > h3 {
    text-align: center;
  }
</style>
