<script lang="ts">
  import Routes from '../../stores/Routes';
  import { search, all, deleteProduct, deleteCategory, updateProduct } from '../../network/Products';
  import { Views, Stores, Types } from '@ikomida/shared-frontend';
  import { faSearch, faEdit, faGift } from '@fortawesome/free-solid-svg-icons';
  import { StatusBar } from '../../stores/Setup';
  import { onMount } from 'svelte';
  import Fa from 'svelte-fa';

  let searchTerm: string = '';
  let oldValue: string;
  let error = false;

  let listableCategoryProducts: Types.Interfaces.ICategoryProducts[] = [];
  let categoriesAndProducts: Types.Interfaces.ICategoryProducts[] = [];
  $: if (searchTerm !== oldValue) {
    error = false;
    if (searchTerm.length > 0) {
      Stores.Loading.instance.start();
      search(searchTerm).then((result) => {
        listableCategoryProducts = result;
      });
      oldValue = searchTerm;
      Stores.Loading.instance.stop();
    } else {
      listableCategoryProducts = [];
      oldValue = '';
    }
  }

  Stores.Title.instance.set('Produtos');
  onMount(async () => {
    categoriesAndProducts = await all();
    console.log(categoriesAndProducts);
    sortItems();
    Stores.Loading.instance.stop();
  });

  function newProduct() {
    Stores.Navigation.instance.goTo(Routes.editProduct, {
      item: Types.Interfaces.IProduct.fromObject({}),
      edit: false,
    });
  }

  function newCategory() {
    Stores.Navigation.instance.goTo(Routes.editCategory, {
      item: Types.Interfaces.IProduct.fromObject({}),
      edit: false,
    });
  }

  async function removeProduct(item: Types.Interfaces.IProduct) {
    Stores.Loading.instance.start();
    const response = await deleteProduct(item.id);
    if (!response?.success) {
      Stores.MessageAlert.instance.show(response?.data);
    }
    Stores.Loading.instance.stop();
  }

  async function removeCategory(id?: string) {
    Stores.Loading.instance.start();
    const response = await deleteCategory(id);
    if (!response?.success) {
      Stores.MessageAlert.instance.show(response?.data);
      return;
    }
    categoriesAndProducts = await all();
    Stores.Loading.instance.stop();
  }

  async function editCategory(item: Types.Interfaces.ICategoryProducts) {
    Stores.Navigation.instance.goTo(Routes.editCategory, {
      item,
      edit: true,
    });
  }

  async function goToCoupons() {
    Stores.Navigation.instance.goTo(Routes.coupons);
  }
  function sortItems() {
    categoriesAndProducts = categoriesAndProducts
      .map((category) => {
        category.products = category?.products?.sort((i1, i2) => (i1?.order ?? 0) - (i2?.order ?? 0));
        return category;
      })
      .sort((i1, i2) => (i1?.order ?? 0) - (i2?.order ?? 0));
  }
  async function itemUp(categoryId?: string, id?: string) {
    const category = categoriesAndProducts?.filter((category) => category.id === categoryId)?.[0];
    const indexOfCategory = categoriesAndProducts?.indexOf(category);
    const product = category?.products?.filter((item) => item.id === id)?.[0];
    const indexOfProduct = product ? category?.products?.indexOf(product) : -1;
    const itemOrder = product?.order ?? indexOfProduct;
    const beforItemOrder = category?.products?.[(indexOfProduct ?? -1) - 1]?.order ?? (indexOfProduct ?? -1) - 1;
    let objects: Types.Interfaces.IProduct[] = [];
    objects.push(Types.Interfaces.IProduct.fromObject({ id: product?.id, order: (itemOrder ?? -1) - 1 }));
    objects.push(
      Types.Interfaces.IProduct.fromObject({
        id: category?.products?.[(indexOfProduct ?? -1) - 1]?.id,
        order: beforItemOrder + 1,
      }),
    );
    const response = await updateProduct(objects);
    if (response?.success) {
      let order = categoriesAndProducts[indexOfCategory ?? -1].products?.[(indexOfProduct ?? -1) - 1].order;
      if (order) {
        order = beforItemOrder + 1;
      }
      order = categoriesAndProducts[indexOfCategory ?? -1].products?.[indexOfProduct ?? -1].order;
      if (order) {
        order = (itemOrder ?? -1) - 1;
      }
      sortItems();
    } else {
      Stores.MessageAlert.instance.show(response?.data);
    }
  }
  async function itemDown(categoryId?: string, id?: string) {
    const category = categoriesAndProducts?.filter((category) => category.id === categoryId)?.[0];
    const indexOfCategory = categoriesAndProducts?.indexOf(category);
    const product = category?.products?.filter((item) => item.id === id)?.[0];
    const indexOfProduct = product ? category?.products?.indexOf(product) : -1;
    const itemOrder = product?.order ?? indexOfProduct;
    const nextItemOrder = category?.products?.[(indexOfProduct ?? -1) + 1]?.order ?? (indexOfProduct ?? -1) + 1;
    let objects: Types.Interfaces.IProduct[] = [];
    objects.push(Types.Interfaces.IProduct.fromObject({ id: product?.id, order: (itemOrder ?? -1) + 1 }));
    objects.push(
      Types.Interfaces.IProduct.fromObject({
        id: category?.products?.[(indexOfProduct ?? -1) + 1]?.id,
        order: nextItemOrder - 1,
      }),
    );
    const response = await updateProduct(objects);
    if (response?.success) {
      let order = categoriesAndProducts[indexOfCategory].products?.[(indexOfProduct ?? -1) + 1].order;
      if (order) {
        order = nextItemOrder - 1;
      }
      order = categoriesAndProducts[indexOfCategory].products?.[indexOfProduct ?? -1].order;
      if (order) {
        order = (itemOrder ?? -1) + 1;
      }
      sortItems();
    } else {
      Stores.MessageAlert.instance.show(response?.data);
    }
  }
  async function categoryUp(id?: string) {
    console.log('categoryUp:', id);
  }
  async function categoryDown(id?: string) {
    console.log('categoryDown:', id);
  }

  Stores.Menu.instance.addItem({
    name: 'Cupons',
    icon: faGift,
    callback: goToCoupons,
  });
</script>

<Views.TextEdit marginTop={0} icon={faSearch} bind:value={searchTerm} placeHolder="Buscar no cardápio" />
<Views.Divider />
<Views.Button on:click={newProduct} bottomPadding={$StatusBar.bottomPadding}
  ><Fa icon={faEdit} /> <span>Novo produto</span></Views.Button
>
<Views.Button on:click={newCategory} bottomPadding={$StatusBar.bottomPadding}
  ><Fa icon={faEdit} /> <span>Nova categoria</span></Views.Button
>
<Views.Divider />
{#if (listableCategoryProducts.length > 0 || searchTerm) && !error}
  <Views.ItemsList bind:categoriesAndProducts={listableCategoryProducts} productPage={Routes.product} {removeProduct} />
{:else if error}
  <h2>Nenhum produto foi encontrado</h2>
  <h3>Tente usar outro termo para pequisar</h3>
{:else if categoriesAndProducts.length > 0}
  <Views.ItemsList
    {itemUp}
    {itemDown}
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
