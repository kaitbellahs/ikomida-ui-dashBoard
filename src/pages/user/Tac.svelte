<script>
    import { Title } from "../../stores/Navigation";
    import {Views} from "@ikomida/components";
    import { StatusBar } from "../../stores/Setup";
    
    Title.set("Perfil");
  
    $: styleHeight = `${(Number($StatusBar.height) + 50)}px`;

  </script>
  
  <Views.NavigationBar />
  <main style="margin-top:{styleHeight};padding: 20px; padding-top: 0; padding-bottom: 0; overflow: hidden;max-width: 100%;">
    dsd
  </main>