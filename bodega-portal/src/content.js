// All site copy in one place. Sourced from the Bodega 2026 credentials deck and
// the client-portal architecture spec (Client → Project → Framework → Content →
// Approval → Schedule → Report).

export const brand = {
  name: "bodega",
  full: "Bodega Creative Studio",
  city: "Jakarta",
  tagline: ["We turn brands", "into culture."],
  promise:
    "Bodega is a creative studio building brand-first social ecosystems — strategy, content, and activation, executed daily.",
  belief:
    "Great brands don’t just speak. They shape culture and become new lifestyles.",
};

export const contact = {
  whatsappLabel: "+62 817-024-7666 (Rizkyanda)",
  whatsappHref: "https://wa.me/6281702476666",
  email: "creativestudiolabodega@gmail.com",
  studio: ["Jl. Otista Raya No.80, RT.2/RW.5", "Jakarta Timur 13330"],
  portalHref: "https://bodega.pplx.app",
};

export const industries = [
  "Travel", "Hospitality", "F&B", "Fashion", "Beauty", "Property",
  "Technology", "Education", "Government", "FMCG", "Automotive",
  "Finance", "Lifestyle", "Gaming",
];

// SELECTED WORK — real engagements from the studio deck.
export const work = [
  {
    title: "Maktour",
    sub: "Hajj & Umrah Travel",
    tags: ["Corporate Branding", "Social Media Handling"],
    metric: "+227.7%",
    metricLabel: "profile visits · 6 months",
    icon: "globe",
    featured: true,
    hue: 168,
  },
  {
    title: "SEREUPNA Journey",
    sub: "Roblox Brand World",
    tags: ["In-Game Development", "Gen-Z Activation"],
    metric: "21",
    metricLabel: "playable stages",
    icon: "game",
    hue: 280,
  },
  {
    title: "Kilometer Berdendang",
    sub: "Roblox Playable World",
    tags: ["In-Game Development", "AI Ghost Mechanics"],
    metric: "AI",
    metricLabel: "custom mechanics",
    icon: "play",
    hue: 210,
  },
];

// SERVICES — full-stack creative, one studio.
export const services = [
  {
    n: "01",
    icon: "identity",
    title: "Branding & Identity",
    body:
      "We shape brands to speak clearly, stand out visually, and grow strategically — from naming and logo systems to a full visual language.",
  },
  {
    n: "02",
    icon: "chat",
    title: "Social Media Management & Content",
    body:
      "Your brand doesn’t follow trends — it leads them and shapes conversations. Daily content, built on research and a clear pillar strategy.",
  },
  {
    n: "03",
    icon: "target",
    title: "Marketing Strategy",
    body:
      "Your goals become actionable, precise, and achievable with a strategy engineered by Bodega and tracked against real KPIs.",
  },
  {
    n: "04",
    icon: "megaphone",
    title: "Brand Activation",
    body:
      "Not just another booth or backdrop — fresh concepts that drive hype, conversation, and authentic engagement on the ground.",
  },
  {
    n: "05",
    icon: "window",
    title: "Web & App Development",
    body:
      "You set the direction; Bodega turns it into a seamless digital experience — sites, portals, and product surfaces that convert.",
  },
  {
    n: "06",
    icon: "chartline",
    title: "Digital Marketing",
    body:
      "Bodega sets the KPIs and drives the strategies — paid, organic, and lifecycle — to deliver the results you’re aiming for.",
  },
];

// THE PORTAL — the operating flow clients log into at bodega.pplx.app.
export const portal = [
  { k: "Client", icon: "handshake", body: "Your brand context, positioning, and stakeholders live in one shared workspace." },
  { k: "Project", icon: "folder", body: "Objectives, audience segments, platform mix, and timeline — scoped per engagement." },
  { k: "Framework", icon: "layers", body: "Project-specific phases, pillars, and content mix. Living strategy, not static lists." },
  { k: "Content", icon: "pen", body: "Briefs, hooks, captions, and CTAs move through clear, owned statuses." },
  { k: "Approval", icon: "checkcircle", body: "Review, approve, or request revisions inline. Every decision timestamped." },
  { k: "Schedule", icon: "calendar", body: "Approved content drops into the calendar with publish windows per platform." },
  { k: "Report", icon: "report", body: "Frozen snapshots: planned vs posted, reach, engagement, and turnaround." },
];

export const roles = [
  { icon: "shield", name: "Admin", body: "Manage every client, project, framework, approval, and report across the studio." },
  { icon: "users", name: "Team Member", body: "Run assigned projects — content, schedules, comments, asset requests, reports." },
  { icon: "lock", name: "Client", body: "View projects, approve or request revisions, upload materials, export reports." },
];

// WHY BODEGA — what makes us different.
export const why = [
  { icon: "users", title: "Distributed Team of Specialists", body: "Talent from different cities and backgrounds. Each project gets a custom-built team with exactly the expertise it needs." },
  { icon: "sliders", title: "Services You Can Scale", body: "Every service — content, strategy, production — scales up or down with your brand’s stage, goals, and budget." },
  { icon: "tag", title: "Adjustable Pricing", body: "You pay for what brings value, not unnecessary add-ons. Flexible, transparent, and cost-efficient." },
  { icon: "search", title: "Research First", body: "Every solution starts with audience behavior, market research, and cultural insight — grounded in reality." },
];

// PROCESS — five steps, zero guesswork.
export const process = [
  { n: "01", title: "Real Bonding", body: "We get to know you — listen, ask the right questions, and build real working chemistry." },
  { n: "02", title: "Research & Deep Understanding", body: "We dig into your audience, competitors, data, culture, and context before any ideas." },
  { n: "03", title: "Strategy Development", body: "We craft a strategic path that aligns with your goals." },
  { n: "04", title: "Review & Alignment", body: "We make sure the solution reflects your voice, not just our imagination." },
  { n: "05", title: "Kick Off & Execution", body: "Once we’re aligned, the real work begins." },
];

// PROOF — Maktour, 6-month results (ongoing since July 2025).
export const proof = [
  { value: 2.9, suffix: "M+", label: "Accounts Reached", icon: "globe" },
  { value: 85.4, suffix: "K", label: "Followers (+100%)", icon: "users" },
  { value: 50.8, suffix: "K", label: "Total Engagement", icon: "spark" },
  { value: 227.7, prefix: "+", suffix: "%", label: "Profile Visits", icon: "chartline" },
];

// Studio team (initials chips).
export const team = [
  { name: "Reno", role: "CEO" },
  { name: "Rizky", role: "COO" },
  { name: "Tya", role: "Account Lead" },
  { name: "Sashil", role: "Social Analyst" },
  { name: "Barry", role: "Social Specialist" },
  { name: "Omar", role: "Account Exec" },
  { name: "Shaft", role: "Graphic Designer" },
  { name: "Adit", role: "Motion & 3D" },
];
