import { AppEvent } from "../app-events/app.events";
import moment from 'moment'

interface EventsNotificationPool {
  [name: string]: AppEvent | null
}

export class NotificationSender {
  private eventsNotificationPool: EventsNotificationPool = {}
  constructor() { }

  addNotification(event: AppEvent) {
    if (event.id && !this.eventsNotificationPool[event.id]) {
      this.eventsNotificationPool[event.id] = event
      setTimeout(() => {
        this.sendNotification(event)
      }, 3000)
    }
  }

  private sendNotification(event: AppEvent) {
    if (event && event.id && this.eventsNotificationPool[event.id]) {

      let title = event.name
      let message = ''
      switch (event.notificationType) {
        case 'each-minute':
          message = `Another minute has passed, ${Math.ceil(moment(event.date).diff(moment(), 'minutes'))} minutes to go!`
          break
        case 'each-hour':
          message = `Another hour has passed, ${Math.ceil(moment(event.date).diff(moment(), 'hours'))} hours to go!`
          break
        case 'each-day':
          message = `Another day has passed, ${Math.ceil(moment(event.date).diff(moment(), 'days'))} days to go!`
          break
        case 'each-week':
          message = `Another week has passed, ${Math.ceil(moment(event.date).diff(moment(), 'weeks'))} weeks to go!`
          break
        case 'each-month':
          message = `Another month has passed, ${Math.ceil(moment(event.date).diff(moment(), 'months'))} months to go!`
          break
        case 'once-finished':
          message = `It's finished now! :)`
          break
      }

      chrome.notifications.create({
        iconUrl: 'icon-128.png',
        title,
        message,
        type: 'basic',
      }, (id) => { })

      this.eventsNotificationPool[event.id] = null
    }
  }
}