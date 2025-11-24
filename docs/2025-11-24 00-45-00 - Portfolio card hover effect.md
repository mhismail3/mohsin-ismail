# Portfolio card hover effect

Reference: `docs/2025-11-24 00-45-00 - Portfolio card hover effect.md`

## Change
Added a hover interaction to portfolio project cards to create a "lift off" effect as requested.

## Implementation
- **CSS**: Updated `.project-card` in `src/index.css`.
- **Transition**: Added `transform` and `box-shadow` transitions (0.32s cubic-bezier).
- **Hover State**:
    - `transform: translateY(-5px)`: Physically moves the card up.
    - `box-shadow`: Changes from the default hard "retro" shadow (`--shadow-retro`) to a softer, larger, more transparent shadow (`4px 14px 28px rgba(31, 26, 20, 0.12)`).

## Visual Result
When hovering over a card, it smoothly rises and the shadow diffuses, giving the impression that the card is lifting off the page and floating closer to the viewer (simulating a light source that casts a softer shadow as the object moves away from the surface).

