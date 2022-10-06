window.environment = 'ENVIRONMENT'

import App from './App.svelte'
import { Network, Stores } from '@ikomida/shared-frontend'
import Routes from './stores/Routes'

const appVersion = '0.0.1'
const agent = 'VENDOR'
const url: any = {
  production: 'https://api.ikomida.com',
  development: 'https://dev.api.ikomida.com',
  homologation: 'https://hmlg.api.ikomida.com'
}
Stores.Cache.createInstance()
Network.createInstance(
  url[window.environment],
  'com.ikomida.br.',
  agent,
  '6LebYzshAAAAAIXhka3WrAjus5tDXtefR1QefVZS',
  appVersion
)
Stores.Auth.Auth.createInstance(agent)
Stores.MenuHamburger.createInstance()
Stores.Menu.createInstance()
Stores.Title.createInstance()
Stores.Loading.createInstance()
Stores.PushNotificationToken.createInstance()
Stores.Navigation.createInstance(Routes.home)
Stores.LoadMore.createInstance()
Stores.Layout.createInstance()

const app = new App({
  target: document.body
})

export default app
