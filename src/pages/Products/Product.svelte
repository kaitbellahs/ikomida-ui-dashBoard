<script lang="ts">
  import Routes from '../../stores/Routes';
  import Fa from 'svelte-fa';
  import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
  import { Views, Utils, Types, Logics, Stores } from '@ikomida/shared-frontend';
  import { deleteProduct } from '../../network/Products';
  import { onMount } from 'svelte';

  const router = Stores.Navigation.instance.router;
  const item = $router.options;
  console.log('item:', item);
  const edit = async () => {
    Stores.Navigation.instance.goTo(Routes.editProduct, {
      item,
      edit: true,
    });
  };

  const newProduct = async () => {
    Stores.Navigation.instance.goTo(Routes.editProduct, {
      item,
      edit: false,
    });
  };

  async function removeProduct() {
    Stores.Loading.instance.start();
    const response = await deleteProduct(item.id);
    if (response?.success) {
      Stores.Navigation.instance.pop();
    } else {
      Stores.MessageAlert.instance.show(response?.data);
    }
    Stores.Loading.instance.stop();
  }

  onMount(() => {
    Stores.Loading.instance.stop();
  });

  Stores.Title.instance.set(item.title);
</script>

<div class="product">
  {#if item.image}
    <img src={item.image} alt={item.title} />
  {/if}
  <h2>{item.title}</h2>
  <p>{item.description}</p>
  <span class="serves">Aproximadamente {Logics.Finances.formatWeight(item.weight)}</span>
  <div class="price">
    {#if [Types.Types.TDiscount.PERCENT, Types.Types.TDiscount.VALUE].includes(item.discountType)}
      <span class="oldPrice">{Utils.Strings.currency(item.price)}</span>
    {/if}
    <span class="current"
      >{Utils.Strings.currency(
        item.price - Logics.Finances.calcDiscount(item.price, item.discount, item.discountType),
      )}</span
    >
  </div>
  <div class="quantity">
    Resta{item.quantity > 1 ? 'm' : ''} <span>{item.quantity}</span>
    unidade{item.quantity > 1 ? 's' : ''}
  </div>
  <Views.Divider />
  <Views.Button on:click={removeProduct}><Fa icon={faTrashAlt} /> <span>Remover este produto</span></Views.Button>
  <Views.Button on:click={edit}><Fa icon={faEdit} /> <span>Editar</span></Views.Button>
  <Views.Button on:click={newProduct}><Fa icon={faEdit} /> <span>Novo produto Similar</span></Views.Button>
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
    object-fit: contain;
    border-radius: 4px;
  }
</style>
