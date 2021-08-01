import React from 'react';
import { render } from 'react-dom';

import Newtab from './Newtab';
import './index.css';

declare var module: any;

render(<Newtab />, window.document.querySelector('#app-container'));

if (module.hot) module.hot.accept();