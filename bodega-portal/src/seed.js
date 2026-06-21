// Bodega demo data — client-side seed (mirrors the real app's mockData shape).
// Dates are relative to "today" so the calendar / reports always look current.

const today = new Date();
const iso = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const isot = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d.toISOString(); };

export const USERS = [
  { id: "u1", name: "Aero Aswar", email: "aero@bodega.studio", role: "admin", avatarInitials: "AA" },
  { id: "u2", name: "Rizky Ananda", email: "rizky@bodega.studio", role: "team", clientIds: ["c1", "c2"], avatarInitials: "RA" },
  { id: "u3", name: "Maya Putri", email: "maya@maktour.id", role: "client", clientIds: ["c1"], avatarInitials: "MP" },
];

export const CLIENTS = [
  {
    id: "c1", name: "Maktour", industry: "Other", description: "Hajj & Umrah travel operator.",
    market: "Indonesia · Muslim families", positioning: "Trusted, modern pilgrimage journeys.",
    brandPersonality: ["Warm", "Trustworthy", "Spiritual"], competitors: ["NRA", "Cheria", "Alhijaz"],
    toneOfVoice: "Reassuring, respectful, aspirational.", stakeholders: ["Head of Marketing", "Founder"],
    projectIds: ["p1", "p4"],
  },
  {
    id: "c2", name: "Kopi Nusa", industry: "F&B / Lifestyle", description: "Specialty archipelago coffee brand.",
    market: "Indonesia · urban Gen-Z", positioning: "Single-origin coffee with a story.",
    brandPersonality: ["Bold", "Crafted", "Local"], competitors: ["Fore", "Tuku", "Kopi Kenangan"],
    toneOfVoice: "Playful, confident, warm.", stakeholders: ["Brand Lead"], projectIds: ["p2"],
  },
  {
    id: "c3", name: "Arus Marine", industry: "Marine Mobility / CleanTech", description: "Electric water-mobility startup.",
    market: "Coastal Indonesia · operators", positioning: "Clean, quiet, capable on water.",
    brandPersonality: ["Innovative", "Calm", "Capable"], competitors: ["Legacy diesel"],
    toneOfVoice: "Clear, technical, optimistic.", stakeholders: ["CEO", "Ops"], projectIds: ["p3"],
  },
];

const phasesFor = (pid) => [
  { id: `${pid}-ph1`, projectId: pid, name: "Foundation", order: 1, objective: "Establish voice, pillars, and baseline cadence." },
  { id: `${pid}-ph2`, projectId: pid, name: "Growth", order: 2, objective: "Scale reach with research-led formats." },
  { id: `${pid}-ph3`, projectId: pid, name: "Authority", order: 3, objective: "Convert attention into trust and action." },
];
const pillarsFor = (pid, names) => names.map((n, i) => ({
  id: `${pid}-pil${i + 1}`, projectId: pid, name: n.name, description: n.d, weight: n.w,
}));
const audFor = (pid, segs) => segs.map((s, i) => ({ id: `${pid}-as${i + 1}`, projectId: pid, name: s.n, description: s.d }));

export const PHASES = [...phasesFor("p1"), ...phasesFor("p2"), ...phasesFor("p3"), ...phasesFor("p4")];

export const PILLARS = [
  ...pillarsFor("p1", [
    { name: "Education", d: "Guides, requirements, what-to-expect.", w: 35 },
    { name: "Inspiration", d: "Real journeys & emotional moments.", w: 30 },
    { name: "Trust", d: "Reviews, certifications, transparency.", w: 20 },
    { name: "Promotion", d: "Packages, dates, early-bird offers.", w: 15 },
  ]),
  ...pillarsFor("p2", [
    { name: "Craft", d: "Origins, roasting, brewing.", w: 40 },
    { name: "Culture", d: "Cafés, people, music.", w: 35 },
    { name: "Promotion", d: "Drops, bundles, loyalty.", w: 25 },
  ]),
  ...pillarsFor("p3", [
    { name: "Education", d: "How electric marine works.", w: 40 },
    { name: "Proof", d: "Range, savings, case studies.", w: 35 },
    { name: "Vision", d: "Cleaner coasts narrative.", w: 25 },
  ]),
  ...pillarsFor("p4", [
    { name: "Urgency", d: "Deadlines, seats left, early-bird.", w: 40 },
    { name: "Reassurance", d: "Guidance, what's included.", w: 35 },
    { name: "Emotion", d: "The pull of the journey.", w: 25 },
  ]),
];

