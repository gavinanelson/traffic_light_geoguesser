# Global Emergency Shift Gameplay Design

## Goal

Define the smallest believable gameplay loop and navigation structure for `traffic_light_geoguesser` that can be built quickly while still giving the player a strong job fantasy.

The game should feel like a high-pressure operator shift where the player verifies worldwide traffic-camera locations from mailed photo packets so emergency logistics teams can rebuild a trusted routing registry.

## Product Constraints

- Build window is approximately 3 hours.
- Gameplay must stay simple and score-driven.
- The photos come from around the world, not a single city.
- The fiction must justify why a human is locating cameras from stale physical photos.
- The prototype should avoid large supporting simulation systems.

## Fiction Summary

A cyberattack corrupted GPS-linked camera metadata and damaged digital map records worldwide.

What survived were physical maintenance packets that traffic departments and contractors had already mailed out. Those packets include stale traffic-camera photos, but not trustworthy machine-readable coordinates.

The player works a shift at a global emergency logistics desk. Their job is to verify as many camera locations as possible before handoff so emergency coordinators can trust the rebuilt routing registry.

## Direct Player Goal

Verify as many worldwide traffic-camera locations as possible before the shift timer expires.

Each correct answer adds one trusted location to the emergency registry. The score represents how much useful routing intelligence the player restores before handoff.

## Core Gameplay Loop

1. A mailed photo packet appears with one stale traffic-camera image.
2. The player inspects the image for clues such as road markings, traffic-light arrangement, architecture, signage, driving side, weathering, and lane geometry.
3. The player places the location on the map.
4. If the guess is correct, that location is marked as verified, the score increases, and the next packet arrives.
5. If the guess is wrong, the player loses time and their streak resets.
6. The loop repeats until the shift timer reaches zero.

## Scoring Rules

Recommended prototype values:

- Correct guess: `+100` points
- Consecutive correct streak bonus: `+25` per streak level
- Wrong guess: `-8` seconds and streak reset
- End-of-shift summary: show total score, verified count, and best streak

These values are simple enough for a first implementation and easy to tune later.

## Guessing Model

For the fast prototype, the map should not support arbitrary exact-coordinate distance scoring.

Instead, the game should use a fixed set of known candidate locations around the world. The player clicks one of those known points. A guess is either correct or incorrect.

Rationale:

- much easier to build than full distance-based scoring
- easier to explain visually
- matches the 3-hour build limit
- works well with a small curated dataset

## Round Structure

Each round contains:

- one image path
- one hidden correct location ID
- one display title or packet ID
- one visible map containing all candidate points

The runtime experience should show only one packet at a time.

## Navigation Structure

The prototype should use only three screens.

### 1. Briefing Screen

Purpose:

- establish the fiction quickly
- explain the job in one short paragraph
- tell the player the shift target
- provide a clear `Start Shift` button

Required content:

- game title
- 2 to 4 sentences of emergency-logistics framing
- short rule list
- start action

### 2. Shift Screen

Purpose:

- hold the full active gameplay loop
- keep the player focused on photo inspection and fast map placement

Layout:

- left panel: mailed photo packet and packet label
- right panel: world map with candidate location markers
- top bar: score, time left, verified count, streak
- optional small status line: `Dispatch Target: verify as many intersections as possible before handoff`

Player action:

- inspect image
- click map marker
- receive immediate result
- advance to next packet

### 3. Debrief Screen

Purpose:

- close the shift cleanly
- reinforce the score-chasing loop
- offer replay without extra complexity

Required content:

- final score
- verified total
- best streak
- short flavor text about registry recovery
- `Play Again` button

## Feedback Rules

Round feedback should be immediate and short.

- Correct: highlight the chosen point as verified and show a brief success message
- Wrong: show the correct point, apply the penalty, and move on quickly

The prototype should avoid long transitions or modal interruptions.

## Why Mailed Photos Matter

The mailed packet framing is not just flavor. It explains why the player is working from stale images instead of modern live systems.

It also creates a believable desk-job texture:

- physical packet arrives
- photo is archival and imperfect
- the operator must infer the location visually
- the result is manually entered into the rebuilt registry

## MVP Scope

Must-have for the first playable build:

- briefing screen
- shift screen
- debrief screen
- timer
- score and streak
- clickable world map with known points
- single-round correctness checking
- packet-to-packet progression through a small curated dataset

Explicitly out of scope:

- live emergency route simulation
- district unlocking systems
- narrative case files
- freeform exact-distance scoring
- backend persistence
- multiplayer or leaderboards

## Success Criteria

The prototype succeeds if:

- the player understands the job premise immediately
- one round can be completed in seconds
- the full session feels like a score attack rather than a puzzle story
- the world-map framing reads clearly
- the game is fully playable with a small set of curated worldwide traffic-camera photos
