/**
 * Listens for the app launching then creates the window
 *
 * @see http://developer.chrome.com/apps/app.runtime.html
 * @see http://developer.chrome.com/apps/app.window.html
 */
chrome.app.runtime.onLaunched.addListener(function() {
  // Center window on screen.
  var width = screen.availWidth;
  var height = screen.availHeight;
  chrome.app.window.create('index.html', {
    id: "window-app",
    state: 'fullscreen',
    resizable: true,
    alwaysOnTop: true,
    focused: true
  });
  chrome.app.window.onMaximized.addListener(function() {
      chrome.app.window.fullscreen(true);
  });
});