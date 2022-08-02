import App from './App.svelte';
import { Network } from '@ikomida/components';

// Network.createInstance("https://api.ikomida.com", "com.ikomida.br.ikomida", "vendor");
Network.createInstance("http://ikomida.ddns.net", "com.ikomida.br.default", "vendor", "6LebYzshAAAAAIXhka3WrAjus5tDXtefR1QefVZS");

const app = new App({
	target: document.body
});

export default app;