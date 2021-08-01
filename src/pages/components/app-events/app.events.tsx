import React from 'react'
import EventAvailableIcon from '@material-ui/icons/EventAvailable';
import IconButton from '@material-ui/core/IconButton'
import Modal from '@material-ui/core/Modal';
import CloseIcon from '@material-ui/icons/Close';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import CheckIcon from '@material-ui/icons/Check';
import ReplayIcon from '@material-ui/icons/Replay';
import './app.events.css'
import { Button, FormHelperText, Typography } from '@material-ui/core';
import { useState } from 'react';
import { useEffect } from 'react';
import moment from 'moment'
import TextField from "@material-ui/core/TextField";
import { useForm, Controller } from "react-hook-form";
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import MomentUtils from '@date-io/moment';
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

import {
  alpha,
  ThemeProvider,
  withStyles,
  makeStyles,
  createTheme,
} from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import { STORAGE_KEYS } from '../../configs';
import { nanoid } from 'nanoid';

interface CurrentView {
  type: 'list' | 'add' | 'edit'
  data: AppEvent | null
}

export interface AppEventState {
  events: AppEvent[]
  lastUpdatedAt: number
}

export interface AppEvent {
  date: Date;
  name: string;
  notificationType?: 'never' | 'each-minute' | 'each-hour' | 'each-day' | 'each-week' | 'each-month',
  id?: string;
}

const WhiteTextField = withStyles({
  root: {
    '& label.Mui-focused': {
      color: '#fff',
    },
    '& label': {
      color: '#fff',
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: '#fff',
    },
    '& input': {
      color: '#fff',
    },
    '& .MuiFilledInput-underline:before': {
      borderBottomColor: '#fff',
    }
  },
})(TextField);

interface AddEditEventFormValues {
  name: string;
  date: Date | undefined;
  notificationType: string;
}

const addEditEventSchema = yup.object().shape({
  name: yup
    .string()
    .max(30, 'Maximum 30 characters')
    .required('Name is required'),
  date: yup
    .date()
    .test(
      'min_max_date',
      `Date must be between ${moment().add(10, 'minutes').format('DD/MM/YYYY hh:mm A')} and ${moment().add(999, 'days').format('DD/MM/YYYY hh:mm A')}`,
      value => {
        let maxDate = moment().add(999, 'days')
        let minDate = moment().add(10, 'minutes')
        return !(moment(value).isBefore(minDate) || moment(value).isAfter(maxDate))
      })
    .required('Date is required'),
  notificationType: yup
    .string()
    .required('Notification Type is required'),
})

