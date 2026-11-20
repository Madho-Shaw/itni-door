// Itni Door? Real Life: the 4-minute class mode. ALL text, numbers and sources for js/rl_app.js and js/rl_model.js.
// Numbers are copied from the vault, never typed from memory:
//   model + parameters: 107 §3b and _project_data/scripts/model_v2_bihar.py (results: _project_data/06_analysis/model_v2_results.md)
//   journeys: _project_data/10_research/bihar_journeys.md (aggregator snapshots, 19 Nov 2026)
// A = assumed (NOT FOUND in the journey file or not measurable), S = sourced. Dramatised lines say so on screen.
window.ITNI = window.ITNI || {};
ITNI.rl = {
  model: {
    // NIRF 2025, 3-year mean of median UG salary, lakh a year (S: 06_analysis/nirf_median_salary.csv)
    pay: { Patna: 8.96, Durgapur: 11.01, Delhi: 15.38 },
    options: {                 // [son's college, daughter's college]
      NEAR: ["Patna", "Patna"],
      TOGETHER: ["Durgapur", "Durgapur"],
      SPLIT: ["Durgapur", "Delhi"],
      SON_ONLY: ["Durgapur", "Patna"]
    },
    // one-way, per person, door to door (the legs are listed in fams.*.legs below)
    journey: {
      village: { Patna: { fare: 300, hours: 6.5 }, Durgapur: { fare: 580, hours: 14.5 }, Delhi: { fare: 1280, hours: 26.5 } },
      town:    { Patna: { fare: 220, hours: 3.5 }, Durgapur: { fare: 500, hours: 11.0 }, Delhi: { fare: 1205, hours: 21.0 } },
      city:    { Patna: { fare: 200, hours: 0.75 }, Durgapur: { fare: 920, hours: 6.5 }, Delhi: { fare: 7103, hours: 5.75 } }
    },
    families: {
      village: { lam: 2.5, w: 378.93, n: 0 },   // w SOURCED: Bihar farm labour, men, Feb 2025 (Labour Bureau via CEIC)
      town:    { lam: 1.2, w: 2000, n: 0 },     // w ASSUMED: income / 300 days
      city:    { lam: 1.0, w: 4167, n: 5 }      // w ASSUMED: one of two salaries / 300 days
    },
    base: { H: 3, sigma: 16, tau: 4, b: 1, mu: 3, J_train: 8, J_air: 2, trips: 16 },   // all ASSUMED (sigma calibrated on the town family)
    fixes: {
      senior:  { n_add_delhi: 1 },
      hostel:  { sigma_mult_delhi: 0.5 },
      fares:   { escort_fares_paid: true },
      credit:  { lam: 1 }
    }
  },

  colleges: {
    Patna:    { name: { en: "NIT Patna", hn: "NIT Patna" }, where: { en: "home state", hn: "apna state" },
                closeHim: 17808, closeHer: 29456, quota: "HS" },
    Durgapur: { name: { en: "NIT Durgapur", hn: "NIT Durgapur" }, where: { en: "West Bengal", hn: "West Bengal" },
                closeHim: 9836, closeHer: 16484, quota: "OS" },
    Delhi:    { name: { en: "NIT Delhi", hn: "NIT Delhi" }, where: { en: "Narela, Delhi", hn: "Narela, Delhi" },
                closeHim: 7651, closeHer: 15361, quota: "OS" }
  },
  crl: 8000,

  fams: {
    village: {
      her: "Shalini", him: "Sonu", papa: { en: "Babuji", hn: "Babuji" }, mummy: { en: "Maai", hn: "Maai" },
      home: { en: "a village in Saharsa district", hn: "Saharsa zile ka ek gaon" },
      income: { en: "about ₹2 lakh a year, small farm (assumed)", hn: "saal ka lagbhag ₹2 lakh, chhota khet (assumed)" },
      wage: { en: "₹379 a day: Bihar farm wage, men, Feb 2025 (Labour Bureau)", hn: "₹379 roz: Bihar khet mazdoori, Feb 2025 (Labour Bureau)" },
      wageSrc: "S",
      skin: "#8D5A3F",
      legs: {
        Delhi: [
          { what: { en: "Shared auto to Saharsa Jn", hn: "Shared auto, Saharsa Jn tak" }, h: "1-1.5 h", rs: 50, src: "A" },
          { what: { en: "Vaishali Express 15565, sleeper", hn: "Vaishali Express 15565, sleeper" }, h: "24 h", rs: 605, src: "S", ref: "confirmtkt" },
          { what: { en: "New Delhi station to Narela, cab", hn: "New Delhi station se Narela, cab" }, h: "~1 h", rs: 625, src: "S", ref: "rome2rio_narela", note: { en: "₹550-700, proxy", hn: "₹550-700, proxy" } }
        ],
        Durgapur: [
          { what: { en: "Shared auto to Saharsa Jn", hn: "Shared auto, Saharsa Jn tak" }, h: "1-1.5 h", rs: 50, src: "A" },
          { what: { en: "Rajya Rani 12567 to Patna, sleeper", hn: "Rajya Rani 12567, Patna tak, sleeper" }, h: "4 h 15", rs: 200, src: "S", ref: "goibibo_rr", note: { en: "₹180-220", hn: "₹180-220" } },
          { what: { en: "Poorva Express 12304 to Durgapur, sleeper", hn: "Poorva Express 12304, Durgapur tak, sleeper" }, h: "6 h 59", rs: 230, src: "S", ref: "erail" },
          { what: { en: "Station to campus", hn: "Station se campus" }, h: "-", rs: 100, src: "A" }
        ],
        Patna: [
          { what: { en: "Shared auto to Saharsa Jn", hn: "Shared auto, Saharsa Jn tak" }, h: "1-1.5 h", rs: 50, src: "A" },
          { what: { en: "Rajya Rani 12567 to Patna, sleeper", hn: "Rajya Rani 12567, Patna tak, sleeper" }, h: "4 h 15", rs: 200, src: "S", ref: "goibibo_rr", note: { en: "₹180-220", hn: "₹180-220" } },
          { what: { en: "Patna Jn to campus, auto", hn: "Patna Jn se campus, auto" }, h: "-", rs: 50, src: "A" }
        ]
      }
    },
    town: {
      her: "Kajal", him: "Kundan", papa: { en: "Papa (a teacher)", hn: "Papa (teacher)" }, mummy: { en: "Mummy", hn: "Mummy" },
      home: { en: "Begusarai town", hn: "Begusarai shahar" },
      income: { en: "about ₹6 lakh a year, father a teacher (assumed)", hn: "saal ka lagbhag ₹6 lakh, papa teacher (assumed)" },
      wage: { en: "₹2,000 a day of Papa's leave (assumed: income ÷ 300)", hn: "Papa ki chhutti ₹2,000 roz (assumed: income ÷ 300)" },
      wageSrc: "A",
      skin: "#A8694B",
      legs: {
        Delhi: [
          { what: { en: "Auto to the station", hn: "Station tak auto" }, h: "20-30 min", rs: 30, src: "A" },
          { what: { en: "Seemanchal Express 12487, sleeper", hn: "Seemanchal Express 12487, sleeper" }, h: "~19 h 25", rs: 550, src: "S", ref: "ixigo_bgs" },
          { what: { en: "New Delhi station to Narela, cab", hn: "New Delhi station se Narela, cab" }, h: "~1 h", rs: 625, src: "S", ref: "rome2rio_narela", note: { en: "₹550-700, proxy", hn: "₹550-700, proxy" } }
        ],
        Durgapur: [
          { what: { en: "Auto to the station", hn: "Station tak auto" }, h: "20-30 min", rs: 30, src: "A" },
          { what: { en: "Train to Patna, sleeper", hn: "Patna tak train, sleeper" }, h: "2 h 23", rs: 140, src: "S", ref: "rome2rio_bgs", note: { en: "SL fare: erail (three-families facts)", hn: "SL kiraya: erail (three-families facts)" } },
          { what: { en: "Poorva Express 12304 to Durgapur, sleeper", hn: "Poorva Express 12304, Durgapur tak, sleeper" }, h: "6 h 59", rs: 230, src: "S", ref: "erail" },
          { what: { en: "Station to campus", hn: "Station se campus" }, h: "-", rs: 100, src: "A" }
        ],
        Patna: [
          { what: { en: "Auto to the station", hn: "Station tak auto" }, h: "20-30 min", rs: 30, src: "A" },
          { what: { en: "Train to Patna, sleeper", hn: "Patna tak train, sleeper" }, h: "2 h 23", rs: 140, src: "S", ref: "rome2rio_bgs", note: { en: "SL fare: erail (three-families facts)", hn: "SL kiraya: erail (three-families facts)" } },
          { what: { en: "Patna Jn to campus, auto", hn: "Patna Jn se campus, auto" }, h: "-", rs: 50, src: "A" }
        ]
      }
    },
    city: {
      her: "Ira", him: "Vivaan", papa: { en: "Papa", hn: "Papa" }, mummy: { en: "Mummy", hn: "Mummy" },
      home: { en: "Patna city, near the airport", hn: "Patna shahar, airport ke paas" },
      income: { en: "about ₹25 lakh a year, two salaries (assumed)", hn: "saal ka lagbhag ₹25 lakh, do salary (assumed)" },
      wage: { en: "₹4,167 a day of a parent's leave (assumed: one salary ÷ 300)", hn: "ek parent ki chhutti ₹4,167 roz (assumed: ek salary ÷ 300)" },
      wageSrc: "A",
      skin: "#B9785A",
      legs: {
        Delhi: [
          { what: { en: "Cab to Patna airport", hn: "Patna airport tak cab" }, h: "30-45 min", rs: 200, src: "A" },
          { what: { en: "Flight Patna to Delhi", hn: "Patna se Delhi flight" }, h: "1 h 35-1 h 50", rs: 6273, src: "S", ref: "ixigo_air", note: { en: "₹5,058-7,677 seen", hn: "₹5,058-7,677 dekha" } },
          { what: { en: "Delhi T3 to Narela, cab, 48.5 km", hn: "Delhi T3 se Narela, cab, 48.5 km" }, h: "~50 min", rs: 630, src: "S", ref: "rome2rio_t3", note: { en: "₹515-744", hn: "₹515-744" } }
        ],
        Durgapur: [
          { what: { en: "Cab to Patna Jn", hn: "Patna Jn tak cab" }, h: "30-45 min", rs: 200, src: "A" },
          { what: { en: "Poorva Express 12304, 3AC (or Vande Bharat 22348, 4 h 06)", hn: "Poorva Express 12304, 3AC (ya Vande Bharat 22348, 4 h 06)" }, h: "4-7 h", rs: 620, src: "S", ref: "erail" },
          { what: { en: "Station to campus", hn: "Station se campus" }, h: "-", rs: 100, src: "A" }
        ],
        Patna: [
          { what: { en: "Local cab to campus", hn: "Campus tak local cab" }, h: "~45 min", rs: 200, src: "A" }
        ]
      }
    }
  },

  // Source sheet entries. file = where in the vault (or repo) the number lives; url = the page it came from.
  sources: {
    nirf:   { en: "NIRF 2025, 3-year mean of the median UG salary", file: "_project_data/06_analysis/nirf_median_salary.csv" },
    josaa:  { en: "JoSAA 2025, final round, OPEN, CSE (4-year B.Tech)", file: "_project_data/01_josaa/josaa_final_2016_2025.csv.gz" },
    wage:   { en: "Bihar general farm labour, men, ₹378.93 a day, Feb 2025 (Labour Bureau, via CEIC)", file: "107 §3b, three-families parameter table" },
    model:  { en: "Model v2: three Bihar families, multinomial logit (H = 3, σ = 16, τ = 4, b = 1, μ = 3: all assumed; σ calibrated so the town family is on the fence)", file: "_project_data/06_analysis/model_v2_results.md; scripts/model_v2_bihar.py" },
    confirmtkt:      { en: "Saharsa to New Delhi, Vaishali Express 15565, 24 h, SL ₹605", url: "https://www.confirmtkt.com/hi/trains/saharsa-to-new-delhi-train-tickets" },
    goibibo_rr:      { en: "Rajya Rani 12567 Saharsa to Patna, 4 h 15, SL ₹180-220", url: "https://www.goibibo.com/trains/12567-detail/" },
    erail:           { en: "Patna to Durgapur, Poorva Express 12304, 6 h 59, SL ₹230, 3A ₹620", url: "https://erail.in/trains-between-stations/patna-saheb-PNC/durgapur-DGR" },
    rome2rio_narela: { en: "Narela Terminal to New Delhi station, 29.8 km, taxi ₹550-700 (proxy for NIT Delhi)", url: "https://www.rome2rio.com/s/Narela-Terminal/New-Delhi-Station-Gate-2" },
    ixigo_bgs:       { en: "Begusarai to New Delhi, Seemanchal 12487, about 19 h 25, SL about ₹550", url: "https://www.ixigo.com/by-train-rail/begusarai-to-new-delhi-by-train" },
    rome2rio_bgs:    { en: "Begusarai to Patna by train, 2 h 23", url: "https://www.rome2rio.com/s/Patna/Begusarai" },
    ixigo_air:       { en: "Patna to Delhi flights, ₹5,058 to ₹7,677 seen; cheapest on route ₹6,273", url: "https://www.ixigo.com/Patna-New_Delhi-IndiGo-6E-flights" },
    rome2rio_t3:     { en: "Delhi airport T3 to Narela, 48.5 km, taxi ₹515-744", url: "https://www.rome2rio.com/s/Narela/IGI-Airport-Terminal-3" },
    journeys:        { en: "Door-to-door journeys, three Bihar homes (aggregator snapshots, 19 Nov 2026; local legs assumed)", file: "_project_data/10_research/bihar_journeys.md" }
  },

  // option names and one-line meanings
  opt: {
    NEAR:     { name: { en: "Both stay", hn: "Dono yahin" }, line: { en: "Both at NIT Patna", hn: "Dono NIT Patna mein" } },
    TOGETHER: { name: { en: "Together", hn: "Dono saath" }, line: { en: "Both at NIT Durgapur: she takes his college", hn: "Dono NIT Durgapur: woh bhai ka college leti hai" } },
    SPLIT:    { name: { en: "Best seats", hn: "Apni-apni best seat" }, line: { en: "He goes to Durgapur, she goes to Delhi", hn: "Woh Durgapur, woh Delhi" } },
    SON_ONLY: { name: { en: "Only he goes", hn: "Sirf beta jaata hai" }, line: { en: "He goes to Durgapur, she stays at NIT Patna", hn: "Beta Durgapur, beti NIT Patna" } }
  },

  // UI text. {her} {him} {papa} {mummy} {home} are filled per family.
  t: {
    title: { en: "Itni Door? Real Life", hn: "Itni Door? Real Life" },
    tagline: { en: "Twins from Bihar. Same JEE rank. She has the better seat. Who goes where?", hn: "Bihar ke twins. Same JEE rank. Behen ki seat behtar hai. Kaun kahan jaayega?" },
    how: { en: "4 decisions · about 4 minutes · every number has a source", hn: "4 faisle · lagbhag 4 minute · har number ka source hai" },
    pick_family: { en: "Pick a family", hn: "Family chuno" },
    lang_en: { en: "English", hn: "English" }, lang_hn: { en: "Hinglish", hn: "Hinglish" },
    full_game: { en: "Full game (about 12 min)", hn: "Poora game (lagbhag 12 min)" },
    start: { en: "Start", hn: "Shuru karo" },
    next: { en: "Next", hn: "Aage" },
    back: { en: "Back", hn: "Peeche" },
    restart: { en: "Play again", hn: "Phir se khelo" },
    other_family: { en: "Another family", hn: "Doosri family" },
    decision_n: { en: "Decision {n} of 4", hn: "Faisla {n} / 4" },
    know_more: { en: "Know more", hn: "Aur jaano" },
    source: { en: "Source", hn: "Source" },
    sources_title: { en: "Where these numbers come from", hn: "Yeh number kahan se aaye" },
    close: { en: "Close", hn: "Band karo" },
    assumed: { en: "assumed", hn: "assumed" },
    sourced: { en: "sourced", hn: "sourced" },
    dramatised: { en: "dramatised", hn: "dramatised" },
    you_picked: { en: "You picked", hn: "Tumne chuna" },

    // live bar
    bar_title: { en: "Out of 100 families like this", hn: "Aisi 100 families mein se" },
    bar_counting: { en: "Counting so far:", hn: "Abhi tak gina:" },
    term1: { en: "pay", hn: "salary" },
    term2: { en: "+ fares and escort", hn: "+ kiraya aur saath jaana" },
    term3: { en: "+ worry", hn: "+ fikr" },
    term4: { en: "+ log kya kahenge", hn: "+ log kya kahenge" },
    bar_delhi: { en: "{her} at NIT Delhi: {x} of 100", hn: "{her} NIT Delhi mein: 100 mein {x}" },
    bar_moved: { en: "was {x}", hn: "pehle {x}" },

    // lanes
    lane_rank: { en: "JEE Main rank 8,000", hn: "JEE Main rank 8,000" },
    lane_now: { en: "Now:", hn: "Abhi:" },

    // D1 the seat
    d1_title: { en: "The seat", hn: "Seat" },
    d1_lead: { en: "JoSAA, final round. {her} and {him} both have rank 8,000 and want CSE.", hn: "JoSAA, final round. {her} aur {him} dono ki rank 8,000, dono ko CSE chahiye." },
    d1_twist: { en: "The women-only pool closes later. {her} can take NIT Delhi. {him} cannot.", hn: "Women-only pool der se band hota hai. {her} ko NIT Delhi mil sakta hai. {him} ko nahi." },
    d1_col_college: { en: "CSE at", hn: "CSE" },
    d1_col_pay: { en: "Median pay", hn: "Median salary" },
    d1_col_him: { en: "{him}", hn: "{him}" },
    d1_col_her: { en: "{her}", hn: "{her}" },
    d1_closes: { en: "closes {r}", hn: "band {r}" },
    d1_q: { en: "What does {her} lock first?", hn: "{her} sabse pehle kya lock kare?" },
    d1_him_note: { en: "{him} locks NIT Durgapur, his best seat. Nobody asks him twice.", hn: "{him} NIT Durgapur lock karta hai, uski best seat. Usse koi do baar nahi poochta." },
    d1_react: { en: "If only pay counted, {x} of 100 families like yours would send {her} to Delhi.", hn: "Agar sirf salary gini jaaye, to aisi 100 mein se {x} families {her} ko Delhi bhejengi." },
    lakh_yr: { en: "₹{x} lakh a year", hn: "₹{x} lakh saal" },
    choice_delhi: { en: "NIT Delhi, her best seat", hn: "NIT Delhi, uski best seat" },
    choice_durg: { en: "NIT Durgapur, with {him}", hn: "NIT Durgapur, {him} ke saath" },
    choice_patna: { en: "NIT Patna, close to home", hn: "NIT Patna, ghar ke paas" },

    // D2 the journey
    d2_title: { en: "The journey", hn: "Safar" },
    d2_lead: { en: "Door to door, one way, per person. {him} goes alone. A parent goes with {her}: there and back.", hn: "Ghar se campus, ek taraf, ek insaan. {him} akela jaata hai. {her} ke saath ek parent jaata hai: jaana bhi, aana bhi." },
    d2_his: { en: "{him} to NIT Durgapur", hn: "{him}: NIT Durgapur" },
    d2_hers: { en: "{her} to {college}", hn: "{her}: {college}" },
    d2_total: { en: "{h} h door to door · ₹{rs}", hn: "{h} ghante ghar se campus · ₹{rs}" },
    d2_escort: { en: "Escort: {papa} loses {dd} a trip × {wage}, plus his own ticket both ways. {j} escorted trips in 4 years.", hn: "Saath jaana: {papa} ke har trip pe {d} din × {wage}, upar se unka apna ticket aana-jaana. 4 saal mein {j} trip." },
    d2_escort_air: { en: "By air, a parent only drops her at the start and picks her up once more (assumed): {j} escorted trips.", hn: "Flight se parent bas pehli baar chhodne aur ek baar lene jaata hai (assumed): {j} trip." },
    d2_escort_none: { en: "{him} is at the same college. He is her escort: ₹0.", hn: "{him} usi college mein hai. Wahi saath jaayega: ₹0." },
    d2_escort_local: { en: "Close to home: no escort needed.", hn: "Ghar ke paas: kisi ko saath jaane ki zaroorat nahi." },
    d2_bill: { en: "This plan's whole travel bill for both, 4 years: ₹{rs}", hn: "Is plan ka 4 saal ka poora safar kharcha, dono ka: ₹{rs}" },
    d2_q: { en: "The bill is on the table. What does the family do?", hn: "Bill saamne hai. Family kya kare?" },
    d2_keep: { en: "Pay it, keep {college}", hn: "Bharo, {college} rakho" },
    d2_together: { en: "\"Dono saath jaoge\": both to Durgapur", hn: "\"Dono saath jaoge\": dono Durgapur" },
    d2_react: { en: "Delhi pays ₹6.4 lakh a year more than NIT Patna. The far plan's whole 4-year travel bill is ₹{bill}. The bar hardly moves: money is not what stops her.", hn: "Delhi ki salary NIT Patna se ₹6.4 lakh saal zyada hai. Door wale plan ka 4 saal ka safar kharcha ₹{bill}. Bar mushkil se hila: paisa rok nahi raha." },

    // D3 worry
    d3_title: { en: "\"Agar kuch hua to?\"", hn: "\"Agar kuch hua to?\"" },
    d3_lead: { en: "{mummy}: \"If something happens, how long will it take us to reach her?\"", hn: "{mummy}: \"Agar kuch hua to pahunchne mein kitna time lagega?\"" },
    d3_reach: { en: "Time to reach her: {h} hours", hn: "Usse pahunchne ka time: {h} ghante" },
    d3_calls: { en: "{mummy} wants a call at every station.", hn: "{mummy} ko har station pe phone chahiye." },
    d3_calls_n: { en: "{n} calls on one trip (one every 2 hours, dramatised)", hn: "Ek trip mein {n} phone (har 2 ghante, dramatised)" },
    d3_him: { en: "{him}'s trip: nobody asks him to call.", hn: "{him} ka trip: usse koi phone karne ko nahi kehta." },
    d3_known: { en: "Girls the family knows who went this far: {n} (assumed)", hn: "Family jaanti hai aisi ladkiyan jo itni door gayi: {n} (assumed)" },
    d3_q: { en: "What settles {mummy}?", hn: "{mummy} ko kya tasalli de?" },
    d3_stay: { en: "Keep {college}. She calls at every station.", hn: "{college} rakho. Woh har station pe phone karegi." },
    d3_bro: { en: "{him} will be there: both to Durgapur", hn: "{him} wahan hoga: dono Durgapur" },
    d3_near: { en: "NIT Patna: {h} hours away", hn: "NIT Patna: {h} ghante door" },
    d3_react: { en: "Worry grows with the hours it takes to reach her, and falls when someone the family trusts is there. Now the bar moves.", hn: "Fikr utni badhti hai jitne ghante usse pahunchne mein lagte hain, aur ghat-ti hai jab koi bharose wala wahan ho. Ab bar hila." },

    // D4 log kya kahenge + the family decides
    d4_title: { en: "Log kya kahenge", hn: "Log kya kahenge" },
    d4_line: { en: "A relative at the wedding: \"Itni door akeli? Ladki hai.\" (dramatised)", hn: "Shaadi mein ek rishtedaar: \"Itni door akeli? Ladki hai.\" (dramatised)" },
    d4_him: { en: "About {him}: \"Delhi, Durgapur, wherever. Ladka hai.\" (dramatised)", hn: "{him} ke baare mein: \"Delhi, Durgapur, kahin bhi. Ladka hai.\" (dramatised)" },
    d4_note: { en: "This cost stays even when {him} is there: the brother calms the worry, not the neighbours.", hn: "Yeh kharcha {him} ke wahan hone pe bhi rehta hai: bhai fikr kam karta hai, padosi nahi." },
    d4_react: { en: "Add \"log kya kahenge\": {her} at NIT Delhi falls to {x} of 100. These are the model's numbers now.", hn: "\"Log kya kahenge\" jodo: {her} NIT Delhi mein 100 mein {x} reh gayi. Ab yeh model ke poore number hain." },
    d4_q: { en: "The family decides. Which plan?", hn: "Family faisla karti hai. Kaunsa plan?" },

    // result
    res_title: { en: "100 families like yours", hn: "Tumhari jaisi 100 families" },
    res_you: { en: "Your family: {plan}. Out of 100 families like yours, {x} did the same.", hn: "Tumhari family: {plan}. Aisi 100 mein se {x} ne yahi kiya." },
    res_most: { en: "Most common: {plan}, {x} of 100.", hn: "Sabse zyada: {plan}, 100 mein {x}." },
    res_legend: { en: "Each dot is one family.", hn: "Har dot ek family." },

    // ending
    end_head: { en: "Same rank. She had the better seat.", hn: "Same rank. Seat uski behtar thi." },
    end_him: { en: "{him} gets his best seat", hn: "{him} ko uski best seat" },
    end_her: { en: "{her} gets her best seat", hn: "{her} ko uski best seat" },
    end_of100: { en: "in {x} of 100 families", hn: "100 mein {x} families mein" },
    end_why: { en: "No one in these families dislikes daughters. Each cost on its own sounded reasonable; only {her} paid them.", hn: "In families mein koi beti se nafrat nahi karta. Har kharcha akele theek lagta tha; bharna sirf {her} ko pada." },
    end_why_city: { en: "Here the airport does the work: Delhi is under 6 hours door to door, so the worry stays small. Same model, a different family.", hn: "Yahan airport kaam karta hai: Delhi 6 ghante se kam door hai, to fikr chhoti rehti hai. Wahi model, alag family." },
    end_eq_label: { en: "The whole model in one line", hn: "Poora model ek line mein" },
    end_eq_words: { en: "value of the two seats − fares and escort days − worry × hours to reach her", hn: "do seaton ki value − kiraya aur saath jaane ke din − fikr × usse pahunchne ke ghante" },
    end_other: { en: "Other families: Delhi for the daughter in {v} (village), {t} (town), {c} (city) of 100.", hn: "Baaki families: beti ko Delhi 100 mein {v} (gaon), {t} (town), {c} (city)." },
    fix_title: { en: "Try a fix: what gets {her} to Delhi?", hn: "Ek fix try karo: {her} Delhi kaise pahunche?" },
    fix_fares: { en: "Pay the escort's fares", hn: "Saath jaane wale ka kiraya do" },
    fix_credit: { en: "Cheap education loan", hn: "Sasta education loan" },
    fix_senior: { en: "A senior girl from her district at NIT Delhi", hn: "Uske zile ki ek senior ladki NIT Delhi mein" },
    fix_hostel: { en: "Guaranteed first-year hostel", hn: "Pehle saal hostel pakka" },
    fix_result: { en: "{her} at NIT Delhi: {x} of 100 (was {y})", hn: "{her} NIT Delhi mein: 100 mein {x} (pehle {y})" },
    fix_moral: { en: "Money moves it a little. Information moves it a lot.", hn: "Paisa thoda hilata hai. Jaankari bahut." },
    fix_caveat: { en: "Illustrative model, calibrated; worry sizes assumed.", hn: "Illustrative model, calibrated; fikr ke size assumed." }
  }
};
