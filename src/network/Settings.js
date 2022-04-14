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

export async function updatePaymentGateway(object) {
    return Network.instance.put("/updatePaymentGateway", get(Auth), object);
}

export async function updateBusinessHours(object) {
    return Network.instance.put("/businessHours", get(Auth), object);
}