export const SchedulableTriggerInputTypes = {
  DAILY: 'daily',
  TIME_INTERVAL: 'timeInterval',
  DATE: 'date',
}

export const AndroidImportance = {
  HIGH: 4,
  DEFAULT: 3,
}

export const setNotificationHandler = () => {}
export const setNotificationChannelAsync = async () => {}
export const getPermissionsAsync = async () => ({ status: 'granted' })
export const requestPermissionsAsync = async () => ({ status: 'granted' })
export const scheduleNotificationAsync = async () => 'mock-notification-id'
export const cancelScheduledNotificationAsync = async () => {}
export const cancelAllScheduledNotificationsAsync = async () => {}
export const getAllScheduledNotificationsAsync = async () => []
export const addNotificationResponseReceivedListener = () => ({ remove: () => {} })
export const getLastNotificationResponseAsync = async () => null

export default {
  SchedulableTriggerInputTypes,
  AndroidImportance,
  setNotificationHandler,
  setNotificationChannelAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  scheduleNotificationAsync,
  cancelScheduledNotificationAsync,
  cancelAllScheduledNotificationsAsync,
  getAllScheduledNotificationsAsync,
  addNotificationResponseReceivedListener,
  getLastNotificationResponseAsync,
}
