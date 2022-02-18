import {
    Network
} from "@tian/components";
import {
    get
} from 'svelte/store';
import {
    Auth
} from '../stores/Auth';

const paymentMethods = [{
    id: "1",
    type: "creditCard",
    brand: "Mastercard",
    lastDigits: "8012",
    selected: true
}, {
    id: "2",
    type: "creditCard",
    brand: "Visa",
    lastDigits: "1725",
    selected: false
}];

export async function GetPaymentMethods() {
    return Network.get("/payments", get(Auth));
    // return new Promise(resolve => setTimeout(resolve, Utils.Numbers.Random(500, 5000), paymentMethods));
}

export async function DoPayment() {
    return new Promise(resolve => setTimeout(resolve, Utils.Numbers.Random(500, 5000), {
        success: true,
        message: "",
        payload: {
            id: "13",
            status: "open",
            stage: "a caminho até você",
            products: [{
                title: "Massa doida cheia de recheio",
                price: 33.5,
                quantity: 3
            }, {
                title: "Carne no capricho",
                price: 33.5,
                quantity: 1
            }],
            address: {
                id: "22",
                cep: "22222-222",
                address: "Av. outra locura, 123",
                complement: "casa dele",
                neighborhood: "Parque dos anjos",
                city: "Taboão da Serra",
                stat: "SP"
            },
            payment: {
                id: "2",
                type: "creditCard",
                brand: "Visa",
                lastDigits: "1725",
                selected: false
            },
            created: 1607110465663,
            finished: 1607110465663,
            subtotal: 123,
            coupon: 0,
            delivery: 0
        }
    }));
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

export async function addCoupon(coupon) {
    return Network.instance.post(`/coupon`, get(Auth), coupon);
}

export async function newCoupon(coupon) {
    return Network.instance.post(`/coupon`, get(Auth), coupon);
}

export async function getCoupon() {
    const response = await Network.instance.get(`/coupons`, get(Auth));
    if(response.success){
        return response.data;
    }
    return [];
}

export async function countCoupons() {
    let response = await Network.instance.get("/couponsCount", get(Auth));
    if(response.success){
        return response.data
    }
    return 0;
}

export async function deleteCoupon(id) {
    const response = await Network.instance.remove(`/coupon/${id}`, get(Auth));
    if(response.success){
        return response.data;
    }
    return false;
}