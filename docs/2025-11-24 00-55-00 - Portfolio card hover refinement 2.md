# Portfolio card hover refinement 2

Reference: `docs/2025-11-24 00-55-00 - Portfolio card hover refinement 2.md`

## Issue
The previous refinement (`5px 9px 2px rgba(31, 26, 20, 0.8)`) was too harsh and weak in terms of the blur effect, making it look like a simple hard shadow shift rather than a lift-off. The user requested a "middle ground" between the initial soft blur and the second hard shadow.

## Change
Updated `.project-card:hover` shadow in `src/index.css`.
- **Old (v1)**: `4px 14px 28px rgba(31, 26, 20, 0.12)` (Too blurry/soft).
- **Old (v2)**: `5px 9px 2px rgba(31, 26, 20, 0.8)` (Too hard/sharp).
- **New**: `5px 11px 10px rgba(31, 26, 20, 0.22)`.

## Visual Result
- **Blur**: Increased to `10px` (was `2px`, previously `28px`). This provides a noticeable diffusion without completely losing definition.
- **Opacity**: Reduced to `0.22` (was `0.8`, previously `0.12`). This keeps the shadow visible but translucent, mimicking a shadow cast from a slight distance.
- **Offset**: `5px 11px` continues to support the upward lift illusion.

This strikes a balance: distinct enough to feel "grounded" in the retro style, but soft enough to convincingly sell the "lift" animation.
