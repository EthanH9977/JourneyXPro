import { TripPlan, TravelBookDay, TravelBookEventType, Activity } from '../types';

const weekDays = ['(日)', '(一)', '(二)', '(三)', '(四)', '(五)', '(六)'];

const activityTypeToEvent = (type: Activity['type']): TravelBookEventType => {
  switch (type) {
    case 'food':
      return 'FOOD';
    case 'transport':
      return 'BUS';
    case 'shopping':
      return 'SHOPPING';
    case 'rest':
      return 'HOTEL';
    case 'sightseeing':
      return 'SIGHTSEEING';
    default:
      return 'WALKING';
  }
};

const formatDisplayDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return dateStr;
  }
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const week = weekDays[date.getDay()];
  return `${month}/${day} ${week}`;
};

const buildDetails = (activity: Activity) => {
  const details: { title: string; content: string }[] = [];
  if (activity.transportDetail) {
    details.push({ title: '交通', content: activity.transportDetail });
  }
  if (activity.cost) {
    details.push({ title: '費用', content: activity.cost });
  }
  if (activity.rainPlan) {
    details.push({ title: '雨備方案', content: activity.rainPlan });
  }
  if (activity.localTip) {
    details.push({ title: '在地小秘訣', content: activity.localTip });
  }
  if (activity.duration) {
    details.push({ title: '預估停留', content: activity.duration });
  }
  return details.length > 0 ? details : undefined;
};

export const tripPlanToTravelBook = (plan: TripPlan): TravelBookDay[] => {
  return plan.days.map((day) => {
    const events = day.activities.map((activity, index) => {
      const locationUrl = activity.location
        ? `https://www.google.com/maps/search/?api=1&query=${activity.location.lat},${activity.location.lng}`
        : undefined;

      return {
        id: `${day.day}-${index}`,
        time: activity.time,
        title: activity.title,
        locationName: activity.location?.name || plan.destination,
        locationUrl,
        type: activityTypeToEvent(activity.type),
        description: activity.description,
        details: buildDetails(activity)
      };
    });

    return {
      dayId: day.day,
      dateStr: day.date,
      displayDate: formatDisplayDate(day.date),
      region: day.theme || plan.destination,
      events
    };
  });
};

