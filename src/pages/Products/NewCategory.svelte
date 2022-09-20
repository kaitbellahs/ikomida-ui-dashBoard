<script lang="ts">
  import Routes from '../../stores/Routes';
  import Fa from 'svelte-fa';
  import { faEdit } from '@fortawesome/free-solid-svg-icons';
  import { StatusBar } from '../../stores/Setup';
  import { Views, Stores, Types } from '@ikomida/shared-frontend';
  import { newCategory, updateCategory } from '../../network/Products';
  import { onMount } from 'svelte';

  const router = Stores.Navigation.instance.router;
  let { item, edit } = $router.options;

  $: canContinue = itemValidation?.title;
  let itemValidation = {
    title: false,
  };

  const submit = async () => {
    Stores.Loading.instance.start();
    let response;
    if (edit) {
      response = await updateCategory(item);
    } else {
      response = await newCategory(item);
    }
    if (response?.success) {
      Stores.Navigation.instance.reset(Routes.products);
    } else {
      Stores.MessageAlert.instance.show(response?.data);
    }
    Stores.Loading.instance.stop();
  };

  onMount(() => {
    Stores.Loading.instance.stop();
  });

  Stores.Title.instance.set(edit ? 'Editar categoria' : 'Novo categoria');
</script>

<div class="category">
  <Views.TextEdit
    placeHolder="Nome da categoria"
    bind:value={item.title}
    bind:isValid={itemValidation.title}
    initialValue={item.title}
    min={3}
    max={255}
  />
  <Views.TextEdit
    type={Types.TTextEdit.TEXT}
    placeHolder="Descrição da categoria"
    bind:value={item.description}
    initialValue={item.description}
    min={1}
    max={500}
  />
  <Views.Divider />
  <Views.Divider />
  <Views.Button disabled={!canContinue} on:click={submit} bottomPadding={$StatusBar.bottomPadding}
    ><Fa icon={faEdit} /> <span>Salvar</span></Views.Button
  >
</div>

<style>
  .category {
    padding-bottom: 50px;
  }
</style>
