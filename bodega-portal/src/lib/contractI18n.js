// Bilingual contract support (English / Bahasa Indonesia). Translates the
// contract's structural labels + the standard boilerplate clauses. Editable
// content (scope, deliverables, fee, custom clauses) is authored by the studio.
import { format, parseISO, isValid } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const LANGS = [
  { code: "en", label: "EN", name: "English" },
  { code: "id", label: "ID", name: "Bahasa Indonesia" },
];

export const T = {
  en: {
    pageTitle: "Contract",
    agreementWord: "agreement",
    agreement: "Agreement",
    between: "Between", and: "and",
    preparedBy: "Prepared by", clientLabel: "Client",
    effectiveDate: "Effective date", termLabel: "Term", renewsUntil: "Renews until",
    feeLabel: "Fee", paymentTerms: "Payment terms", cadenceLabel: "Cadence",
    months: "months",
    scope: "Scope", deliverables: "Deliverables",
    statementOfWork: "Statement of work",
    channels: "Channels", goalsKpis: "Goals & KPIs",
    business: "Business", marketing: "Marketing", campaign: "Campaign",
    phases: "Engagement phases", pillars: "Content pillars", audience: "Audience segments",
    termsConditions: "Terms & conditions", signatures: "Signatures",
    forClient: "For the Client", forBodega: "For Bodega",
    signHere: "Sign here", awaiting: "Awaiting signature", signedElectronically: "Signed electronically",
    confidential: "Confidential",
    none: "—", noPhases: "No phases yet — add one.", noPillars: "No pillars yet — add one.", noSegments: "No segments yet — add one.",
    add: "Add",
    // toolbar / states
    sendToClient: "Send to client", edit: "Edit", print: "Print", deleteContract: "Delete contract",
    createContract: "Create contract", noContractTitle: "No contract yet",
    noContractAdmin: (c) => `Draft the engagement agreement for ${c}.`,
    noContractClient: "Your studio will share an agreement here to review and sign.",
    clientHint: "Please review this agreement and sign at the bottom. Reach out to your studio contact with any questions before signing.",
    deleteConfirm: "Delete this contract?",
    // status
    status: { Draft: "Draft", Sent: "Sent", Signed: "Signed" },
    // sign modal
    signAsClient: "Sign as Client", signAsBodega: "Sign as Bodega",
    fullName: "Full name", title: "Title", type: "Type", draw: "Draw", clear: "Clear",
    typeSignature: "Type your signature", yourSignature: "Your signature", drawHint: "Draw your signature here",
    consent: "I have read and agree to the terms of this agreement, and consent to signing electronically.",
    signAgreement: "Sign agreement", cancel: "Cancel", resetSignature: "Reset signature",
    affixMeterai: "Affix e-Meterai", removeMeterai: "Remove e-Meterai", meteraiModalTitle: "Affix e-Meterai",
    meteraiUploadHint: "Upload the official e-Meterai you obtained from PERURI or an authorized distributor (PNG/JPG), then record its serial number.",
    chooseImage: "Choose e-Meterai image", meteraiSerial: "Serial number (Nomor Seri)", meteraiSeriShort: "Serial", affix: "Affix",
    meteraiNote: "A legally valid e-Meterai must be issued by PERURI / an authorized distributor. This attaches its image to the document for the record.",
  },
  id: {
    pageTitle: "Kontrak",
    agreementWord: "perjanjian",
    agreement: "Perjanjian",
    between: "Antara", and: "dan",
    preparedBy: "Disiapkan oleh", clientLabel: "Klien",
    effectiveDate: "Tanggal berlaku", termLabel: "Jangka waktu", renewsUntil: "Berlaku hingga",
    feeLabel: "Biaya", paymentTerms: "Ketentuan pembayaran", cadenceLabel: "Frekuensi",
    months: "bulan",
    scope: "Ruang lingkup", deliverables: "Hasil pekerjaan",
    statementOfWork: "Rincian pekerjaan",
    channels: "Kanal", goalsKpis: "Tujuan & KPI",
    business: "Bisnis", marketing: "Pemasaran", campaign: "Kampanye",
    phases: "Tahapan kerja sama", pillars: "Pilar konten", audience: "Segmen audiens",
    termsConditions: "Syarat & ketentuan", signatures: "Tanda tangan",
    forClient: "Untuk Klien", forBodega: "Untuk Bodega",
    signHere: "Tanda tangani di sini", awaiting: "Menunggu tanda tangan", signedElectronically: "Ditandatangani secara elektronik",
    confidential: "Rahasia",
    none: "—", noPhases: "Belum ada tahapan — tambahkan satu.", noPillars: "Belum ada pilar — tambahkan satu.", noSegments: "Belum ada segmen — tambahkan satu.",
    add: "Tambah",
    sendToClient: "Kirim ke klien", edit: "Ubah", print: "Cetak", deleteContract: "Hapus kontrak",
    createContract: "Buat kontrak", noContractTitle: "Belum ada kontrak",
    noContractAdmin: (c) => `Susun perjanjian kerja sama untuk ${c}.`,
    noContractClient: "Studio Anda akan membagikan perjanjian di sini untuk Anda tinjau dan tandatangani.",
    clientHint: "Mohon tinjau perjanjian ini dan tandatangani di bagian bawah. Hubungi kontak studio Anda jika ada pertanyaan sebelum menandatangani.",
    deleteConfirm: "Hapus kontrak ini?",
    status: { Draft: "Draf", Sent: "Terkirim", Signed: "Ditandatangani" },
    signAsClient: "Tanda tangan sebagai Klien", signAsBodega: "Tanda tangan sebagai Bodega",
    fullName: "Nama lengkap", title: "Jabatan", type: "Ketik", draw: "Gambar", clear: "Hapus",
    typeSignature: "Ketik tanda tangan Anda", yourSignature: "Tanda tangan Anda", drawHint: "Gambar tanda tangan Anda di sini",
    consent: "Saya telah membaca dan menyetujui ketentuan perjanjian ini, serta setuju untuk menandatangani secara elektronik.",
    signAgreement: "Tandatangani perjanjian", cancel: "Batal", resetSignature: "Atur ulang tanda tangan",
    affixMeterai: "Tempel e-Meterai", removeMeterai: "Hapus e-Meterai", meteraiModalTitle: "Tempel e-Meterai",
    meteraiUploadHint: "Unggah e-Meterai resmi yang Anda peroleh dari PERURI atau distributor resmi (PNG/JPG), lalu catat nomor serinya.",
    chooseImage: "Pilih gambar e-Meterai", meteraiSerial: "Nomor Seri Meterai", meteraiSeriShort: "No. Seri", affix: "Tempel",
    meteraiNote: "e-Meterai yang sah secara hukum harus diterbitkan oleh PERURI / distributor resmi. Fitur ini melampirkan gambarnya ke dokumen untuk pencatatan.",
  },
};

