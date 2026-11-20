---
created: 2026-11-19
tags: [eco463, project, model]
source_script: _project_data/scripts/model_v2_bihar.py
---

# Model v2 results: three Bihar families, three college pairs

<!-- AUTO TABLES START (regenerate with py model_v2_bihar.py; prose below the tables is hand-written) -->

## A. Inputs pulled from our data

| NIT (CSE) | NIRF 3-yr mean median pay, lakh (SOURCED) | Quota for a Bihar student | Closes: Gender-Neutral | Closes: Female-only | Son at CRL 8,000? | Daughter at CRL 8,000? |
|---|---|---|---|---|---|---|
| Patna | 8.96 | HS | 17,808 | 29,456 | yes | yes |
| Delhi | 15.38 | OS | 7,651 | 15,361 | no | yes |
| Durgapur | 11.01 | OS | 9,836 | 16,484 | yes | yes |
| Jamshedpur | 10.57 | OS | 8,902 | 18,219 | yes | yes |
| Silchar | 11.98 | OS | 12,665 | 22,468 | yes | yes |

Sources: `06_analysis/nirf_median_salary.csv` (NIRF 2025 rows), `01_josaa/josaa_final_2016_2025.csv.gz` (2025, final round, OPEN, CSE 4-year B.Tech).

| Family | Option leg used | One-way fare per person, Rs | Door-to-door hours | Escort days per escorted trip |
|---|---|---|---|---|
| Shalini / Sonu, Saharsa village | Patna | 300 | 6.5 | 1 |
| Shalini / Sonu, Saharsa village | Durgapur | 580 | 14.5 | 3 |
| Shalini / Sonu, Saharsa village | Delhi | 1,280 | 26.5 | 4 |
| Kajal / Kundan, Begusarai | Patna | 220 | 3.5 | 1 |
| Kajal / Kundan, Begusarai | Durgapur | 500 | 11.0 | 2 |
| Kajal / Kundan, Begusarai | Delhi | 1,205 | 21.0 | 3 |
| Ira / Vivaan, Patna | Patna | 200 | 0.75 | 1 |
| Ira / Vivaan, Patna | Durgapur | 920 | 6.5 | 1 |
| Ira / Vivaan, Patna | Delhi | 7,103 | 5.75 | 1 |

Fares and hours: `10_research/bihar_journeys.md` (main legs SOURCED; village/town/home local legs and the station-to-NIT legs in Patna and Durgapur ASSUMED: NOT FOUND in that file). Full leg list in the script header.

## B. Baseline (H = 3, sigma = 16, tau = 4, b = 1, mu = 3)

| Family | Option | Value H x pay, lakh | Money, Rs (4 yrs) | lambda x money, lakh | Worry, lakh | U, lakh |
|---|---|---|---|---|---|---|
| Shalini / Sonu, Saharsa village | NEAR | 53.8 | 9,600 | 0.24 | 3.25 | 50.27 |
| Shalini / Sonu, Saharsa village | TOGETHER | 66.1 | 18,560 | 0.46 | 7.25 | 58.35 |
| Shalini / Sonu, Saharsa village | SPLIT | 79.2 | 62,366 | 1.56 | 22.08 | 55.53 |
| Kajal / Kundan, Begusarai | NEAR | 53.8 | 7,040 | 0.08 | 1.75 | 51.93 |
| Kajal / Kundan, Begusarai | TOGETHER | 66.1 | 16,000 | 0.19 | 5.50 | 60.37 |
| Kajal / Kundan, Begusarai | SPLIT | 79.2 | 94,560 | 1.13 | 17.50 | 60.54 |
| Ira / Vivaan, Patna | NEAR | 53.8 | 6,400 | 0.06 | 0.20 | 53.50 |
| Ira / Vivaan, Patna | TOGETHER | 66.1 | 29,440 | 0.29 | 1.70 | 64.06 |
| Ira / Vivaan, Patna | SPLIT | 79.2 | 165,114 | 1.65 | 1.60 | 75.92 |

### Out of 100 families like this

| Family | NEAR | TOGETHER | SPLIT | P(son far) | P(daughter far) | P(son at his best seat) | P(daughter at her best seat, Delhi) | Most likely |
|---|---|---|---|---|---|---|---|---|
| Shalini / Sonu, Saharsa village | 5 | 69 | 27 | 95 | 95 | 95 | 27 | TOGETHER |
| Kajal / Kundan, Begusarai | 3 | 47 | 50 | 97 | 97 | 97 | 50 | SPLIT |
| Ira / Vivaan, Patna | 0 | 2 | 98 | 100 | 100 | 100 | 98 | SPLIT |

