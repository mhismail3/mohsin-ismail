import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Pill, Button } from '../ui';

/**
 * Calculate proportional scale factors for tags based on their counts.
 * Uses logarithmic scaling to avoid extreme size differences.
 * 
 * @param {Object} tagCounts - Map of tag names to counts
 * @param {Array<string>} tags - Array of tag names to scale
 * @returns {Object} Map of tag names to scale factors (0-1)
 */
function calculateTagScales(tagCounts, tags) {
  if (!tagCounts || tags.length === 0) return {};
  
  const counts = tags.map(tag => tagCounts[tag] || 0);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);
  
  // If all counts are the same, return uniform scale
  if (minCount === maxCount) {
    return tags.reduce((acc, tag) => ({ ...acc, [tag]: 0.5 }), {});
  }
  
  // Use logarithmic scaling for smoother distribution
  // log(1) = 0, so we add 1 to avoid log(0) and shift the scale
  const logMin = Math.log(minCount + 1);
  const logMax = Math.log(maxCount + 1);
  const logRange = logMax - logMin;
  
  return tags.reduce((acc, tag) => {
    const count = tagCounts[tag] || 0;
    const logCount = Math.log(count + 1);
    // Normalize to 0-1 range
    const scale = (logCount - logMin) / logRange;
    return { ...acc, [tag]: scale };
  }, {});
}

/**
 * TagCloud component for displaying and filtering by tags.
 * Tags scale proportionally based on their post counts.
 * 
 * @param {Object} props
 * @param {Array<string>} props.tags - Array of tag strings
 * @param {Array<string>} props.selectedTags - Array of currently selected tags
 * @param {Function} props.onToggle - Callback when tag is toggled (receives tag string)
 * @param {Function} props.onClear - Callback to clear all selected tags
 * @param {boolean} props.showClear - Whether to show clear button when tags are selected (default: true)
 * @param {Object} props.tagCounts - Optional object mapping tag names to their post counts
 */
const TagCloud = ({
  tags = [],
  selectedTags = [],
  onToggle,
  onClear,
  showClear = true,
  tagCounts,
}) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Calculate scale factors for proportional sizing
  const tagScales = useMemo(
    () => calculateTagScales(tagCounts, tags),
    [tagCounts, tags]
  );
  
  const hasScaling = tagCounts && Object.keys(tagScales).length > 0;

  // Split tags into 3 rows for horizontal scrolling layout
  // using interleaved distribution (0,1,2,0,1,2...) for visual balance
  const rows = [[], [], []];
  tags.forEach((tag, index) => {
    rows[index % 3].push(tag);
  });

  // Check scroll capability
  const checkScroll = () => {
    const el = scrollRef.current;
    if (el) {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      // Show left gradient if we've scrolled past start (with tiny buffer)
      setCanScrollLeft(scrollLeft > 2);
      // Show right gradient if there's more content (with tiny buffer)
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
    }
  };

  useEffect(() => {
    checkScroll();
    
    // Check on resize too
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [tags]); // Re-check when tags change

  return (
    <div className="tag-cloud-wrapper">
      <div 
        ref={scrollRef}
        className={`tag-cloud${hasScaling ? ' tag-cloud--scaled' : ''}`}
        onScroll={checkScroll}
      >
        {rows.map((rowTags, rowIndex) => (
          <div key={rowIndex} className="tag-cloud-row">
            {rowTags.map((tag) => (
              <Pill
                key={tag}
                active={selectedTags.includes(tag)}
                onClick={() => onToggle?.(tag)}
                style={hasScaling ? { '--tag-scale': tagScales[tag] } : undefined}
                className={hasScaling ? 'tag-scaled' : undefined}
              >
                #{tag}
                {tagCounts && tagCounts[tag] !== undefined && (
                  <span className="tag-count">{tagCounts[tag]}</span>
                )}
              </Pill>
            ))}
            {/* Append clear button to the end of the logical last row (based on count) */}
            {showClear && selectedTags.length > 0 && onClear && rowIndex === (tags.length % 3) && (
              <Pill variant="reset" onClick={onClear}>
                Clear tags
              </Pill>
            )}
          </div>
        ))}
      </div>
      
      {/* Scroll gradients - using CSS custom properties for smooth transitions */}
      <div className={`scroll-gradient left ${canScrollLeft ? 'visible' : ''}`} />
      <div className={`scroll-gradient right ${canScrollRight ? 'visible' : ''}`} />
    </div>
  );
};

export default TagCloud;
