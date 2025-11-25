# Portfolio archive ordering

## Summary
Archived projects are now ordered after non-archived entries so Completed work always appears before anything marked Archived, even if the archived item has a newer date.

## Problem
Portfolio items were sorted purely by date, so a newly archived project could float above completed work, which contradicts the intent to demote archives.

## Solution
- Added a status-aware comparator in `src/portfolioProjects.js` that pushes any `Archived` status items below other projects before applying the existing date sort.
- Status detection is case-insensitive to avoid ordering drift from inconsistent casing.

## Notes
- Tests not run; change only affects sort order.
