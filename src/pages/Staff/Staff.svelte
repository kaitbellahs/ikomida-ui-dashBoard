<script>
  import Routes from '../../stores/Routes';
  import { removeStaff } from '../../network/Staff';
  import { Views, Utils, Stores } from '@ikomida/shared-frontend';
  import { StatusBar } from '../../stores/Setup';
  import { onMount } from 'svelte';
  import Fa from 'svelte-fa';
  import { faEdit } from '@fortawesome/free-solid-svg-icons';

  let userInfo;
  let auth;

  onMount(async () => {
    auth = await Stores.Auth.Auth.instance.store();
    userInfo = await Utils.Jws.extractToken($auth);
    Stores.Loading.instance.stop();
  });

  async function onRemoveClick(id) {
    Stores.Loading.instance.start();
    let response = await removeStaff(id);
    if (response.success) {
      Stores.LoadMore.instance.refresh();
    } else {
      Stores.MessageAlert.instance.show(response?.data);
      Stores.Loading.instance.stop();
      return;
    }
    Stores.Loading.instance.stop();
  }

  async function newStaff() {
    Stores.Navigation.instance.goTo(Routes.newStaff);
  }

  function roleName(role) {
    switch (role.toLowerCase()) {
      case 'VENDOR':
        return 'Responsável';
      case 'STAFF':
        return 'Colaborador';
      default:
        return '-';
    }
  }
  Stores.Title.instance.set('Lista de colaboradores');
</script>

<Views.Button on:click={newStaff} bottomPadding={$StatusBar.bottomPadding}
  ><Fa icon={faEdit} /> <span>Novo colaborador</span></Views.Button
>
<Views.Divider />
<Views.LoadMoreReusableList
  noItems="Não há colaboradores cadastrados para exibir!"
  cache={Stores.Cache.Types.STAFF}
  url="/vendor/staff"
  let:item
>
  <article>
    {#if userInfo?.id !== item?.id}
      <Views.FloatRemove callback={() => onRemoveClick(item?.id)} />
    {/if}
    <h2>{item?.name} {item?.lastName}</h2>
    <div>Telefone: {Utils?.Strings?.formatAsPhone(item?.phone)}</div>
    <div>Título: {roleName(item?.role)}</div>
  </article>
</Views.LoadMoreReusableList>

<style>
  article {
    position: relative;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-top: 10px;
    box-shadow: 2px 3px #cccccc7a;
    padding: 20px;
  }
</style>
