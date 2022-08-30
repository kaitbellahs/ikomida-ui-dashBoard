import {
    Network,
    Stores,
} from "@ikomida/components";


export async function registerPushNotificationToken(object) {
    return Network.instance.post("/notification/register", true, object);
}

export async function newPushNotification(object) {
    const response = await Network.instance.post("/vendor/pushNotification", true, object);
    if (response?.success) {
        await Network.instance.clearCache(Stores.Cache.Types.STAFF)
    }
    return response
}