import {
    Network, Types, Stores
} from "@ikomida/shared-frontend";
const cache = Stores.Cache.createInstance('Products')
let timeout: Date
export async function all(): Promise<Types.Classes.CCategoryProducts[]> {
    if (!timeout || timeout < new Date(new Date().setMinutes(new Date().getMinutes() + 2))) {
        const response = await Network.instance?.get("/products", true);
        if (response?.success) {
            cache.setObject('Products', response?.data)
            timeout = new Date()
            return Types.Classes.CCategoryProducts.fromObject(response?.data);
        } else {
            return [];
        }
    } else {
        return cache.getObject('Products');
    }
}

export async function countProducts() {
    const response = await Network.instance?.get("/productsCount", true);
    if (response?.success) {
        return response?.data as number
    }
    return 0;
}

export async function getCategories() {
    const response = await Network.instance?.get(`/categories`, true);
    if (response?.success) {
        return response?.data as Types.Classes.CCategoryProducts[];
    }
    return [];
}

export async function getOrder(id: string) {
    return Network.instance?.get(`/product/${id}`, true);
}

export async function deleteProduct(id?: string) {
    return Network.instance?.remove(`/product/${id}`, true);
}

export async function deleteCategory(id?: string) {
    return Network.instance?.remove(`/category/${id}`, true);
}

export async function newProduct(object: Types.Classes.CProduct) {
    return Network.instance?.post("/product", true, object);
}

export async function updateProduct(object: Types.Classes.CProduct | Types.Classes.CProduct[]) {
    return Network.instance?.put("/product", true, object);
}

export async function newCategory(object: Types.Classes.CCategoryProducts) {
    return Network.instance?.post("/category", true, object);
}

export async function updateCategory(object: Types.Classes.CCategoryProducts | Types.Classes.CCategoryProducts[]) {
    return Network.instance?.put("/category", true, object);
}

export async function search(query: string): Promise<Types.Classes.CCategoryProducts[]> {
    return (await all()).map(section => {
        return {
            title: section.title,
            products: section.products?.filter(item => {
                if (typeof item == "object") {
                    return item.title?.toLowerCase().includes(query.toLowerCase()) || item.description?.toLowerCase().includes(query.toLowerCase());
                } else {
                    return true;
                }
            })
        } as Types.Classes.CCategoryProducts;
    }).filter(item => (item.products?.length ?? 0) > 0);
}