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
    if (products.timeout == undefined || products.timeout < Date.now() - (5 * 60 * 60)) {
        const response = await Network.instance.get("/products", get(Auth));
        console.log(response);
        if (response.success) {
            Store.updateItems({
                items: response.data,
                timeout: Date.now()
            });
            return response.data;
        } else {
            return [];
        }
    } else {
        return products.items;
    }
}

export async function countProducts() {
    let response = await Network.instance.get("/productsCount", get(Auth));
    if(response.success){
        return response.data
    }
    return 0;
}

export async function getCategories() {
    let response = await Network.instance.get(`/categories`, get(Auth));
    if (response.success) {
        return response.data;
    }
    return [];
}

export async function deleteProduct(id) {
    let response = await Network.instance.remove(`/product/${id}`, get(Auth));
    return response.success;
}

export async function deleteCategory(id) {
    let response = await Network.instance.remove(`/category/${id}`, get(Auth));
    return response.success;
}

export async function newProduct(object) {
    let response = await Network.instance.post("/product", get(Auth), object);
    return response.success;
}

export async function updateProduct(object) {
    let response = await Network.instance.put("/product", get(Auth), object);
    return response.success;
}

export async function newCategory(object) {
    let response = await Network.instance.post("/category", get(Auth), object);
    return response.success;
}

export async function updateCategory(object) {
    let response = await Network.instance.put("/category", get(Auth), object);
    return response.success;
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