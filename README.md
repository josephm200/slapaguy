Mouse-Controlled Video Scrubber Web App
Project Overview

Create a simple, single-page web application inspired by the interaction style of eelslap.com, but with a different theme.
This app uses a local MP4 video file and allows the user to control video playback by moving their mouse horizontally.

The app should feel playful, immediate, and physics-like — no buttons, no UI clutter.

Core Interaction Requirements

The app displays a full-screen video of a real person (or subject) interacting with an object (theme can be generic).

The video does NOT autoplay.

Video playback is controlled entirely by horizontal mouse movement:

Moving the mouse left → video plays forward

Moving the mouse right → video rewinds backward

The speed and distance the video scrubs should scale with:

How far the mouse moves

How fast the mouse moves

When the mouse stops moving, the video should stop changing frames (no inertia unless added later).

Video Behavior Details

Use an HTML5 <video> element.

The video should:

Be muted

Have controls disabled

Not loop automatically (unless explicitly coded)

Video playback should be controlled by manually setting video.currentTime, not by calling play() or pause() continuously.

Clamp currentTime so it never goes below 0 or above video.duration.

Mouse Tracking Logic

Track horizontal mouse movement using:

mousemove events

Store the previous mouse X position.

On each mouse move:

Calculate deltaX = currentX - previousX

Convert deltaX into a time delta (e.g. seconds per pixel).

Example behavior:

Small movements → subtle scrubbing

Large fast movements → aggressive scrubbing

Technical Constraints

Use vanilla JavaScript, HTML, and CSS only

No frameworks (React, Vue, etc.)

No external libraries

All logic should live in:

index.html

style.css

script.js

The MP4 video should be referenced locally (e.g. /assets/video.mp4)

Layout & Styling

Video should:

Fill the entire viewport (100vw x 100vh)

Maintain aspect ratio (object-fit: cover)

Cursor should remain visible

Background should be black or neutral

No visible UI elements unless needed for debugging

Performance & UX Considerations

Scrubbing should feel:

Smooth

Responsive

Low-latency

Avoid excessive DOM updates

Throttle or smooth mouse input if necessary

Prevent text selection or unwanted drag behavior

Deliverables

Copilot should generate:

index.html

Video element

Script and CSS references

style.css

Fullscreen layout

Minimal styling

script.js

Mouse tracking logic

Video time control logic

Clear comments explaining:

Mouse delta math

Time scaling logic

Boundary checks

Optional Enhancements (Only If Easy)

Sensitivity constant that can be easily tuned

Mobile fallback:

Touch drag scrubbing

Prevent scroll on mobile

Small easing or smoothing to reduce jitter

Goal

The final result should feel like:

A playful, one-interaction web toy

Extremely simple

Immediately understandable without instructions

Very similar in spirit to Eelslap, but with a different theme and object