// Demo dataset — the backbone entities the portal runs on. All of this is
// user-editable at runtime and persisted to localStorage by the DataProvider.

export const USERS = [
  { id: "u_admin", name: "Rizkyanda Putra", role: "admin", email: "studio@labodega.id" },
  { id: "u_team1", name: "Sasha Wirano", role: "team", email: "sasha@labodega.id" },
  { id: "u_team2", name: "Dimas Ardhi", role: "team", email: "dimas@labodega.id" },
  { id: "u_client1", name: "Maya Chen", role: "client", email: "maya@panasonic.co.id", clientId: "c_panasonic" },
];

export const CLIENTS = [
  { id: "c_panasonic", name: "Panasonic Indonesia", industry: "Consumer Electronics", since: "2025-09-01", status: "Active", contact: "Maya Chen" },
  { id: "c_maktour", name: "Maktour", industry: "Travel", since: "2025-11-15", status: "Active", contact: "Farid Alhabsyi" },
  { id: "c_superpadel", name: "SuperPadel", industry: "Sports / App", since: "2026-02-01", status: "Active", contact: "Gilang Pratama" },
];

export const PROJECTS = [
  {
    id: "p_pana_social", clientId: "c_panasonic", name: "Always-On Social 2026",
    status: "Active", start: "2026-01-05", end: "2026-12-20",
    phases: ["Foundation", "Ramp", "Peak Season", "Wrap"],
    pillars: ["Product Education", "Lifestyle", "Community", "Promo"],
    segments: ["Young Families", "First-Jobbers", "Home Upgraders"],
  },
  {
    id: "p_mak_umrah", clientId: "c_maktour", name: "Umrah Season Campaign",
    status: "Active", start: "2026-03-01", end: "2026-09-30",
    phases: ["Awareness", "Consideration", "Booking Push"],
    pillars: ["Testimony", "Guides", "Offers"],
    segments: ["Families", "First-Timers", "Repeat Pilgrims"],
  },
  {
    id: "p_sp_launch", clientId: "c_superpadel", name: "App Launch & Community",
    status: "Planning", start: "2026-07-15", end: "2026-12-15",
    phases: ["Pre-Launch", "Launch", "Community"],
    pillars: ["Athletes", "Courts", "App Features"],
    segments: ["Padel Players", "Gym Crossovers"],
  },
];

export const CAMPAIGNS = [
  { id: "cmp_pana_q3", projectId: "p_pana_social", name: "Q3 Cooling Season", goal: "Reach + engagement on AC line", start: "2026-07-01", end: "2026-09-30" },
  { id: "cmp_mak_early", projectId: "p_mak_umrah", name: "Early-Bird Booking", goal: "Lead gen for Nov departures", start: "2026-06-15", end: "2026-08-15" },
  { id: "cmp_sp_tease", projectId: "p_sp_launch", name: "Launch Teaser", goal: "Waitlist signups", start: "2026-07-20", end: "2026-08-20" },
];

export const CONTENT = [
  { id: "ct_01", projectId: "p_pana_social", campaignId: "cmp_pana_q3", title: "AC myth-busting reel", platform: "Instagram", status: "Client Review", ownerId: "u_team1", hook: "You're using your AC wrong", brief: "3 myths, 3 fixes, product tie-in at the end.", cta: "Save this for the dry season", deadline: "2026-07-04", publishDate: "2026-07-08" },
  { id: "ct_02", projectId: "p_pana_social", campaignId: "cmp_pana_q3", title: "Fridge organization ASMR", platform: "TikTok", status: "Draft", ownerId: "u_team2", hook: "Restock with me — NR-BX421 edition", brief: "ASMR restock, feature callouts as captions.", cta: "Which shelf is your chaos shelf?", deadline: "2026-07-06", publishDate: "" },
  { id: "ct_03", projectId: "p_pana_social", campaignId: "cmp_pana_q3", title: "Community Q&A carousel", platform: "Instagram", status: "Approved", ownerId: "u_team1", hook: "You asked, our engineers answered", brief: "Top 5 DM questions, answered plainly.", cta: "Drop your question for round 2", deadline: "2026-06-28", publishDate: "2026-07-05" },
  { id: "ct_04", projectId: "p_pana_social", campaignId: "cmp_pana_q3", title: "Dealer visit vlog", platform: "YouTube", status: "Idea", ownerId: "", hook: "", brief: "", cta: "", deadline: "", publishDate: "" },
  { id: "ct_05", projectId: "p_pana_social", campaignId: "cmp_pana_q3", title: "Air purifier launch teaser", platform: "Instagram", status: "Scheduled", ownerId: "u_team2", hook: "Breathe like it's the mountains", brief: "15s teaser, product silhouette reveal.", cta: "Launching 12 July", deadline: "2026-07-01", publishDate: "2026-07-12" },
  { id: "ct_06", projectId: "p_pana_social", campaignId: "cmp_pana_q3", title: "June recap + wins", platform: "LinkedIn", status: "Posted", ownerId: "u_team1", hook: "What compounding looks like", brief: "Monthly recap for the corporate audience.", cta: "Follow for the Q3 story", deadline: "2026-06-30", publishDate: "2026-06-30" },
  { id: "ct_07", projectId: "p_mak_umrah", campaignId: "cmp_mak_early", title: "Jamaah testimony mini-doc", platform: "Instagram", status: "Internal Review", ownerId: "u_team2", hook: "Ibu Ratna's first Umrah at 61", brief: "90s cut of the Jeddah interview footage.", cta: "Ask about November departures", deadline: "2026-07-05", publishDate: "" },
  { id: "ct_08", projectId: "p_mak_umrah", campaignId: "cmp_mak_early", title: "Packing checklist carousel", platform: "Instagram", status: "Revision Requested", ownerId: "u_team1", hook: "The 12 things jamaah forget", brief: "Checklist carousel, save-driven.", cta: "Save + share with your travel group", deadline: "2026-07-03", publishDate: "" },
  { id: "ct_09", projectId: "p_mak_umrah", campaignId: "cmp_mak_early", title: "Early-bird offer explainer", platform: "TikTok", status: "Client Review", ownerId: "u_team2", hook: "Book in July, fly in November", brief: "Offer mechanics in 30s, urgency framing.", cta: "Link in bio for the early-bird list", deadline: "2026-07-02", publishDate: "2026-07-10" },
  { id: "ct_10", projectId: "p_sp_launch", campaignId: "cmp_sp_tease", title: "Court-finder feature tease", platform: "TikTok", status: "Briefing", ownerId: "u_team1", hook: "Never text 'ada court kosong?' again", brief: "", cta: "", deadline: "2026-07-18", publishDate: "" },
];

