import {
    Network,
    Types,
    Stores,
} from "@ikomida/components";


export async function getOrders(refresh = false) {
    return await Network.instance.loadMore(Stores.Cache.Types.ORDERS, '/orders', true, refresh)
}

export async function ChangeOrderStatus(id, status) {
    let response = await Network.instance.put("/order", true, {
        id,
        status
    }, "editOrder");
    if (response?.success) {
        await Network.instance.clearCache(Stores.Cache.Types.ORDERS)
    }
    return response
}

export async function countOrders() {
    let response = await Network.instance.get("/ordersCount", true);
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