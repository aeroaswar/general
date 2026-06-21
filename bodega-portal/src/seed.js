// Bodega demo data — client-side seed (mirrors the real app's mockData shape).
// Clients & metrics mirror the real Bodega roster shown on the marketing site
// (Maktour, Panasonic, Astra Daihatsu, Kopikalyan, Super Padel, Insan Hutama,
// KEMENDAGRI). Dates are relative to "today" so calendar / reports stay current.

const today = new Date();
const iso = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const isot = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d.toISOString(); };

export const USERS = [
  { id: "u1", name: "Aero Aswar", email: "aero@bodega.studio", role: "admin", avatarInitials: "AA" },
  { id: "u2", name: "Rizky Ananda", email: "rizky@bodega.studio", role: "team", clientIds: ["c1", "c2", "c4", "c5", "c6"], avatarInitials: "RA" },
  { id: "u3", name: "Maya Putri", email: "maya@maktour.id", role: "client", clientIds: ["c1"], avatarInitials: "MP" },
];

export const CLIENTS = [
  {
    id: "c1", name: "Maktour", industry: "Travel & Hospitality", description: "Hajj & Umrah travel operator · maktour.id",
    market: "Indonesia · Muslim families", positioning: "Trusted, modern pilgrimage journeys.",
    brandPersonality: ["Warm", "Trustworthy", "Spiritual"], competitors: ["NRA", "Cheria", "Alhijaz"],
    toneOfVoice: "Reassuring, respectful, aspirational.", stakeholders: ["Head of Marketing", "Founder"],
    projectIds: ["p1", "p4"],
  },
  {
    id: "c2", name: "Panasonic Indonesia", industry: "Electronics", description: "Multinational electronics brand.",
    market: "Indonesia · households & pro buyers", positioning: "Reliable technology for everyday life.",
    brandPersonality: ["Trusted", "Innovative", "Human"], competitors: ["Samsung", "LG", "Sharp"],
    toneOfVoice: "Helpful, modern, dependable.", stakeholders: ["Brand Manager", "Digital Lead"],
    projectIds: ["p2"],
  },
  {
    id: "c3", name: "Astra Daihatsu", industry: "Automotive", description: "Automotive dealership network.",
    market: "Indonesia · family car buyers", positioning: "Dependable cars, accessible ownership.",
    brandPersonality: ["Practical", "Friendly", "Trusted"], competitors: ["Toyota", "Honda", "Suzuki"],
    toneOfVoice: "Approachable, confident, clear.", stakeholders: ["Marketing Lead", "Sales Ops"],
    projectIds: ["p3"],
  },
  {
    id: "c4", name: "Kopikalyan", industry: "F&B / Specialty Coffee", description: "Specialty coffee · Jakarta / Surabaya / Tokyo.",
    market: "Urban Gen-Z & coffee lovers", positioning: "Specialty coffee with a story.",
    brandPersonality: ["Crafted", "Warm", "Cultured"], competitors: ["Fore", "Tuku", "Kopi Kenangan"],
    toneOfVoice: "Playful, confident, warm.", stakeholders: ["Founder", "Brand Lead"],
    projectIds: ["p5"],
  },
  {
    id: "c5", name: "Super Padel", industry: "Sports / App", description: "Padel scoring app & community.",
    market: "Padel players & clubs", positioning: "The home court for padel scores.",
    brandPersonality: ["Energetic", "Social", "Competitive"], competitors: ["Playtomic", "Manual scoring"],
    toneOfVoice: "Hyped, sporty, inclusive.", stakeholders: ["Product Lead", "Community"],
    projectIds: ["p6"],
  },
  {
    id: "c6", name: "Insan Hutama", industry: "Human Capital", description: "Hutama Karya · employer brand & human capital.",
    market: "Engineers, graduates & talent", positioning: "Building the nation, building people.",
    brandPersonality: ["Proud", "Grounded", "Aspirational"], competitors: ["WIKA", "Adhi Karya"],
    toneOfVoice: "Sincere, motivating, professional.", stakeholders: ["HC Comms", "Corporate Comms"],
    projectIds: ["p7"],
  },
  {
    id: "c7", name: "KEMENDAGRI", industry: "Government & Public", description: "Ministry of Home Affairs · public communication.",
    market: "Indonesian public", positioning: "Clear, trusted public-service communication.",
    brandPersonality: ["Authoritative", "Clear", "Inclusive"], competitors: ["—"],
    toneOfVoice: "Formal, clear, accessible.", stakeholders: ["Public Relations Bureau", "Content Team"],
    projectIds: ["p8"],
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

export const PHASES = [
  ...phasesFor("p1"), ...phasesFor("p2"), ...phasesFor("p3"), ...phasesFor("p4"),
  ...phasesFor("p5"), ...phasesFor("p6"), ...phasesFor("p7"), ...phasesFor("p8"),
];

export const PILLARS = [
  ...pillarsFor("p1", [
    { name: "Education", d: "Guides, requirements, what-to-expect.", w: 35 },
    { name: "Inspiration", d: "Real journeys & emotional moments.", w: 30 },
    { name: "Trust", d: "Reviews, certifications, transparency.", w: 20 },
    { name: "Promotion", d: "Packages, dates, early-bird offers.", w: 15 },
  ]),
  ...pillarsFor("p2", [
    { name: "Education", d: "Product how-tos, tips & care.", w: 35 },
    { name: "Community", d: "UGC, fans, events.", w: 35 },
    { name: "Promotion", d: "Launches & seasonal offers.", w: 30 },
  ]),
  ...pillarsFor("p3", [
    { name: "Offers", d: "Promos, financing, trade-in.", w: 45 },
    { name: "Trust", d: "Reviews, service, warranty.", w: 30 },
    { name: "Lifestyle", d: "Family & road stories.", w: 25 },
  ]),
  ...pillarsFor("p4", [
    { name: "Urgency", d: "Deadlines, seats left, early-bird.", w: 40 },
    { name: "Reassurance", d: "Guidance, what's included.", w: 35 },
    { name: "Emotion", d: "The pull of the journey.", w: 25 },
  ]),
  ...pillarsFor("p5", [
    { name: "Craft", d: "Origins, roasting, brewing.", w: 40 },
    { name: "Culture", d: "Cafés, people, music.", w: 35 },
    { name: "Promotion", d: "Drops, bundles, loyalty.", w: 25 },
  ]),
  ...pillarsFor("p6", [
    { name: "Hype", d: "Match clips & big moments.", w: 40 },
    { name: "Education", d: "Rules, tips, scoring.", w: 35 },
    { name: "Community", d: "Clubs, players, events.", w: 25 },
  ]),
  ...pillarsFor("p7", [
    { name: "People", d: "Employee stories & culture.", w: 40 },
    { name: "Purpose", d: "Nation-building projects.", w: 35 },
    { name: "Careers", d: "Hiring & growth paths.", w: 25 },
  ]),
  ...pillarsFor("p8", [
    { name: "Information", d: "Policies & services, explained.", w: 40 },
    { name: "Service", d: "How-to & how-to-access.", w: 35 },
    { name: "Engagement", d: "Public participation.", w: 25 },
  ]),
];

export const AUDIENCE_SEGMENTS = [
  ...audFor("p1", [{ n: "First-time pilgrims", d: "Families planning their first Umrah." }, { n: "Repeat travelers", d: "Returning, premium-package buyers." }]),
  ...audFor("p2", [{ n: "Households", d: "Everyday buyers of home electronics." }, { n: "Pro buyers", d: "Trade & professional specifiers." }]),
  ...audFor("p3", [{ n: "Family car buyers", d: "First-car & family upgraders." }, { n: "Upgraders", d: "Trade-in ready owners." }]),
  ...audFor("p4", [{ n: "Ramadan planners", d: "Families targeting March departures." }]),
  ...audFor("p5", [{ n: "Coffee explorers", d: "Gen-Z discovering single-origin." }]),
  ...audFor("p6", [{ n: "Padel players", d: "Active players tracking scores." }, { n: "Clubs", d: "Venues & community organizers." }]),
  ...audFor("p7", [{ n: "Graduates & engineers", d: "Talent considering Hutama Karya." }]),
  ...audFor("p8", [{ n: "General public", d: "Citizens accessing public services." }]),
];

export const PROJECTS = [
  {
    id: "p1", clientId: "c1", name: "Maktour Social Growth", industry: "Travel & Hospitality",
    goalBusiness: "Grow qualified package inquiries via social.",
    goalMarketing: "Build a consistent, research-led editorial system.",
    goalCampaign: "+228% profile visits over 6 months.",
    platforms: ["Instagram", "TikTok", "Newsletter"], cadence: "5×/week",
    startDate: iso(-160), endDate: iso(40), budget: "Retainer",
    successMetrics: ["Reach", "Engagement", "Profile visits", "Inquiries"],
    painPoints: ["Inconsistent posting", "No content pillars"],
    audienceSegmentIds: ["p1-as1", "p1-as2"], phaseIds: ["p1-ph1", "p1-ph2", "p1-ph3"],
    pillarIds: ["p1-pil1", "p1-pil2", "p1-pil3", "p1-pil4"], health: 86, status: "Active",
  },
  {
    id: "p2", clientId: "c2", name: "Panasonic Community & Activation", industry: "Electronics",
    goalBusiness: "Grow brand community and engagement.",
    goalMarketing: "Research-led content + community development.",
    goalCampaign: "+65.8% reach · +205.6% engagement-rate growth.",
    platforms: ["Instagram", "TikTok"], cadence: "5×/week",
    startDate: iso(-120), endDate: iso(60), budget: "Retainer",
    successMetrics: ["Reach", "Engagement rate", "Community"],
    painPoints: ["Low engagement", "Fragmented content"],
    audienceSegmentIds: ["p2-as1", "p2-as2"], phaseIds: ["p2-ph1", "p2-ph2", "p2-ph3"],
    pillarIds: ["p2-pil1", "p2-pil2", "p2-pil3"], health: 88, status: "Active",
  },
  {
    id: "p3", clientId: "c3", name: "Astra Daihatsu Lead Gen", industry: "Automotive",
    goalBusiness: "Generate qualified sales leads.",
    goalMarketing: "Performance ads tuned by interest & cost-per-result.",
    goalCampaign: "161 leads at Rp 8.5K cost per result.",
    platforms: ["Instagram", "Web"], cadence: "Always-on ads",
    startDate: iso(-45), endDate: iso(75), budget: "Performance",
    successMetrics: ["Leads", "Cost per result", "CTR", "Reach"],
    painPoints: ["High cost per lead", "Untracked funnels"],
    audienceSegmentIds: ["p3-as1", "p3-as2"], phaseIds: ["p3-ph1", "p3-ph2", "p3-ph3"],
    pillarIds: ["p3-pil1", "p3-pil2", "p3-pil3"], health: 80, status: "Active",
  },
  {
    id: "p4", clientId: "c1", name: "Maktour Ramadan Push", industry: "Travel & Hospitality",
    goalBusiness: "Capture Ramadan & early-bird Umrah demand.",
    goalMarketing: "A focused 8-week content sprint.",
    goalCampaign: "Fill the March departures.",
    platforms: ["Instagram", "TikTok"], cadence: "6×/week",
    startDate: iso(-20), endDate: iso(40), budget: "Project",
    successMetrics: ["Reach", "Leads", "Bookings"], painPoints: ["Tight timeline"],
    audienceSegmentIds: ["p4-as1"], phaseIds: ["p4-ph1", "p4-ph2", "p4-ph3"],
    pillarIds: ["p4-pil1", "p4-pil2", "p4-pil3"], health: 78, status: "Active",
  },
  {
    id: "p5", clientId: "c4", name: "Kopikalyan Brand & Content", industry: "F&B / Specialty Coffee",
    goalBusiness: "Build brand love and café footfall.",
    goalMarketing: "Craft-led brand design + communication.",
    goalCampaign: "Launch the flagship archive store.",
    platforms: ["Instagram", "TikTok"], cadence: "4×/week",
    startDate: iso(-80), endDate: iso(80), budget: "Retainer",
    successMetrics: ["Reach", "Saves", "Footfall"], painPoints: ["New flagship awareness"],
    audienceSegmentIds: ["p5-as1"], phaseIds: ["p5-ph1", "p5-ph2", "p5-ph3"],
    pillarIds: ["p5-pil1", "p5-pil2", "p5-pil3"], health: 74, status: "Active",
  },
  {
    id: "p6", clientId: "c5", name: "Super Padel Social Push", industry: "Sports / App",
    goalBusiness: "Grow app installs & community.",
    goalMarketing: "New content pillar + Meta Ads into padel communities.",
    goalCampaign: "579.1K views · +47% profile visits.",
    platforms: ["Instagram", "TikTok"], cadence: "4×/week",
    startDate: iso(-50), endDate: iso(40), budget: "Project",
    successMetrics: ["Views", "Reach", "Interaction", "Visits"], painPoints: ["Niche audience"],
    audienceSegmentIds: ["p6-as1", "p6-as2"], phaseIds: ["p6-ph1", "p6-ph2", "p6-ph3"],
    pillarIds: ["p6-pil1", "p6-pil2", "p6-pil3"], health: 82, status: "Active",
  },
  {
    id: "p7", clientId: "c6", name: "Insan Hutama Employer Brand", industry: "Human Capital",
    goalBusiness: "Strengthen the employer brand.",
    goalMarketing: "Hook-led Reels + daily Stories to build connection.",
    goalCampaign: "611.7K reached · +7.4% followers.",
    platforms: ["Instagram", "TikTok"], cadence: "5×/week",
    startDate: iso(-100), endDate: iso(50), budget: "Retainer",
    successMetrics: ["Reach", "Followers", "Engagement rate", "Visits"],
    painPoints: ["Low awareness as an employer"],
    audienceSegmentIds: ["p7-as1"], phaseIds: ["p7-ph1", "p7-ph2", "p7-ph3"],
    pillarIds: ["p7-pil1", "p7-pil2", "p7-pil3"], health: 79, status: "Active",
  },
  {
    id: "p8", clientId: "c7", name: "KEMENDAGRI Public Comms", industry: "Government & Public",
    goalBusiness: "Improve public-communication reach & clarity.",
    goalMarketing: "Strategy + media partnership + content.",
    goalCampaign: "Consistent, trusted public messaging.",
    platforms: ["Instagram", "YouTube"], cadence: "Daily",
    startDate: iso(-70), endDate: iso(110), budget: "Retainer",
    successMetrics: ["Reach", "Trust", "Shares"], painPoints: ["Complex topics to simplify"],
    audienceSegmentIds: ["p8-as1"], phaseIds: ["p8-ph1", "p8-ph2", "p8-ph3"],
    pillarIds: ["p8-pil1", "p8-pil2", "p8-pil3"], health: 76, status: "Active",
  },
];

export const CAMPAIGNS = [
  { id: "cam1", projectId: "p1", name: "Ramadan Readiness", objective: "Capture early-bird Umrah demand.", startDate: iso(-30), endDate: iso(30), phaseId: "p1-ph2", pillarIds: ["p1-pil1", "p1-pil4"], status: "Active" },
  { id: "cam2", projectId: "p1", name: "Real Journeys", objective: "Emotional proof series.", startDate: iso(-10), endDate: iso(50), phaseId: "p1-ph3", pillarIds: ["p1-pil2", "p1-pil3"], status: "Active" },
  { id: "cam3", projectId: "p5", name: "First Roast", objective: "Flagship archive launch.", startDate: iso(-7), endDate: iso(14), phaseId: "p5-ph1", status: "Active" },
  { id: "cam4", projectId: "p4", name: "Ramadan Sprint", objective: "Fill March departures.", startDate: iso(-20), endDate: iso(40), phaseId: "p4-ph2", pillarIds: ["p4-pil1"], status: "Active" },
  { id: "cam5", projectId: "p2", name: "Community Month", objective: "Activate fans & UGC.", startDate: iso(-25), endDate: iso(20), phaseId: "p2-ph2", pillarIds: ["p2-pil2"], status: "Active" },
  { id: "cam6", projectId: "p6", name: "Open Tournament", objective: "Ride event hype into installs.", startDate: iso(-14), endDate: iso(21), phaseId: "p6-ph2", pillarIds: ["p6-pil1", "p6-pil3"], status: "Active" },
  { id: "cam7", projectId: "p3", name: "Trade-in Drive", objective: "Lower cost-per-lead with offers.", startDate: iso(-20), endDate: iso(25), phaseId: "p3-ph2", pillarIds: ["p3-pil1"], status: "Active" },
];

const perf = (reach, eng, clicks, saves) => ({ reach, engagement: eng, clicks, saves, completionRate: 40 + Math.round(eng) });

// Content items — rich for Maktour (p1) so the board / calendar / approvals feel alive;
// lighter but real-metric'd for the rest of the roster.
export const CONTENT_ITEMS = [
  // ─── Maktour · Social Growth (p1) ───
  ci("ci1", "p1", "5 things first-time pilgrims forget", "Most people miss #3.", "Instagram", "Carousel", "Posted", "p1-ph2", "p1-pil1", "u2", -18, perf(184000, 7.2, 2100, 5400), "cam1"),
  ci("ci2", "p1", "A father's first Umrah", "He cried at the door.", "TikTok", "Reel", "Posted", "p1-ph3", "p1-pil2", "u2", -12, perf(412000, 11.4, 3800, 9100), "cam2"),
  ci("ci3", "p1", "How our packages are priced", "No hidden fees, ever.", "Instagram", "Carousel", "Posted", "p1-ph2", "p1-pil3", "u2", -7, perf(96000, 5.1, 1400, 2200), "cam1"),
  ci("ci4", "p1", "Umrah checklist (save this)", "Save before you pack.", "Instagram", "Single", "Posted", "p1-ph1", "p1-pil1", "u2", -3, perf(132000, 8.6, 900, 7700), "cam1"),
  ci("ci5", "p1", "Best months to go", "Timing changes everything.", "Instagram", "Reel", "Scheduled", "p1-ph2", "p1-pil1", "u2", 2, null, "cam1"),
  ci("ci6", "p1", "Behind the scenes: our team in Madinah", "Meet the people who guide you.", "TikTok", "Reel", "Scheduled", "p1-ph3", "p1-pil3", "u1", 5, null, "cam2"),
  ci("ci7", "p1", "Ramadan early-bird is open", "Lock your seat today.", "Instagram", "Carousel", "Scheduled", "p1-ph2", "p1-pil4", "u2", 9, null, "cam1"),
  ci("ci8", "p1", "What's included in every package", "Everything, explained.", "Newsletter", "Email", "Approved", "p1-ph2", "p1-pil1", "u2", 7, null, "cam1"),
  ciReview("ci9", "p1", "Testimonial: the Rahman family", "“It was effortless.”", "Instagram", "Reel", "p1-ph3", "p1-pil3", "u2", 6, "u1", "Please review the on-screen captions.", -1),
  ciReview("ci10", "p1", "Umrah vs Hajj — the difference", "A 60-second explainer.", "TikTok", "Reel", "p1-ph1", "p1-pil1", "u2", 8, "u1", "Confirm the facts in slide 2.", 1),
  ciReview("ci11", "p1", "Our certifications, explained", "Why it matters who you book with.", "Instagram", "Carousel", "p1-ph2", "p1-pil3", "u2", 11, "u2", "Approve tone for compliance.", 2),
  ci("ci12", "p1", "Packing reel v1", "Pack smart, travel light.", "TikTok", "Reel", "Revision Requested", "p1-ph1", "p1-pil1", "u2", 12, null, "cam1"),
  ci("ci13", "p1", "FAQ: visas & documents", "The 6 questions we get most.", "Instagram", "Carousel", "Internal Review", "p1-ph2", "p1-pil1", "u2", 10, null, "cam1"),
  ci("ci14", "p1", "A day in Makkah", "Sunrise to last prayer.", "TikTok", "Reel", "Draft", "p1-ph3", "p1-pil2", "u1", 13, null, "cam2"),
  ci("ci15", "p1", "Why families choose Maktour", "Trust, built over years.", "Instagram", "Single", "Draft", "p1-ph2", "p1-pil3", "u2", 16, null, "cam2"),
  ci("ci16", "p1", "Live Q&A teaser", "Ask us anything about Umrah.", "Instagram", "Story", "Idea", "p1-ph3", "p1-pil2", "u1", 20, null),
  ci("ci17", "p1", "Newsletter: monthly journeys digest", "The stories from this month.", "Newsletter", "Email", "Briefing", "p1-ph3", "p1-pil2", "u2", 22, null),

  // ─── Panasonic Indonesia · Community & Activation (p2) ───
  ci("ci20", "p2", "Set up your home theatre in 5 steps", "Cinema night, sorted.", "Instagram", "Carousel", "Posted", "p2-ph2", "p2-pil1", "u2", -16, perf(240000, 12.4, 3100, 5400), "cam5"),
  ci("ci21", "p2", "Fan favourites: your Panasonic setups", "You tagged us — we're obsessed.", "Instagram", "Reel", "Posted", "p2-ph2", "p2-pil2", "u2", -6, perf(168000, 9.8, 2100, 4300), "cam5"),
  ciReview("ci22", "p2", "New lineup teaser", "Something quiet is coming.", "TikTok", "Reel", "p2-ph2", "p2-pil3", "u2", 4, "u1", "Confirm the launch date on screen.", 2),
  ci("ci23", "p2", "Care tips for your appliances", "Make them last longer.", "Instagram", "Carousel", "Scheduled", "p2-ph2", "p2-pil1", "u2", 7, null, "cam5"),

  // ─── Astra Daihatsu · Lead Gen (p3) ───
  ci("ci30", "p3", "Trade in your old car this month", "More for your trade-in.", "Instagram", "Single", "Posted", "p3-ph2", "p3-pil1", "u2", -10, perf(62400, 4.2, 493, 0), "cam7"),
  ci("ci31", "p3", "Low down-payment, easy financing", "Drive home this week.", "Web", "Single", "Posted", "p3-ph2", "p3-pil1", "u2", -4, perf(38500, 3.1, 305, 0), "cam7"),
  ci("ci32", "p3", "Why owners trust the service network", "Service you can count on.", "Instagram", "Carousel", "Internal Review", "p3-ph2", "p3-pil2", "u2", 6, null),
  ci("ci33", "p3", "Family road-trip checklist", "Before you hit the road.", "Instagram", "Carousel", "Draft", "p3-ph3", "p3-pil3", "u2", 11, null),

  // ─── Kopikalyan · Brand & Content (p5) ───
  ci("ci40", "p5", "Single-origin, explained", "Taste the map.", "Instagram", "Carousel", "Posted", "p5-ph1", "p5-pil1", "u2", -5, perf(54000, 9.3, 600, 4100), "cam3"),
  ciReview("ci41", "p5", "First Roast drop is live", "Limited batch — go.", "TikTok", "Reel", "p5-ph1", "p5-pil3", "u2", 3, "u1", "Check the discount code.", 1),
  ci("ci42", "p5", "Café culture series ep.1", "Where the city slows down.", "Instagram", "Reel", "Scheduled", "p5-ph2", "p5-pil2", "u2", 6, null, "cam3"),

  // ─── Super Padel · Social Push (p6) ───
  ci("ci50", "p6", "Match point of the week", "You did NOT see that coming.", "TikTok", "Reel", "Posted", "p6-ph2", "p6-pil1", "u2", -9, perf(91500, 25.1, 7200, 12000), "cam6"),
  ci("ci51", "p6", "How padel scoring actually works", "Stop arguing about the score.", "Instagram", "Carousel", "Scheduled", "p6-ph1", "p6-pil2", "u2", 4, null, "cam6"),
  ciReview("ci52", "p6", "Open Tournament recap", "The whole weekend in 30s.", "Instagram", "Reel", "p6-ph2", "p6-pil3", "u2", 6, "u1", "Confirm sponsor logos are correct.", 1),

  // ─── Insan Hutama · Employer Brand (p7) ───
  ci("ci60", "p7", "A day building the Trans-Sumatra toll", "The people behind the road.", "Instagram", "Reel", "Posted", "p7-ph2", "p7-pil1", "u2", -11, perf(611700, 2.5, 7000, 3400)),
  ci("ci61", "p7", "Meet our young engineers", "Five years, five projects.", "Instagram", "Carousel", "Scheduled", "p7-ph2", "p7-pil3", "u2", 5, null),
  ci("ci62", "p7", "Why our people stay", "It's more than a job.", "TikTok", "Reel", "Draft", "p7-ph3", "p7-pil2", "u2", 12, null),

  // ─── KEMENDAGRI · Public Comms (p8) ───
  ci("ci70", "p8", "Your new e-KTP, explained", "Everything in 60 seconds.", "Instagram", "Carousel", "Posted", "p8-ph2", "p8-pil1", "u2", -8, perf(180000, 6.1, 2200, 4800)),
  ci("ci71", "p8", "How to update your domicile data", "Three steps, no queue.", "YouTube", "Single", "Scheduled", "p8-ph2", "p8-pil2", "u2", 6, null),
  ciReview("ci72", "p8", "Public service week highlights", "What changed for you this year.", "Instagram", "Reel", "p8-ph3", "p8-pil3", "u2", 9, "u1", "Confirm the figures in the recap.", 2),

  // ─── Maktour · Ramadan Push (p4) ───
  ci("ci80", "p4", "Seats left for March", "Don't wait for the last 10.", "Instagram", "Reel", "Posted", "p4-ph2", "p4-pil1", "u2", -8, perf(78000, 9.1, 1200, 3100), "cam4"),
  ci("ci81", "p4", "What's included in Ramadan packages", "Everything, line by line.", "Instagram", "Carousel", "Scheduled", "p4-ph2", "p4-pil2", "u2", 4, null, "cam4"),
  ciReview("ci82", "p4", "A mother's Ramadan dua", "She waited 12 years.", "TikTok", "Reel", "p4-ph3", "p4-pil3", "u2", 6, "u1", "Confirm the on-screen text.", 1),
  ci("ci83", "p4", "Early-bird ends Friday", "Last call for the best price.", "Instagram", "Story", "Draft", "p4-ph1", "p4-pil1", "u1", 9, null, "cam4"),
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
  { id: "asset4", projectId: "p6", contentItemId: "ci50", name: "match-point.mp4", type: "video", size: "61 MB", uploadedBy: "u2", uploadedAt: isot(-9), source: "demo" },
  { id: "asset5", projectId: "p2", contentItemId: "ci20", name: "home-theatre.png", type: "image", size: "3.0 MB", uploadedBy: "u2", uploadedAt: isot(-16), source: "demo" },
];

export const ASSET_REQUESTS = [
  { id: "ar1", projectId: "p1", contentItemId: "ci6", title: "Madinah team footage", description: "Raw clips of the on-ground team.", type: "video", requestedBy: "u2", requestedAt: isot(-3), dueDate: iso(3), status: "In Progress" },
  { id: "ar2", projectId: "p1", title: "Updated package price list", type: "doc", requestedBy: "u2", requestedAt: isot(-2), dueDate: iso(4), status: "Requested" },
  { id: "ar3", projectId: "p3", title: "Latest financing offer sheet", type: "doc", requestedBy: "u2", requestedAt: isot(-2), dueDate: iso(5), status: "Requested" },
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
  ...snaps("p2", [
    { l: "Month 1", o: -110, pl: 18, po: 14, h: 30 }, { l: "Month 2", o: -70, pl: 22, po: 20, h: 22 },
    { l: "Month 3", o: -30, pl: 24, po: 23, h: 16 }, { l: "Month 4", o: 0, pl: 26, po: 25, h: 12 },
  ]),
  ...snaps("p3", [{ l: "Wk 1", o: -28, pl: 10, po: 8, h: 26 }, { l: "Wk 2", o: -14, pl: 12, po: 11, h: 20 }, { l: "Wk 3", o: 0, pl: 14, po: 13, h: 15 }]),
  ...snaps("p4", [{ l: "Wk 1", o: -14, pl: 8, po: 6, h: 20 }, { l: "Wk 2", o: -7, pl: 10, po: 9, h: 16 }, { l: "Wk 3", o: 0, pl: 12, po: 10, h: 12 }]),
  ...snaps("p5", [{ l: "Wk 1", o: -21, pl: 8, po: 6, h: 28 }, { l: "Wk 2", o: -7, pl: 10, po: 9, h: 20 }, { l: "Wk 3", o: 0, pl: 12, po: 11, h: 16 }]),
  ...snaps("p6", [{ l: "Wk 1", o: -28, pl: 8, po: 7, h: 22 }, { l: "Wk 2", o: -14, pl: 10, po: 10, h: 16 }, { l: "Wk 3", o: 0, pl: 12, po: 11, h: 12 }]),
  ...snaps("p7", [
    { l: "Month 1", o: -90, pl: 18, po: 15, h: 28 }, { l: "Month 2", o: -45, pl: 22, po: 21, h: 20 }, { l: "Month 3", o: 0, pl: 24, po: 23, h: 14 },
  ]),
  ...snaps("p8", [{ l: "Month 1", o: -60, pl: 24, po: 21, h: 24 }, { l: "Month 2", o: -30, pl: 28, po: 27, h: 18 }, { l: "Month 3", o: 0, pl: 30, po: 29, h: 13 }]),
];

export const INDUSTRY_TEMPLATES = [
  {
    industry: "Other",
    segments: [{ name: "Core audience", description: "Primary buyers." }],
    phases: [{ name: "Foundation", objective: "Voice & cadence." }, { name: "Growth", objective: "Scale reach." }, { name: "Authority", objective: "Convert trust." }],
    pillars: [{ name: "Education", description: "Teach.", weight: 40 }, { name: "Inspiration", description: "Move.", weight: 35 }, { name: "Promotion", description: "Sell.", weight: 25 }],
  },
];
