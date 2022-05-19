import {
    get
} from 'svelte/store';
import {
    Auth
} from '../stores/Auth';
import {
    Network
} from "@ikomida/components";

export async function getSettings() {
    let response = await Network.instance.get("/vendor/settings", get(Auth));
    if (response?.success) {
        return response?.data
    }
    return null;
}

export async function getPagSeguroUrl() {
    return Network.instance.get("/vendor/pagSeguroUrl", get(Auth));
}

export async function setSettings(object) {
    return Network.instance.put("/vendor/settings", get(Auth), object);
}

export async function updatePaymentGateway(object) {
    return Network.instance.put("/vendor/updatePaymentGateway", get(Auth), object);
}

export async function revokePaymentGateway(object) {
    return Network.instance.remove("/vendor/revokePaymentGateway", get(Auth), object);
}

export async function updateBusinessHours(object) {
    return Network.instance.put("/vendor/businessHours", get(Auth), object);
}

export async function setDelivery(preparation, delivery) {
    return Network.instance.put("/vendor/delivery", get(Auth), {preparation, delivery});
}