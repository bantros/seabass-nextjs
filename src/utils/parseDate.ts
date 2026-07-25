import * as z from 'zod';

export const parseDate = (date: string) => {
  if (!z.date().safeParse(date)) return;
  return new Date(date).toLocaleString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};
