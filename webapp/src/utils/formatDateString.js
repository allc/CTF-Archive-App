function formatDateString(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatDateStringOrNull(dateString) {
  if (dateString) {
    return formatDateString(dateString);
  }
  return null;
}

export { formatDateString, formatDateStringOrNull };