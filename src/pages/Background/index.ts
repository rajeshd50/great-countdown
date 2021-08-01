try {
  chrome.action.onClicked.addListener(function () {
    var newTabUrl = chrome.runtime.getURL('newtab.html');
    chrome.tabs.query({ url: newTabUrl }, function (tabs) {
      if (tabs.length) {
        if (tabs[0] && tabs[0].id) {
          chrome.tabs.update(tabs[0].id, { active: true });
        }
      } else {
        chrome.tabs.create({ url: newTabUrl });
      }
    });
  })
  // console.log('In background')
  // chrome.notifications.create({
  //   message: 'Hello Test Notification',
  //   title: 'Title123',
  //   type: 'basic',
  //   iconUrl: 'icon-128.png'
  // }, (id => {
  //   console.log('In background after notification', id)
  // }))
} catch (e) {
  console.log(e)
}