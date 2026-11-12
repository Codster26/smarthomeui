# Bedroom dashboard

A local, dependency-free HTML/CSS/JavaScript prototype. No accounts, API keys, device connections, or external assets are required.

## Open

Open `index.html` in a browser. Keep `styles.css` and `app.js` beside it.

To use a local server, run from this folder:

```sh
python3 -m http.server 8080 --bind 0.0.0.0
```

On the same Wi-Fi, open `http://YOUR-COMPUTER-IP:8080` on the iPad. The computer must remain on. The server exposes the contents of this folder to your local network; stop it with Control-C. Safari's Share → Add to Home Screen can provide a cleaner wall-panel experience.

## Try it

- Drag left or right across a light tile to dim or brighten it; its fill follows your drag. Tap the sparkle button for color controls and the small switch for power. Brightness boxes also support arrow keys; a tap alone does not change brightness.
- Use Relax, Focus, Good night, or All off to change the lighting together.
- Room brightness adjusts the currently lit lights. When all lights are off, raising it turns all four on.
- Set AC temperature from 60–86°F, switch between Cool / Auto / Fan, and toggle AC power. Fan mode disables the temperature buttons.
- Play/pause, skip, seek, and adjust the demo music volume. No audio plays.
- Use the moon button to dim the display. The rail shortcuts jump to dashboard sections.

Light, scene, AC, track, and volume settings persist in browser local storage where supported. Playback starts paused on page load. To reset, clear this page's site data. Clock/date use the browser's local time. Weather, room temperature, humidity, and track information are sample data.

The layout adapts to landscape and portrait tablets and phones. Landscape is the intended wall-panel orientation. It uses system fonts, inline SVG icons, and a CSS album illustration, so there are no remote dependencies.

## Files and next steps

- `index.html`: dashboard structure and icons
- `styles.css`: responsive visual design
- `app.js`: local state and demo interactions

No 3D page has been implemented. There are no Home Assistant, Hue, Govee, Apple Home, Apple Music, or AC integrations yet. Device integrations can later replace the local state actions without replacing the layout. Do not embed long-lived device or Home Assistant credentials in browser source.

## Work across devices

Clone the repository once on each computer:

```sh
git clone https://github.com/Codster26/smarthomeui.git
cd smarthomeui
```

Before starting work, pull the latest changes:

```sh
git pull --ff-only
```

After editing, review and save your changes:

```sh
git status
git add index.html styles.css app.js README.md .gitignore
git commit -m "Describe your dashboard changes"
git push
```

Push your changes before switching computers, then pull on the other computer. If a pull reports conflicting history, resolve it before continuing; do not force-push over work from another device. GitHub authentication is required to push.

This repository syncs the source files. Demo device settings remain in each browser's local storage and do not sync through GitHub. Uploading the files does not publish a live website.

Brightness interaction update: light tiles now act as filled drag dimmers. A separate sparkle button opens color controls. Room and modal brightness controls use filled boxes and relative dragging without click-to-jump. Keyboard arrow keys remain supported.
