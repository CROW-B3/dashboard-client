import type { PatternData, PatternDetail } from '@/components/patterns';

export const mockPatterns: PatternData[] = [
  {
    id: 'p1',
    title: 'Checkout Drop-off Spike (Step 3)',
    severity: 'high',
    affectedStores: '12 (Global Web)',
    lastSeen: '14 min ago',
    confidence: 'high',
    source: 'web',
  },
  {
    id: 'p2',
    title: 'Queue Wait Time > 15m (Peak Hours)',
    severity: 'high',
    affectedStores: 'NY-04, LA-01',
    lastSeen: '2 min ago',
    confidence: 'high',
    source: 'cctv',
  },
  {
    id: 'p3',
    title: 'Promo Banner Causing Low Conversion',
    severity: 'medium',
    affectedStores: 'Global Web',
    lastSeen: '45 min ago',
    confidence: 'medium',
    source: 'web',
  },
  {
    id: 'p4',
    title: 'Inventory Discrepancy Signals',
    severity: 'medium',
    affectedStores: '3 Locations',
    lastSeen: '3 hrs ago',
    confidence: 'low',
    source: 'cctv',
  },
  {
    id: 'p5',
    title: 'Negative Social Sentiment — Delivery',
    severity: 'medium',
    affectedStores: 'Social (Twitter/X)',
    lastSeen: '1 hr ago',
    confidence: 'high',
    source: 'social',
  },
  {
    id: 'p6',
    title: 'CCTV Footfall Surge Without POS Lift',
    severity: 'high',
    affectedStores: 'CH-02',
    lastSeen: '10 min ago',
    confidence: 'medium',
    source: 'cctv',
  },
  {
    id: 'p7',
    title: 'Search-to-cart friction increase',
    severity: 'low',
    affectedStores: 'Mobile Web',
    lastSeen: '5 hrs ago',
    confidence: 'medium',
    source: 'web',
  },
  {
    id: 'p8',
    title: 'Repeat returns anomaly — SKU cluster',
    severity: 'low',
    affectedStores: 'Global',
    lastSeen: '1 day ago',
    confidence: 'high',
    source: 'web',
  },
];

