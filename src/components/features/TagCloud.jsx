import React from 'react';
import Pill from '../ui/Pill';
import Button from '../ui/Button';

/**
 * TagCloud component for displaying and filtering by tags.
 * 
 * @param {Object} props
 * @param {Array<string>} props.tags - Array of tag strings
 * @param {Array<string>} props.selectedTags - Array of currently selected tags
 * @param {Function} props.onToggle - Callback when tag is toggled (receives tag string)
 * @param {Function} props.onClear - Callback to clear all selected tags
 * @param {boolean} props.showClear - Whether to show clear button when tags are selected (default: true)
 */
const TagCloud = ({
  tags = [],
  selectedTags = [],
  onToggle,
  onClear,
  showClear = true,
}) => (
  <div className="tag-cloud">
    {tags.map((tag) => (
      <Pill
        key={tag}
        active={selectedTags.includes(tag)}
        onClick={() => onToggle?.(tag)}
      >
        #{tag}
      </Pill>
    ))}
    {showClear && selectedTags.length > 0 && onClear && (
      <Pill variant="reset" onClick={onClear}>
        Clear tags
      </Pill>
    )}
  </div>
);

export default TagCloud;


