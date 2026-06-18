# Regulasi Indonesia 2026 — Backbone Referensi

Shared regulatory constants for all `usaha-id` skills. **Every rate below must be
re-verified against the live regulation before it touches a filing, a payment, or
a number you give a counterparty.** Tax and mining rules are in active flux in
2025–2026; treat this file as a structured starting point, not gospel.

Confidence legend:
- ✅ **Verified** (cross-checked against multiple 2025–2026 sources)
- 🟡 **Stable-but-verify** (known, rarely changes, confirm anyway)
- 🔴 **Flux / uncertain** (recently changed or contested — verify before use)

---

## 1. Payroll — BPJS (per worker, monthly)

Source basis: PP 84/2013 & amendments (Ketenagakerjaan), Perpres 82/2018 (Kesehatan).

| Program | Employer | Employee | Base / ceiling | Conf. |
|---|---|---|---|---|
| BPJS Kesehatan | 4% | 1% | Ceiling upah **Rp12.000.000** → max iuran **Rp600.000** total | ✅ |
| JHT (Hari Tua) | 3.7% | 2% | Full upah | ✅ |
| JP (Pensiun) | 2% | 1% | Separate, higher ceiling — **verify 2026 figure** | 🔴 |
| JKK (Kecelakaan) | 0.24%–1.74% | — | By risk class (mining = highest tier) | ✅ |
| JKM (Kematian) | 0.3% | — | Full upah | ✅ |

**ANI/MMI note:** mining sites sit in the **highest JKK risk class** (likely 1.74%) — never default to 0.24% for field/site workers. Office staff in Jakarta differ from site crew; split the payroll run by location.

---

## 2. Payroll — PPh 21 (PP 58/2023 + PMK 168/2023, TER method)

✅ **Mechanism:** Jan–Nov withheld monthly as `PPh 21 = Bruto × TER%`. December = annualised reconciliation using progressive Pasal 17 rates, crediting Jan–Nov withholdings.

**Bruto includes:** gaji pokok, tunjangan, lembur, THR, bonus, **plus** employer-paid JKK + JKM + BPJS Kesehatan premiums (these are PPh 21 objects). JHT/JP employee portions are deductible.

🟡 **Biaya jabatan:** 5% of bruto, capped **Rp500.000/month** (Rp6.000.000/year).

🟡 **PTKP (annual, assume unchanged since 2016 — verify):**
- TK/0: Rp54.000.000 · +Rp4.500.000 if married · +Rp4.500.000 per dependent (max 3)

✅ **TER categories:** A / B / C, assigned by PTKP status. Exact per-bracket % — do **not** hardcode; pull from PP 58/2023 lampiran or a Coretax-compatible calculator. There are dozens of brackets per category.

✅ **Pasal 17 (Dec reconciliation & badan reference):** 5% (≤60jt) · 15% (60–250jt) · 25% (250–500jt) · 30% (500jt–5M) · 35% (>5M).

✅ **Daily TER (pekerja tidak tetap):** 0% if ≤Rp450.000/day, 0.5% above.

**Filing:** SPT Masa PPh 21 — setor & lapor by the **10th/20th** of the following month (verify current Coretax deadline). Bukti potong **1721-A1** (swasta). Output to **Coretax XML (BPMP / BPA1)**.

---

## 3. Indirect & corporate tax

🔴 **PPN (VAT):** Statutory rate **12%** (UU HPP). For most non-luxury goods/services the **effective rate stays ~11%** via *DPP nilai lain* = 11/12 × price (PMK 131/2024). Luxury goods (PPnBM) hit full 12%. This is the single most error-prone number in the pack — **verify the current mechanism before invoicing or filing PPN.** I am not fully certain the 11/12 mechanism is unchanged in 2026.

🟡 **PPh Badan (corporate income tax):** **22%** flat (UU HPP). PPh 25 monthly instalments; PPh 29 settlement at SPT Tahunan.

🟡 **PPh 23:** 2% on services/management/rent fees (with NPWP). PPh 4(2) final for specific objects.

