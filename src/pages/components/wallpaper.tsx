import React from 'react'
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import PaletteIcon from '@material-ui/icons/Palette';
import IconButton from '@material-ui/core/IconButton';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';

import './wallpaper.css'

import { useState } from 'react';
import { useEffect } from 'react';
import { STORAGE_KEYS } from '../configs';
import usePrevious from '../hooks/usePrevious';

interface CurrentWallpaperInfo {
  index: number;
  type: string;
}

function Wallpaper() {
  const [wallPapers, setWallpapers] = useState<string[]>(['black-sand.jpg', 'blue-calm.jpg', 'blue-light.jpg', 'calm-sand.jpg', 'cloud-light.jpg', 'color-ballon.jpg', 'color-bubble.jpg', 'color-cloud.jpg', 'earth.jpg', 'galaxy.jpg', 'island.jpg', 'mountain.jpg', 'pint-sweet.jpg', 'wood.jpg'])
  const [gradients, setGradients] = useState<string[]>(['gradient-cool-blue', 'gradient-cool-sky', 'gradient-moon-lit-asteroid', 'gradient-flare', 'gradient-lawrencium', 'gradient-selenium', 'gradient-hydrogen', 'gradient-purpink', 'gradient-vision-grandeur', 'gradient-deep-space', 'gradient-back-to-earth'])
  const [currentWallpaper, setCurrentWallpaper] = useState<any>(null)
  const [anchorElMenu, setAnchorElMenu] = React.useState(null);
  const [currentWallpaperInfo, setCurrentWallpaperInfo] = useState<CurrentWallpaperInfo | null>(null)

  const previousCurrentWallpaperInfo = usePrevious<CurrentWallpaperInfo | null>(currentWallpaperInfo)

  useEffect(() => {
    chrome.storage.sync.get(STORAGE_KEYS.BG_TYPE, (item) => {
      let cInfo: CurrentWallpaperInfo = {
        index: 0,
        type: 'gradient'
      }
      if (item && item[STORAGE_KEYS.BG_TYPE]) {
        cInfo.type = item[STORAGE_KEYS.BG_TYPE]
      }
      chrome.storage.sync.get(STORAGE_KEYS.BG_INDEX, (item) => {
        if (item && item[STORAGE_KEYS.BG_INDEX] != undefined) {
          let index = 0
          try {
            index = parseInt(item[STORAGE_KEYS.BG_INDEX])
          } catch (e) { }
          cInfo.index = index
        }
        console.log('SETTING WALLPAPER', cInfo)
        setCurrentWallpaperInfo(cInfo)
        chrome.storage.onChanged.addListener(storageChangeListener)
      })
    })

    return () => {
      chrome.storage.onChanged.removeListener(storageChangeListener)
    }
  }, [])

  useEffect(() => {
    if (currentWallpaperInfo) {
      if (currentWallpaperInfo.index !== previousCurrentWallpaperInfo?.index) {
        chrome.storage.sync.set({
          [STORAGE_KEYS.BG_INDEX]: currentWallpaperInfo.index
        })
      }
      if (currentWallpaperInfo.type !== previousCurrentWallpaperInfo?.type) {
        chrome.storage.sync.set({
          [STORAGE_KEYS.BG_TYPE]: currentWallpaperInfo.type
        })
      }
    }
  }, [currentWallpaperInfo, previousCurrentWallpaperInfo])

  useEffect(() => {
    if (currentWallpaperInfo && currentWallpaperInfo.type === 'image') {
      if (currentWallpaperInfo.index >= 0 && wallPapers.length && currentWallpaperInfo.index < wallPapers.length) {
        setCurrentWallpaper(wallPapers[currentWallpaperInfo.index])
      }
    } else if (currentWallpaperInfo && currentWallpaperInfo.type === 'gradient') {
      if (currentWallpaperInfo.index >= 0 && gradients.length && currentWallpaperInfo.index < gradients.length) {
        setCurrentWallpaper(gradients[currentWallpaperInfo.index])
      }
    }
  }, [wallPapers, gradients, currentWallpaperInfo])

  const storageChangeListener = (changes: any, area: string) => {
    if (currentWallpaperInfo) {
      if (area === 'sync' && changes && changes[STORAGE_KEYS.BG_INDEX] && changes[STORAGE_KEYS.BG_INDEX].newValue) {
        let index = 0
        try {
          index = parseInt(changes[STORAGE_KEYS.BG_INDEX].newValue)
        } catch (e) { }
        console.log('SETTING WALLPAPER HERE 1 type', currentWallpaperInfo.type, ' index', index)
        setCurrentWallpaperInfo({
          type: currentWallpaperInfo.type,
          index,
        })
      }
      if (area === 'sync' && changes && changes[STORAGE_KEYS.BG_TYPE] && changes[STORAGE_KEYS.BG_TYPE].newValue) {
        console.log('SETTING WALLPAPER HERE 1 index', currentWallpaperInfo.index, ' type', changes[STORAGE_KEYS.BG_TYPE].newValue)
        setCurrentWallpaperInfo({
          index: currentWallpaperInfo.index,
          type: changes[STORAGE_KEYS.BG_TYPE].newValue
        })
      }
    }
  }

  const openMenuSwitcher = (event: any) => {
    setAnchorElMenu(event.currentTarget);
  }

  const closeMenu = () => {
    setAnchorElMenu(null);
  }

  const changeWallpaperType = (type: string) => {
    if (currentWallpaperInfo && currentWallpaperInfo.type != type) {
      setCurrentWallpaperInfo({
        index: 0,
        type,
      })
    }
    closeMenu()
  }

  const loadNextWallpaper = (event: React.MouseEvent) => {
    if (event) {
      event.preventDefault()
    }
    if (!currentWallpaperInfo) {
      return
    }
    let ci = currentWallpaperInfo.index + 1
    if (ci >= wallPapers.length) {
      ci = 0
    }
    setCurrentWallpaperInfo({
      type: currentWallpaperInfo.type,
      index: ci
    })
  }

  const loadPrevWallpaper = (event: React.MouseEvent) => {
    if (event) {
      event.preventDefault()
    }
    if (!currentWallpaperInfo) {
      return
    }
    let ci = currentWallpaperInfo.index - 1
    if (ci <= 0) {
      ci = wallPapers.length - 1
    }
    setCurrentWallpaperInfo({
      type: currentWallpaperInfo.type,
      index: ci
    })
  }

  return (
    <React.Fragment>
      <CssBaseline />
      {
        currentWallpaperInfo && currentWallpaperInfo.type === 'gradient' ? <div className={currentWallpaper ? `wallpaper-container ${currentWallpaper}` : 'wallpaper-container'} /> : <div className="wallpaper-container wallpaper-container-image" style={{
          backgroundImage: `url('wallpapers/${currentWallpaper}')`
        }} />
      }

      <Container maxWidth={false} className="wallpaper-control-container">
        <div className="wallpaper-control-inner">
          <IconButton onClick={loadPrevWallpaper}>
            <NavigateBeforeIcon />
          </IconButton>
          <IconButton onClick={openMenuSwitcher}>
            <PaletteIcon />
          </IconButton>
          <IconButton onClick={loadNextWallpaper}>
            <NavigateNextIcon />
          </IconButton>
        </div>
        <Menu
          id="simple-menu"
          anchorEl={anchorElMenu}
          keepMounted
          open={Boolean(anchorElMenu)}
          onClose={closeMenu}
        >
          <MenuItem onClick={() => changeWallpaperType('gradient')}>Color</MenuItem>
          <MenuItem onClick={() => changeWallpaperType('image')}>Image</MenuItem>
        </Menu>
      </Container>
    </React.Fragment>
  )
}

export default Wallpaper