// Indonesian legal-format labels & boilerplate
T.id.nomor = "Nomor";
T.id.pasal = "PASAL";
T.id.pihakPertama = "PIHAK PERTAMA";
T.id.pihakKedua = "PIHAK KEDUA";
T.id.penutupHeading = "PENUTUP";
T.id.meterai = "Meterai";
T.id.appendix = "Lampiran — Rincian Pekerjaan";

export const tr = (lang) => T[lang === "id" ? "id" : "en"];

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

// Indonesian day name, e.g. "Senin"
export function hariName(iso) {
  if (!iso) return "";
  const dt = typeof iso === "string" ? parseISO(iso) : iso;
  return isValid(dt) ? format(dt, "EEEE", { locale: idLocale }) : "";
}

// A default Indonesian contract number, e.g. "001/BCS/VI/2026"
export function defaultContractNumber(iso) {
  const dt = iso ? parseISO(iso) : new Date();
  const ok = isValid(dt);
  const m = ok ? dt.getMonth() : new Date().getMonth();
  const y = ok ? dt.getFullYear() : new Date().getFullYear();
  return `001/BCS/${ROMAN[m]}/${y}`;
}

// Opening line: "Pada hari ini, Senin, tanggal 12 Januari 2026, yang bertanda tangan di bawah ini:"
export const openingID = (hari, tgl) => `Pada hari ini, ${hari}, tanggal ${tgl}, yang bertanda tangan di bawah ini:`;

// One party identification sentence
export function partySentenceID({ name, address, rep, role, label }) {
  let s = name;
  if (address) s += `, beralamat di ${address}`;
  if (rep) s += `, dalam hal ini diwakili oleh ${rep}${role ? ` selaku ${role}` : ""} dan oleh karenanya sah bertindak untuk dan atas nama ${name}`;
  s += `, untuk selanjutnya disebut sebagai ${label}.`;
  return s;
}

export const preambleID = "PIHAK PERTAMA dan PIHAK KEDUA secara bersama-sama disebut “Para Pihak” dan masing-masing disebut “Pihak”. Para Pihak terlebih dahulu menerangkan dan dengan ini sepakat untuk mengadakan Perjanjian Kerja Sama dengan syarat dan ketentuan sebagaimana diatur dalam pasal-pasal berikut:";

export const penutupID = "Demikian Perjanjian ini dibuat dan ditandatangani oleh Para Pihak dalam keadaan sadar, sehat jasmani dan rohani, serta tanpa adanya paksaan dari pihak manapun. Perjanjian ini dibuat dalam rangkap 2 (dua), masing-masing bermaterai cukup dan mempunyai kekuatan hukum yang sama.";

// Recital ("This Agreement is entered into …")
export function recital(lang, { title, date, studio, client }) {
  if (lang === "id") {
    return `${title} ini (“Perjanjian”) dibuat pada tanggal ${date} antara ${studio} (“Bodega”) dan ${client} (“Klien”), yang selanjutnya bersama-sama disebut “Para Pihak.”`;
  }
  return `This ${title} (the “Agreement”) is entered into on ${date} between ${studio} (“Bodega”) and ${client} (the “Client”), together the “Parties.”`;
}

