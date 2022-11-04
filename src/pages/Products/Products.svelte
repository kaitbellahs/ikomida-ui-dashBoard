<script lang="ts">
  import Routes from '../../stores/Routes'
  import {
    resetTimeout,
    search,
    all,
    deleteProduct,
    deleteCategory,
    updateProduct,
    updateCategory
  } from '../../network/Products'
  import { Views, Stores, Types, Utils } from '@ikomida/shared-frontend'
  import { faSearch, faEdit, faGift } from '@fortawesome/free-solid-svg-icons'
  import { StatusBar } from '../../stores/Setup'
  import { onMount } from 'svelte'
  import Fa from 'svelte-fa'
  const cache = Stores.Cache.createInstance('Products')

  const navigation: Stores.Navigation = Stores.Navigation.instance

  let searchTerm: string = ''
  let oldValue: string
  let error = false

  let listableCategoryProducts: Types.Classes.CCategoryProducts[] = []
  let categoriesAndProducts: Types.Classes.CCategoryProducts[] = []
  $: if (searchTerm !== oldValue) {
    error = false
    if (searchTerm.length > 0) {
      Stores.Loading.instance.start()
      search(searchTerm).then(result => {
        listableCategoryProducts = result
      })
      oldValue = searchTerm
      Stores.Loading.instance.stop()
    } else {
      listableCategoryProducts = []
      oldValue = ''
    }
  }

  Stores.Title.instance.set('Produtos')
  onMount(async () => {
    categoriesAndProducts = await all()
    sortItems()
    const auth = await Stores.Auth.Auth.instance.data()
    if (auth) {
      const userInfo = await Utils.Jws.extractToken(auth)
      if (userInfo.role === 'VENDOR') {
        Stores.Menu.instance.addItem({
          name: 'Cupons',
          icon: faGift,
          callback: goToCoupons
        })
      }
    }
    Stores.Loading.instance.stop()
  })

  function newProduct() {
    const product = Types.Classes.CProduct.fromObject({})
    navigation.goTo(Routes.editProduct, {
      product: product,
      edit: false
    })
  }

  function newCategory() {
    navigation.goTo(Routes.editCategory, {
      category: Types.Classes.CProductCategory.fillWith(undefined),
      edit: false
    })
  }

  async function removeProduct(product: Types.Classes.CProduct) {
    Stores.Loading.instance.start()
    const response = await deleteProduct(product.id)
    if (!response?.success) {
      resetTimeout()
      Stores.MessageAlert.instance.show(response?.data)
    } else {
      categoriesAndProducts = await all()
    }
    Stores.Loading.instance.stop()
  }

  async function removeCategory(id?: string) {
    Stores.Loading.instance.start()
    const response = await deleteCategory(id)
    if (!response?.success) {
      resetTimeout()
      Stores.MessageAlert.instance.show(response?.data)
      return
    }
    categoriesAndProducts = await all()
    Stores.Loading.instance.stop()
  }

  async function editCategory(category: Types.Classes.CCategoryProducts) {
    navigation.goTo(Routes.editCategory, {
      category,
      edit: true
    })
  }

  async function goToCoupons() {
    navigation.goTo(Routes.coupons)
  }
  function sortItems() {
    categoriesAndProducts = categoriesAndProducts
      .map(category => {
        category.products = category?.products?.sort((i1, i2) => (i1?.order ?? 0) - (i2?.order ?? 0))
        return category
      })
      .sort((i1, i2) => (i1.order ?? 0) - (i2.order ?? 0))
    cache.setObject(
      'Products',
      categoriesAndProducts.map(category => category.toJSON())
    )
  }
  async function productUp(categoryId?: string, id?: string) {
    Stores.Loading.instance.start()
    const category = categoriesAndProducts?.filter(category => category.id === categoryId)?.[0]
    const indexOfCategory = categoriesAndProducts?.indexOf(category)
    const product = category?.products?.filter(product => product.id === id)?.[0]
    const indexOfProduct = product ? category?.products?.indexOf(product) : -1
    const productOrder = product?.order ?? indexOfProduct
    const beforeItemOrder = category?.products?.[(indexOfProduct ?? -1) - 1]?.order ?? (indexOfProduct ?? -1) - 1
    let objects: Types.Classes.CProduct[] = []
    objects.push(Types.Classes.CProduct.fromObject({ id: product?.id, order: (productOrder ?? -1) - 1 }))
    objects.push(
      Types.Classes.CProduct.fromObject({
        id: category?.products?.[(indexOfProduct ?? -1) - 1]?.id,
        order: beforeItemOrder + 1
      })
    )
    const response = await updateProduct(objects)
    if (response?.success) {
      let product = categoriesAndProducts[indexOfCategory ?? -1].products?.[(indexOfProduct ?? -1) - 1]
      if (product) {
        product.order = beforeItemOrder + 1
      }
      product = categoriesAndProducts[indexOfCategory ?? -1].products?.[indexOfProduct ?? -1]
      if (product) {
        product.order = (productOrder ?? -1) - 1
      }
      sortItems()
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  }
  async function productDown(categoryId?: string, id?: string) {
    Stores.Loading.instance.start()
    const category = categoriesAndProducts?.filter(category => category.id === categoryId)?.[0]
    const indexOfCategory = categoriesAndProducts?.indexOf(category)
    const product = category?.products?.filter(product => product.id === id)?.[0]
    const indexOfProduct = product ? category?.products?.indexOf(product) : -1
    const productOrder = product?.order ?? indexOfProduct
    const nextItemOrder = category?.products?.[(indexOfProduct ?? -1) + 1]?.order ?? (indexOfProduct ?? -1) + 1
    let objects: Types.Classes.CProduct[] = []
    objects.push(Types.Classes.CProduct.fromObject({ id: product?.id, order: (productOrder ?? -1) + 1 }))
    objects.push(
      Types.Classes.CProduct.fromObject({
        id: category?.products?.[(indexOfProduct ?? -1) + 1]?.id,
        order: nextItemOrder - 1
      })
    )
    const response = await updateProduct(objects)
    if (response?.success) {
      let product = categoriesAndProducts[indexOfCategory].products?.[(indexOfProduct ?? -1) + 1]
      if (product) {
        product.order = nextItemOrder - 1
      }
      product = categoriesAndProducts[indexOfCategory].products?.[indexOfProduct ?? -1]
      if (product) {
        product.order = (productOrder ?? -1) + 1
      }
      sortItems()
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  }
  async function categoryUp(id?: string) {
    Stores.Loading.instance.start()
    const category = categoriesAndProducts?.filter(category => category.id === id)?.[0]
    const indexOfCategory = categoriesAndProducts?.indexOf(category) ?? -1
    const categoryOrder = category?.order ?? indexOfCategory
    const beforeItemOrder = categoriesAndProducts?.[(indexOfCategory ?? -1) - 1]?.order ?? (indexOfCategory ?? -1) - 1
    let objects: Types.Classes.CCategoryProducts[] = [
      Types.Classes.CCategoryProducts.fromObject({ id: category?.id, order: (categoryOrder ?? -1) - 1 }),
      Types.Classes.CCategoryProducts.fromObject({
        id: categoriesAndProducts?.[(categoryOrder ?? -1) - 1]?.id,
        order: beforeItemOrder + 1
      })
    ]
    const response = await updateCategory(objects)
    if (response?.success) {
      let category = categoriesAndProducts?.[(indexOfCategory ?? -1) - 1]
      if (category) {
        category.order = beforeItemOrder + 1
      }
      category = categoriesAndProducts?.[indexOfCategory ?? -1]
      if (category) {
        category.order = (categoryOrder ?? -1) - 1
      }
      sortItems()
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  }
  async function categoryDown(id?: string) {
    Stores.Loading.instance.start()
    const category = categoriesAndProducts?.filter(category => category.id === id)?.[0]
    const indexOfCategory = categoriesAndProducts?.indexOf(category) ?? -1
    const categoryOrder = category?.order ?? indexOfCategory
    const nextItemOrder = categoriesAndProducts?.[(indexOfCategory ?? -1) + 1]?.order ?? (indexOfCategory ?? -1) + 1
    let objects: Types.Classes.CCategoryProducts[] = []
    objects.push(Types.Classes.CCategoryProducts.fromObject({ id: category?.id, order: (categoryOrder ?? -1) + 1 }))
    objects.push(
      Types.Classes.CCategoryProducts.fromObject({
        id: categoriesAndProducts?.[(indexOfCategory ?? -1) + 1]?.id,
        order: nextItemOrder - 1
      })
    )
    const response = await updateCategory(objects)
    if (response?.success) {
      let category = categoriesAndProducts?.[(indexOfCategory ?? -1) + 1]
      if (category) {
        category.order = nextItemOrder - 1
      }
      category = categoriesAndProducts?.[indexOfCategory ?? -1]
      if (category) {
        category.order = (categoryOrder ?? -1) + 1
      }
      sortItems()
    } else {
      Stores.MessageAlert.instance.show(response?.data)
    }
    Stores.Loading.instance.stop()
  }
</script>

<Views.TextEdit marginTop={0} icon={faSearch} bind:value={searchTerm} placeHolder="Buscar no cardápio" />
<Views.Divider />

<Views.Button
  disabled={categoriesAndProducts.length <= 0}
  on:click={newProduct}
  bottomPadding={$StatusBar.bottomPadding}><Fa icon={faEdit} /> <span>Novo produto</span></Views.Button
>
<Views.Button on:click={newCategory} bottomPadding={$StatusBar.bottomPadding}
  ><Fa icon={faEdit} /> <span>Nova categoria</span></Views.Button
>
<Views.Divider />
{#if (listableCategoryProducts.length > 0 || searchTerm) && !error}
  <Views.ItemsList
    {removeCategory}
    {editCategory}
    bind:categoriesAndProducts={listableCategoryProducts}
    productPage={Routes.product}
    {removeProduct}
  />
{:else if error}
  <h2>Nenhum produto foi encontrado</h2>
  <h3>Tente usar outro termo para pequisar</h3>
{:else if categoriesAndProducts.length > 0}
  <Views.ItemsList
    itemUp={productUp}
    itemDown={productDown}
    {categoryUp}
    {categoryDown}
    {removeCategory}
    {editCategory}
    bind:categoriesAndProducts
    productPage={Routes.product}
    {removeProduct}
  />
{:else}
  <Views.CentredMessage text="Nenhum produto foi encontrad">
    <h3>Tente usar outro termo para pequisar ou cadastre novos produtos</h3>
  </Views.CentredMessage>
{/if}
