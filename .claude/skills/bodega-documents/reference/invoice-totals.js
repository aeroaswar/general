// Bodega invoice math + money formatting (Indonesian studio defaults).
//
// Cascade: Subtotal → + agency fee (on subtotal) → + VAT (on subtotal + agency fee) → total.
// Rates default to agency 10% / VAT 2% and are EDITABLE per invoice
// (store `agencyFeeRate` / `vatRate` on the invoice; default them when creating).

export const invoiceTotals = (invoice) => {
  const subtotal = (invoice.items || []).reduce(
    (s, it) => s + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0),
    0,
  );
  const agencyFeeRate = Number(invoice.agencyFeeRate ?? 0);
  const vatRate = Number(invoice.vatRate ?? 0);
  const agencyFee = Math.round((subtotal * agencyFeeRate) / 100);
  const vat = Math.round(((subtotal + agencyFee) * vatRate) / 100);
  return { subtotal, agencyFee, vat, agencyFeeRate, vatRate, total: subtotal + agencyFee + vat };
};

// Defaults to apply when creating an invoice:  vatRate: 2, agencyFeeRate: 10

// Money — "Rp 25.000.000" (IDR) by default; falls back gracefully.
export function money(n, currency = "IDR") {
  const v = Number(n) || 0;
  try {
    return new Intl.NumberFormat(currency === "IDR" ? "id-ID" : "en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(v);
  } catch {
    return `${currency} ${v.toLocaleString()}`;
  }
}

// Indonesian invoice numbering: INV/001/BCS/<roman-month>/<year>
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
export function defaultInvoiceNumber(seq = 1, iso) {
  const dt = iso ? new Date(iso) : new Date();
  const m = isNaN(dt) ? new Date().getMonth() : dt.getMonth();
  const y = isNaN(dt) ? new Date().getFullYear() : dt.getFullYear();
  return `INV/${String(seq).padStart(3, "0")}/BCS/${ROMAN[m]}/${y}`;
}
