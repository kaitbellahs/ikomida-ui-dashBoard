import App from './App.svelte';
import { Network, Stores } from '@ikomida/components';
import Routes from './stores/Routes'

let appVersion = '0.0.1'
let isProd = false
try {
    isProd = (isProduction !== undefined && isProduction)
} catch (error) {
}
let agent = "vendor"
const url = isProd ? "https://api.ikomida.com" : "http://192.168.1.200"
Stores.Cache.createInstance()
Network.createInstance(url, "com.ikomida.br.", agent, "6LebYzshAAAAAIXhka3WrAjus5tDXtefR1QefVZS", appVersion);
Stores.Auth.createInstance(agent)
Stores.MenuHamburger.createInstance()
Stores.Menu.createInstance()
Stores.Title.createInstance()
Stores.PushNotificationToken.createInstance()
Stores.Navigation.createInstance(Routes);

const app = new App({
    target: document.body
});

export default app;