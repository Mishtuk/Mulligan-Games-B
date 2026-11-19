// One .ics per weekly night and per dated one-off, built at deploy time: /events/<id>.ics
import events from '../../data/events.json';
import store from '../../data/store.json';
import { eventIcs, isShown } from '../../lib/events.js';

export function getStaticPaths() {
  const rows = [...events.weekly, ...events.oneoffs.filter((e) => e.date)].filter(isShown);
  return rows.map((e) => ({ params: { id: e.id }, props: { e } }));
}

export function GET({ props }) {
  const a = store.address;
  const body = eventIcs(props.e, { now: Date.now(), tz: store.timezone, place: `${store.name}, ${a.street}, ${a.city}, ${a.state} ${a.zip}` });
  return new Response(body, { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
}
