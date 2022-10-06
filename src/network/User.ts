import { Network } from '@ikomida/shared-frontend'

export async function countUsers() {
  const response = await Network.instance?.get('/usersCount', true)
  if (response?.success) {
    return response?.data
  }
  return 0
}
