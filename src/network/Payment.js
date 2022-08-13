import {
    Network
} from "@ikomida/components";
import {
    get
} from 'svelte/store';
import {
    Auth
} from '../stores/Auth';

export async function GetPaymentMethods() {
    return Network.get("/payments", get(Auth));
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
    const response = await Network.instance.post("/coupon", get(Auth), object);
    if (response?.success) {
        await Network.instance.clearCache(Network.cacheTypes.STAFF)
    }
    return response
}

export async function getCoupons(refresh = false) {
    return await Network.instance.loadMore(Network.cacheTypes.COUPONS, '/coupons', get(Auth), refresh)
}

export async function countCoupons() {
    let response = await Network.instance.get("/couponsCount", get(Auth));
    if (response?.success) {
        return response?.data
    }
    return 0;
}

export async function deleteCoupon(id) {
    return Network.instance.remove(`/coupon/${id}`, get(Auth));
}

export async function getSubscription() {
    let response = await Network.instance.get("/vendor/subscription", get(Auth));
    if (response?.success) {
        return response?.data
    }
    return null;
}