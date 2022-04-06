<script>
  import { Title, Navigation, Router, Routes } from "../../stores/Navigation";
  import Fa from "svelte-fa";
  import { faEdit } from "@fortawesome/free-solid-svg-icons";
  import { StatusBar } from "../../stores/Setup";
  import { Views, Network, Image } from "@tian/components";
  import {
    newProduct,
    updateProduct,
    getCategories,
  } from "../../network/Products";
  import { onMount } from "svelte";

  let { item, edit } = $Router.options;
  let isLoading = false;
  let fileinput;
  let categoriesOptions = [];
  let firstLaunch = true;
  let imageSrc =
    "https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-alt-512.png";

  let errorAlert;
  let showAlert = false;

  function toggleErrorAlert(messageObject) {
    errorAlert = messageObject;
    showAlert = true;
  }

  Title.set(edit ? "Editar produto" : "Novo produto");

  async function submit() {
    isLoading = true;
    let response;
    if (edit) {
      response = await updateProduct(item);
    } else {
      response = await newProduct(item);
    }
    if (response?.success) {
      Navigation.reset(Routes.products);
    } else {
      toggleErrorAlert(response?.data);
    }
    isLoading = false;
  }

  async function onFileSelected(e) {
    let imageSrcFile = e.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(imageSrcFile);
    reader.onload = async (e) => {
      const [dataType, data] = e.target.result.split(";");
      let imageType = "jpeg";
      switch (dataType) {
        case "image/jpeg":
        case "image/jpg":
          imageType = "jpeg";
          break;
        case "image/png":
          imageType = "png";
          break;
      }
      item.image = await Image.resizeImage(imageSrcFile, 400, 400, imageType);
      imageSrc = item.image;
    };
  }

  async function generateOptions() {
    const response = await getCategories();
    if (response) {
      categoriesOptions = response.map((item) => {
        return { id: item.id, name: item.title };
      });
    }
  }

  $: if (categoriesOptions.length > 0 && firstLaunch) {
    firstLaunch = false;
    const result = categoriesOptions.filter(
      (option) => option.id == item.categoryID
    );

    item.category = result.length > 0 ? result[0] : null;
  }

  onMount(async () => {
    if (!item.category) {
      item.category = null;
    }
    if (item.image) {
      imageSrc = `${Network.instance.devApiServer}/image/${item.image}`;
    }
  });

  generateOptions();
</script>

{#if isLoading}
  <Views.Loading
    topPadding={$StatusBar.height}
    bottomPadding={$StatusBar.bottomPadding}
  />
{/if}
<div class="product">
  <img src={imageSrc} alt={item.title} />
  <img
    class="upload"
    src="https://static.thenounproject.com/png/625182-200.png"
    alt=""
    on:click={() => {
      fileinput.click();
    }}
  />
  <div
    class="chan"
    on:click={() => {
      fileinput.click();
    }}
  >
    Choose Image
  </div>
  <input
    style="display:none"
    type="file"
    accept=".jpg, .jpeg, .png"
    on:change={(e) => onFileSelected(e)}
    bind:this={fileinput}
  />
  <Views.Selector
    bind:selected={item.category}
    name="Seleciona uma opção"
    options={categoriesOptions}
  />
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
  <Views.TextEdit
    name="Serve quantas pessoas?"
    bind:value={item.serves}
    placeHolder=""
  />
  <Views.TextEdit
    name="Quantos itens você tem?"
    bind:value={item.quantity}
    placeHolder=""
  />
  <Views.TextEdit name="Preço atual" bind:value={item.price} placeHolder="" />
  <Views.TextEdit
    name="Preço original"
    bind:value={item.oldPrice}
    placeHolder=""
  />
  <Views.Divider />
  <Views.Button on:click={submit} bottomPadding={$StatusBar.bottomPadding}
    ><Fa icon={faEdit} /> <span>Salvar</span></Views.Button
  >
</div>
<Views.MessageAlert object={errorAlert} bind:show={showAlert} />

<style>
  .product {
    padding-bottom: 50px;
  }
  img {
    max-width: 100%;
    max-height: 200px;
  }
  img.upload {
    width: 60px;
  }
</style>
