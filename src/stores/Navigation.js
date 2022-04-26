import {
    writable,
    derived
} from 'svelte/store';
import {
    v4 as uuidV4
} from "uuid";

export const Routes = {
    home: Symbol("/home"),
    orders: Symbol("/orders"),
    order: Symbol("/order"),
    settings: Symbol("/settings"),
    search: Symbol("/search"),
    product: Symbol("/product"),
    products: Symbol("/products"),
    editProduct: Symbol("/editProduct"),
    editCategory: Symbol("/editCategory"),
    cart: Symbol("/cart"),
    checkout: Symbol("/checkout"),
    confirmSubscribe: Symbol("/confirmSubscribe"),
    subscribe: Symbol("/subscribe"),
    coupons: Symbol("/coupons"),
    newCoupon: Symbol("/newCoupon"),
    tac: Symbol("/tac"),
    profile: Symbol("/profile"),
    layout: Symbol("/layout"),
    subscription: Symbol("/subscription")
};

function createTitle() {
    const {
        subscribe,
        set
    } = writable("");

    return {
        subscribe,
        set: (title) => set(title)
    };
}

export const Title = createTitle();

function createMenu() {
    const {
        subscribe,
        set,
        update
    } = writable([]);

    return {
        subscribe,
        reset: () => set([]),
        addItem: (item) => update(items => [...items, item])
    };
}

export const Menu = createMenu();
export const MenuHamburger = createMenu();

function createNavigation() {
    const {
        subscribe,
        update,
        set
    } = writable([{
        route: Routes.home,
        options: null,
        uuid: uuidV4()
    }]);

    return {
        subscribe,
        reset: (route) => {
            set([{
                route,
                uuid: uuidV4(),
                options: null
            }]);
            Menu.reset();
        },
        goTo: (route, options) => {
            update(navigation => [...navigation, {
                route,
                options,
                uuid: uuidV4()
            }]);
            Menu.reset();
        },
        pop: (count) => {
            update(navigation => {
                if (navigation.length > 1) {
                    let itemsToRemove = 1
                    if (count != undefined && typeof count === 'number' && count > 1 && count < navigation.length) {
                        itemsToRemove = count;
                    }
                    return [...navigation.slice(0, navigation.length - itemsToRemove)];
                } else {
                    return navigation;
                }
            });
            Menu.reset();
        }
    };
}
export const Navigation = createNavigation();

export const Router = derived(
    Navigation,
    $Navigation => $Navigation[$Navigation.length - 1]
);