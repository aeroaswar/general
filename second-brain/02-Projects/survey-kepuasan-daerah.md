---
type: project
status: active
area: Academia, Law & Public Sector
tags: [project, govtech, survey, dashboard, public-sector]
---
# survey-kepuasan-daerah

**Status:** active · **Area:** [[Academia, Law & Public Sector]]

## What it is
A **Community Satisfaction Survey (Survei Kepuasan Masyarakat / IKM)** web app +
dashboard for Indonesian local government — citizens rate **Kepala Daerah**
(Gubernur / Bupati / Walikota, period 2024–2029) performance.

## Design
- **8 dimensions:** public service & admin, infrastructure, health, education,
  economy & jobs, transparency & governance, security, environment. 5-point scale.
- **IKM index 0–100 + mutu A–D** (PermenPAN style); region picker
  Provinsi → Kota → Kecamatan → Kelurahan (live Permendagri-based wilayah API, DKI seed fallback).
- **Privacy:** simple k-anonymity (hide index if N < 30, mask cells < 5).
- Stack: vanilla HTML / CSS / JS + localStorage.

## Where
- Drive: `survey-kepuasan-daerah/` (index.html, app.js, data.js, dashboard.js, styles.css).

## 📦 Log
- 2026-06-19 — note created from source.