export const APPROVALS = [
  { id: "ap_01", contentId: "ct_01", requestedAt: "2026-06-29T09:00:00Z", note: "Round 1 — please check the product claim on slide 2.", decision: "", decidedAt: "" },
  { id: "ap_02", contentId: "ct_09", requestedAt: "2026-06-30T13:30:00Z", note: "Offer copy locked with sales — visual review only.", decision: "", decidedAt: "" },
  { id: "ap_03", contentId: "ct_03", requestedAt: "2026-06-25T08:00:00Z", note: "", decision: "approved", decidedAt: "2026-06-27T10:12:00Z" },
];

export const INVOICES = [
  { id: "inv_2026_014", clientId: "c_panasonic", number: "INV/2026/014", issued: "2026-06-01", due: "2026-06-15", amount: 85000000, currency: "IDR", status: "Paid", memo: "Retainer — June" },
  { id: "inv_2026_019", clientId: "c_panasonic", number: "INV/2026/019", issued: "2026-07-01", due: "2026-07-15", amount: 85000000, currency: "IDR", status: "Sent", memo: "Retainer — July" },
  { id: "inv_2026_017", clientId: "c_maktour", number: "INV/2026/017", issued: "2026-06-20", due: "2026-07-04", amount: 62500000, currency: "IDR", status: "Overdue", memo: "Campaign sprint 1 of 2" },
  { id: "inv_2026_020", clientId: "c_superpadel", number: "INV/2026/020", issued: "2026-07-01", due: "2026-07-20", amount: 40000000, currency: "IDR", status: "Draft", memo: "Launch scoping" },
];

// Monthly reach/engagement series for the Reports page (per client).
export const REPORT_SERIES = {
  c_panasonic: [
    { m: "Jan", reach: 310, eng: 4.1 }, { m: "Feb", reach: 342, eng: 4.4 },
    { m: "Mar", reach: 401, eng: 4.9 }, { m: "Apr", reach: 458, eng: 5.6 },
    { m: "May", reach: 540, eng: 6.2 }, { m: "Jun", reach: 622, eng: 6.9 },
  ],
  c_maktour: [
    { m: "Jan", reach: 180, eng: 3.2 }, { m: "Feb", reach: 220, eng: 3.6 },
    { m: "Mar", reach: 305, eng: 4.2 }, { m: "Apr", reach: 420, eng: 4.8 },
    { m: "May", reach: 495, eng: 5.4 }, { m: "Jun", reach: 610, eng: 6.1 },
  ],
  c_superpadel: [
    { m: "Jan", reach: 0, eng: 0 }, { m: "Feb", reach: 0, eng: 0 },
    { m: "Mar", reach: 42, eng: 2.4 }, { m: "Apr", reach: 88, eng: 3.8 },
    { m: "May", reach: 130, eng: 4.6 }, { m: "Jun", reach: 176, eng: 5.2 },
  ],
};

export const SEED = { users: USERS, clients: CLIENTS, projects: PROJECTS, campaigns: CAMPAIGNS, content: CONTENT, approvals: APPROVALS, invoices: INVOICES, audit: [] };
