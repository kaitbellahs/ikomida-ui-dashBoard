<script lang="ts">
  import Routes from '../../stores/Routes'
  import { removeStaff } from '../../network/Staff'
  import { Views, Utils, Stores, Types } from '@ikomida/shared-frontend'
  import { StatusBar } from '../../stores/Setup'
  import { onMount, tick } from 'svelte'
  import Fa from 'svelte-fa'
  import { faEdit } from '@fortawesome/free-solid-svg-icons'

  let userInfo: Types.Classes.CUser
  let auth: Stores.Auth.IStore
  let items: Types.Classes.CUser[]

  $: {
    items = Types.Classes.CUser.fromObject(items)
    console.log(items)
  }
  onMount(async () => {
    auth = await Stores.Auth.Auth.instance.store()
    userInfo = Types.Classes.CUser.fromObject(await Utils.Jws.extractToken($auth))
    Stores.Loading.instance.stop()
  })

  async function onRemoveClick(id?: string) {
    if (!id) {
      return
    }
    Stores.Loading.instance.start()
    let response = await removeStaff(id)
    if (response.success) {
      Stores.LoadMore.instance.refresh()
    } else {
      Stores.MessageAlert.instance.show(response?.data)
      Stores.Loading.instance.stop()
      return
    }
    Stores.Loading.instance.stop()
  }

  async function newStaff() {
    Stores.Navigation.instance.goTo(Routes.newStaff)
  }

  function roleName(role: string) {
    switch (role.toUpperCase()) {
      case 'VENDOR':
        return 'Responsável'
      case 'STAFF':
        return 'Colaborador'
      default:
        return '-'
    }
  }
  Stores.Title.instance.set('Lista de colaboradores')
</script>

<div style="padding: 0 16pt;">
  <Views.Button on:click={newStaff} bottomPadding={$StatusBar.bottomPadding}
    ><Fa icon={faEdit} /> <span>Novo colaborador</span></Views.Button
  >
</div>
<Views.Divider />
<Views.LoadMoreReusableList
  noItems="Não há colaboradores cadastrados para exibir!"
  cache={Stores.Cache.Types.STAFF}
  url="/vendor/staff"
  bind:items
  let:index
>
  <article>
    {#if userInfo && userInfo.role === Types.Types.TRoles.VENDOR && userInfo.id !== items[index]?.id}
      <Views.FloatRemove top={-4} right={-4} callback={() => onRemoveClick(items[index].id)} />
    {/if}
    <h2>{items?.[index]?.name} {items?.[index]?.lastName}</h2>
    <div>Telefone: {Utils?.Strings?.formatAsPhone(items?.[index]?.phone)}</div>
    <div>Título: {items?.[index]?.role?.name}</div>
  </article>
</Views.LoadMoreReusableList>

<style>
  article {
    position: relative;
    border-radius: 8pt;
    padding: 16pt;
  }
</style>
