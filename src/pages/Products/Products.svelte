<script>
  import Routes from "../../stores/Routes";
  import {
    search,
    all,
    deleteProduct,
    deleteCategory,
    updateProduct,
  } from "../../network/Products";
  import { Views, Stores } from "@ikomida/components";
  import { faSearch, faEdit, faGift } from "@fortawesome/free-solid-svg-icons";
  import { StatusBar } from "../../stores/Setup";
  import { onMount } from "svelte";
  import Fa from "svelte-fa";

  let value = "";
  let oldValue;
  let error = false;

  let items = [];
  let products = [];

  $: if (value != oldValue) {
    error = false;
    if (value.length > 0) {
      Stores.Loading.instance.start();
      search(value).then((result) => (items = result));
      oldValue = value;
      Stores.Loading.instance.stop();
    } else {
      items = [];
      oldValue = "";
    }
  }

  Stores.Title.instance.set("Produtos");
  onMount(async () => {
    products = await all();
    // order();
    sortItems();
    Stores.Loading.instance.stop();
  });

  function newProduct() {
    Stores.Navigation.instance.goTo(Routes.editProduct, {
      item: {
        id: null,
        title: null,
        description: null,
        serves: null,
        price: null,
        discount: null,
        discountType: null,
        image: null,
        weight: null,
        quantity: null,
      },
      edit: false,
    });
  }

  function newCategory() {
    Stores.Navigation.instance.goTo(Routes.editCategory, {
      item: {
        id: null,
        title: null,
        description: null,
      },
      edit: false,
    });
  }

  async function removeProduct(item) {
    Stores.Loading.instance.start();
    const response = await deleteProduct(item.id);
    if (!response?.success) {
      Stores.MessageAlert.instance.show(response?.data);
    }
    Stores.Loading.instance.stop();
  }

  async function removeCategory(id) {
    Stores.Loading.instance.start();
    const response = await deleteCategory(id);
    if (!response?.success) {
      Stores.MessageAlert.instance.show(response?.data);
      return;
    }
    products = await all();
    Stores.Loading.instance.stop();
  }

  async function editCategory(item) {
    Stores.Navigation.instance.goTo(Routes.editCategory, {
      item,
      edit: true,
    });
  }

  async function goToCoupons() {
    Stores.Navigation.instance.goTo(Routes.coupons);
  }
  function sortItems() {
    products = products
      .map((category) => {
        category.products = category.products.sort(
          (i1, i2) => (i1?.order ?? 0) - (i2?.order ?? 0)
        );
        return category;
      })
      .sort((i1, i2) => (i1?.order ?? 0) - (i2?.order ?? 0));
  }
  async function itemUp(id, categoryId) {
    const category = products?.filter(
      (category) => category.id === categoryId
    )?.[0];
    const indexOfCategory = products?.indexOf(category);
    const product = category?.products?.filter((item) => item.id === id)?.[0];
    const indexOfProduct = category?.products?.indexOf(product);
    const itemOrder = product?.order ?? indexOfProduct;
    const beforItemOrder =
      category?.products?.[indexOfProduct - 1]?.order ?? indexOfProduct - 1;
    let objects = [];
    objects.push({ id: product.id, order: itemOrder - 1 });
    objects.push({
      id: category?.products?.[indexOfProduct - 1]?.id,
      order: beforItemOrder + 1,
    });
    const response = await updateProduct(objects);
    if (response?.success) {
      products[indexOfCategory].products[indexOfProduct - 1].order =
        beforItemOrder + 1;
      products[indexOfCategory].products[indexOfProduct].order = itemOrder - 1;
      sortItems();
    } else {
      Stores.MessageAlert.instance.show(response?.data);
    }
  }
  async function itemDown(id, categoryId) {
    const category = products?.filter(
      (category) => category.id === categoryId
    )?.[0];
    const indexOfCategory = products?.indexOf(category);
    const product = category?.products?.filter((item) => item.id === id)?.[0];
    const indexOfProduct = category?.products?.indexOf(product);
    const itemOrder = product?.order ?? indexOfProduct;
    const nextItemOrder =
      category?.products?.[indexOfProduct + 1]?.order ?? indexOfProduct + 1;
    let objects = [];
    objects.push({ id: product.id, order: itemOrder + 1 });
    objects.push({
      id: category?.products?.[indexOfProduct + 1]?.id,
      order: nextItemOrder - 1,
    });
    const response = await updateProduct(objects);
    if (response?.success) {
      products[indexOfCategory].products[indexOfProduct + 1].order =
        nextItemOrder - 1;
      products[indexOfCategory].products[indexOfProduct].order = itemOrder + 1;
      sortItems();
    } else {
      Stores.MessageAlert.instance.show(response?.data);
    }
  }
  async function categoryUp(id) {
    console.log("categoryUp:", id);
  }
  async function categoryDown(id) {
    console.log("categoryDown:", id);
  }

  Stores.Menu.instance.addItem({
    name: "Cupons",
    icon: faGift,
    callback: goToCoupons,
  });
</script>

<Views.TextEdit
  marginTop="0"
  icon={faSearch}
  bind:value
  placeHolder="Buscar no cardápio"
/>
<Views.Divider />
<Views.Button on:click={newProduct} bottomPadding={$StatusBar.bottomPadding}
  ><Fa icon={faEdit} /> <span>Novo produto</span></Views.Button
>
<Views.Button on:click={newCategory} bottomPadding={$StatusBar.bottomPadding}
  ><Fa icon={faEdit} /> <span>Nova categoria</span></Views.Button
>
<Views.Divider />
{#if (items.length > 0 || value) && !error}
  <Views.ItemsList {items} productPage={Routes.product} {removeProduct} />
{:else if error}
  <h2>Nenhum produto foi encontrado</h2>
  <h3>Tente usar outro termo para pequisar</h3>
{:else if products.length > 0}
  <Views.ItemsList
    {itemUp}
    {itemDown}
    {categoryUp}
    {categoryDown}
    {removeCategory}
    {editCategory}
    items={products}
    productPage={Routes.product}
    {removeProduct}
  />
{:else}
  <Views.CentredMessage text="Nenhum produto foi encontrad">
    <h3>Tente usar outro termo para pequisar ou cadastre novos produtos</h3>
  </Views.CentredMessage>
{/if}
