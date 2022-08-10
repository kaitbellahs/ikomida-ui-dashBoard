import {
    Network
} from "@ikomida/components";
import {
    get
} from 'svelte/store';
import {
    Auth
} from '../stores/Auth';

export async function registerPushNotificationToken(object) {
    return Network.instance.post("/notification/register", get(Auth), object);
}
export async function getPushNotifications(timestamp = 0) {
    const response = await Network.instance.get(`/vendor/pushNotifications/${timestamp}`, get(Auth));
    if (response && response?.success) {
        return response?.data ?? [];
    }
    return [];
}

export async function newPushNotification(object) {
    return Network.instance.post("/vendor/pushNotification", get(Auth), object);
}