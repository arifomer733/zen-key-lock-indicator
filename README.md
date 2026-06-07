# Zen Key Lock Indicator

A lightweight, beautiful, glassmorphic browser extension for Zen Browser (Firefox-based) that shows a floating toast when Caps Lock, Num Lock, or Scroll Lock is enabled.

## Features

- **On-Screen Toast**: Displays active locks in a beautiful glassmorphic visual.
- **Real-Time Detection**: Instantly detects and syncs status when typing or clicking anywhere.
- **Auto-Fade**: Appears on status change and fades out after 3 seconds of inactivity.
- **Repositionable**: Move it to any corner of the screen (Top-Left, Top-Right, Bottom-Left, Bottom-Right) using the grid layout picker.
- **Persistent Settings**: Remembers the selected corner layout using `browser.storage.local`.
- **Dismissible**: Click the `×` button to close the notification for the current page session.

## Installation

### For Developers / Temporary Installation
1. Go to `about:debugging#/runtime/this-firefox` in Zen Browser / Firefox.
2. Click **Load Temporary Add-on...**.
3. Select `manifest.json` from the root of this folder.

## File Structure

- `manifest.json`: WebExtension Manifest V2 configuration.
- `background.js`: Manages extension badge state and enables global communication.
- `content.js`: Injects custom styles/DOM overlay and listens for keyboard/mouse events.

## License

MIT License.
