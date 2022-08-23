import {
    Network
} from "@ikomida/components";

export async function getSettings() {
    return await Network.instance.get("/vendor/settings", true);
}
export async function getLimits() {
    return Network.instance.get("/vendor/limits", true);
}

export async function getPagSeguroUrl() {
    return Network.instance.get("/vendor/pagSeguroUrl", true, null, "pagSeguroUrl");
}

export async function setSettings(object) {
    return Network.instance.put("/vendor/settings", true, object);
}

export async function updatePaymentGateway(object) {
    return Network.instance.put("/vendor/updatePaymentGateway", true, object, "updatePaymentGateway");
}

export async function revokePaymentGateway(object) {
    return Network.instance.remove("/vendor/revokePaymentGateway", true, object, "revokePaymentGateway");
}

export async function updateBusinessHours(object) {
    return Network.instance.put("/vendor/businessHours", true, object);
}

export async function setDelivery(preparation, delivery) {
    return Network.instance.put("/vendor/delivery", true, { preparation, delivery });
}