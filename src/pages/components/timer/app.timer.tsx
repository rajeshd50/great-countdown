import React, { useEffect } from 'react'
import { useState } from 'react'
import FlipTimer from '../flip-timer/flipTimer'
import moment from 'moment'
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

import './app.timer.css'
import AppControl from '../app-control/app.control';
import { AppEvent } from '../app-events/app.events';

interface TimerState {
  digit: number;
  shuffle: boolean;
}

function AppTimer() {

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

  const [eventTime, setEventTime] = useState<any>(null)
  const [currentEvent, setCurrentEvent] = useState<AppEvent | null>(null)

  let timerID: any = null
  let timerStarted: boolean = false

  useEffect(() => {
    if (!eventTime) {
      setEventTime(moment().add(1, 'days').toDate())
    }
  }, [])

  useEffect(() => {
    if (eventTime && !timerStarted) {
      timerStarted = true
      timerID = setInterval(
        () => updateTime(),
        50
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
  }

  const setSelectedEvent = (event: AppEvent | null) => {
    setCurrentEvent(event)

    if (event) {
      if (timerID) {
        clearInterval(timerID)
        timerID = null
        timerStarted = false
      }
      setEventTime(event.date)
    }
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="md" className="timer-container">
        <AppControl setParentSelectedEvent={setSelectedEvent} />
        <div className="app-timer-container">
          {
            currentEvent && currentEvent.date ? <div className="app-timer-container-inner">
              <FlipTimer
                unit={'days'}
                digit={daysTimerState.digit}
                shuffle={daysTimerState.shuffle}
              />
              <FlipTimer
                unit={'hours'}
                digit={hoursTimerState.digit}
                shuffle={hoursTimerState.shuffle}
              />
              <FlipTimer
                unit={'minutes'}
                digit={minutesTimerState.digit}
                shuffle={minutesTimerState.shuffle}
              />
              <FlipTimer
                unit={'seconds'}
                digit={secondsTimerState.digit}
                shuffle={secondsTimerState.shuffle}
              />
            </div> : <div className="no-event-selected">
              No event selected, please add and select one! Click the calendar icon to manage events.
            </div>
          }

        </div>
      </Container>
    </React.Fragment>
  )
}

export default AppTimer
