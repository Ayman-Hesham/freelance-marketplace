import { formatDistanceToNow } from 'date-fns';

const formatDistanceLocale = {
  lessThanXSeconds: '{{count}}s',
  xSeconds: '{{count}}s',
  halfAMinute: '30s',
  lessThanXMinutes: '{{count}}m',
  xMinutes: '{{count}}m',
  aboutXHours: '{{count}}h',
  xHours: '{{count}}h',
  xDays: '{{count}}d',
  aboutXWeeks: '{{count}}w',
  xWeeks: '{{count}}w',
  aboutXMonths: '{{count}}mo',
  xMonths: '{{count}}mo',
  aboutXYears: '{{count}}y',
  xYears: '{{count}}y',
  overXYears: '{{count}}y',
  almostXYears: '{{count}}y',
};

export const formatMessageDate = (date: Date | string) => {
  return formatDistanceToNow(new Date(date), { 
    addSuffix: true,
    locale: {
      ...formatDistanceLocale,
      formatDistance: (token, count) => {
        return formatDistanceLocale[token].replace('{{count}}', count.toString());
      },
    }
  });
}