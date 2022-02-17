import App from './App.svelte';
import { Network } from '@tian/components';

Network.createInstance("http://10.0.0.102:1988", "projx.test-6", "vendor");

const app = new App({
	target: document.body
});

export default app;