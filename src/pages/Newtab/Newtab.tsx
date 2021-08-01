import React from 'react';
import logo from '../../assets/img/logo.svg';
import AppControl from '../components/app-control/app.control';
import AppTimer from '../components/timer/app.timer';
import Wallpaper from '../components/wallpaper';
import './Newtab.css';
import './Newtab.scss';

const Newtab = () => {
  return (
    <div className="App">
      <Wallpaper />
      <AppTimer />
    </div>
  );
};

export default Newtab;
