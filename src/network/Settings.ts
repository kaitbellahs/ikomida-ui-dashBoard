import { Network, Types } from '@ikomida/shared-frontend'

export async function getSettings() {
  const response = await Network.instance?.get('/vendor/settings', true)
  response.data = Types.Classes.CVendorSettings.fromObject(response.data) as Types.Classes.CVendorSettings
  return response
}
export async function getLimits() {
  return Network.instance?.get('/vendor/limits', true)
}

export async function getPagSeguroUrl() {
  return Network.instance?.get('/vendor/pagSeguroUrl', true, null, 'pagSeguroUrl')
}

export async function setSettings(object: Types.Classes.CVendorSettings) {
  return Network.instance?.put('/vendor/settings', true, object)
}

export async function updatePaymentGateway(object: any) {
  return Network.instance?.put('/vendor/updatePaymentGateway', true, object, 'updatePaymentGateway')
}

export async function revokePaymentGateway() {
  return Network.instance?.remove('/vendor/revokePaymentGateway', true, null, 'revokePaymentGateway')
}

export async function updateBusinessHours(object: Types.Classes.CBusinessTime) {
  return Network.instance?.put('/vendor/businessHours', true, object)
}

export async function setDelivery(vendorSettings: Types.Classes.CVendorSettings) {
  return Network.instance?.put('/vendor/delivery', true, vendorSettings)
}
