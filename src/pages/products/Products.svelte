<script>
  import { Title, Navigation, Routes, Menu } from "../../stores/Navigation";
  import {
    search,
    all,
    deleteProduct,
    deleteCategory,
  } from "../../network/Products";
  import { Views } from "@ikomida/components";
  import { faSearch, faEdit, faGift } from "@fortawesome/free-solid-svg-icons";
  import { StatusBar } from "../../stores/Setup";
  import { onMount } from "svelte";
  import Fa from "svelte-fa";

  let value = "";
  let oldValue;
  let error = false;
  let isLoading = false;
  let items = [];
  let products = [];

  let errorAlert;
  let showAlert = false;

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  $: if (value != oldValue) {
    error = false;
    if (value.length > 0) {
      isLoading = true;
      search(value).then((result) => (items = result));
      oldValue = value;
      isLoading = false;
    } else {
      items = [];
      oldValue = "";
    }
  }

  Title.set("Produtos");
  onMount(async () => {
    isLoading = true;
    products = await all();
    isLoading = false;
  });

  function newProduct() {
    Navigation.goTo(Routes.editProduct, {
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
    Navigation.goTo(Routes.editCategory, {
      item: {
        id: null,
        title: null,
        description: null,
      },
      edit: false,
    });
  }

  async function removeProduct(item) {
    isLoading = true;
    const response = await deleteProduct(item.id);
    if (!response?.success) {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  async function removeCategory(id) {
    isLoading = true;
    const response = await deleteCategory(id);
    if (!response?.success) {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  async function editCategory(item) {
    Navigation.goTo(Routes.editCategory, { item, edit: true });
  }

  async function goToCoupons() {
    Navigation.goTo(Routes.coupons);
  }

  Menu.addItem({ name: "Cupons", icon: faGift, callback: goToCoupons });
</script>

{#if isLoading}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{:else}
  <div>
    <Views.TextEdit
      icon={faSearch}
      bind:value
      placeHolder="Buscar no cardápio"
    />
    <Views.Divider />
    <Views.Button on:click={newProduct} bottomPadding={$StatusBar.bottomPadding}
      ><Fa icon={faEdit} /> <span>Novo produto</span></Views.Button
    >
    <Views.Button
      on:click={newCategory}
      bottomPadding={$StatusBar.bottomPadding}
      ><Fa icon={faEdit} /> <span>Nova categoria</span></Views.Button
    >
    <Views.Divider />
    {#if (items.length > 0 || value) && !error}
      <Views.ItemsList
        {items}
        productPage={Routes.product}
        {Navigation}
        {removeProduct}
      />
    {:else if error}
      <h2>Nenhum produto foi encontrado</h2>
      <h3>Tente usar outro termo para pequisar</h3>
    {:else if products.length > 0}
      <Views.ItemsList
        {removeCategory}
        {editCategory}
        items={products}
        productPage={Routes.product}
        {Navigation}
        {removeProduct}
      />
    {/if}
  </div>
{/if}

<Views.MessageAlert object={errorAlert} bind:show={showAlert} />
