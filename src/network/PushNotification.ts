import { Network, Stores, Types } from '@ikomida/shared-frontend'

export async function registerPushNotificationToken(object: Types.Classes.CRegisterPushNotification) {
  return Network.instance?.post('/notification/register', true, object)
}

export async function newPushNotification(object: any) {
  const response = await Network.instance?.post('/vendor/pushNotification', true, object)
  if (response?.success) {
    await Network.instance?.clearCache(Stores.Cache.Types.STAFF)
  }
  return response
}
