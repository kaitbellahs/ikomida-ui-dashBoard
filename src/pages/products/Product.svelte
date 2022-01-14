<script>
  import { Title, Navigation, Router } from "../../stores/Navigation";
  import Fa from "svelte-fa";
  import {
    faEdit, faTrashAlt
  } from "@fortawesome/free-solid-svg-icons";
  import { StatusBar } from "../../stores/Setup";
  import { Views, Utils } from "@tian/components";

  const item = $Router.options;

const edit = async () => {
  Navigation.goTo(Router.values.editProduct, {item, edit: true});
};

const newProduct = async () => {
  Navigation.goTo(Router.values.editProduct, {item, edit: false});
};

const deleteProduct = async () => {
  Navigation.goTo(Router.values.editProduct, {item, edit: false});
};

  Title.set(item.title);
</script>

<div class="product">
  <img src={item.src} alt={item.title} />
  <h2>{item.title}</h2>
  <p>{item.description}</p>
  <span class="serves"
    >Aproximadamente {Utils.Strings.formatNumber(item.weight)} Kg</span>

  <div class="price">
    <span class:current={item.oldPrice != undefined && item.oldPrice != 0}
      >{Utils.Strings.currency(item.price)}</span
    >
    {#if item.oldPrice != undefined && item.oldPrice != 0}
      <span class="oldPrice">{Utils.Strings.currency(item.oldPrice)}</span>
    {/if}
  </div>
  <div class="quantity">
    Resta{item.quantity > 1 ? "m" : ""} <span>{item.quantity}</span> unidades 
  </div>
  <Views.Button
    on:click={deleteProduct}
    ><Fa icon={faTrashAlt} /> <span>Remover este produto</span></Views.Button
  >
  <Views.Button
    on:click={edit}
    ><Fa icon={faEdit} /> <span>Editar</span></Views.Button
  >
  <Views.Button
    on:click={newProduct}
    ><Fa icon={faEdit} /> <span>Novo produto Similar</span></Views.Button
  >
</div>

<style>
  .product {
    padding-bottom: 50px;
  }
  .quantity {
    margin-top: 10px;
    align-items: center;
    font-size: 1.8em;
    text-align: center;
  }
  .quantity > span {
    padding: 0;
    border: 0;
    background: transparent;
    margin-right: 10px;
    margin-left: 10px;
  }
  .price {
    margin-top: 20px;
    width: 100%;
    min-width: 100%;
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
  }
  .oldPrice {
    text-decoration: line-through;
    color: #717171;
    font-size: 0.8rem;
  }
  .current {
    color: green;
    font-size: 1.5em;
    margin-top: 10px;
  }
  p {
    font-size: 0.8rem;
    font-weight: lighter;
    margin: 10px 0;
  }
  .serves {
    font-size: 0.8rem;
  }
  img {
    width: 100%;
    max-width: 100%;
  }
</style>
