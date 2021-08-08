import React from 'react'
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';


import './app.event.selection.css'
import { useState } from 'react';
import { AppEvent, AppEventState } from '../app-events/app.events';
import { useEffect } from 'react';
import { STORAGE_KEYS } from '../../configs';
import moment from 'moment'
import usePrevious from '../../hooks/usePrevious';

interface AppEventSelected {
  events: AppEvent[];
  loaded: boolean;
}

interface AppEventSelectionProps {
  setParentSelectedEvent?: (event: AppEvent | null) => void;
  setParentAllEvents?: (events: AppEvent[]) => void;
}

function AppEventSelection({
  setParentSelectedEvent,
  setParentAllEvents,
}: AppEventSelectionProps) {
  const [currentEvent, setCurrentEvent] = useState('')
  const [eventKeyLoaded, setEventKeyLoaded] = useState(false);
  const [appEvents, setAppEvents] = useState<AppEventSelected>({
    events: [],
    loaded: false
  })
  const previousSelectedEvent = usePrevious(currentEvent)

  useEffect(() => {
    chrome.storage.sync.get(STORAGE_KEYS.EVENTS, (items) => {
      if (items[STORAGE_KEYS.EVENTS] && items[STORAGE_KEYS.EVENTS].length) {
        setAppEvents({
          loaded: true,
          events: items[STORAGE_KEYS.EVENTS].map((x: any) => {
            return {
              name: x.name,
              date: moment(x.date, 'DD/MM/YYYY HH:mm'),
              notificationType: x.notificationType,
              id: x.id
            }
          })
        })
      }
      chrome.storage.sync.get(STORAGE_KEYS.SELECTED_EVENT, (items) => {
        if (items[STORAGE_KEYS.SELECTED_EVENT]) {
          setCurrentEvent(items[STORAGE_KEYS.SELECTED_EVENT])
        }
        setEventKeyLoaded(true)
      })
    })
  }, [])

  useEffect(() => {
    if (eventKeyLoaded && previousSelectedEvent !== currentEvent) {
      chrome.storage.sync.set({
        [STORAGE_KEYS.SELECTED_EVENT]: currentEvent || ''
      })
    }
  }, [eventKeyLoaded, currentEvent, previousSelectedEvent])

  useEffect(() => {
    if (eventKeyLoaded) {
      if (!appEvents || !appEvents.events || !appEvents.events.length) {
        setCurrentEvent('')
        return
      }
      if (currentEvent) {
        let findIndex = appEvents.events.findIndex(x => x.id === currentEvent)
        if (findIndex < 0) {
          setCurrentEvent('')
          return
        }
      } else {
        if (appEvents.events[0].id) {
          setCurrentEvent(appEvents.events[0].id)
        }
      }
    }
  }, [eventKeyLoaded, currentEvent, appEvents])

  useEffect(() => {
    chrome.storage.onChanged.addListener(storageChangeListener)
    return () => {
      chrome.storage.onChanged.removeListener(storageChangeListener)
    }
  }, [])

  useEffect(() => {
    if (setParentSelectedEvent) {
      if (currentEvent) {
        let findEvent = appEvents && appEvents.events && appEvents.loaded ? appEvents.events.find(x => x.id === currentEvent) : null
        if (!findEvent) {
          findEvent = null
        }
        setParentSelectedEvent(findEvent)
      } else {
        setParentSelectedEvent(null)
      }
    }
  }, [currentEvent])

  useEffect(() => {
    setParentAllEvents && setParentAllEvents(appEvents.events)
  }, [appEvents.events])

  const storageChangeListener = (changes: any, area: string) => {
    if (area == 'sync' && changes && changes[STORAGE_KEYS.EVENTS] && changes[STORAGE_KEYS.EVENTS].newValue) {
      setAppEvents({
        loaded: true,
        events: changes[STORAGE_KEYS.EVENTS].newValue.map((x: any) => {
          return {
            name: x.name,
            date: moment(x.date, 'DD/MM/YYYY HH:mm'),
            notificationType: x.notificationType,
            id: x.id
          }
        })
      })
    }
  }

  const onEventChanged = (event: any) => {
    setCurrentEvent(event.target.value)
  }

  return (
    <div className="app-event-selection-container">
      <FormControl>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={currentEvent}
          onChange={onEventChanged}
          fullWidth
          disabled={!appEvents || !appEvents.events || !appEvents.events.length}
        >
          {
            appEvents && appEvents.events && appEvents.events.length ? appEvents.events.map((event: AppEvent, key: any) => {
              return <MenuItem value={event.id}>{event.name}</MenuItem>
            }) : null
          }
        </Select>
      </FormControl>
    </div>
  )
}

export default AppEventSelection