export const AUDIENCE_SEGMENTS = [
  ...audFor("p1", [{ n: "First-time pilgrims", d: "Families planning their first Umrah." }, { n: "Repeat travelers", d: "Returning, premium-package buyers." }]),
  ...audFor("p2", [{ n: "Coffee explorers", d: "Gen-Z discovering single-origin." }]),
  ...audFor("p3", [{ n: "Fleet operators", d: "Tour & transport operators." }]),
  ...audFor("p4", [{ n: "Ramadan planners", d: "Families targeting March departures." }]),
];

export const PROJECTS = [
  {
    id: "p1", clientId: "c1", name: "Maktour Social Growth", industry: "Other",
    goalBusiness: "Grow qualified package inquiries via social.",
    goalMarketing: "Build a consistent, research-led editorial system.",
    goalCampaign: "+200% profile visits in 6 months.",
    platforms: ["Instagram", "TikTok", "Newsletter"], cadence: "5×/week",
    startDate: iso(-160), endDate: iso(40), budget: "Retainer",
    successMetrics: ["Reach", "Engagement", "Profile visits", "Inquiries"],
    painPoints: ["Inconsistent posting", "No content pillars"],
    audienceSegmentIds: ["p1-as1", "p1-as2"], phaseIds: ["p1-ph1", "p1-ph2", "p1-ph3"],
    pillarIds: ["p1-pil1", "p1-pil2", "p1-pil3", "p1-pil4"], health: 86, status: "Active",
  },
  {
    id: "p2", clientId: "c2", name: "Kopi Nusa Launch", industry: "F&B / Lifestyle",
    goalBusiness: "Drive launch-week sales.", goalMarketing: "Establish a craveable brand voice.",
    goalCampaign: "Sell out the first roast batch.",
    platforms: ["Instagram", "TikTok"], cadence: "4×/week",
    startDate: iso(-60), endDate: iso(60), budget: "Project",
    successMetrics: ["Reach", "Saves", "Sales"], painPoints: ["New brand, no audience"],
    audienceSegmentIds: ["p2-as1"], phaseIds: ["p2-ph1", "p2-ph2", "p2-ph3"],
    pillarIds: ["p2-pil1", "p2-pil2", "p2-pil3"], health: 71, status: "Active",
  },
  {
    id: "p3", clientId: "c3", name: "Arus Marine Awareness", industry: "Marine Mobility / CleanTech",
    goalBusiness: "Build a pipeline of operator leads.", goalMarketing: "Explain the category clearly.",
    goalCampaign: "100 qualified demo requests.",
    platforms: ["LinkedIn", "YouTube", "Web"], cadence: "3×/week",
    startDate: iso(-30), endDate: iso(120), budget: "Retainer",
    successMetrics: ["Reach", "Leads"], painPoints: ["New category education"],
    audienceSegmentIds: ["p3-as1"], phaseIds: ["p3-ph1", "p3-ph2", "p3-ph3"],
    pillarIds: ["p3-pil1", "p3-pil2", "p3-pil3"], health: 64, status: "Planning",
  },
  {
    id: "p4", clientId: "c1", name: "Maktour Ramadan Push", industry: "Other",
    goalBusiness: "Capture Ramadan & early-bird Umrah demand.",
    goalMarketing: "A focused 8-week content sprint.",
    goalCampaign: "Fill the March departures.",
    platforms: ["Instagram", "TikTok"], cadence: "6×/week",
    startDate: iso(-20), endDate: iso(40), budget: "Project",
    successMetrics: ["Reach", "Leads", "Bookings"], painPoints: ["Tight timeline"],
    audienceSegmentIds: ["p4-as1"], phaseIds: ["p4-ph1", "p4-ph2", "p4-ph3"],
    pillarIds: ["p4-pil1", "p4-pil2", "p4-pil3"], health: 78, status: "Active",
  },
];

