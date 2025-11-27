# TLDR collapsed gap fix

- The TL;DR wrapper still reserved space when hidden because the nested `.post-body` kept its border and padding even with `grid-template-rows: 0fr`, leaving a ~13px gap under the toggle.
- Added a collapsed-state override in `src/styles/components/post-card.css` to strip the border and padding whenever the card is not expanded, eliminating the reserved space.
- Expanded styling and animation stay the same, so the reveal/hide behavior is unchanged while the hidden state no longer adds whitespace. Post page rendering is unaffected.
