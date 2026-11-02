import 'dotenv/config';
import { getStore } from '../lib/store/index.ts';
// Since Node ESM with TS requires transpilation...
console.log('Env configured?', process.env.FIREBASE_PROJECT_ID);