With only these three pairs, 'far' is shared by construction (both stay or both leave), so the gendered gap shows in the last two columns: who gets the best seat their rank allows.

### Robustness: add the classic v1 outcome, SON-ONLY (son Durgapur, daughter NIT Patna)

| Family | NEAR | TOGETHER | SPLIT | SON-ONLY | P(son far) | P(daughter far) | P(daughter at Delhi) |
|---|---|---|---|---|---|---|---|
| Shalini / Sonu, Saharsa village | 4 | 59 | 23 | 14 | 96 | 82 | 23 |
| Kajal / Kundan, Begusarai | 2 | 42 | 44 | 12 | 98 | 86 | 44 |
| Ira / Vivaan, Patna | 0 | 2 | 98 | 0 | 100 | 100 | 98 |

## C. Sensitivity (out of 100: NEAR / TOGETHER / SPLIT)

### Horizon H (years of pay gap counted)

| H | Shalini / Sonu: N / T / S | Kajal / Kundan: N / T / S | Ira / Vivaan: N / T / S |
|---|---|---|---|
| 1 | 51 / 48 / 1 | 47 / 51 / 3 | 11 / 23 / 66 |
| 2 | 20 / 74 / 7 | 16 / 67 / 17 | 1 / 8 / 92 |
| 3 | 5 / 69 / 27 | 3 / 47 / 50 | 0 / 2 / 98 |
| 5 | 0 / 12 / 88 | 0 / 5 / 95 | 0 / 0 / 100 |

### Worry scale sigma (tau = sigma/4); 3 = v1's worry re-expressed per reach-day

| sigma | Shalini / Sonu: N / T / S | Kajal / Kundan: N / T / S | Ira / Vivaan: N / T / S |
|---|---|---|---|
| 3 | 0 / 4 / 96 | 0 / 4 / 96 | 0 / 2 / 98 |
| 8 | 1 / 18 / 82 | 0 / 11 / 88 | 0 / 2 / 98 |
| 16 | 5 / 69 / 27 | 3 / 47 / 50 | 0 / 2 / 98 |
| 24 | 11 / 86 / 3 | 9 / 80 / 11 | 0 / 2 / 98 |
| 32 | 20 / 79 / 0 | 17 / 81 / 2 | 0 / 2 / 98 |

### Logit noise mu (lakh)

| mu | Shalini / Sonu: N / T / S | Kajal / Kundan: N / T / S | Ira / Vivaan: N / T / S |
|---|---|---|---|
| 1.5 | 0 / 86 / 13 | 0 / 47 / 53 | 0 / 0 / 100 |
| 3 | 5 / 69 / 27 | 3 / 47 / 50 | 0 / 2 / 98 |
| 6 | 14 / 53 / 33 | 11 / 44 / 45 | 2 / 12 / 86 |

### Brother's worry effect b

| b | Shalini / Sonu: N / T / S | Kajal / Kundan: N / T / S | Ira / Vivaan: N / T / S |
|---|---|---|---|
| 0 | 5 / 32 / 63 | 3 / 21 / 76 | 0 / 2 / 98 |
| 1 | 5 / 69 / 27 | 3 / 47 / 50 | 0 / 2 / 98 |
| 2 | 4 / 78 / 18 | 3 / 57 / 40 | 0 / 2 / 98 |

Town family exactly on the SPLIT/TOGETHER fence at sigma = 16.2 (tau = sigma/4), H = 3.

City family with n = 0 (no girls known who went far; the airport alone): NEAR / TOGETHER / SPLIT = 0 / 3 / 97.

What it takes to get the expected 'Shalini mostly stays at Patna': a village-only fixed cost of her leaving Bihar of about 4.7 lakh (four options). Then out of 100: NEAR 12, TOGETHER 35, SPLIT 14, SON-ONLY 39.

## D. Bargaining: the daughter's say beta (Agarwal legitimacy)

Parents' payoff = U above; hers = H x pay of her college minus her own worry (a third of theirs, no taste term), both relative to NEAR; disagreement = drop a year (T_P = T_D = -2 lakh, ASSUMED).

