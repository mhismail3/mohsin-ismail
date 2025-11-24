# Portfolio card hover refinement

Reference: `docs/2025-11-24 00-50-00 - Portfolio card hover refinement.md`

## Issue
The previous hover effect made the shadow too blurry and light, losing the "solid" feel of the design system. The user wanted a much more subtle blur that retains the solidity of the shadow.

## Change
Updated the `.project-card:hover` shadow in `src/index.css`.
- **Old**: `box-shadow: 4px 14px 28px rgba(31, 26, 20, 0.12)` (Very soft, wide blur).
- **New**: `box-shadow: 5px 9px 2px rgba(31, 26, 20, 0.8)` (Tight blur, high opacity, offset for lift).

## Visual Result
The card still lifts (`translateY(-5px)`), but the shadow remains dark and distinct, with just a `2px` blur radius to soften the edges slightly, simulating a "closer" shadow that hasn't diffused completely.
