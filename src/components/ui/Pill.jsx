import React from 'react';

/**
 * Tag/pill button component with variants.
 * 
 * @param {Object} props
 * @param {string} props.variant - Pill style variant: 'default' | 'active' | 'reset' | 'disabled' | 'icon' | 'project-link' (default: 'default')
 * @param {string} props.size - Pill size: 'small' | 'default' (default: 'default')
 * @param {boolean} props.active - Whether pill is in active/selected state (alternative to variant='active')
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Pill content
 * @param {string} props.as - Element type to render ('button' | 'span' | 'a', default: 'button')
 */
const Pill = ({
  variant = 'default',
  size,
  active = false,
  className = '',
  children,
  as: Component = 'button',
  ...props
}) => {
  const classes = [
    'pill',
    variant !== 'default' && variant === 'icon' ? 'icon-btn' : variant !== 'default' ? variant : null,
    variant === 'project-link' && 'project-link-pill',
    size === 'small' && 'small',
    active && 'active',
    className,
  ].filter(Boolean).join(' ');

  const componentProps = Component === 'button' ? { type: 'button', ...props } : props;

  return (
    <Component className={classes} {...componentProps}>
      {children}
    </Component>
  );
};

export default Pill;