| Family | Parents' U: TOGETHER / SPLIT | Her gain: TOGETHER / SPLIT | Choice at beta = 0.2 | Choice at beta = 0.3 | Choice at beta = 0.5 | Smallest beta at which she gets SPLIT |
|---|---|---|---|---|---|---|
| Shalini / Sonu, Saharsa village | 8.1 / 5.3 | 5.3 / 14.1 | TOGETHER | SPLIT | SPLIT | 0.3 |
| Kajal / Kundan, Begusarai | 8.4 / 8.6 | 5.3 / 15.0 | SPLIT | SPLIT | SPLIT | 0.0 |
| Ira / Vivaan, Patna | 10.6 / 22.4 | 6.0 / 19.1 | SPLIT | SPLIT | SPLIT | 0.0 |

## E. Fixes, tested (out of 100 daughters at NIT Delhi = P(SPLIT))

| Fix (model term) | Shalini / Sonu | Kajal / Kundan | Ira / Vivaan |
|---|---|---|---|
| Baseline | 27 | 50 | 98 |
| Escort's fares paid (travel allowance) | 30 | 52 | 98 |
| Cheap credit: lambda = 1 (PM-Vidyalaxmi, SBI girls' rate) | 31 | 51 | 98 |
| One senior girl from home district at NIT Delhi (n + 1 there) | 87 | 91 | 98 |
| First-year hostel guarantee at Delhi (sigma x 0.5 there) | 87 | 91 | 98 |
| Campus pickup from station/airport (last mile: -1 h, cab fare 0) | 36 | 59 | 98 |
| Senior girl + hostel guarantee | 97 | 97 | 98 |

### Same fixes with four options (the video's numbers): her Delhi chance / her far chance, out of 100

| Fix | Shalini / Sonu | Kajal / Kundan | Ira / Vivaan |
|---|---|---|---|
| Baseline | 23 / 82 | 44 / 86 | 98 / 100 |
| Escort's fares paid (travel allowance) | 26 / 83 | 46 / 86 | 98 / 100 |
| Cheap credit: lambda = 1 (PM-Vidyalaxmi, SBI girls' rate) | 27 / 83 | 45 / 86 | 98 / 100 |
| One senior girl from home district at NIT Delhi (n + 1 there) | 85 / 97 | 89 / 97 | 98 / 100 |
| First-year hostel guarantee at Delhi (sigma x 0.5 there) | 85 / 97 | 89 / 97 | 98 / 100 |
| Campus pickup from station/airport (last mile: -1 h, cab fare 0) | 32 / 84 | 53 / 88 | 98 / 100 |
| Senior girl + hostel guarantee | 96 / 99 | 96 / 99 | 98 / 100 |

## F. Rupee anchors for the script

- Trade-down cost of TOGETHER for the daughter: Delhi 15.38 minus Durgapur 11.01 = **4.37 lakh a year** (Jamshedpur instead: 4.81). Staying at NIT Patna: 6.42 lakh a year.
- Shalini / Sonu, Saharsa village: SPLIT's whole travel bill over 4 years (both children, escort fares and days) = Rs 62,366; NEAR's = Rs 9,600.
- Kajal / Kundan, Begusarai: SPLIT's whole travel bill over 4 years (both children, escort fares and days) = Rs 94,560; NEAR's = Rs 7,040.
- Ira / Vivaan, Patna: SPLIT's whole travel bill over 4 years (both children, escort fares and days) = Rs 165,114; NEAR's = Rs 6,400.
- UP contrast (state_pay_near_vs_far.csv): home NIT Motilal Nehru National Institute of Technology Allahabad pays 13.7 lakh; best far NIT in reach of a home-median-rank girl pays 12.0 (gap -1.7). Bihar: NIT Patna 9.0.

<!-- AUTO TABLES END -->

## G. Reading it (hand-written, 19 Nov)

**Parameter labels.** SOURCED: NIRF pay (Patna 8.96, Durgapur 11.01, Jamshedpur 10.57, Delhi 15.38, Silchar 11.98 lakh), JoSAA 2025 closing ranks (who can take which seat at CRL 8,000), the main train and flight fares and hours (`bihar_journeys.md`), the Delhi-airport-to-Narela cab (48.5 km, Rs 515-744), the village father's day wage (Rs 378.93, Bihar farm labour). ASSUMED: H, sigma, tau, b, mu, lambda, n, the town and city day wages, J (8 by train, 2 by air), the escort-days rule, all local legs at both ends, her own worry share (1/3), T_P and T_D. Fees and hostel are the same at every NIT (common fee structure, hostel not waived), so they cancel across the three pairs and are left out of the choice.

**Why Durgapur, not Jamshedpur, for TOGETHER.** The journey file prices Patna to Durgapur (Poorva 12304, SL Rs 230, 3A Rs 620, 6h59; Vande Bharat 4h06); for Patna to Tatanagar it has only an all-class average (Rs 180) and no sleeper fare. Durgapur is also closer and pays a little more (11.0 vs 10.6). The son gets Durgapur CSE comfortably (OS Gender-Neutral closes 9,836) and Jamshedpur too (8,902). Silchar (12.0) is left out: remote hill campus, and it would need a different journey.

**What came out, and does it match the expected story?**
1. **Ira splits: yes, strongly (98 of 100).** And not because of money: her SPLIT travel bill is the biggest of all (Rs 1.65 lakh over 4 years). Her worry term is small because Delhi is under 6 hours door to door by air, so the "reach time" is short. Even with n = 0 (no girls she knows went far) she splits 97 of 100. The airport does the work (Mshaw's airport point).
2. **Kajal: about 50 / 50 between SPLIT and TOGETHER.** This is **by calibration, not a finding**: sigma was set (16, with tau = 4) so the town family sits on the fence. The worry scale is the one thing we cannot source, so we pin it at the middle family and let the other two be predictions.
3. **Shalini is mostly TOGETHER (69 of 100), not NEAR (5 of 100).** The expected "Shalini mostly near" does **not** emerge. Reason: NIT Patna is itself 6.5 hours from her village, Durgapur is only 8 hours more, and once Sonu goes with her the escort cost is zero and the worry falls. Real fares are tiny next to the pay gap, so "near" has nothing going for it. What does separate her from Kajal is SPLIT: Delhi is 26.5 hours from the village by train vs 21 from Begusarai, so she gets Delhi 27 times in 100 vs Kajal's 50.
4. **With the classic SON-ONLY outcome added**, the gender gap in "going far" appears where expected: village son far 96 vs daughter 82; town 98 vs 86; city 100 vs 100. So 14 and 12 of 100 poorer families send only the son.

**What you would have to change to get "Shalini mostly near".** Either (a) H = 1 for everyone (the family counts one year of the pay gap): then Shalini is near 51 of 100, but Kajal is near 47 too, so the village-town difference still does not appear; or (b) a village-only fixed taste cost of her leaving Bihar of about Rs 4.7 lakh: then she stays at NIT Patna in 51 of 100 (39 of them with Sonu gone to Durgapur). (b) is a real hypothesis (rural norms, "log kya kahenge" is louder in a village), but it is ours, not data. **Recommendation for the script: follow the numbers.** Shalini's story becomes "the brother is her ticket out": she ends at Sonu's college. That is Mshaw's tied-mover idea, and it is the sharper story.

**The money is not the binding term (the most robust result).** SPLIT's whole travel bill over four years is Rs 62,366 (village), Rs 94,560 (town), Rs 1,65,114 (city). The pay gain from Delhi over Patna is Rs 6.42 lakh **a year**. Paying the escort's fares moves Shalini from 27 to 30 in 100; cheap credit (lambda = 1) to 31. A senior girl from her district at NIT Delhi, or a first-year hostel guarantee, moves her to 87. The size of that jump depends on the assumed split of worry (80% statistical, 20% taste), but the ranking (information beats money) follows from the sourced fares. The campus pickup (last mile) moves her only to 36, which fits the last-mile test (airport distance does not predict empty women-only seats, p = 0.63).

**Bargaining (Mshaw's "pulls vs suggests").** In the village, the parents prefer TOGETHER by about Rs 2.8 lakh; she prefers Delhi by about Rs 8.8 lakh. She wins only if her say is at least beta = 0.3; at beta = 0.2 the parents' TOGETHER wins (they "pull"). In Patna the parents themselves prefer SPLIT (by about Rs 11.8 lakh), so there is no conflict and they can only "suggest". Kajal's parents are on the fence, so any say she has decides it. So the same model gives both of Mshaw's cases; what differs is the size of the parents' preference and her legitimacy (Agarwal's L).

**Fragile spots (say them in the report).** H swings everything (H = 1 vs 5 moves Shalini's Delhi chance from 1 to 88). sigma is calibrated, not measured. The value of a college is the NIRF median, partly who gets in. Durgapur and Patna last-mile legs, and all local legs, are assumed. The brother's worry effect b is assumed (b = 0 gives Shalini Delhi 63 of 100, so the tied-mover pull depends on it).
