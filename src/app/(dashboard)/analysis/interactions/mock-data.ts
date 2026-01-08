import type { InteractionData, InteractionDetail } from '@/components/interactions';

export const mockInteractions: InteractionData[] = [
  {
    id: '1',
    source: 'web',
    title: 'Checkout step 3 drop-off increased after banner update',
    subtitle: 'Session ID: #WK-9923',
    storeSite: 'Global (Web)',
    timestamp: '2 mins ago',
    confidence: 0.92,
    confidenceLevel: 'high',
    tags: ['checkout', 'promo'],
  },
  {
    id: '2',
    source: 'cctv',
    title: 'Queue length exceeded threshold at Store NY-04',
    subtitle: 'Cam-04 · Zone B',
    storeSite: 'Store NY-04',
    timestamp: '15 mins ago',
    confidence: 0.88,
    confidenceLevel: 'high',
    tags: ['queues', 'occupancy'],
  },
  {
    id: '3',
    source: 'social',
    title: "Negative sentiment spike mentioning 'late delivery'",
    subtitle: 'Twitter · 45 mentions',
    storeSite: 'West Region',
    timestamp: '1 hr ago',
    confidence: 0.76,
    confidenceLevel: 'medium',
    tags: ['delivery', 'sentiment'],
  },
  {
    id: '4',
    source: 'web',
    title: 'Unusual traffic pattern on /sale page',
    subtitle: 'Bot traffic suspected',
    storeSite: 'Global (Web)',
    timestamp: '2 hrs ago',
    confidence: 0.65,
    confidenceLevel: 'low',
    tags: ['security', 'traffic'],
  },
  {
    id: '5',
    source: 'cctv',
    title: 'Loitering detected near entrance B',
    subtitle: 'Cam-02 · Security Alert',
    storeSite: 'Store LA-02',
    timestamp: '3 hrs ago',
    confidence: 0.95,
    confidenceLevel: 'high',
    tags: ['security', 'safety'],
  },
  {
    id: '6',
    source: 'social',
    title: 'Viral mention of #CrowStore in positive context',
    subtitle: 'Instagram · 2.4k Likes',
    storeSite: 'Global',
    timestamp: '4 hrs ago',
    confidence: 0.81,
    confidenceLevel: 'high',
    tags: ['brand', 'viral'],
  },
];

