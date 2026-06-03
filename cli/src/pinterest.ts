// Pinterest — US careers on Greenhouse (slug: pinterest, ~178 active jobs probed 2026-06-03).
import { createAdapter } from "./greenhouse.js";

const adapter = createAdapter({ slug: "pinterest", label: "Pinterest" });

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
