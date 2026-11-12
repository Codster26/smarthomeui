# Smart Home UI — handoff

Updated: November 11, 2026
Repository: https://github.com/Codster26/smarthomeui
Default branch: main

## Start here on another computer

1. Clone the repository, or run `git pull --ff-only` in your existing clone.
2. Open the repository folder in your editor or coding assistant.
3. Read this file and README.md before making changes.
4. Open index.html in a browser, or run `python3 -m http.server 8080` from the repository and visit http://localhost:8080.
5. Commit and push completed work before switching computers. Pull on the next computer before editing. Resolve conflicting history instead of force-pushing.

The repository is the shared source of truth. Paths from the original computer are not required. GitHub stores source; no live website hosting has been configured. Browser demo settings do not sync between devices.

## User intent and design direction

Build a custom bedroom control dashboard for a wall-mounted iPad mini, sixth generation, using a browser. Bedroom is the only room for now; another room can be added later.

The user supplied two visual references: a lighter button dashboard for layout and a dark 3D room dashboard for color/mood. The requested design combines rounded, Apple-inspired controls with a dark navy finish. The 3D interactive room page is explicitly deferred. No cameras are needed.

Original requested location was Desktop/Home Assistant UI. macOS denied Desktop access, so this build was created in the chat workspace's outputs/Home Assistant UI folder. Do not assume the Desktop copy exists or is current. Reference screenshots were supplied in the conversation and are not included in this repository.

## Implemented

- Responsive dark bedroom dashboard with room label, greeting, live local clock/date, and sample weather.
- Main lights, accent lights, under-bed lights, and lamp lights.
- Individual power switches and modal controls for brightness, preset colors, and custom color.
- Relax, Focus, Good night, and All off lighting scenes.
- Room brightness controls lit lights; raising it when all are off turns all four on.
- Portable AC demo with power, 60–86°F target, Cool/Auto/Fan modes. Fan mode disables temperature adjustment.
- Apple Music-style mock player with three sample tracks, play/pause, skip, seek, volume, and simulated progress. No audio plays.
- Navigation shortcuts and display dimming.
- Browser localStorage persistence under bedroom-dashboard-v1. Playback starts paused after reload.

All device controls are simulated. Weather, room temperature, humidity, and music metadata are sample data. No credentials, backend, real device integrations, or 3D page exist.

## Source map

- index.html — structure, inline SVG icons, light dialog.
- styles.css — responsive design, tablet landscape spacing, CSS album artwork.
- app.js — demo state, rendering, interactions, localStorage, timers.
- README.md — running the app and cross-device Git workflow.
- .gitignore — excludes local configuration, credentials, logs, and scratch files.

No framework, package installation, build step, external fonts, or remote image assets are required.

## Verification already performed

Browser checks covered light colors/brightness, scenes including All off, AC temperature and Fan mode, music controls, and persistence after reload. The full layout fit an effective 1133 × 744 landscape viewport without scrolling. Portrait at 744 × 1133 had no horizontal overflow; vertical scrolling is allowed. These were browser viewport checks, not testing on a physical iPad or Safari. Recheck Safari and touch controls when the actual iPad is available.

## Planned integrations — discussed, not implemented

Proposed architecture: custom iPad UI → authenticated Home Assistant connection → devices. Home Assistant should run on an always-on host. Replace demo actions with device commands and subscribe to actual state changes; show unavailable/error states rather than assuming success. Keep long-lived secrets out of browser source and Git.

- Philips Hue: built-in Hue integration via Hue Bridge. Confirm whether the user has a bridge.
- Govee: obtain exact model numbers; use Govee lights local for supported LAN-control models. Other models need compatibility research.
- TCL TV: obtain model/OS. Roku and Google/Android TV require different integrations. Some TCL Google TVs require Screenless service for network wake.
- ConnectLife portable AC: obtain exact model. Community integration at https://github.com/oyvindwe/connectlife-ha is a possible route. Supported controls vary and external state changes may take up to 60 seconds to appear.
- Apple Music: first identify the output device (iPad, TV, HomePod, or other speaker). MusicKit on the Web supports browser playback with Apple authorization/developer setup. Music Assistant is another possibility for compatible speakers, but its Apple Music playback is not officially supported by Apple. Do not promise arbitrary remote control of the Apple Music app.

Recheck current integration documentation before implementation. The user currently uses Apple Home; no migration or removal has been authorized or performed.

## Next useful steps

1. Continue visual revisions based on user feedback.
2. Ask for Hue Bridge status, existing Home Assistant installation, Govee model numbers, TCL model/OS, AC model, and intended music speaker.
3. Bring up Home Assistant and verify each device there before connecting this UI.
4. Connect Hue first, then Govee, TV, AC, and music as compatibility permits.
5. Add the second room and 3D page only when requested.

For a new assistant session: read this handoff and inspect current Git history before editing. Preserve user changes, keep the initial scope bedroom-only, and do not mistake the mock controls for working integrations.

Brightness interaction update: light tiles now act as filled drag dimmers. A separate sparkle button opens color controls. Room and modal brightness controls use filled boxes and relative dragging without click-to-jump. Keyboard arrow keys remain supported.
