<script>
  import { Title, Navigation, Router, Routes } from "../../stores/Navigation";
  import Fa from "svelte-fa";
  import { faEdit } from "@fortawesome/free-solid-svg-icons";
  import { StatusBar } from "../../stores/Setup";
  import { Views } from "@ikomida/components";
  import { newCategory, updateCategory } from "../../network/Products";

  let { item, edit } = $Router.options;
  let isLoading = false;
  let errorAlert;
  let showAlert = false;

  $: canContinue =
    item?.title &&
    (item?.title?.length || 0) <= 255 &&
    item?.description &&
    (item?.lastName?.length || 0) <= 1000;

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  const submit = async () => {
    isLoading = true;
    let response;
    if (edit) {
      response = await updateCategory(item);
    } else {
      response = await newCategory(item);
    }
    if (response?.success) {
      Navigation.reset(Routes.products);
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  };

  Title.set(edit ? "Editar categoria" : "Novo categoria");
</script>

{#if isLoading}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if}
<div class="category">
  <Views.TextEdit name="Nome da categoria" bind:value={item.title} />
  <Views.TextEdit
    type="text"
    name="Descrição da categoria"
    bind:value={item.description}
  />
  <Views.Divider />
  <Views.Divider />
  <Views.Button
    disabled={!canContinue}
    on:click={submit}
    bottomPadding={$StatusBar.bottomPadding}
    ><Fa icon={faEdit} /> <span>Salvar</span></Views.Button
  >
</div>
<Views.MessageAlert object={errorAlert} bind:show={showAlert} />

<style>
  .category {
    padding-bottom: 50px;
  }
</style>
