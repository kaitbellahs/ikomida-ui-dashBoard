<script>
    import { Title, Navigation, Router, Routes } from "../../stores/Navigation";
    import Fa from "svelte-fa";
    import { faEdit } from "@fortawesome/free-solid-svg-icons";
    import { StatusBar } from "../../stores/Setup";
    import { Views } from "@tian/components";
    import { newCoupon } from "../../network/Payment";
  
    let item = {
        name: null,
        value: null,
        quantity: null,
        validity: null,
    };
    let isLoading = false;
    const submit = async () => {
      isLoading = true;
      let response;
        response = await newCoupon(item);
      if(response){
        Navigation.reset(Routes.coupons);
      }
      isLoading = false;
    };
    Title.set("Novo cupom");
  </script>
  
  {#if isLoading}
    <Views.Loading
      topPadding={$StatusBar.height}
      bottomPadding={$StatusBar.bottomPadding}
    />
  {/if}
  <div class="coupon">
    <Views.TextEdit
      name="Nome:"
      bind:value={item.name}
      placeHolder=""
    />
    <Views.TextEdit
      name="Valor:"
      bind:value={item.value}
      placeHolder=""
    />
    <Views.TextEdit
      name="Quantidade:"
      bind:value={item.quantity}
      placeHolder=""
    />
    <Views.TextEdit
    type="date"
      name="Validade:"
      bind:value={item.validity}
      placeHolder=""
    />
    <Views.Divider />
    <Views.Button on:click={submit} bottomPadding={$StatusBar.bottomPadding}
      ><Fa icon={faEdit} /> <span>Salvar</span></Views.Button
    >
  </div>
  
  <style>
    .coupon {
      padding-bottom: 50px;
    }
  </style>
  