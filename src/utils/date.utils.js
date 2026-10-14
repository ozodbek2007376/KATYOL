import dayjs from 'dayjs';

export const formatDate = (date, format = 'MMM DD, YYYY') => {
  if (!date) return 'N/A';
  return dayjs(date).format(format);
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return dayjs(date).format('MMM DD, YYYY HH:mm');
};

export const getRelativeTime = (date) => {
  if (!date) return '';
  return dayjs(date).fromNow ? dayjs(date).fromNow() : dayjs(date).format('MMM DD, YYYY');
};
