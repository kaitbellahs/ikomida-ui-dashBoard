<script>
  import Routes from "../../stores/Routes";
  import {
    search,
    all,
    deleteProduct,
    deleteCategory,
  } from "../../network/Products";
  import { Views, Stores } from "@ikomida/components";
  import { faSearch, faEdit, faGift } from "@fortawesome/free-solid-svg-icons";
  import { StatusBar } from "../../stores/Setup";
  import { onMount } from "svelte";
  import Fa from "svelte-fa";

  let value = "";
  let oldValue;
  let error = false;
  let isLoading = true;
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

  Stores.Title.instance.set("Produtos");
  onMount(async () => {
    products = await all();
    isLoading = false;
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
      return;
    }
    products = await all();
    isLoading = false;
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

  Stores.Menu.instance.addItem({
    name: "Cupons",
    icon: faGift,
    callback: goToCoupons,
  });
</script>

{#if isLoading}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{:else}
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
{/if}

<Views.MessageAlert object={errorAlert} bind:show={showAlert} />
