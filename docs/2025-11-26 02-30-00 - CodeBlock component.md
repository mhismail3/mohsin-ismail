# CodeBlock Component

## Summary
Created a new `CodeBlock` component for displaying large code snippets with expand/collapse functionality and copy-to-clipboard support, styled to match the website's retro aesthetic.

## Changes

### New Files
- `src/components/CodeBlock.jsx` - React component for expandable code blocks

### Modified Files
- `src/index.css` - Added CSS styles for `.code-block` and related classes
- `src/PostPage.jsx` - Integrated CodeBlock example in the "Field notes on tactile UI" post

## Component Features
1. **Truncation**: Shows first N lines (default 10) with gradient fade
2. **Expand/Collapse**: Button to show all lines or collapse back
3. **Copy to Clipboard**: Copy button with "Copied!" feedback
4. **Line Count**: Shows "N / total lines" indicator
5. **Language Label**: Displays language in header
6. **Retro Styling**: Dark theme with solid shadow matching site aesthetic

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `code` | string | required | The code snippet to display |
| `language` | string | `'javascript'` | Language label for header |
| `maxLines` | number | `10` | Lines to show before truncation |

## Usage Example
```jsx
import CodeBlock from './components/CodeBlock';

<CodeBlock 
  code={myCodeString} 
  language="typescript" 
  maxLines={15} 
/>
```

## CSS Classes
- `.code-block` - Main container with retro border/shadow
- `.code-block-header` - Top bar with language and copy button
- `.code-block-content` - Scrollable code area
- `.code-block-fade` - Gradient fade overlay for truncated state
- `.code-block-expand` - Bottom expand/collapse button

## Demo Location
The component is demonstrated in the "Field notes on tactile UI" post at `/#/posts/2025-11-15-field-notes` with a sample React hook implementation.

