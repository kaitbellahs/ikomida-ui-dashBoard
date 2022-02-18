import {
    Network
} from "@tian/components";
import {
    get
} from 'svelte/store';
import {
    Auth
} from '../stores/Auth';

export async function GetOrders(showHistory) {
    let response = await Network.instance.get("/orders", get(Auth));
    let orders = [];
    if (response.success) {
        if (showHistory) {
            orders = response.data.filter(item => !["open", "accepted", "waitingDelivery", "delivery"].includes(item.status));
        } else {
            orders = response.data.filter(item => ["open", "accepted", "waitingDelivery", "delivery"].includes(item.status));
        }
    }
    return orders;
}

export async function ChangeOrderStatus(id, status) {
    let response = await Network.instance.put("/order", get(Auth), {id, status});
    return response.success;
}

export async function countOrders() {
    let response = await Network.instance.get("/ordersCount", get(Auth));
    if(response.success){
        return response.data
    }
    return 0;
}

export function OrderStatus(status) {
    switch (status) {
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