export const mockPatternDetails: Record<string, Partial<PatternDetail>> = {
  p1: {
    description: 'A significant increase in checkout abandonment has been detected at step 3 of the checkout flow across multiple web properties. This pattern correlates with recent promotional banner updates and appears to be affecting conversion rates globally.',
    recommendations: [
      'Review recent banner changes on checkout pages',
      'A/B test alternative banner placements',
      'Monitor session recordings for user behavior patterns',
      'Consider reducing visual distractions during checkout',
    ],
    relatedInteractions: [
      { id: 'i1', title: 'Checkout step 3 drop-off increased after banner update', timestamp: '2 mins ago', source: 'web' },
      { id: 'i2', title: 'Session abandonment spike detected', timestamp: '15 mins ago', source: 'web' },
    ],
    timeline: [
      { id: 't1', title: 'Pattern first detected', timestamp: '2 hours ago', type: 'detection' },
      { id: 't2', title: 'Severity upgraded to High', timestamp: '1 hour ago', type: 'update' },
      { id: 't3', title: 'Alert sent to UX team', timestamp: '45 mins ago', type: 'action' },
    ],
    metrics: [
      { label: 'Drop-off Rate', value: '34%', change: '+12%', changeType: 'negative' },
      { label: 'Affected Sessions', value: '2,340', change: '+890', changeType: 'negative' },
      { label: 'Est. Revenue Impact', value: '$45K', changeType: 'negative' },
      { label: 'Pattern Frequency', value: '12/hr', change: '+8', changeType: 'negative' },
    ],
  },
  p2: {
    description: 'Queue wait times are exceeding the 15-minute threshold during peak hours at stores NY-04 and LA-01. CCTV analysis shows consistent bottlenecks at checkout counters with insufficient staff allocation.',
    recommendations: [
      'Increase staff at checkout during peak hours (12pm-2pm, 5pm-7pm)',
      'Consider opening additional checkout lanes',
      'Implement queue management system alerts',
      'Review staffing schedules for optimization',
    ],
    relatedInteractions: [
      { id: 'i3', title: 'Queue length exceeded threshold at Store NY-04', timestamp: '15 mins ago', source: 'cctv' },
      { id: 'i4', title: 'Customer wait time alert at LA-01', timestamp: '25 mins ago', source: 'cctv' },
    ],
    metrics: [
      { label: 'Avg Wait Time', value: '18m', change: '+7m', changeType: 'negative' },
      { label: 'Peak Queue Length', value: '23', change: '+8', changeType: 'negative' },
      { label: 'Customer Satisfaction', value: '-12%', changeType: 'negative' },
      { label: 'Staff Utilization', value: '95%', changeType: 'neutral' },
    ],
  },
  p3: {
    description: 'The current promotional banner on the homepage is correlating with lower than expected conversion rates. Users are engaging with the banner but not completing purchases, suggesting a potential disconnect between promotion messaging and product availability.',
    recommendations: [
      'Review banner call-to-action messaging',
      'Verify promoted products are in stock',
      'Test different banner designs and placements',
      'Analyze user journey after banner click',
    ],
    metrics: [
      { label: 'Banner CTR', value: '4.2%', change: '+1.8%', changeType: 'positive' },
      { label: 'Post-Click Conversion', value: '0.8%', change: '-2.1%', changeType: 'negative' },
      { label: 'Bounce Rate', value: '67%', change: '+23%', changeType: 'negative' },
      { label: 'Time on Page', value: '12s', change: '-18s', changeType: 'negative' },
    ],
  },
  p4: {
    description: 'Discrepancies detected between CCTV-observed inventory movements and POS system records at 3 store locations. This may indicate potential shrinkage, system sync issues, or process compliance gaps.',
    recommendations: [
      'Conduct inventory audit at affected locations',
      'Review surveillance footage for anomalies',
      'Check POS system sync status',
      'Verify staff training on inventory procedures',
    ],
    metrics: [
      { label: 'Discrepancy Value', value: '$12.4K', changeType: 'negative' },
      { label: 'Affected SKUs', value: '47', change: '+12', changeType: 'negative' },
      { label: 'Locations', value: '3', changeType: 'neutral' },
      { label: 'Trend', value: 'Increasing', changeType: 'negative' },
    ],
  },
  p5: {
    description: 'Social media monitoring has detected a spike in negative sentiment specifically around delivery experiences. Multiple mentions of late deliveries, missed time windows, and poor communication are trending on Twitter/X.',
    recommendations: [
      'Review delivery partner performance metrics',
      'Improve delivery status communication',
      'Consider proactive outreach to affected customers',
      'Prepare social media response strategy',
    ],
    relatedInteractions: [
      { id: 'i5', title: 'Negative sentiment spike mentioning late delivery', timestamp: '1 hr ago', source: 'social' },
      { id: 'i6', title: 'Twitter trending topic detected', timestamp: '2 hrs ago', source: 'social' },
    ],
    metrics: [
      { label: 'Negative Mentions', value: '234', change: '+180%', changeType: 'negative' },
      { label: 'Sentiment Score', value: '-0.67', change: '-0.34', changeType: 'negative' },
      { label: 'Reach', value: '125K', change: '+89K', changeType: 'negative' },
      { label: 'Response Rate', value: '23%', changeType: 'neutral' },
    ],
  },
  p6: {
    description: 'CCTV footfall analysis shows a significant increase in store visitors at CH-02, but this is not reflecting in POS transactions. This mismatch could indicate browsing-only behavior, operational issues, or potential loss prevention concerns.',
    recommendations: [
      'Review store layout and product placement',
      'Check for POS system issues',
      'Analyze customer journey through store',
      'Increase floor staff for customer assistance',
    ],
    metrics: [
      { label: 'Footfall', value: '+45%', changeType: 'positive' },
      { label: 'POS Transactions', value: '+3%', changeType: 'neutral' },
      { label: 'Conversion Gap', value: '42%', changeType: 'negative' },
      { label: 'Avg Dwell Time', value: '8m', change: '+3m', changeType: 'positive' },
    ],
  },
  p7: {
    description: 'Mobile web users are experiencing increased friction when moving from search results to cart. Drop-off rates at this stage have increased, particularly on iOS devices.',
    recommendations: [
      'Review mobile search-to-cart flow',
      'Test add-to-cart button visibility on mobile',
      'Check for mobile-specific rendering issues',
      'Analyze iOS vs Android user behavior',
    ],
    metrics: [
      { label: 'Search-to-Cart Rate', value: '12%', change: '-4%', changeType: 'negative' },
      { label: 'Mobile Bounce Rate', value: '58%', change: '+8%', changeType: 'negative' },
      { label: 'iOS Affected', value: '78%', changeType: 'neutral' },
      { label: 'Load Time', value: '3.2s', change: '+0.8s', changeType: 'negative' },
    ],
  },
  p8: {
    description: 'A cluster of SKUs is showing abnormally high return rates compared to category averages. Pattern analysis suggests potential product quality issues or misleading product descriptions.',
    recommendations: [
      'Review product descriptions for accuracy',
      'Analyze return reason codes for affected SKUs',
      'Check product quality reports',
      'Consider customer feedback survey',
    ],
    metrics: [
      { label: 'Return Rate', value: '23%', change: '+15%', changeType: 'negative' },
      { label: 'Affected SKUs', value: '12', changeType: 'neutral' },
      { label: 'Return Value', value: '$34K', changeType: 'negative' },
      { label: 'Customer Complaints', value: '47', change: '+32', changeType: 'negative' },
    ],
  },
};
