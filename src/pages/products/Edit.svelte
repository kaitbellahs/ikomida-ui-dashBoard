<script>
  import { Title, Navigation, Router, Routes } from "../../stores/Navigation";
  import Fa from "svelte-fa";
  import { faEdit } from "@fortawesome/free-solid-svg-icons";
  import { StatusBar } from "../../stores/Setup";
  import { Views, Network, Image, Types, Utils } from "@tian/components";
  import {
    newProduct,
    updateProduct,
    getCategories
  } from "../../network/Products";
  import { onMount } from "svelte";

  let { item, edit } = Utils.Objects.copy($Router.options);
  let isLoading = false;
  let fileinput;
  let categoriesOptions = [];
  let firstLaunch = true;
  let imageSrc =
    "/Assets/Images/food-plate.svg";

  let errorAlert;
  let showAlert = false;
  let selectedDiscountType;
  let oldSelectedDiscountType = null;
  $: if (
    selectedDiscountType &&
    (oldSelectedDiscountType === null ||
      oldSelectedDiscountType?.id !== selectedDiscountType?.id)
  ) {
    item.discountType = selectedDiscountType?.id;
    item.discount = item.discount;
    oldSelectedDiscountType = selectedDiscountType;
  }
  $: canContinue =
  item?.category &&
  item?.title && (item?.title?.length || 0) <= 255 &&
  item?.description && (item?.lastName?.length || 0) <= 1000 &&
  item?.weight && (Number(item?.weight || 0)) <= 99999999.99 &&
  item?.price && (Utils.Numbers.toFinanceNumber(item?.price || 0)) <= 99999999.99 &&
  ((selectedDiscountType && selectedDiscountType.name !== Types.DiscountTypes.NO) ? (item?.discount && (Utils.Numbers.toFinanceNumber(item?.discount || 0)) <= 99999999.99) : true) &&
  item?.serves && (Number(item?.serves || 0)) <= 2147483647 &&
  item?.quantity && (Number(item?.quantity || 0)) <= 2147483647;

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
      if (categoriesOptions.length > 0) {
        const result = categoriesOptions.filter(
          (option) => option.id == item.categoryID
        );

        item.category = result.length > 0 ? result[0] : null;
      }
    }
  }

  $: if (firstLaunch) {
    if (categoriesOptions.length > 0) {
      const result = categoriesOptions.filter(
        (option) => option.id == item.categoryID
      );

      item.category = result.length > 0 ? result[0] : null;
    }

    if (Types.DiscountTypes.list.length > 0) {
      const result = Types.DiscountTypes.list.filter(
        (option) => option.id == item.discountType
      );

      selectedDiscountType =
        result.length > 0 ? result[0] : null;
    }
    firstLaunch = false;
  }

  onMount(async () => {
    if (!item.category) {
      item.category = null;
    }
    if (item.image) {
      imageSrc = item.image;
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
  {#if categoriesOptions.length > 0}
    <div class="imageContainer">
      <img src={imageSrc} alt={item?.title} />
      <img
        class="upload"
        src="/Assets/Images/upload.png"
        alt=""
        on:click={fileinput.click()}
      />
      <input
        style="display:none"
        type="file"
        accept=".jpg, .jpeg, .png"
        on:change={(e) => onFileSelected(e)}
        bind:this={fileinput}
      />
    </div>
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
      type="number"
      name="Peso do produto em KG"
      bind:value={item.weight}
      bind:rawValue={item.weight}
      placeHolder=""
    />
    <Views.TextEdit
      type="number"
      name="Serve quantas pessoas?"
      bind:value={item.serves}
      bind:rawValue={item.serves}
      placeHolder=""
    />
    <Views.TextEdit
    type="number"
      name="Quantos itens você tem?"
      bind:value={item.quantity}
      bind:rawValue={item.quantity}
      placeHolder=""
    />
    <Views.TextEdit
      type="currency"
      name="Preço:"
      bind:value={item.price}
      bind:rawValue={item.price}
      placeHolder=""
    />
    <Views.Selector
      bind:selected={selectedDiscountType}
      name="seleciona uma opção"
      options={Types.DiscountTypes.list}
    />
    {#if selectedDiscountType}
      {#if selectedDiscountType.name === Types.DiscountTypes.PERCENT}
        <Views.TextEdit
          type="percent"
          name="Disconto:"
          bind:value={item.discount}
          bind:rawValue={item.discount}
          placeHolder=""
        />
      {:else if selectedDiscountType.name === Types.DiscountTypes.VALUE}
        <Views.TextEdit
          name="Disconto:"
          bind:value={item.discount}
          bind:rawValue={item.discount}
          type="currency"
          placeHolder=""
        />
      {/if}
    {/if}
    <Views.Divider />
    <Views.Button on:click={submit} disabled={!canContinue} bottomPadding={$StatusBar.bottomPadding}
      ><Fa icon={faEdit} /> <span>Salvar</span></Views.Button
    >
  {:else}
    Precisa adicionar uma categoria pelo menos antes de adicionar novo produto
  {/if}
</div>
<Views.MessageAlert object={errorAlert} bind:show={showAlert} />

<style>
  .product {
    padding-bottom: 50px;
  }
  .imageContainer {
    position: relative;
    border-radius: 4px;
    width: 100%;
    overflow: hidden;
  }
  .imageContainer > img {
    max-width: 100%;
    /* max-height: 200px; */
    width: 100%;
  }
  .imageContainer > img.upload {
    width: 60px;
    position: absolute;
    left: 0;
    background: #00000077;
    border-radius: 4px;
  }
</style>
