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

export async function getOrders(refresh = false) {
    return await Network.instance.loadMore(Network.cacheTypes.ORDERS, '/orders', get(Auth), refresh)
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
            return "aguardando aprovação";
        case Types.OrderStatusType.ACCEPTED:
            return "em preparação";
        case Types.OrderStatusType.WAITING_DELIVERY:
            return "esperando o entregador";
        case Types.OrderStatusType.IN_DELIVERY:
            return "a caminho do cliente";
        case Types.OrderStatusType.DELIVERED:
            return "entregue";
        case Types.OrderStatusType.CANCELED:
            return "cancelado";
        case Types.OrderStatusType.IN_DISPUTE:
            return "em disputa";
    }
}