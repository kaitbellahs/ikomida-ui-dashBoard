<script>
  import { Title, Navigation, Router, Routes } from "../../stores/Navigation";
  import { search, all, deleteProduct } from "../../network/Products";
  import { Views } from "@tian/components";
  import { faSearch, faEdit } from "@fortawesome/free-solid-svg-icons";
  import { StatusBar } from "../../stores/Setup";
  import { onMount } from "svelte";
  import Fa from "svelte-fa";

  let value = "";
  let oldValue;
  let error = false;
  let isLoading = false;
  let items = [];
  let products = [];
  $: if (value != oldValue) {
    error = false;
    if (value.length > 0) {
      isLoading = true;
      search(value).then(result => items = result);
      oldValue = value;
      isLoading = false;
    } else {
      items = [];
      oldValue = "";
    }
  }

  function goToOrders() {
    Navigation.goTo(Routes.orders);
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
        oldPrice: null,
        src: null,
        weight: null,
        quantity: null,
      },
      edit: false,
    });
  }

  async function removeProduct(item) {
    isLoading = true;
    const response = await deleteProduct(item.id)
    console.log(response);
    isLoading = false;
  }
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
        items={products}
        productPage={Routes.product}
        {Navigation}
        {removeProduct}
      />
    {/if}
  </div>
{/if}
