export const cacheDirectory = 'file:///cache/'
export const getInfoAsync = async () => ({ exists: false })
export const deleteAsync = async () => {}
export const createDownloadResumable = () => ({
  downloadAsync: async () => ({ uri: 'file:///cache/diario-nutricional-update.apk' }),
})
export const getContentUriAsync = async (uri) => `content://${uri}`

export default {
  cacheDirectory,
  getInfoAsync,
  deleteAsync,
  createDownloadResumable,
  getContentUriAsync,
}
