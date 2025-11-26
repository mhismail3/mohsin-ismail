export const formatDate = (value) => {
  const date = new Date(value);
  const datePart = new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
  
  const timePart = new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
  
  return `${datePart} ${timePart}`;
};



