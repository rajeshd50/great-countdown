import React from 'react'
import Container from '@material-ui/core/Container';

import './app.control.css'
import AppEventSelection from '../app-event-selection/app.event.selection';
import AppEvents, { AppEvent } from '../app-events/app.events';

interface AppEventSelectionProps {
  setParentSelectedEvent?: (event: AppEvent | null) => void;
  setParentAllEvents?: (events: AppEvent[]) => void;
}

function AppControl({
  setParentSelectedEvent,
  setParentAllEvents,
}: AppEventSelectionProps) {
  return (
    <React.Fragment>
      <Container maxWidth={false} className="app-control-container">
        <div className="app-control-container-inner">
          <AppEventSelection setParentAllEvents={setParentAllEvents} setParentSelectedEvent={setParentSelectedEvent} />
          <AppEvents />
        </div>
      </Container>
    </React.Fragment>
  )
}

export default AppControl
