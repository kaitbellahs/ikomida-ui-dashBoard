import App from './App.svelte';
import { Network } from '@tian/components';

Network.createInstance("http://10.0.0.103:1988", "ProjX", "vendor");

const app = new App({
	target: document.body
});

export default app;