# Paradise Bloom 1.0.22

Fixed the ray fan snapping backwards at each 2–3.2 second background loop. Rotation now follows the unwrapped Spine track time before world transforms are rendered. Glow, particles and screen layout retain their existing timing.

Browser verification: four loops of each of six screen backgrounds, full 360-degree boundary, paused animation state, and rendered world transforms. Before-fix recording reproduced two backwards snaps. All 115 frontend tests pass. Production build and archive CRC/content verification pass. Legacy frame from supplied 1.0.14, yellow win amounts, rules and mathematics are preserved.
