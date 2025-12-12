// Minerals Index - Export all mineral articles
export { natrium } from './natrium';
export { calcium } from './calcium';
export { magnesium } from './magnesium';
export { nitrat } from './nitrat';
export { ph } from './ph';
export { hydrogencarbonat } from './hydrogencarbonat';
export { sulfat } from './sulfat';
export { chlorid } from './chlorid';
export { kalium } from './kalium';
export { fluorid } from './fluorid';
export { tds } from './tds';

import { natrium } from './natrium';
import { calcium } from './calcium';
import { magnesium } from './magnesium';
import { nitrat } from './nitrat';
import { ph } from './ph';
import { hydrogencarbonat } from './hydrogencarbonat';
import { sulfat } from './sulfat';
import { chlorid } from './chlorid';
import { kalium } from './kalium';
import { fluorid } from './fluorid';
import { tds } from './tds';
import { MineralArticle } from '../types';

// All minerals as a record (for lookup by ID)
export const MINERAL_ARTICLES: Record<string, MineralArticle> = {
    natrium,
    calcium,
    magnesium,
    nitrat,
    ph,
    hydrogencarbonat,
    sulfat,
    chlorid,
    kalium,
    fluorid,
    tds,
};

// All minerals as a list (for iteration)
export const MINERALS_LIST: MineralArticle[] = Object.values(MINERAL_ARTICLES);
