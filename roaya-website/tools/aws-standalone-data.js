/**
 * The component's render context, mirrored for the standalone build.
 * Data literals match aws.component.ts; the two seed helpers are copied
 * verbatim so the decorative dot fields come out identical.
 */
function seedRegion() {
  let seed = 19470723;
  const prand = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const clusters = [
    { cx: 128, cy: 172, rx: 46, ry: 26 },
    { cx: 280, cy: 176, rx: 58, ry: 28 },
    { cx: 432, cy: 172, rx: 46, ry: 26 }
  ];
  const dots = [];
  clusters.forEach((cluster, ci) => {
    for (let i = 0; i < 34; i++) {
      const angle = prand() * Math.PI * 2;
      const radius = Math.sqrt(prand());
      dots.push({
        x: Math.round(cluster.cx + Math.cos(angle) * radius * cluster.rx),
        y: Math.round(cluster.cy + Math.sin(angle) * radius * cluster.ry),
        z: (ci + i) % 3
      });
    }
  });
  return dots;
}

function seedMotes(count, seedStart) {
  let seed = seedStart;
  const prand = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  return Array.from({ length: count }, (_, i) => ({
    x: Math.round(prand() * 1600),
    y: Math.round(prand() * 900),
    r: +(0.9 + prand() * 1.8).toFixed(1),
    v: i % 4
  }));
}

const DEFAULTS = { stage: 'assess', pillar: 'local', region: 'egypt' };

const journey = [
  { id: 'assess', n: '01', icon: 'lucideScanSearch' },
  { id: 'design', n: '02', icon: 'lucideDraftingCompass' },
  { id: 'migrate', n: '03', icon: 'lucideArrowLeftRight' },
  { id: 'secure', n: '04', icon: 'lucideShieldCheck' },
  { id: 'operate', n: '05', icon: 'lucideActivity' },
  { id: 'optimize', n: '06', icon: 'lucideTrendingDown' }
];

const pillars = [
  { id: 'local', n: '01', icon: 'lucideGlobe' },
  { id: 'delivery', n: '02', icon: 'lucideTarget' },
  { id: 'security', n: '03', icon: 'lucideShieldCheck' },
  { id: 'programmes', n: '04', icon: 'lucideCloud' }
];

const regions = [{ id: 'egypt' }, { id: 'ksa' }, { id: 'uae' }, { id: 'pakistan' }];
const faqs = ['tier', 'residency', 'map', 'timeline', 'pricing', 'arabic'];

module.exports = {
  DEFAULTS,
  journey,
  pillars,
  regions,
  faqs,
  data: {
    motes: seedMotes(14, 20260824),
    regionDots: seedRegion(),
    journey,
    pillars,
    regions,
    faqs,
    heroProofs: [
      { id: 'tier', icon: 'lucideAward' },
      { id: 'years', icon: 'lucideClock' },
      { id: 'support', icon: 'lucideLifeBuoy' },
      { id: 'markets', icon: 'lucideGlobe' }
    ],
    practices: ['cloud', 'security', 'email', 'managed'],
    markets: ['egypt', 'ksa', 'uae', 'other'],
    topics: ['migration', 'security', 'cost', 'ops', 'data', 'other'],
    deliverySteps: [
      { id: 'discover', n: '01', x: 96 },
      { id: 'scope', n: '02', x: 224 },
      { id: 'deliver', n: '03', x: 352 },
      { id: 'validate', n: '04', x: 480 }
    ],
    securityLayers: [
      { id: 'identity', x: 62 },
      { id: 'network', x: 171 },
      { id: 'detection', x: 280 },
      { id: 'backup', x: 389 },
      { id: 'compliance', x: 498 }
    ],
    programmeStops: [
      { id: 'assess', n: '01', x: 12 },
      { id: 'mobilise', n: '02', x: 152 },
      { id: 'migrate', n: '03', x: 292 },
      { id: 'optimise', n: '04', x: 432 }
    ],
    programmeLinks: [
      { from: 124, to: 152 },
      { from: 264, to: 292 },
      { from: 404, to: 432 }
    ],
    accountStages: [
      { id: 'design', icon: 'lucideDraftingCompass' },
      { id: 'deliver', icon: 'lucideRocket' },
      { id: 'operate', icon: 'lucideActivity' }
    ],
    pillarSignals: {
      local: ['lucideClock', 'lucideMapPin', 'lucideLifeBuoy'],
      delivery: ['lucideFileText', 'lucideCoins', 'lucideCircleCheckBig'],
      security: ['lucideKeyRound', 'lucideActivity', 'lucideDatabaseBackup'],
      programmes: ['lucideClipboardList', 'lucideRocket', 'lucideBadgeCheck']
    },
    supportStats: [
      { id: 'clock', icon: 'lucideClock' },
      { id: 'team', icon: 'lucideHeadset' },
      { id: 'lang', icon: 'lucideGlobe' }
    ],
    supportChannels: [
      { id: 'whatsapp', icon: 'lucideMessageCircle', href: 'https://wa.me/201096274996', external: true },
      { id: 'phone', icon: 'lucidePhone', href: 'tel:+20227469708', external: false },
      { id: 'email', icon: 'lucideMail', href: 'mailto:info@roaya.co', external: false },
      { id: 'linkedin', icon: 'lucideLinkedin', href: 'https://www.linkedin.com/company/19047659', external: true },
      { id: 'facebook', icon: 'lucideFacebook', href: 'https://www.facebook.com/RoayaIT', external: true }
    ],
    awsLogoPath: '/assets/images/aws/aws-mark.png',
    awsLogoReversedPath: '/assets/images/aws/aws-mark-reversed.png',
    roayaLogoPath: '/assets/images/aws/roaya-mark-ink.png',
    roayaLogoReversedPath: '/assets/images/aws/roaya-mark-reversed.png'
  }
};
