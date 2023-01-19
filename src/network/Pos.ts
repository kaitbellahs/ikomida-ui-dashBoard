import { Network } from "@ikomida/shared-frontend"
import { Classes } from "@ikomida/shared-types"

export async function isPosOpen() {
    const response = await Network.instance?.get('/isPosOpen', true)
    if (response?.success) {
        return Classes.CPos.fromObject(response?.data)
    }
    return undefined
}

export async function getPos() {
    const response = await Network.instance?.get('/pos', true)
    if (response?.success) {
        return Classes.CPos.fromObject(response?.data)
    }
    return undefined
}