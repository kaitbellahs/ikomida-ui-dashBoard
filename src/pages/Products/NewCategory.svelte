<script>
  import Routes from "../../stores/Routes";
  import Fa from "svelte-fa";
  import { faEdit } from "@fortawesome/free-solid-svg-icons";
  import { StatusBar } from "../../stores/Setup";
  import { Views, Stores } from "@ikomida/components";
  import { newCategory, updateCategory } from "../../network/Products";
  import { onMount } from "svelte";

  const router = Stores.Navigation.instance.router;
  let { item, edit } = $router.options;
  let isLoading = true;
  let errorAlert;
  let showAlert = false;

  $: canContinue = itemValidation?.title;
  let itemValidation = {
    title,
  };
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
      Stores.Navigation.instance.reset(Routes.products);
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  };

  onMount(() => {
    isLoading = false;
  });

  Stores.Title.instance.set(edit ? "Editar categoria" : "Novo categoria");
</script>

{#if isLoading}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if}
<div class="category">
  <Views.TextEdit
    placeHolder="Nome da categoria"
    bind:value={item.title}
    bind:isValid={itemValidation.title}
    initialValue={item.title}
    min="3"
    max="255"
  />
  <Views.TextEdit
    type="text"
    placeHolder="Descrição da categoria"
    bind:value={item.description}
    initialValue={item.description}
    min="1"
    max="500"
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
