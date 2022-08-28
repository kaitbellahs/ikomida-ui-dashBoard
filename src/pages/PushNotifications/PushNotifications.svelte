<script>
  import Routes from "../../stores/Routes";
  import Fa from "svelte-fa";
  import { faSync, faRocket } from "@fortawesome/free-solid-svg-icons";
  import { Views, Utils, Stores } from "@ikomida/components";
  import { getPushNotifications } from "../../network/PushNotification";
  import { StatusBar } from "../../stores/Setup";
  import { onMount } from "svelte";

  onMount(async () => {
    Stores.Loading.instance.stop();
  });

  const newPushNotification = async () => {
    Stores.Navigation.instance.goTo(Routes.newPushNotification);
  };

  Stores.Title.instance.set("Mensagens push");
</script>

<Views.Button
  on:click={newPushNotification}
  bottomPadding={$StatusBar.bottomPadding}
  ><Fa icon={faRocket} /> <span>Enviar mensagem</span></Views.Button
>
<Views.Divider />
<Views.LoadMore
  noItems="Não há mensagens para exibir por enquanto, Aproveite e mande uma mensagem com um cupom de desconto para incentivar seus clientes!"
  cache={Stores.Cache.Types.PUSH_NOTIFICATIONS}
  url="/vendor/pushNotifications"
  let:item
>
  <article>
    <h2>{item?.title}</h2>
    <div>{item?.body}</div>
    <div>Enviados: {item?.sends}</div>
    <div>Falhas: {item?.fails}</div>
    <div>Abertos: {item?.opens}</div>
    <div>
      {Utils.Strings.dateToDateString(item?.createdAt)}
    </div>
  </article></Views.LoadMore
>

<style>
  article {
    position: relative;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-top: 10px;
    padding: 10px;
  }
</style>
