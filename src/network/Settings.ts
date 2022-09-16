import {
    Network, Types
} from "@ikomida/shared-frontend";

export async function getSettings() {
    return await Network.instance?.get("/vendor/settings", true);
}
export async function getLimits() {
    return Network.instance?.get("/vendor/limits", true);
}

export async function getPagSeguroUrl() {
    return Network.instance?.get("/vendor/pagSeguroUrl", true, null, "pagSeguroUrl");
}

export async function setSettings(object: Types.Interfaces.IVendorSettings) {
    return Network.instance?.put("/vendor/settings", true, object);
}

export async function updatePaymentGateway(object: any) {
    return Network.instance?.put("/vendor/updatePaymentGateway", true, object, "updatePaymentGateway");
}

export async function revokePaymentGateway() {
    return Network.instance?.remove("/vendor/revokePaymentGateway", true, null, "revokePaymentGateway");
}

export async function updateBusinessHours(object: Types.Interfaces.IBusinessTime) {
    return Network.instance?.put("/vendor/businessHours", true, object);
}

export async function setDelivery(preparation: Types.Interfaces.IVendorPreparation, delivery: Types.Interfaces.IVendorDelivery) {
    return Network.instance?.put("/vendor/delivery", true, { preparation, delivery });
}