import App from './App.svelte';
import { Network } from '@tian/components';

Network.createInstance("http://127.0.0.1:1988", "com.deluxeApp.hjgdhjagsd", "vendor");

const app = new App({
	target: document.body
});

export default app;