# Safari glass background follow-up 2

- Removed the fixed `.grain` overlay and instead baked all gradients (top/bottom haze + color spots + base cream) into the root `html`/`body` background so Safari samples a single, varied background for Liquid Glass tinting rather than a fixed layer that could force a flat bar.
- Added stronger top/bottom gradient stops in the root background to give Safari more tonal variation to blur against the status and tab bars, while keeping the existing palette; `body` now inherits this unified background.
- Kept viewport-fit and vh/svh/dvh sizing so the background fills safe areas and overscroll without introducing new fixed elements that Safari might treat as tint sources.
