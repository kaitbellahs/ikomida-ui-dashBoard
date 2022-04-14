import {
    Store
} from '../stores/Products';
import {
    get
} from 'svelte/store';
import {
    Auth
} from '../stores/Auth';
import {
    Network
} from "@tian/components";

export async function all() {
    let products = get(Store);
    if (!products.timeout || products.timeout < new Date(new Date().setMinutes(new Date().getMinutes() + 2)).getTime()) {
        const response = await Network.instance.get("/products", get(Auth));
        if (response?.success) {
            Store.updateItems({
                items: response?.data,
                timeout: new Date().getTime()
            });
            return response?.data;
        } else {
            return [];
        }
    } else {
        return products.items;
    }
}

export async function countProducts() {
    let response = await Network.instance.get("/productsCount", get(Auth));
    if(response?.success){
        return response?.data
    }
    return 0;
}

export async function getCategories() {
    let response = await Network.instance.get(`/categories`, get(Auth));
    if (response?.success) {
        return response?.data;
    }
    return [];
}

export async function deleteProduct(id) {
    return Network.instance.remove(`/product/${id}`, get(Auth));
}

export async function deleteCategory(id) {
    return Network.instance.remove(`/category/${id}`, get(Auth));
}

export async function newProduct(object) {
    console.log(object)
    return Network.instance.post("/product", get(Auth), object);
}

export async function updateProduct(object) {
    return Network.instance.put("/product", get(Auth), object);
}

export async function newCategory(object) {
    return Network.instance.post("/category", get(Auth), object);
}

export async function updateCategory(object) {
    return Network.instance.put("/category", get(Auth), object);
}

export async function search(query) {
    return (await all()).map(section => {
        return {
            title: section.title,
            products: section.products.filter(item => {
                if (typeof item == "object") {
                    return item.title.toLowerCase().includes(query.toLowerCase()) || item.description.toLowerCase().includes(query.toLowerCase());
                } else {
                    return true;
                }
            })
        };
    }).filter(item => item.products.length > 0);
}