import { Network, Types, Stores } from '@ikomida/shared-frontend'
const cache = Stores.Cache.createInstance('Products')
let timeout = 0
export function resetTimeout() {
  timeout = 0
}

export async function all(): Promise<Types.Classes.CCategoryProducts[]> {
  if (timeout < new Date().getTime() - 2 * 60 * 1000) {
    const response = await Network.instance?.get('/products', true)
    if (response?.success) {
      cache.setObject('Products', response?.data)
      timeout = new Date().getTime()
      return Types.Classes.CCategoryProducts.fromObject(response?.data)
    } else {
      return []
    }
  } else {
    return Types.Classes.CCategoryProducts.fromObject(cache.getObject('Products'))
  }
}

export async function countProducts() {
  const response = await Network.instance?.get('/productsCount', true)
  if (response?.success) {
    return response?.data as number
  }
  return 0
}

export async function getLowQuantityProducts() {
  return await Network.instance?.get(`/lowQuantityProducts`, true)
}

export async function getCategories() {
  return await Network.instance?.get(`/categories`, true)
}

export async function getOrder(id: string) {
  return Network.instance?.get(`/product/${id}`, true)
}

export async function deleteProduct(id?: string) {
  return Network.instance?.remove(`/product/${id}`, true)
}

export async function activateProduct(id?: string) {
  return Network.instance?.patch(`/product/${id}`, true)
}

export async function deleteProductOption(id?: string) {
  return Network.instance?.remove(`/productoption/${id}`, true)
}

export async function deleteProductOptionsCategory(id?: string) {
  return Network.instance?.remove(`/productoptionscategory/${id}`, true)
}

export async function deleteCategory(id?: string) {
  return Network.instance?.remove(`/category/${id}`, true)
}

export async function newProduct(object: Types.Classes.CProduct) {
  return Network.instance?.post('/product', true, object)
}

export async function getProduct(id?: string) {
  return Network.instance?.get(`/product/${id}`, true)
}

export async function updateProduct(object: Types.Classes.CProduct | Types.Classes.CProduct[]) {
  return Network.instance?.put('/product', true, object)
}

export async function newCategory(object: Types.Classes.CCategoryProducts) {
  return Network.instance?.post('/category', true, object)
}

export async function updateCategory(object: Types.Classes.CCategoryProducts | Types.Classes.CCategoryProducts[]) {
  return Network.instance?.put('/category', true, object)
}

export async function search(query: string): Promise<Types.Classes.CCategoryProducts[]> {
  return (await all())
    .map(section => {
      return {
        title: section.title,
        products: section.products?.filter(item => {
          if (typeof item == 'object') {
            return (
              item.title?.toLowerCase().includes(query.toLowerCase()) ||
              item.description?.toLowerCase().includes(query.toLowerCase())
            )
          } else {
            return true
          }
        })
      } as Types.Classes.CCategoryProducts
    })
    .filter(item => (item.products?.length ?? 0) > 0)
}
