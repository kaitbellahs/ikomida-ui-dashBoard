<script>
    import { Title, Navigation, Router, Routes } from "../../stores/Navigation";
    import Fa from "svelte-fa";
    import { faEdit } from "@fortawesome/free-solid-svg-icons";
    import { StatusBar } from "../../stores/Setup";
    import { Views } from "@tian/components";
    import { newCategory, updateCategory } from "../../network/Products";
  
    let { item, edit } = $Router.options;
    let isLoading = false;
    const submit = async () => {
      isLoading = true;
      let response;
      if(edit){
        response = await updateCategory(item);
      }else{
        response = await newCategory(item);
      }
      if(response){
        Navigation.reset(Routes.products);
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
    <Views.TextEdit
      name="Nome da categoria"
      bind:value={item.title}
      placeHolder=""
    />
    <Views.TextEdit
      name="Descrição da categoria"
      bind:value={item.description}
      placeHolder=""
    />
    <Views.Divider />
    <Views.Button on:click={submit} bottomPadding={$StatusBar.bottomPadding}
      ><Fa icon={faEdit} /> <span>Salvar</span></Views.Button
    >
  </div>
  
  <style>
    .category {
      padding-bottom: 50px;
    }
  </style>
  