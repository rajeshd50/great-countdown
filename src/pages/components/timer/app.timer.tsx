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
import AppTimerDisplay from '../app-timer-display/app.timer.display';

function AppTimer() {
  const [mainEventTime, setMainEventTime] = useState<any>(null)
  const [currentEvent, setCurrentEvent] = useState<AppEvent | null>(null)
  const [allEvents, setAllEvents] = useState<AppEvent[]>([])
  const [allOtherEvents, setAllOtherEvents] = useState<AppEvent[]>([])

  useEffect(() => {
    if (!mainEventTime) {
      setMainEventTime(moment().add(1, 'days').toDate())
    }
  }, [])

  useEffect(() => {
    if (allEvents && allEvents.length) {
      if (currentEvent) {
        setAllOtherEvents(allEvents.filter(x => x.id != currentEvent.id))
      } else {
        setAllOtherEvents(allEvents)
      }
    } else {
      setAllOtherEvents([])
    }
  }, [allEvents, currentEvent])

  const setSelectedEvent = (event: AppEvent | null) => {
    setCurrentEvent(event)

    if (event) {
      setMainEventTime(event.date)
    }
  }
  const setParentAllEvents = (events: AppEvent[]) => {
    setAllEvents(events)
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="md" className="timer-container">
        <AppControl setParentSelectedEvent={setSelectedEvent} setParentAllEvents={setParentAllEvents} />
        <div className="app-timer-container">
          {
            currentEvent && currentEvent.date ? <AppTimerDisplay event={currentEvent} display="large" eventTime={mainEventTime} /> : <div className="no-event-selected">
              No event selected, please add and select one! Click the calendar icon to manage events.
            </div>
          }
        </div>
        {
          allOtherEvents && allOtherEvents.length ? <div className="all-other-event-container">
            {
              allOtherEvents.map((oe, key) => {
                return <div className="all-other-event-container-inner">
                  <p>{oe.name}</p>
                  <AppTimerDisplay event={oe} display="small" eventTime={oe.date} key={oe.id} />
                </div>
              })
            }
          </div> : null
        }
      </Container>
    </React.Fragment>
  )
}

export default AppTimer