function AppEvents() {
  const [open, setOpen] = useState(false);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [currentView, setCurrentView] = useState<CurrentView>({
    type: 'list',
    data: null
  });
  const [appEvents, setAppEvents] = useState<AppEventState>({
    events: [],
    lastUpdatedAt: new Date().getTime()
  })
  const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm<AddEditEventFormValues>({
    resolver: yupResolver(addEditEventSchema),
    defaultValues: {
      name: '',
      notificationType: 'never',
      date: moment().add(1, 'day').toDate()
    }
  })

  useEffect(() => {
    chrome.storage.onChanged.addListener(storageChangeListener)
    return () => {
      chrome.storage.onChanged.removeListener(storageChangeListener)
    }
  }, [])

  useEffect(() => {
    if (eventsLoaded) {
      updateAddEventToStorage()
    }
  }, [appEvents.lastUpdatedAt])

  useEffect(() => {
    chrome.storage.sync.get(STORAGE_KEYS.EVENTS, (items) => {
      if (items[STORAGE_KEYS.EVENTS] && items[STORAGE_KEYS.EVENTS].length) {
        setAppEvents({
          lastUpdatedAt: appEvents.lastUpdatedAt,
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
      setEventsLoaded(true)
    })
  }, [])

  const storageChangeListener = (changes: any, area: string) => {
    if (area == 'sync' && changes && changes[STORAGE_KEYS.EVENTS] && changes[STORAGE_KEYS.EVENTS].newValue) {
      setAppEvents({
        lastUpdatedAt: appEvents.lastUpdatedAt,
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

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = (event: any, reason: string) => {
    if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
      setOpen(false);
    }
  };

  const gotoAddForm = () => {
    setCurrentView({
      type: 'add',
      data: null
    })
  }
  const gotoEditForm = (event: AppEvent) => {
    setCurrentView({
      type: 'edit',
      data: event
    })
    if (event.name) {
      setValue('name', event.name)
    }
    if (event.date) {
      setValue('date', event.date)
    }
    if (event.notificationType) {
      setValue('notificationType', event.notificationType)
    }
  }
  const deleteEvent = (event: AppEvent) => {
    let oldEvents = Object.assign({}, appEvents)
    oldEvents = {
      events: oldEvents.events.filter(x => x.id != event.id),
      lastUpdatedAt: new Date().getTime()
    }
    setAppEvents(oldEvents)
  }
  const gotoList = () => {
    setCurrentView({
      type: 'list',
      data: null
    })
  }

  const updateAddEventToStorage = () => {
    chrome.storage.sync.set({
      [STORAGE_KEYS.EVENTS]: appEvents.events.map(x => {
        return {
          name: x.name,
          date: moment(x.date).format('DD/MM/YYYY HH:mm'),
          notificationType: x.notificationType,
          id: x.id
        }
      })
    }, () => {
      reset()
      gotoList()
    })
  }

  const onSubmit = (data: any) => {
    let oldEvents = Object.assign({}, appEvents)
    if (currentView.type === 'add') {
      oldEvents.events.push({
        ...data,
        id: data.id ? data.id : nanoid()
      })
    } else if (currentView.type === 'edit') {
      oldEvents.events = oldEvents.events.map(x => {
        if (currentView.data && x.id == currentView.data.id) {
          return {
            ...x,
            ...data,
          }
        } else {
          return {
            ...x
          }
        }
      })
    }
    oldEvents.lastUpdatedAt = new Date().getTime()
    setAppEvents(oldEvents)
  }

  return (
    <React.Fragment>
      <div className="app-event-open-button-container">
        <IconButton onClick={handleOpen}>
          <EventAvailableIcon />
        </IconButton>
      </div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
        disableEscapeKeyDown
      >
        <Fade in={open}>
          <div className="app-modal-container">
            <div className="app-modal">
              <div className="app-modal-header">
                <Typography className="app-modal-header-title">
                  {currentView && currentView.type == 'list' ? 'List of events' : null}
                  {currentView && currentView.type == 'add' ? 'Add new event' : null}
                  {currentView && currentView.type == 'edit' ? 'Edit event' : null}
                </Typography>
                <IconButton onClick={(evt) => {
                  handleClose(evt, '')
                }} className="app-modal-header-close">
                  <CloseIcon />
                </IconButton>
              </div>

              <div className="app-modal-body">
                {
                  currentView && currentView.type === 'list' ? <div className="app-modal-body-list">
                    <div className="app-modal-body-list-add-icon">
                      <div className="app-modal-body-list-add-icon-button-container">
                        <Button
                          startIcon={<AddIcon />}
                          variant="outlined"
                          color="primary"
                          onClick={gotoAddForm}
                          disabled={appEvents && appEvents.events && appEvents.events.length > 5}
                        >
                          Add New Event
                        </Button>
                        <small>Max 5 events can be added</small>
                      </div>
                    </div>
                    <List aria-label="main mailbox folders">
                      {
                        appEvents && appEvents.events && appEvents.events.length ? appEvents.events.map((event, key) => {
                          return <ListItem key={event.id || key}>
                            <ListItemText primary={`${event.name} (${moment(event.date).format('DD, MMM YY hh:mm A')})`} />
                            <ListItemIcon>
                              <IconButton onClick={() => gotoEditForm(event)}>
                                <EditIcon />
                              </IconButton>
                            </ListItemIcon>
                            <ListItemIcon>
                              <IconButton onClick={() => deleteEvent(event)}>
                                <DeleteIcon />
                              </IconButton>
                            </ListItemIcon>
                          </ListItem>
                        }) : null
                      }
                      {
                        !appEvents || !appEvents.events || !appEvents.events.length ? <div className="no-event-available">
                          No event available, add one!
                        </div> : null
                      }
                    </List>
                  </div> : null
                }
                {
                  currentView && (currentView.type === 'add' || currentView.type === 'edit') ? <div className="app-modal-body-form">
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="app-modal-body-form-inner">
                        <Controller
                          name="name"
                          control={control}
                          render={({ field }) => <WhiteTextField
                            {...field}
                            label="Event Name"
                            variant="standard"
                            fullWidth
                            error={errors && errors.name && errors.name.message ? true : false}
                            helperText={errors && errors.name && errors.name.message ? errors.name.message : ''}
                          />}
                        />
                        <MuiPickersUtilsProvider utils={MomentUtils}>
                          <Controller
                            name="date"
                            control={control}
                            render={({ field }) => <DateTimePicker
                              {...field}
                              label="Event Date"
                              fullWidth
                              format="DD/MM/YYYY hh:mm A"
                              minDate={moment().add(10, 'minutes').toDate()}
                              maxDate={moment().add(999, 'days').toDate()}
                              error={errors && errors.date && errors.date.message ? true : false}
                              helperText={errors && errors.date && errors.date.message ? errors.date.message : ''}
                            />}
                          />
                        </MuiPickersUtilsProvider>
                        <Controller
                          name="notificationType"
                          control={control}
                          defaultValue=""
                          render={({ field }) => <React.Fragment>
                            <InputLabel id="notification-type-select-label">Notification Type</InputLabel>
                            <Select
                              {...field}
                              fullWidth
                              labelId="notification-type-select-label"
                              error={errors && errors.notificationType && errors.notificationType.message ? true : false}
                            >
                              <MenuItem value={'never'}>Never</MenuItem>
                              <MenuItem value={'each-minute'}>Every Minute</MenuItem>
                              <MenuItem value={'each-hour'}>Every Hour</MenuItem>
                              <MenuItem value={'each-day'}>Every Day</MenuItem>
                              <MenuItem value={'each-week'}>Every Week</MenuItem>
                              <MenuItem value={'each-month'}>Every Month</MenuItem>
                            </Select>
                            {errors && errors.notificationType && errors.notificationType.message ? <FormHelperText error>{errors.notificationType.message}</FormHelperText> : null}

                          </React.Fragment>}
                        />
                      </div>
                      <div className="app-modal-body-form-footer">
                        <Button
                          startIcon={<ReplayIcon />}
                          variant="outlined"
                          color="secondary"
                          onClick={gotoList}
                          type="button"
                        >
                          Cancel
                        </Button>
                        <Button
                          startIcon={<CheckIcon />}
                          variant="outlined"
                          color="primary"
                          type="submit"
                        >
                          {currentView.type === 'add' ? 'Add' : 'Update'}
                        </Button>
                      </div>
                    </form>
                  </div> : null
                }
              </div>
            </div>
          </div>
        </Fade>
      </Modal>
    </React.Fragment>
  )
}

export default AppEvents
