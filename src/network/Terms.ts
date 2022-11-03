import { Network, Types } from '@ikomida/shared-frontend'

export async function getTermsOfUse() {
  return Network.instance?.get(`/term/${Types.Types.TTerm.TERM_OF_USE_VENDOR}`)
}

export async function getTermOfUse() {
  const response = await Network.instance?.get(`/termID/${Types.Types.TTerm.TERM_OF_USE_VENDOR}`)
  if (response && response?.success) {
    return response?.data
  }
  return undefined
}

export async function getPrivacyPolicy() {
  return await Network.instance?.get(`/term/${Types.Types.TTerm.PRIVACY_POLICY}`)
}
