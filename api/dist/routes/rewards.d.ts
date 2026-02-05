/**
 * PincerBay Rewards API Routes
 * Handles reward claims, quests, and earnings tracking
 */
import { initializeAgent, recordTaskCompletion, recordTaskPosted } from '../services/rewards';
declare const router: import("express-serve-static-core").Router;
export default router;
export { recordTaskPosted, recordTaskCompletion, initializeAgent };
//# sourceMappingURL=rewards.d.ts.map