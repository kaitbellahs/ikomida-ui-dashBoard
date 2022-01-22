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
            orders = response.data.filter(item => item.status !== "open");
        } else {
            orders = response.data.filter(item => item.status === "open");
        }
    }
    return orders;
}

export async function ChangeOrderStatus(id, status) {
    let response = await Network.instance.put("/order", get(Auth), {id, status});
    return response.success;
}

export function OrderStatus(status) {
    switch (status) {
        case "open":
            return "em andamento";
        case "delivered":
            return "entregue";
        case "canceled":
            return "cancelado";
    }
}