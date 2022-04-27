import {
    get
} from 'svelte/store';
import {
    Auth
} from '../stores/Auth';
import {
    Network
} from "@tian/components";

export async function getLayout() {
    return Network.instance.get("/layout");
}

export async function updateLayout(object) {
    return Network.instance.put("/layout", get(Auth), object);
}