import {
    Network,
    Stores,
} from "@ikomida/components";


export async function GetPaymentMethods() {
    return Network.get("/payments", true);
}

export function PaymentType(type) {
    switch (type?.toLowerCase()) {
        case "creditcard":
            return "cartão de crédito";
        case "pix":
            return "PIX";
        case "boleto":
            return "boleto bancário";
        case "cash":
            return "Dinheiro";
        default:
            return "-";
    }
}

export async function newCoupon(object) {
    const response = await Network.instance.post("/coupon", true, object);
    if (response?.success) {
        await Network.instance.clearCache(Stores.Cache.Types.STAFF)
    }
    return response
}

export async function countCoupons() {
    let response = await Network.instance.get("/couponsCount", true);
    if (response?.success) {
        return response?.data
    }
    return 0;
}

export async function deleteCoupon(id) {
    return Network.instance.remove(`/coupon/${id}`, true);
}

export async function getSubscription() {
    let response = await Network.instance.get("/vendor/subscription", true);
    if (response?.success) {
        return response?.data
    }
    return null;
}