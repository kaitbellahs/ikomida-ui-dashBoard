import { Network, Types } from '@ikomida/shared-frontend'

export async function getLayout() {
  return Network.instance?.get('/layout')
}

export async function updateLayout(object: Types.Classes.CLayout) {
  return Network.instance?.put('/layout', true, object)
}