🟡 **Global minimum tax (Pillar Two):** 15% effective floor applies to qualifying MNE groups from FY2025. Likely **not** triggered at your scale, but flag if any entity joins a large group structure.

**System:** All filings now route through **Coretax DJP** (live since Jan 2025). e-Faktur for PPN. Expect XML upload formats, not the old DJP Online flows.

---

## 4. Mining royalty / PNBP (ANI & MMI) — PP 19/2025

✅ PP 19/2025 (eff. ~26 Apr 2025) **revoked PP 26/2022** and raised minerba royalties. Nickel ore moved from a flat **10%** to a **progressive scale tied to HMA nikel** (Harga Mineral Acuan, USD/ton):

| HMA nikel (USD/ton) | Iuran produksi (royalti) bijih nikel |
|---|---|
| < 18,000 | **14%** |
| 18,000 – 21,000 | **15%** |
| 21,000 – 24,000 | **16%** |
| 24,000 – 31,000 | **18%** |
| > 31,000 | **19%** |

✅ Refined/processed: **FeNi / NPI / Nickel Matte ≈ 3.5%–7%** by HMA band.
🔴 **Cobalt:** a ~2% royalty on cobalt content was floated in a *proposed* further revision — **not confirmed as enacted.** Verify before applying to limonite Co value.

**Royalty base** = sale value benchmarked to **HPM** (see §5), not invoice price, if invoice < HPM. Royalty is one PNBP line; also budget **iuran tetap (landrent)**, **PPN**, **PPh Badan**, PPKH, reklamasi & pascatambang jaminan.

**Reporting:** realisasi produksi & penjualan via **MODI / MOMS / e-PNBP** (ESDM). RKAB realisation reported against approved RKAB volume — overruns need RKAB revision.

---

## 5. HPM bijih nikel — Kepmen ESDM 144.K/2026 (eff. Apr 2026)

✅ Verified formula (matches MMI skill — authoritative there):

```
HPM = [ (%Ni × CF_Ni × HMA_Ni)
      + (%Fe × CF_Fe × HMA_Fe × 100)
      + (%Co × CF_Co × HMA_Co)
      + (%Cr × CF_Cr × HMA_Cr × 100) ] × (1 − MC%)

FOB = HPM − trader margin
```

- Grades as **decimal fractions**; **Fe and Cr terms × 100**
- `CF_Ni = 0.28 + (Ni% − 1.40) × 0.1` (sliding)
- CF ikutan: **Fe = 30%, Co = 30%, Cr = 10%**
- 144/2026 added **mineral ikutan** (Fe, Co, Cr) to the base and shifted to **WMT basis with moisture penalty** `(1 − MC%)`

**Strategic constant (from MMI work):** cobalt ≈ **3.5× nickel value per unit grade** → low-grade limonite is profitable when **Co ≥ 0.05% and Fe ≤ 35%**. Always run the byproduct credit before rejecting a limonite parcel.

> Defer to the `mmi` skill for the full convention set and the blend calculator. This is the summary; that is the source of truth.

---

## 6. Compliance calendar (verify exact dates each period)

| Obligation | Cadence | Rough deadline |
|---|---|---|
| BPJS Kes + TK payment | Monthly | ~10th (Kes) / per BPJS-TK schedule |
| PPh 21 setor & lapor (Coretax) | Monthly | ~10th / 20th |
| PPN e-Faktur & SPT Masa | Monthly | end of following month |
| PPh 25 instalment | Monthly | ~15th |
| SPT Tahunan Badan | Annual | **30 Apr** (4 months after FY-end) |
| RKAB realisasi (ESDM) | Per RKAB cycle | per approval terms |
| PNBP / royalti setor | Per shipment / period | before/at sale realisation |
| THR | Annual | **≥ H-7 before Idul Fitri**, statutory |

---

## 7. What this file deliberately does NOT do

- It does not file anything. Skills **prepare**; you (or your konsultan pajak / accountant) **file**.
- It does not replace a licensed konsultan pajak, notaris, or competent person (CP) for RKAB/JORC.
- It does not lock rates. If a number here conflicts with the live regulation or your konsultan, **the live source wins** — and update this file.
