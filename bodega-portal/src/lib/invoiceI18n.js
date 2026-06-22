// Invoice support — bilingual labels + money/number formatting. Reuses the
// locale-aware date formatter from the contract module.
import { fmtDateL } from "./contractI18n.js";
export { fmtDateL };

export const INV = {
  en: {
    pageTitle: "Invoices", invoice: "INVOICE", number: "Invoice No.",
    date: "Date", dueDate: "Due date",
    from: "From", billTo: "Bill to", attn: "Attn",
    description: "Description", qty: "Qty", unitPrice: "Unit price", amount: "Amount",
    subtotal: "Subtotal", agencyFee: "Agency fee", tax: "VAT", total: "Total due",
    paymentTo: "Payment to", bank: "Bank", accountName: "Account name", accountNo: "Account no.",
    paymentTerms: "Payment terms", notes: "Notes", thanks: "Thank you for your business.",
    status: { Draft: "Draft", Sent: "Sent", Paid: "Paid", Overdue: "Overdue" },
    newInvoice: "New invoice", edit: "Edit", print: "Print", back: "Back", markPaid: "Mark paid", markUnpaid: "Mark unpaid",
    send: "Send to client", deleteInvoice: "Delete invoice", deleteConfirm: "Delete this invoice?",
    noInvoices: "No invoices yet", noInvoicesAdmin: (c) => `Create the first invoice for ${c}.`,
    noInvoicesClient: "Your studio will share invoices here.", createInvoice: "Create invoice",
    paidStamp: "PAID",
  },
  id: {
    pageTitle: "Faktur", invoice: "FAKTUR", number: "No. Faktur",
    date: "Tanggal", dueDate: "Jatuh tempo",
    from: "Dari", billTo: "Ditagihkan kepada", attn: "u.p.",
    description: "Deskripsi", qty: "Jml", unitPrice: "Harga satuan", amount: "Jumlah",
    subtotal: "Subtotal", agencyFee: "Biaya agensi", tax: "PPN", total: "Total tagihan",
    paymentTo: "Pembayaran ke", bank: "Bank", accountName: "Atas nama", accountNo: "No. rekening",
    paymentTerms: "Ketentuan pembayaran", notes: "Catatan", thanks: "Terima kasih atas kepercayaan Anda.",
    status: { Draft: "Draf", Sent: "Terkirim", Paid: "Lunas", Overdue: "Jatuh tempo" },
    newInvoice: "Faktur baru", edit: "Ubah", print: "Cetak", back: "Kembali", markPaid: "Tandai lunas", markUnpaid: "Tandai belum lunas",
    send: "Kirim ke klien", deleteInvoice: "Hapus faktur", deleteConfirm: "Hapus faktur ini?",
    noInvoices: "Belum ada faktur", noInvoicesAdmin: (c) => `Buat faktur pertama untuk ${c}.`,
    noInvoicesClient: "Studio Anda akan membagikan faktur di sini.", createInvoice: "Buat faktur",
    paidStamp: "LUNAS",
  },
};

export const inv = (lang) => INV[lang === "id" ? "id" : "en"];

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
export function defaultInvoiceNumber(seq = 1, iso) {
  const dt = iso ? new Date(iso) : new Date();
  const m = isNaN(dt) ? new Date().getMonth() : dt.getMonth();
  const y = isNaN(dt) ? new Date().getFullYear() : dt.getFullYear();
  return `INV/${String(seq).padStart(3, "0")}/BCS/${ROMAN[m]}/${y}`;
}

// Money — "Rp 25.000.000" (IDR) etc.
export function money(n, currency = "IDR") {
  const v = Number(n) || 0;
  try {
    return new Intl.NumberFormat(currency === "IDR" ? "id-ID" : "en-US", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
  } catch {
    return `${currency} ${v.toLocaleString()}`;
  }
}

// Subtotal → + agency fee (on subtotal) → + VAT (on subtotal + agency fee) → total.
// Rates default to agency 10% / VAT 2%, and are editable per invoice.
export const invoiceTotals = (invoice) => {
  const subtotal = (invoice.items || []).reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0);
  const agencyFeeRate = Number(invoice.agencyFeeRate ?? 0);
  const vatRate = Number(invoice.vatRate ?? 0);
  const agencyFee = Math.round(subtotal * agencyFeeRate / 100);
  const vat = Math.round((subtotal + agencyFee) * vatRate / 100);
  return { subtotal, agencyFee, vat, agencyFeeRate, vatRate, total: subtotal + agencyFee + vat };
};
