# Desktop header flyout nav

- On desktop, the header dropdown now flies out from behind the toggle button instead of expanding downward; buttons animate left of the toggle with a bounce effect and use a left-chevron icon when open.
- Kept mobile behavior unchanged (vertical expansion), using viewport detection in `Header` to switch between modes.
- Enabled overflow visibility on the flyout layout so nav buttons render fully without increasing header height.
