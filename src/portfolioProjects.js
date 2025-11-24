const portfolioProjects = [
  {
    title: 'Signal Desk',
    slug: 'signal-desk',
    date: '2024',
    description: 'A centralized command center for distributed teams. Signal Desk brings together async communication, task tracking, and live status updates into a single, calm interface designed to reduce context switching.',
    github: 'https://github.com/mohsin-ismail/signal-desk',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    aspect: 0.78,
    gallery: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
      'https://images.unsplash.com/photo-1555421689-4922cd293803',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c'
    ]
  },
  {
    title: 'Remote Atlas',
    slug: 'remote-atlas',
    date: '2023',
    description: 'Interactive mapping tool for digital nomads. Visualize time zones, visa requirements, and internet speeds across the globe. Built with Mapbox GL and React.',
    github: 'https://github.com/mohsin-ismail/remote-atlas',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    aspect: 0.75,
    gallery: [
       'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
       'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1',
       'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df',
       'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b'
    ]
  },
  {
    title: 'Field Notes',
    slug: 'field-notes',
    date: '2025',
    description: 'A minimal markdown editor for field researchers. Offline-first, synchronizing when connection is restored. Features simplified citation management and photo attachment.',
    github: 'https://github.com/mohsin-ismail/field-notes',
    image: 'https://images.unsplash.com/photo-1470246973918-29a93221c455',
    aspect: 0.7,
    gallery: [
      'https://images.unsplash.com/photo-1470246973918-29a93221c455',
      'https://images.unsplash.com/photo-1457369804613-52c61a468e7d',
      'https://images.unsplash.com/photo-1517842645767-c639042777db',
      'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d'
    ]
  },
  {
    title: 'Analog Trails',
    slug: 'analog-trails',
    date: '2023',
    description: 'Digital archive for film photography enthusiasts. Catalog film stocks, development recipes, and scan settings. A community-driven database for analog workflows.',
    github: 'https://github.com/mohsin-ismail/analog-trails',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
    aspect: 0.76,
    gallery: [
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05',
      'https://images.unsplash.com/photo-1500622944204-b135684e99fd',
      'https://images.unsplash.com/photo-1433838552652-f9a46b332c40'
    ]
  },
  {
    title: 'Quiet Interface',
    slug: 'quiet-interface',
    date: '2024',
    description: 'An exploration of calm computing principles applied to dashboard UI. Reducing alert fatigue through intelligent grouping and ambient status indicators.',
    github: 'https://github.com/mohsin-ismail/quiet-interface',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
    aspect: 0.74,
    gallery: [
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
      'https://images.unsplash.com/photo-1531403009284-440f080d1e12',
      'https://images.unsplash.com/photo-1551434678-e076c223a692'
    ]
  },
  {
    title: 'Night Shift',
    slug: 'night-shift',
    date: '2023',
    description: 'Dark mode toggle and theming engine for legacy enterprise apps. A drop-in library to modernize archaic interfaces without a full rewrite.',
    github: 'https://github.com/mohsin-ismail/night-shift',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
    aspect: 0.78,
    gallery: [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
        'https://images.unsplash.com/photo-1550439062-609e1531270e',
        'https://images.unsplash.com/photo-1542831371-29b0f74f9713'
    ]
  },
  {
    title: 'Wayfinding System',
    slug: 'wayfinding-system',
    date: '2022',
    description: 'Digital signage software for university campuses. Real-time event updates, emergency broadcasting, and interactive 3D maps.',
    github: 'https://github.com/mohsin-ismail/wayfinding',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
    aspect: 0.72,
    gallery: [
        'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
        'https://images.unsplash.com/photo-1497366216548-37526070297c',
        'https://images.unsplash.com/photo-1497215728101-856f4ea42174'
    ]
  },
  {
    title: 'Harbor CMS',
    slug: 'harbor-cms',
    date: '2024',
    description: 'Headless CMS designed for static site generators. Git-based storage with a friendly editing interface for non-technical content creators.',
    github: 'https://github.com/mohsin-ismail/harbor-cms',
    image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e',
    aspect: 0.82,
    gallery: [
        'https://images.unsplash.com/photo-1472214103451-9374bd1c798e',
        'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d',
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40'
    ]
  },
  {
    title: 'Northbound',
    slug: 'northbound',
    date: '2023',
    description: 'Logistics tracking for arctic shipping routes. Specialized visualization for ice coverage and weather patterns affecting delivery estimates.',
    github: 'https://github.com/mohsin-ismail/northbound',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
    aspect: 0.68,
    gallery: [
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
        'https://images.unsplash.com/photo-1516937941344-00b4e0337589',
        'https://images.unsplash.com/photo-1483389127517-711b1d1d2979'
    ]
  },
  {
    title: 'Monument UI',
    slug: 'monument-ui',
    date: '2025',
    description: 'React component library focusing on brutalist aesthetics and high contrast accessibility. Heavy use of borders and bold typography.',
    github: 'https://github.com/mohsin-ismail/monument-ui',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
    aspect: 0.8,
    gallery: [
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
        'https://images.unsplash.com/photo-1518770660439-4636190af475',
        'https://images.unsplash.com/photo-1504164996092-797626b4550f'
    ]
  },
  {
    title: 'Dispatch Ops',
    slug: 'dispatch-ops',
    date: '2024',
    description: 'Real-time fleet management dashboard. WebSocket integration for live vehicle telemetry and driver status monitoring.',
    github: 'https://github.com/mohsin-ismail/dispatch-ops',
    image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef',
    aspect: 0.77,
    gallery: [
        'https://images.unsplash.com/photo-1489515217757-5fd1be406fef',
        'https://images.unsplash.com/photo-1508614999368-9260051292e5',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085'
    ]
  },
  {
    title: 'Courier',
    slug: 'courier',
    date: '2022',
    description: 'Secure document transfer service for legal firms. End-to-end encryption with audit logs and expiration policies.',
    github: 'https://github.com/mohsin-ismail/courier',
    image: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d',
    aspect: 0.73,
    gallery: [
        'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d',
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7',
        'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d'
    ]
  },
];

export default portfolioProjects;