// Statement-of-work intro line
export function sowIntro(lang, project) {
  if (lang === "id") {
    return `Perjanjian ini mencakup kerja sama ${project}. Strategi di bawah ini dikelola dalam portal dan menjadi bagian dari Perjanjian ini.`;
  }
  return `This agreement covers the engagement ${project}. The strategy below is maintained in the portal and forms part of this agreement.`;
}

// Locale-aware date — "January 12, 2026" (en) / "12 Januari 2026" (id)
export function fmtDateL(iso, lang) {
  if (!iso) return "—";
  const d = typeof iso === "string" ? parseISO(iso) : iso;
  if (!isValid(d)) return "—";
  return lang === "id" ? format(d, "d MMMM yyyy", { locale: idLocale }) : format(d, "MMMM d, yyyy");
}

export const DEFAULT_CLAUSES_EN = [
  { heading: "1. Scope of Work", body: "Bodega Creative Studio (“Bodega”) will act as an extension of the Client's marketing team, delivering the strategy and deliverables described in this agreement. Any work beyond the stated scope will be quoted separately and agreed in writing before it begins." },
  { heading: "2. Term & Termination", body: "This agreement begins on the effective date and runs for the term stated above, renewing for successive one-month periods thereafter unless either party gives 30 days' written notice. Fees for work already delivered remain payable on termination." },
  { heading: "3. Fees & Payment", body: "Fees are billed monthly in advance unless stated otherwise. Invoices are due within the payment terms stated above. Late payment may pause active work until the account is settled." },
  { heading: "4. Approvals & Responsibilities", body: "The Client will provide timely feedback, brand assets, and approvals through this portal. Content moves forward once approved by the Client's named signatory or their delegate." },
  { heading: "5. Intellectual Property", body: "On full payment, ownership of the approved and delivered content transfers to the Client. Bodega retains the right to feature delivered work in its portfolio and credentials unless agreed otherwise in writing." },
  { heading: "6. Confidentiality", body: "Both parties will keep each other's non-public information confidential during the engagement and after it ends." },
  { heading: "7. Electronic Signature", body: "The parties agree that signing electronically through this portal is valid, binding, and has the same legal effect as a handwritten signature." },
];

export const DEFAULT_CLAUSES_ID = [
  { heading: "1. Ruang Lingkup Pekerjaan", body: "Bodega Creative Studio (“Bodega”) akan bertindak sebagai perpanjangan dari tim pemasaran Klien, dengan memberikan strategi dan hasil pekerjaan sebagaimana dijelaskan dalam Perjanjian ini. Setiap pekerjaan di luar ruang lingkup yang disepakati akan dikuotasikan secara terpisah dan disetujui secara tertulis sebelum dimulai." },
  { heading: "2. Jangka Waktu & Pengakhiran", body: "Perjanjian ini berlaku sejak tanggal berlaku dan berlangsung selama jangka waktu yang tercantum di atas, serta diperpanjang secara otomatis untuk periode satu bulan berikutnya kecuali salah satu pihak memberikan pemberitahuan tertulis 30 (tiga puluh) hari sebelumnya. Biaya atas pekerjaan yang telah diserahkan tetap wajib dibayar pada saat pengakhiran." },
  { heading: "3. Biaya & Pembayaran", body: "Biaya ditagihkan setiap bulan di muka kecuali ditentukan lain. Faktur jatuh tempo sesuai ketentuan pembayaran yang tercantum di atas. Keterlambatan pembayaran dapat menghentikan sementara pekerjaan yang sedang berjalan hingga tagihan diselesaikan." },
  { heading: "4. Persetujuan & Tanggung Jawab", body: "Klien akan memberikan umpan balik, aset merek, dan persetujuan secara tepat waktu melalui portal ini. Konten dilanjutkan setelah disetujui oleh penandatangan yang ditunjuk Klien atau perwakilannya." },
  { heading: "5. Hak Kekayaan Intelektual", body: "Setelah pembayaran lunas, kepemilikan atas konten yang telah disetujui dan diserahkan beralih kepada Klien. Bodega berhak menampilkan hasil pekerjaan dalam portofolio dan kredensialnya kecuali disepakati lain secara tertulis." },
  { heading: "6. Kerahasiaan", body: "Kedua belah pihak akan menjaga kerahasiaan informasi non-publik satu sama lain selama dan setelah kerja sama berakhir." },
  { heading: "7. Tanda Tangan Elektronik", body: "Para Pihak sepakat bahwa penandatanganan secara elektronik melalui portal ini adalah sah, mengikat, dan memiliki kekuatan hukum yang sama dengan tanda tangan basah." },
];

export const defaultClauses = (lang) => (lang === "id" ? DEFAULT_CLAUSES_ID : DEFAULT_CLAUSES_EN);

// Are the contract's clauses still exactly one of the standard sets? (so we can
// safely swap boilerplate language without clobbering custom edits)
export function clausesMatchDefault(clauses = []) {
  const eq = (set) => clauses.length === set.length && clauses.every((c, i) => c.heading === set[i].heading && c.body === set[i].body);
  return eq(DEFAULT_CLAUSES_EN) || eq(DEFAULT_CLAUSES_ID);
}
