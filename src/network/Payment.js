import {
    Network
} from "@tian/components";
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
    switch (type) {
        case "creditCard":
            return "cartão de crédito";
        case "pix":
            return "PIX";
        case "boleto":
            return "boleto bancário";
        default:
            return "-";
    }
}

export async function newCoupon(coupon) {
    return Network.instance.post(`/coupon`, get(Auth), coupon);
}

export async function getCoupon() {
    const response = await Network.instance.get(`/coupons`, get(Auth));
    if(response?.success){
        return response?.data;
    }
    return [];
}

export async function countCoupons() {
    let response = await Network.instance.get("/couponsCount", get(Auth));
    if(response?.success){
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