export const mockInteractionDetails: Record<string, Partial<InteractionDetail>> = {
  '1': {
    description: 'After the promotional banner was updated on the checkout page, we detected a significant increase in drop-offs at step 3 of the checkout flow. The new banner appears to be distracting users from completing their purchase.',
    evidence: [
      { id: 'e1', type: 'screenshot', title: 'Checkout Step 3 Screenshot', timestamp: '2 mins ago' },
      { id: 'e2', type: 'log', title: 'Session Recording #WK-9923', timestamp: '2 mins ago' },
    ],
    sourceData: [
      { label: 'Session Duration', value: '4m 32s' },
      { label: 'Page Views', value: '7' },
      { label: 'Cart Value', value: '$142.50' },
      { label: 'Device', value: 'Mobile (iOS)' },
    ],
    metrics: [
      { label: 'Drop-off Rate', value: '34%', change: '+12%', changeType: 'negative' },
      { label: 'Avg. Time on Page', value: '45s', change: '-8s', changeType: 'neutral' },
    ],
  },
  '2': {
    description: 'Queue length at Store NY-04 has exceeded the configured threshold of 15 customers. Current queue length is 23 customers with an estimated wait time of 18 minutes.',
    evidence: [
      { id: 'e1', type: 'video', title: 'Live Feed - Cam-04', timestamp: 'Live' },
      { id: 'e2', type: 'log', title: 'Queue Analytics Log', timestamp: '15 mins ago' },
    ],
    sourceData: [
      { label: 'Current Queue', value: '23 customers' },
      { label: 'Threshold', value: '15 customers' },
      { label: 'Est. Wait Time', value: '18 mins' },
      { label: 'Open Registers', value: '3 of 6' },
    ],
    metrics: [
      { label: 'Queue Length', value: '23', change: '+8', changeType: 'negative' },
      { label: 'Service Rate', value: '2.1/min', change: '-0.4', changeType: 'negative' },
    ],
  },
  '3': {
    description: 'Twitter mentions containing "late delivery" have spiked significantly in the West Region. Sentiment analysis shows predominantly negative tone with customers expressing frustration about delivery delays.',
    evidence: [
      { id: 'e1', type: 'document', title: 'Tweet Collection Report', timestamp: '1 hr ago' },
      { id: 'e2', type: 'log', title: 'Sentiment Analysis Log', timestamp: '1 hr ago' },
    ],
    sourceData: [
      { label: 'Total Mentions', value: '45' },
      { label: 'Negative Sentiment', value: '78%' },
      { label: 'Top Hashtags', value: '#latedelivery, #frustrated' },
      { label: 'Avg. Reach', value: '2,340' },
    ],
    metrics: [
      { label: 'Sentiment Score', value: '-0.67', change: '-0.34', changeType: 'negative' },
      { label: 'Mention Volume', value: '45', change: '+312%', changeType: 'negative' },
    ],
  },
  '4': {
    description: 'Unusual traffic patterns detected on the /sale page. Traffic analysis suggests potential bot activity with abnormal request patterns and suspicious user agents.',
    evidence: [
      { id: 'e1', type: 'log', title: 'Traffic Analysis Log', timestamp: '2 hrs ago' },
      { id: 'e2', type: 'document', title: 'Bot Detection Report', timestamp: '2 hrs ago' },
    ],
    sourceData: [
      { label: 'Requests/min', value: '2,340' },
      { label: 'Unique IPs', value: '12' },
      { label: 'Bot Probability', value: '65%' },
      { label: 'Affected Page', value: '/sale' },
    ],
    metrics: [
      { label: 'Traffic Spike', value: '340%', change: '+340%', changeType: 'negative' },
      { label: 'Bot Score', value: '0.65', change: 'New', changeType: 'neutral' },
    ],
  },
  '5': {
    description: 'Security camera detected prolonged loitering near entrance B at Store LA-02. Individual has been present for over 15 minutes without entering the store.',
    evidence: [
      { id: 'e1', type: 'video', title: 'Cam-02 Recording', timestamp: '3 hrs ago' },
      { id: 'e2', type: 'screenshot', title: 'Detection Snapshot', timestamp: '3 hrs ago' },
    ],
    sourceData: [
      { label: 'Duration', value: '17 mins' },
      { label: 'Location', value: 'Entrance B' },
      { label: 'Alert Level', value: 'Medium' },
      { label: 'Staff Notified', value: 'Yes' },
    ],
    metrics: [
      { label: 'Detection Confidence', value: '95%', changeType: 'positive' },
      { label: 'Similar Events (7d)', value: '3', changeType: 'neutral' },
    ],
  },
  '6': {
    description: 'A positive viral mention of #CrowStore has gained significant traction on Instagram. The post highlights excellent customer service and product quality.',
    evidence: [
      { id: 'e1', type: 'screenshot', title: 'Instagram Post', timestamp: '4 hrs ago' },
      { id: 'e2', type: 'document', title: 'Engagement Report', timestamp: '4 hrs ago' },
    ],
    sourceData: [
      { label: 'Likes', value: '2,412' },
      { label: 'Comments', value: '187' },
      { label: 'Shares', value: '342' },
      { label: 'Reach', value: '45,230' },
    ],
    metrics: [
      { label: 'Engagement Rate', value: '6.8%', change: '+4.2%', changeType: 'positive' },
      { label: 'Brand Sentiment', value: '+0.89', change: '+0.12', changeType: 'positive' },
    ],
  },
};