export const CAMPAIGNS = [
  { id: "cam1", projectId: "p1", name: "Ramadan Readiness", objective: "Capture early-bird Umrah demand.", startDate: iso(-30), endDate: iso(30), phaseId: "p1-ph2", pillarIds: ["p1-pil1", "p1-pil4"], status: "Active" },
  { id: "cam2", projectId: "p1", name: "Real Journeys", objective: "Emotional proof series.", startDate: iso(-10), endDate: iso(50), phaseId: "p1-ph3", pillarIds: ["p1-pil2", "p1-pil3"], status: "Active" },
  { id: "cam3", projectId: "p2", name: "First Roast", objective: "Launch week.", startDate: iso(-7), endDate: iso(14), phaseId: "p2-ph1", status: "Active" },
  { id: "cam4", projectId: "p4", name: "Ramadan Sprint", objective: "Fill March departures.", startDate: iso(-20), endDate: iso(40), phaseId: "p4-ph2", pillarIds: ["p4-pil1"], status: "Active" },
];

const perf = (reach, eng, clicks, saves) => ({ reach, engagement: eng, clicks, saves, completionRate: 40 + Math.round(eng) });

// Content items — rich for Maktour (p1) so the board / calendar / approvals feel alive.
export const CONTENT_ITEMS = [
  // Posted (past) with performance
  ci("ci1", "p1", "5 things first-time pilgrims forget", "Most people miss #3.", "Instagram", "Carousel", "Posted", "p1-ph2", "p1-pil1", "u2", -18, perf(184000, 7.2, 2100, 5400), "cam1"),
  ci("ci2", "p1", "A father's first Umrah", "He cried at the door.", "TikTok", "Reel", "Posted", "p1-ph3", "p1-pil2", "u2", -12, perf(412000, 11.4, 3800, 9100), "cam2"),
  ci("ci3", "p1", "How our packages are priced", "No hidden fees, ever.", "Instagram", "Carousel", "Posted", "p1-ph2", "p1-pil3", "u2", -7, perf(96000, 5.1, 1400, 2200), "cam1"),
  ci("ci4", "p1", "Umrah checklist (save this)", "Save before you pack.", "Instagram", "Single", "Posted", "p1-ph1", "p1-pil1", "u2", -3, perf(132000, 8.6, 900, 7700), "cam1"),
  // Scheduled (upcoming)
  ci("ci5", "p1", "Best months to go", "Timing changes everything.", "Instagram", "Reel", "Scheduled", "p1-ph2", "p1-pil1", "u2", 2, null, "cam1"),
  ci("ci6", "p1", "Behind the scenes: our team in Madinah", "Meet the people who guide you.", "TikTok", "Reel", "Scheduled", "p1-ph3", "p1-pil3", "u1", 5, null, "cam2"),
  ci("ci7", "p1", "Ramadan early-bird is open", "Lock your seat today.", "Instagram", "Carousel", "Scheduled", "p1-ph2", "p1-pil4", "u2", 9, null, "cam1"),
  // Approved (awaiting schedule)
  ci("ci8", "p1", "What's included in every package", "Everything, explained.", "Newsletter", "Email", "Approved", "p1-ph2", "p1-pil1", "u2", 7, null, "cam1"),
  // Client Review (in the approval queue)
  ciReview("ci9", "p1", "Testimonial: the Rahman family", "“It was effortless.”", "Instagram", "Reel", "p1-ph3", "p1-pil3", "u2", 6, "u1", "Please review the on-screen captions.", -1),
  ciReview("ci10", "p1", "Umrah vs Hajj — the difference", "A 60-second explainer.", "TikTok", "Reel", "p1-ph1", "p1-pil1", "u2", 8, "u1", "Confirm the facts in slide 2.", 1),
  ciReview("ci11", "p1", "Our certifications, explained", "Why it matters who you book with.", "Instagram", "Carousel", "p1-ph2", "p1-pil3", "u2", 11, "u2", "Approve tone for compliance.", 2),
  // Revision Requested
  ci("ci12", "p1", "Packing reel v1", "Pack smart, travel light.", "TikTok", "Reel", "Revision Requested", "p1-ph1", "p1-pil1", "u2", 12, null, "cam1"),
  // Internal Review
  ci("ci13", "p1", "FAQ: visas & documents", "The 6 questions we get most.", "Instagram", "Carousel", "Internal Review", "p1-ph2", "p1-pil1", "u2", 10, null, "cam1"),
  // Draft
  ci("ci14", "p1", "A day in Makkah", "Sunrise to last prayer.", "TikTok", "Reel", "Draft", "p1-ph3", "p1-pil2", "u1", 13, null, "cam2"),
  ci("ci15", "p1", "Why families choose Maktour", "Trust, built over years.", "Instagram", "Single", "Draft", "p1-ph2", "p1-pil3", "u2", 16, null, "cam2"),
  // Idea / Briefing
  ci("ci16", "p1", "Live Q&A teaser", "Ask us anything about Umrah.", "Instagram", "Story", "Idea", "p1-ph3", "p1-pil2", "u1", 20, null),
  ci("ci17", "p1", "Newsletter: monthly journeys digest", "The stories from this month.", "Newsletter", "Email", "Briefing", "p1-ph3", "p1-pil2", "u2", 22, null),

  // Other clients (lighter)
  ci("ci20", "p2", "Single-origin, explained", "Taste the map.", "Instagram", "Carousel", "Posted", "p2-ph1", "p2-pil1", "u2", -5, perf(54000, 9.3, 600, 4100), "cam3"),
  ciReview("ci21", "p2", "First Roast drop is live", "Limited batch — go.", "TikTok", "Reel", "p2-ph1", "p2-pil3", "u2", 3, "u1", "Check the discount code.", 1),
  ci("ci22", "p2", "Café culture series ep.1", "Where the city slows down.", "Instagram", "Reel", "Scheduled", "p2-ph2", "p2-pil2", "u2", 6, null, "cam3"),
  ci("ci30", "p3", "How electric water-mobility works", "Quiet, clean, capable.", "LinkedIn", "Carousel", "Internal Review", "p3-ph1", "p3-pil1", "u2", 9, null),
  ci("ci31", "p3", "Range & savings, by the numbers", "The math operators ask for.", "LinkedIn", "Single", "Draft", "p3-ph2", "p3-pil2", "u2", 12, null),

  // Maktour Ramadan Push (p4)
  ci("ci40", "p4", "Seats left for March", "Don't wait for the last 10.", "Instagram", "Reel", "Posted", "p4-ph2", "p4-pil1", "u2", -8, perf(78000, 9.1, 1200, 3100), "cam4"),
  ci("ci41", "p4", "What's included in Ramadan packages", "Everything, line by line.", "Instagram", "Carousel", "Scheduled", "p4-ph2", "p4-pil2", "u2", 4, null, "cam4"),
  ciReview("ci42", "p4", "A mother's Ramadan dua", "She waited 12 years.", "TikTok", "Reel", "p4-ph3", "p4-pil3", "u2", 6, "u1", "Confirm the on-screen text.", 1),
  ci("ci43", "p4", "Early-bird ends Friday", "Last call for the best price.", "Instagram", "Story", "Draft", "p4-ph1", "p4-pil1", "u1", 9, null, "cam4"),
];

