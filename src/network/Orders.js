import {
    Network
} from "@ikomida/components";
import {
    get
} from 'svelte/store';
import {
    Auth
} from '../stores/Auth';

const openOrdersStatus = ["waitingPayment", "open", "accepted", "waitingDelivery", "delivery"];

export async function getOrders (history, timestamp = 0) {
    let response = await Network.instance.get(`/orders/${timestamp}${history ? '/history' : ''}`, get(Auth));
    let orders = [];
    if (response?.success) {
        orders = response?.data || [];
    }
    return orders;
}

export async function ChangeOrderStatus(id, status) {
    return Network.instance.put("/order", get(Auth), {
        id,
        status
    }), "editOrder";
}

export async function countOrders() {
    let response = await Network.instance.get("/ordersCount", get(Auth));
    if (response?.success) {
        return response?.data
    }
    return 0;
}

export function OrderStatus(status) {
    switch (status) {
        case "waitingPayment":
            return "aguardando pagamento";
        case "open":
        case "accepted":
        case "waitingDelivery":
        case "delivery":
            return "em andamento";
        case "delivered":
            return "entregue";
        case "canceled":
            return "cancelado";
    }
}

export function OrderStage(status) {
    switch (status) {
        case "waitingPayment":
            return "aguardando pagamento";
        case "open":
            return "aguardando aprovação";
        case "accepted":
            return "em preparação";
        case "waitingDelivery":
            return "esperando para sair para delivery";
        case "delivery":
            return "a caminho até você";
        case "delivered":
            return "entregue";
        case "canceled":
            return "cancelado";
    }
}