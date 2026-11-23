// Inner pages: warm card paper, a running header (short title + current section) over the railway line,
// a footer with the page number as a rail ticket. No header on the cover, findings, contents or a section's first page.
#set page(
  paper: "a4",
  margin: (x: 2.2cm, top: 2.5cm, bottom: 2.3cm),
  fill: C.card,
  header-ascent: 35%,
  footer-descent: 35%,
  header: context {
    let p = here().page()
    if p <= 3 { return }
    let hs = query(heading.where(level: 1))
    if hs.any(h => h.location().page() == p) { return }
    let before = hs.filter(h => h.location().page() < p)
    let cur = if before.len() > 0 { before.last() } else { none }
    set text(size: 7.5pt, fill: C.ink-soft)
    grid(columns: (1fr, auto), align: (left + bottom, right + bottom),
      text(font: F.head, weight: 700, fill: C.ink, [Itni Door? #text(weight: 500, fill: C.ink-soft)[The distance discount]]),
      if cur != none {
        if cur.numbering != none { text(font: F.head, weight: 700, fill: C.sindoor, str(counter(heading).at(cur.location()).first()) + "  ") }
        plain(cur.body)
      })
    v(-3pt)
    rail(color: C.kraft-deep, tie: C.paper, gap: 6pt)
  },
  footer: context {
    let p = here().page()
    if p <= 1 { return }
    set text(size: 7.5pt, fill: C.ink-soft)
    grid(columns: (1fr, auto), align: (left + horizon, right + horizon),
      [ECO463 · Group 7 · Shiv Nadar University · November 2026],
      ticket(counter(page).display()))
  },
)
