// Vercel — US careers on Greenhouse (slug: vercel, ~74 active jobs probed 2026-06-03).
import { createAdapter } from "./greenhouse.js";

const adapter = createAdapter({ slug: "vercel", label: "Vercel" });

export const supportedScopes = ["social", "all"] as const;
export const searchPositions = adapter.searchPositions;
export const fetchAllPositions = adapter.fetchAllPositions;
export const fetchPositionDetail = adapter.fetchPositionDetail;
export const fetchDictionaries = adapter.fetchDictionaries;
export const listNotices = adapter.listNotices;
export const getNotice = adapter.getNotice;
export const findNoticesByQuestion = adapter.findNoticesByQuestion;
export const matchResume = adapter.matchResume;
export const checkResume = adapter.checkResume;
export const fetchApplicationSchema = adapter.fetchApplicationSchema;
