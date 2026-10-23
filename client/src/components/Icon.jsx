
const paths = {
  chat: [
    'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  ],
  mic: [
    'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z',
    'M19 10v2a7 7 0 0 1-14 0v-2',
    'M12 19v4',
    'M8 23h8',
  ],
  book: [
    'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z',
    'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
  ],
  spark: [
    'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z',
    'M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19z',
  ],
  heart: [
    'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z',
  ],
  send: [
    'M22 2L11 13',
    'M22 2l-7 20-4-9-9-4z',
  ],
  swap: [
    'M7 16V4',
    'M3 8l4-4 4 4',
    'M17 8v12',
    'M21 16l-4 4-4-4',
  ],
  arrowLeft: [
    'M19 12H5',
    'M12 19l-7-7 7-7',
  ],
volume: [
  'M11 5L6 9H2v6h4l5 4V5z',
  'M15.5 8.5a5 5 0 0 1 0 7',
  'M19 5a10 10 0 0 1 0 14',
],

  expand: [
    'M15 3h6v6',
    'M9 21H3v-6',
    'M21 3l-7 7',
    'M3 21l7-7',
  ],
  search: [
    'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
    'M21 21l-4.3-4.3',
  ],
  x: [
    'M18 6L6 18',
    'M6 6l12 12',
  ],
  copy: [
    'M9 9h11v11H9z',
    'M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1',
  ],
  check: [
    'M20 6L9 17l-5-5',
  ],
  bulb: [
    'M9 18h6',
    'M10 22h4',
    'M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z',
  ],
  flame: [
    'M12 2s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-8z',
  ],
  translate: [
    'M5 8l6 6',
    'M4 14l6-6 2-3',
    'M2 5h12',
    'M7 2h1',
    'M22 22l-5-10-5 10',
    'M14 18h6',
  ],
  speed: [
    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z',
    'M10 8l6 4-6 4z',
  ],
  eye: [
    'M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z',
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  ],

  // Additional icons for future KannadaSaathi features
  mapPin: [
    'M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z',
    'M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  ],
  globe: [
    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z',
    'M2 12h20',
    'M12 2a15 15 0 0 1 0 20',
    'M12 2a15 15 0 0 0 0 20',
  ],
  phone: [
    'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8L7.2 10.3a16 16 0 0 0 6 6l1.8-1.8a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 2.2 2.5z',
  ],
  clock: [
    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z',
    'M12 6v6l4 2',
  ],
  alert: [
    'M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20h15.8a2 2 0 0 0 1.7-2.5L13.7 3.9a2 2 0 0 0-3.4 0z',
    'M12 9v4',
    'M12 17h.01',
  ],
};

export default function Icon({
  name,
  size = 20,
  strokeWidth = 2,
  className = '',
  title,
}) {
  const iconPaths = paths[name] || paths.spark;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      aria-label={title || undefined}
      role={title ? 'img' : undefined}
      focusable="false"
    >
      {iconPaths.map((d, index) => (
        <path key={`${name}-${index}`} d={d} />
      ))}
    </svg>
  );
}
