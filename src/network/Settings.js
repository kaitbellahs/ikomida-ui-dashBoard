import {
    get
} from 'svelte/store';
import {
    Auth
} from '../stores/Auth';
import {
    Network
} from "@tian/components";

export async function getSettings() {
    let response = await Network.instance.get("/vendorsettings", get(Auth));
    if (response?.success) {
        return response?.data
    }
    return null;
}

export async function setSettings(object) {
    return Network.instance.put("/vendorsettings", get(Auth), object);
}