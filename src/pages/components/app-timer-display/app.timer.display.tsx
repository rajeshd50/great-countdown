import React, { useEffect, useState } from 'react'
import FlipTimer from '../flip-timer/flipTimer'
import moment from 'moment'
import usePrevious from '../../hooks/usePrevious'

import './app.timer.display.css'
import { AppEvent } from '../app-events/app.events'
import { NotificationSender } from './notification.sender'
import { STORAGE_KEYS } from '../../configs'

interface AppTimerDisplayProps {
  eventTime: Date;
  event: AppEvent;
  display: 'small' | 'large'
}
interface TimerState {
  digit: number;
  shuffle: boolean;
}

function AppTimerDisplay({
  eventTime,
  event,
  display,
}: AppTimerDisplayProps) {
  const previousEventTime = usePrevious(eventTime)
  const [daysTimerState, setDaysTimerState] = useState<TimerState>({
    digit: 0,
    shuffle: true,
  })
  const [hoursTimerState, setHoursTimerState] = useState<TimerState>({
    digit: 0,
    shuffle: true,
  })
  const [minutesTimerState, setMinutesTimerState] = useState<TimerState>({
    digit: 0,
    shuffle: true,
  })
  const [secondsTimerState, setSecondsTimerState] = useState<TimerState>({
    digit: 0,
    shuffle: true,
  })
  let timerID: any = null
  let timerStarted: boolean = false
  const notificationSender = new NotificationSender()

  useEffect(() => {
    if (eventTime != previousEventTime) {
      if (timerID) {
        clearInterval(timerID)
        timerID = null
        timerStarted = false
      }
    }
  }, [eventTime, previousEventTime])

  useEffect(() => {
    if (eventTime && !timerStarted) {
      timerStarted = true
      timerID = setInterval(
        () => updateTime(),
        200
      );
    }
    return () => {
      if (timerID) {
        clearInterval(timerID)
        timerID = null
        timerStarted = false
      }
    }
  }, [eventTime, daysTimerState, hoursTimerState, minutesTimerState, secondsTimerState])
  const updateTime = () => {
    // get new date
    const time = eventTime;
    // set time units
    const secondsDiffTotal = Math.abs(moment().diff(time, 'seconds'))

    const daysDiff = Math.floor(secondsDiffTotal / 86400)
    let remainingSeconds = secondsDiffTotal - (daysDiff * 86400)
    const hoursDiff = remainingSeconds > 0 ? Math.floor(remainingSeconds / 3600) : 0
    remainingSeconds = remainingSeconds - (hoursDiff * 3600)
    const minutesDiff = remainingSeconds > 0 ? Math.floor(remainingSeconds / 60) : 0
    remainingSeconds = remainingSeconds - (minutesDiff * 60)
    const secondsDiff = remainingSeconds > 0 ? remainingSeconds : 0

    // on days change, update days and shuffle state
    if (daysDiff !== daysTimerState.digit) {
      setDaysTimerState({
        digit: daysDiff,
        shuffle: !daysTimerState.shuffle
      })
    }
    // on hour change, update hours and shuffle state
    if (hoursDiff !== hoursTimerState.digit) {
      setHoursTimerState({
        digit: hoursDiff,
        shuffle: !hoursTimerState.shuffle
      })
    }
    // on minute change, update minutes and shuffle state
    if (minutesDiff !== minutesTimerState.digit) {
      setMinutesTimerState({
        digit: minutesDiff,
        shuffle: !minutesTimerState.shuffle
      })
    }
    // on second change, update seconds and shuffle state
    if (secondsDiff !== secondsTimerState.digit) {
      setSecondsTimerState({
        digit: secondsDiff,
        shuffle: !secondsTimerState.shuffle
      })
    }
    /**
     * check for notification
     */
    let shouldSendNotification = false;
    let isFinished = daysDiff == 0 && hoursDiff == 0 && minutesDiff == 0 && secondsDiff == 0
    switch (event.notificationType) {
      case 'each-minute':
        shouldSendNotification = secondsDiff == 0
        break;
      case 'each-hour':
        shouldSendNotification = minutesDiff == 0 && secondsDiff == 0
        break;
      case 'each-day':
        shouldSendNotification = minutesDiff == 0 && secondsDiff == 0 && hoursDiff == 0
        break;
      case 'each-week':
        shouldSendNotification = minutesDiff == 0 && secondsDiff == 0 && hoursDiff == 0 && daysDiff % 7 == 0
        break;
      case 'each-month':
        shouldSendNotification = minutesDiff == 0 && secondsDiff == 0 && hoursDiff == 0 && daysDiff % 30 == 0
        break;
      case 'once-finished':
        shouldSendNotification = isFinished
        break;
      case 'never':
        break;
    }
    if (shouldSendNotification) {
      // should sent notification
      notificationSender.addNotification(event)
    }
    if (isFinished) {
      // delete the event
      chrome.storage.sync.get(STORAGE_KEYS.EVENTS, (items) => {
        if (items[STORAGE_KEYS.EVENTS] && items[STORAGE_KEYS.EVENTS].length) {
          chrome.storage.sync.set({
            [STORAGE_KEYS.EVENTS]: items[STORAGE_KEYS.EVENTS].filter((x: any) => x.id !== event.id)
          }, () => { })
        }
      })
    }
  }
  return (
    <React.Fragment>
      <div className="app-timer-container-inner">
        <FlipTimer
          unit={'days'}
          digit={daysTimerState.digit}
          shuffle={daysTimerState.shuffle}
          display={display}
        />
        <FlipTimer
          unit={'hours'}
          digit={hoursTimerState.digit}
          shuffle={hoursTimerState.shuffle}
          display={display}
        />
        <FlipTimer
          unit={'minutes'}
          digit={minutesTimerState.digit}
          shuffle={minutesTimerState.shuffle}
          display={display}
        />
        <FlipTimer
          unit={'seconds'}
          digit={secondsTimerState.digit}
          shuffle={secondsTimerState.shuffle}
          display={display}
        />
      </div>
    </React.Fragment>
  )
}

export default AppTimerDisplay
