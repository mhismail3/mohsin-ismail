# iOS tap highlight removal

- Set `-webkit-tap-highlight-color: transparent` on anchors/buttons and enforced `touch-action: manipulation` so iOS Safari stops painting the gray overlay that made button fills look translucent during taps.
- Removed the default button appearance/border globally (while keeping inherited fonts/colors) so only our custom `.btn/.pill` styling renders, preventing Safari from reintroducing native press styling on touch.
- Rationale: On iPhone, tapping buttons briefly added a gray wash that exposed the hard drop shadow; removing the native tap highlight keeps the pressed state entirely in our CSS without visual glitches.
- Verification: CSS-only change; not re-tested on device yet—please open on iOS Safari to confirm the overlay is gone.
