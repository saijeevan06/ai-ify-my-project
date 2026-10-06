import type { CollegeSeed } from './types.ts';
import { collegeKey } from './ids.ts';

/**
 * SAMPLE leaderboard baseline for demos (SEED_LEADERBOARD=true). Names are illustrative.
 * Replace with real partner colleges — or turn seeding off — before launch.
 */
const RAW: [name: string, city: string, builders: number][] = [
  ['Northfield Institute of Technology', 'Hyderabad', 127],
  ['Lakeview College of Engineering', 'Bengaluru', 104],
  ['Riverside Engineering College', 'Pune', 87],
  ['Eastgate Institute of Technology', 'Chennai', 84],
  ['Meridian College of Engineering', 'Pune', 61],
  ['Hilltop Institute of Science & Technology', 'Vizag', 48],
  ['Westbrook College of Engineering', 'Coimbatore', 36],
  ['Southpoint Institute of Technology', 'Vijayawada', 22],
];

export const COLLEGE_SEEDS: CollegeSeed[] = RAW.map(([name, city, builders]) => ({ key: collegeKey(name), name, city, builders }));