function ci(id, projectId, title, hook, platform, format, status, phaseId, pillarId, ownerId, pubOffset, performance, campaignId) {
  return {
    id, projectId, campaignId, title, hook,
    brief: `${title} — built for ${platform}.`,
    cta: "Learn more", platform, format, status, phaseId, pillarId,
    ownerId, deadline: iso(pubOffset - 3), publishDate: iso(pubOffset),
    performance: performance || undefined,
  };
}
function ciReview(id, projectId, title, hook, platform, format, phaseId, pillarId, ownerId, pubOffset, requestedBy, message, dueOffset) {
  return {
    id, projectId, title, hook, brief: `${title} — built for ${platform}.`, cta: "Learn more",
    platform, format, status: "Client Review", phaseId, pillarId, ownerId,
    deadline: iso(pubOffset - 3), publishDate: iso(pubOffset),
    clientReviewDue: iso(dueOffset), clientReviewMessage: message,
    clientReviewRequestedAt: isot(-1), clientReviewRequestedBy: requestedBy,
  };
}

export const APPROVALS = [
  { id: "ap1", contentItemId: "ci1", actorId: "u3", action: "approved", note: "Love this.", timestamp: isot(-20) },
  { id: "ap2", contentItemId: "ci2", actorId: "u3", action: "approved", timestamp: isot(-14) },
  { id: "ap3", contentItemId: "ci3", actorId: "u3", action: "approved", note: "Clear and honest.", timestamp: isot(-9) },
  { id: "ap4", contentItemId: "ci12", actorId: "u3", action: "revision_requested", note: "Trim the intro, it's slow.", timestamp: isot(-2) },
  { id: "ap5", contentItemId: "ci8", actorId: "u3", action: "approved", timestamp: isot(-1) },
];

