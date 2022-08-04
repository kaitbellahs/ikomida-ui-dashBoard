import {
    Network,
    Types
} from "@ikomida/components";
import {
    get
} from 'svelte/store';
import {
    Auth
} from '../stores/Auth';

const openOrdersStatus = [Types.OrderStatusType.WAITING_PAYMENT, Types.OrderStatusType.OPEN, Types.OrderStatusType.ACCEPTED, Types.OrderStatusType.WAITING_DELIVERY, Types.OrderStatusType.IN_DELIVERY];

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
    }, "editOrder");
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
        case Types.OrderStatusType.WAITING_PAYMENT:
            return "aguardando pagamento";
        case Types.OrderStatusType.OPEN:
        case Types.OrderStatusType.ACCEPTED:
        case Types.OrderStatusType.WAITING_DELIVERY:
        case Types.OrderStatusType.IN_DELIVERY:
            return "em andamento";
        case Types.OrderStatusType.DELIVERED:
            return "entregue";
        case Types.OrderStatusType.CANCELED:
            return "cancelado";
    }
}