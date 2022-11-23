import { Network, Types } from '@ikomida/shared-frontend'

export async function getApp() {
  return Network.instance?.get('/vendor/app', true)
}

export async function updateApp(object: Types.Classes.CApp[]) {
  const payload = object.map(app => {
    return app.toJSON()
  })
  return Network.instance?.patch('/vendor/app', true, payload)
}