export const COMMENTS = [
  { id: "cm1", contentItemId: "ci9", authorId: "u2", body: "Captions updated per brand guide.", timestamp: isot(-1) },
  { id: "cm2", contentItemId: "ci12", authorId: "u1", body: "Agreed — recutting the open.", timestamp: isot(-1) },
];

export const ASSETS = [
  { id: "asset1", projectId: "p1", contentItemId: "ci2", name: "madinah-bts.mp4", type: "video", size: "84 MB", uploadedBy: "u2", uploadedAt: isot(-13), source: "demo" },
  { id: "asset2", projectId: "p1", contentItemId: "ci1", name: "checklist.png", type: "image", size: "2.1 MB", uploadedBy: "u2", uploadedAt: isot(-19), source: "demo" },
  { id: "asset3", projectId: "p1", name: "brand-guide.pdf", type: "doc", size: "5.4 MB", uploadedBy: "u1", uploadedAt: isot(-40), source: "demo" },
];

export const ASSET_REQUESTS = [
  { id: "ar1", projectId: "p1", contentItemId: "ci6", title: "Madinah team footage", description: "Raw clips of the on-ground team.", type: "video", requestedBy: "u2", requestedAt: isot(-3), dueDate: iso(3), status: "In Progress" },
  { id: "ar2", projectId: "p1", title: "Updated package price list", type: "doc", requestedBy: "u2", requestedAt: isot(-2), dueDate: iso(4), status: "Requested" },
];

export const REMINDER_LOGS = [
  { id: "rl1", kind: "approval", targetId: "ci9", message: "Gentle nudge: 1 item awaiting your review.", sentBy: "u1", sentAt: isot(-1) },
];

// Report snapshots — planned vs posted + approval turnaround over time.
const snaps = (pid, rows) => rows.map((r, i) => ({ id: `${pid}-snap${i + 1}`, projectId: pid, label: r.l, date: iso(r.o), planned: r.pl, posted: r.po, approvalAvgHours: r.h }));
export const REPORT_SNAPSHOTS = [
  ...snaps("p1", [
    { l: "Month 1", o: -150, pl: 20, po: 16, h: 34 }, { l: "Month 2", o: -120, pl: 22, po: 20, h: 26 },
    { l: "Month 3", o: -90, pl: 24, po: 23, h: 20 }, { l: "Month 4", o: -60, pl: 24, po: 24, h: 16 },
    { l: "Month 5", o: -30, pl: 26, po: 25, h: 13 }, { l: "Month 6", o: 0, pl: 28, po: 26, h: 11 },
  ]),
  ...snaps("p2", [{ l: "Wk 1", o: -28, pl: 8, po: 6, h: 30 }, { l: "Wk 2", o: -14, pl: 10, po: 9, h: 22 }, { l: "Wk 3", o: 0, pl: 12, po: 10, h: 18 }]),
  ...snaps("p3", [{ l: "Wk 1", o: -14, pl: 6, po: 3, h: 40 }, { l: "Wk 2", o: 0, pl: 8, po: 5, h: 32 }]),
  ...snaps("p4", [{ l: "Wk 1", o: -14, pl: 8, po: 6, h: 20 }, { l: "Wk 2", o: -7, pl: 10, po: 9, h: 16 }, { l: "Wk 3", o: 0, pl: 12, po: 10, h: 12 }]),
];

export const INDUSTRY_TEMPLATES = [
  {
    industry: "Other",
    segments: [{ name: "Core audience", description: "Primary buyers." }],
    phases: [{ name: "Foundation", objective: "Voice & cadence." }, { name: "Growth", objective: "Scale reach." }, { name: "Authority", objective: "Convert trust." }],
    pillars: [{ name: "Education", description: "Teach.", weight: 40 }, { name: "Inspiration", description: "Move.", weight: 35 }, { name: "Promotion", description: "Sell.", weight: 25 }],
  },
];
