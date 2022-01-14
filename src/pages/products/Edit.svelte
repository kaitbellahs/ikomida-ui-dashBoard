<script>
  import { Title, Navigation, Router, Routes } from "../../stores/Navigation";
  import Fa from "svelte-fa";
  import { faEdit } from "@fortawesome/free-solid-svg-icons";
  import { StatusBar } from "../../stores/Setup";
  import { Views } from "@tian/components";

  let { item, edit } = $Router.options;
  const submit = async () => {
    item.quantity = quantity;
    Navigation.goTo(Routes.cart);
  };
  Title.set(edit ? "Editar produto" : "Novo produto");
</script>

<div class="product">
  <img src={item.src} alt={item.title} />
  <input type="file" />
  <Views.TextEdit
    name="Nome do produto"
    bind:value={item.title}
    placeHolder=""
  />
  <Views.TextEdit
    name="Descrição do produto"
    bind:value={item.description}
    placeHolder=""
  />
  <Views.TextEdit
    name="Peso do produto em KG"
    bind:value={item.weight}
    placeHolder=""
  />
  <Views.TextEdit name="Preço atual" bind:value={item.price} placeHolder="" />
  <Views.TextEdit
    name="Preço original"
    bind:value={item.oldPrice}
    placeHolder=""
  />
  <Views.Button on:click={submit} bottomPadding={$StatusBar.bottomPadding}
    ><Fa icon={faEdit} /> <span>Salvar</span></Views.Button
  >
</div>

<style>
  .product {
    padding-bottom: 50px;
  }
  img {
    width: 100%;
    max-width: 100%;
  }
</style>
