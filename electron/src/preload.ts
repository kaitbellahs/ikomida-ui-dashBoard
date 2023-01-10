require('./rt/electron-rt');
import { contextBridge } from 'electron'
const axios = require('axios')
//////////////////////////////

contextBridge.exposeInMainWorld('iKomidaElectronAPI', {
    httpRequest: async (options: typeof axios.AxiosRequestConfig) => {
        try {
            const response = await axios.request(options)
            console.log(response)
            return response as typeof axios.AxiosResponse
        } catch (exception: Any) {
            if (axios.isAxiosError(exception)) {
                return exception.response
            }
            throw exception
        }
    }
})
// User Defined Preload scripts below
console.log('User Preload!');
