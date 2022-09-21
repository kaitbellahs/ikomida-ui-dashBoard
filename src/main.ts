import App from './App.svelte';
import { Network, Stores } from '@ikomida/shared-frontend';
import Routes from './stores/Routes';

const appVersion = '0.0.1';
let isProd = false;
try {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  isProd = isProduction !== undefined && isProduction;
  // eslint-disable-next-line no-empty
} catch (error: any) { }
const agent = 'VENDOR';
const url = isProd ? 'https://api.ikomida.com' : 'hmlg.api.ikomida.com';
Stores.Cache.createInstance();
Network.createInstance(url, 'com.ikomida.br.', agent, '6LebYzshAAAAAIXhka3WrAjus5tDXtefR1QefVZS', appVersion);
Stores.Auth.Auth.createInstance(agent);
Stores.MenuHamburger.createInstance();
Stores.Menu.createInstance();
Stores.Title.createInstance();
Stores.PushNotificationToken.createInstance();
Stores.Navigation.createInstance(Routes.home);
Stores.LoadMore.createInstance();

const app = new App({
  target: document.body,
});

export default app;
