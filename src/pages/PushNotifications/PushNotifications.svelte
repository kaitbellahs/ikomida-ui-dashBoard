<script lang="ts">
  import Routes from '../../stores/Routes'
  import Fa from 'svelte-fa'
  import { faRocket } from '@fortawesome/free-solid-svg-icons'
  import { Views, Utils, Stores } from '@ikomida/shared-frontend'
  import { StatusBar } from '../../stores/Setup'
  import { onMount } from 'svelte'

  //TODO: -- implement CPush class
  let items: any[]

  onMount(async () => {
    Stores.Loading.instance.stop()
  })

  const newPushNotification = async () => {
    Stores.Navigation.instance.goTo(Routes.newPushNotification)
  }

  Stores.Title.instance.set('Mensagens push')
</script>

<Views.Button on:click={newPushNotification} bottomPadding={$StatusBar.bottomPadding}
  ><Fa icon={faRocket} /> <span>Enviar mensagem</span></Views.Button
>
<Views.Divider />
<Views.LoadMoreReusableList
  noItems="Não há mensagens para exibir por enquanto, Aproveite e mande uma mensagem com um cupom de desconto para incentivar seus clientes!"
  cache={Stores.Cache.Types.PUSH_NOTIFICATIONS}
  url="/vendor/pushNotifications"
  let:index
  bind:items
>
  <article>
    <h2>{items[index].title ?? ''}</h2>
    <div>{items[index].body ?? ''}</div>
    <div>Enviados: {items[index].sends ?? 0}</div>
    <div>Falhas: {items[index].fails ?? 0}</div>
    <div>Abertos: {items[index].opens ?? 0}</div>
    <div>
      {Utils.Strings.dateToString(items[index].createdAt)}
    </div>
  </article>
</Views.LoadMoreReusableList>

<style>
  article {
    position: relative;
    padding: 16pt;
  }
</style>
