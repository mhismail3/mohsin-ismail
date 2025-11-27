import React from 'react';

/**
 * Standardized button component with variants.
 * 
 * @param {Object} props
 * @param {string} props.variant - Button style variant: 'primary' | 'outline' | 'ghost' (default: 'outline')
 * @param {string} props.size - Button size: 'small' | 'default' (default: 'default')
 * @param {boolean} props.active - Whether button is in active state
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.type - Button type attribute (default: 'button')
 */
const Button = ({
  variant = 'outline',
  size,
  active = false,
  disabled = false,
  className = '',
  children,
  type = 'button',
  ...props
}) => {
  const classes = [
    'btn',
    variant,
    size === 'small' && 'small',
    active && 'active',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

