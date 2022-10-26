import { Network, Types } from '@ikomida/shared-frontend'

export async function countUsers() {
  const response = await Network.instance?.get('/usersCount', true)
  if (response?.success) {
    return response?.data
  }
  return 0
}

export async function profile() {
  const network = Network.instance as Network
  return network?.get(`/profile`, true)
}

export async function UpdateAvatar(object?: Types.Classes.CUser) {
  const network = Network.instance as Network
  return network?.patch(`/profile/avatar`, true, object)
}
