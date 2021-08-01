import React from 'react'
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

import './app.title.css'

export default function AppTitle() {
  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="sm" className="title-container">
        <Typography component="div" className="title-container-main-text">
          Great Countdown
        </Typography>
      </Container>
    </React.Fragment>
  )
}
