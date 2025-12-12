// Profiles Index - Export all profile articles
export { baby } from './baby';
export { sport } from './sport';
export { blood_pressure } from './blood_pressure';
export { coffee } from './coffee';
export { kidney } from './kidney';
export { pregnancy } from './pregnancy';
export { seniors } from './seniors';
export { diabetes } from './diabetes';

import { baby } from './baby';
import { sport } from './sport';
import { blood_pressure } from './blood_pressure';
import { coffee } from './coffee';
import { kidney } from './kidney';
import { pregnancy } from './pregnancy';
import { seniors } from './seniors';
import { diabetes } from './diabetes';
import { ProfileArticle } from '../types';

// All profiles as a record (for lookup by ID)
export const PROFILE_ARTICLES: Record<string, ProfileArticle> = {
    baby,
    sport,
    blood_pressure,
    coffee,
    kidney,
    pregnancy,
    seniors,
    diabetes,
};

// All profiles as a list (for iteration)
export const PROFILES_LIST: ProfileArticle[] = Object.values(PROFILE_ARTICLES);

