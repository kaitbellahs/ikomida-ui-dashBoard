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
export async function getPushNotifications(refresh = false) {
    return await Network.instance.loadMore(Network.cacheTypes.PUSH_NOTIFICATIONS, '/vendor/pushNotifications', get(Auth), refresh)
}

export async function newPushNotification(object) {
    const response = await Network.instance.post("/vendor/pushNotification", get(Auth), object);
    if (response?.success) {
        await Network.instance.clearCache(Network.cacheTypes.STAFF)
    }
    return response
}