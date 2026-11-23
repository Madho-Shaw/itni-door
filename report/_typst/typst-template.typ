// Itni Door? report PDF: the site's paper desk adapted for print (Quarto template partial).
// Palette = site/assets/tokens.css; fonts = site/assets/fonts converted to TTF in _typst/fonts.
// Cover art = eco463-media/video_v2/cover_art_report.html (the thumbnail without its title) at 2x.

#let C = (
  paper: rgb("#F3E9D7"), kraft: rgb("#E6D5B8"), kraft-deep: rgb("#D3BE9A"), card: rgb("#FBF6EC"),
  ink: rgb("#2B2118"), ink-soft: rgb("#5A4A3C"), hair-grey: rgb("#A39B91"),
  her: rgb("#2A7F7A"), her-ink: rgb("#1F6661"), her-soft: rgb("#CFE3DE"),
  him: rgb("#E3A92B"), him-soft: rgb("#F4E2B4"),
  sindoor: rgb("#C8372D"), sindoor-ink: rgb("#A62B22"), sindoor-soft: rgb("#F0CDC4"),
  data: rgb("#2F3E73"), data-soft: rgb("#D5D9E8"),
  yes-ink: rgb("#3A6136"), yes-soft: rgb("#D5E2CF"),
)
#let F = (head: ("Baloo 2", "Baloo Rupee"), body: ("Hind", "Baloo Rupee"), hand: ("Kalam", "Baloo Rupee"))

#let plain(c) = {
  if type(c) == str { c }
  else if c.has("text") { c.text }
  else if c.has("children") { c.children.map(plain).join("") }
  else if c.has("body") { plain(c.body) }
  else if c == [ ] { " " }
  else { "" }
}

// The railway line: two rails over sleepers. The site's motif for "how far".
#let rail(width: 100%, color: C.ink, tie: C.kraft-deep, gap: 7pt) = box(width: width, height: 9pt, layout(size => {
  let n = calc.floor(size.width / gap)
  for i in range(n) { place(dx: i * gap + 1.5pt, rect(width: 2.6pt, height: 9pt, fill: tie, stroke: none)) }
  place(dy: 2pt, line(length: 100%, stroke: 0.9pt + color))
  place(dy: 7pt, line(length: 100%, stroke: 0.9pt + color))
}))

// A rail ticket: the page number and small labels.
#let ticket(body, color: C.sindoor) = box(
  stroke: (paint: color, thickness: 0.8pt, dash: "solid"), inset: (x: 5pt, y: 2.5pt), radius: 1.5pt,
  text(font: F.head, weight: 700, size: 8pt, fill: color, body))

// Hooks from the Lua filter (report/_typst/print.lua), named after the site's classes.
#let takeaway(body) = block(width: 100%, breakable: false, above: 1.2em, below: 1.3em,
  stroke: (left: 3pt + C.sindoor), fill: C.paper, inset: (left: 12pt, right: 10pt, y: 9pt), {
    place(top + right, dx: 4pt, dy: -14pt, rotate(-3deg, box(fill: C.card, inset: (x: 4pt, y: 1pt),
      text(font: F.hand, weight: 700, size: 9pt, fill: C.sindoor-ink, "in short"))))
    set text(size: 10.5pt, fill: C.ink)
    set par(justify: false)
    body
  })
#let methodbox(body) = block(width: 100%, above: 1.2em, below: 1.2em, fill: C.paper, radius: 2pt,
  stroke: (paint: C.kraft-deep, thickness: 0.9pt, dash: "dashed"), inset: 10pt, {
    text(font: F.head, weight: 700, size: 8pt, fill: C.data, tracking: 1.2pt, "HOW WE DID IT")
    v(-2pt)
    set text(size: 9pt)
    body
  })
#let courseline(body) = block(width: 100%, inset: (y: 6pt), stroke: (y: 0.5pt + C.kraft-deep), {
  set text(size: 8.5pt, fill: C.ink-soft); set par(justify: false); body })
#let quotereal(body) = block(width: 100%, inset: (left: 14pt, y: 4pt), stroke: (left: 1.5pt + C.her), {
  set text(font: F.hand, size: 10pt, fill: C.her-ink); body })
#let peg(body) = box(fill: C.data-soft, inset: (x: 4pt, y: 2pt), outset: (y: 1pt), radius: 6pt,
  text(size: 7.5pt, weight: 500, fill: C.data, body))
#let src(body) = text(size: 0.82em, fill: C.data, [\[#body\]])
#let tag(body, fill, ink) = box(fill: fill, inset: (x: 3pt, y: 1pt), outset: (y: 1pt), radius: 1.5pt,
  text(size: 7pt, weight: 600, tracking: 0.4pt, fill: ink, upper(plain(body))))
#let tagsourced(body) = tag(body, C.yes-soft, C.yes-ink)
#let tagassumed(body) = tag(body, C.sindoor-soft, C.sindoor-ink)
#let tagcalibrated(body) = tag(body, C.him-soft, C.ink)
#let tagours(body) = tag(body, C.data-soft, C.data)

#let finding(chip, big, label, note, color: C.data) = block(width: 100%, height: 100%, fill: C.card, radius: 2pt,
  stroke: 0.8pt + C.kraft-deep, inset: 0pt, clip: true, {
    block(width: 100%, fill: C.paper, inset: (x: 12pt, y: 5pt), below: 0pt,
      text(font: F.head, weight: 700, size: 7.5pt, tracking: 1.2pt, fill: C.ink-soft, upper(chip)))
    block(inset: (x: 12pt, top: 8pt, bottom: 10pt), {
      text(font: F.head, weight: 800, size: 30pt, fill: color, big)
      v(-12pt)
      set par(justify: false, leading: 0.55em)
      text(size: 9.5pt, fill: C.ink, label)
      v(1pt)
      text(font: F.hand, size: 8.5pt, fill: C.ink-soft, note)
    })
  })

#let article(
  title: none, subtitle: none, authors: none, date: none, abstract: none, abstract-title: none,
  lang: "en", region: "IN", fontsize: 10pt, sectionnumbering: none,
  toc: false, toc_title: none, toc_depth: none, toc_indent: 1.5em,
  ..rest, doc,
) = {
  set document(title: plain(title))
  set document(author: authors.map(a => plain(a.name))) if authors != none
  set text(lang: lang, region: "IN", size: fontsize, font: F.body, fill: C.ink, hyphenate: true)
  set par(justify: true, leading: 0.68em, spacing: 0.95em)
  set heading(numbering: sectionnumbering)
  show link: set text(fill: C.data)
  show ref: set text(fill: C.data)
  show math.equation: set text(font: ("New Computer Modern Math",))
  set footnote.entry(separator: line(length: 25%, stroke: 0.5pt + C.kraft-deep))
  show footnote.entry: set text(size: 7.8pt, fill: C.ink-soft)
  show footnote.entry: set par(justify: false)
  set list(marker: text(fill: C.sindoor, "–"))
  set enum(numbering: n => text(font: F.head, weight: 700, fill: C.sindoor, str(n) + "."))
  show strong: set text(weight: 600)
  show "₹": set text(size: 0.9em)

  // Section openers: a big number, the railway line, the title. Numbered sections and the first appendix start a page.
  show heading.where(level: 1): it => {
    let t = plain(it.body)
    let numbered = it.numbering != none
    let newpage = (numbered and counter(heading).get().first() > 1) or t.starts-with("References") or t.starts-with("Appendix A")
    if newpage { pagebreak(weak: true) } else { v(1.2em) }
    block(width: 100%, below: 1.1em, sticky: true, {
      if numbered {
        let n = counter(heading).get().first()
        grid(columns: (auto, 1fr), column-gutter: 10pt, align: (bottom, bottom),
          text(font: F.head, weight: 800, size: 58pt, fill: C.sindoor, top-edge: "cap-height", bottom-edge: "baseline",
            if n < 10 { "0" + str(n) } else { str(n) }),
          { text(font: F.hand, weight: 700, size: 10pt, fill: C.ink-soft, "Section " + str(n)); v(-6pt); rail() })
        v(8pt)
      } else if newpage {
        rail(); v(6pt)
      }
      set par(justify: false, leading: 0.5em)
      text(font: F.head, weight: 800, size: if numbered { 24pt } else { 17pt }, fill: C.ink, it.body)
    })
  }
  show heading.where(level: 2): it => block(above: 1.5em, below: 0.65em, sticky: true, {
    set par(justify: false, leading: 0.5em)
    if it.numbering != none {
      text(font: F.head, weight: 700, size: 10pt, fill: C.sindoor, counter(heading).display())
      h(6pt)
    }
    text(font: F.head, weight: 700, size: 13pt, fill: C.data, it.body)
  })
  show heading.where(level: 3): it => block(above: 1.2em, below: 0.5em, sticky: true,
    text(font: F.body, weight: 600, size: 10.5pt, fill: C.ink, it.body))

  // Tables: ink rules top and under the head, a kraft zebra, small text.
  set table(stroke: none, inset: (x: 5pt, y: 4pt),
    fill: (x, y) => if y > 0 and calc.even(y) { C.paper } else { none })
  set table.hline(stroke: 0.9pt + C.ink)
  show table: it => block(stroke: (top: 1.4pt + C.ink, bottom: 0.9pt + C.ink), it)
  show table: set text(size: 8.3pt)
  show table: set par(justify: false, leading: 0.5em)
  show table.cell.where(y: 0): set text(font: F.head, weight: 700, size: 8.3pt, fill: C.ink)
  show figure: set block(above: 1.3em, below: 1.4em)
  show figure.where(kind: "quarto-float-tbl"): set figure.caption(position: top)
  show figure.caption: it => block(width: 100%, below: 4pt, {
    set align(left); set par(justify: false, leading: 0.5em)
    text(font: F.head, weight: 700, size: 9pt, fill: C.sindoor-ink, [#it.supplement #context it.counter.display(it.numbering)])
    h(5pt)
    text(size: 8.8pt, fill: C.ink-soft, it.body)
  })

  // ---- Cover ----
  page(margin: 0pt, fill: rgb("#EEE2CE"), header: none, footer: none, {  // the art's sky colour (paper under its grain)
    place(bottom, image("_typst/cover_art.jpg", width: 100%))
    // fade the art's sky into the paper, so there is no seam
    place(bottom, dy: -8.6cm, rect(width: 100%, height: 3.3cm, stroke: none,
      fill: gradient.linear(rgb("#EEE2CE"), rgb("#EEE2CE").transparentize(100%), angle: 90deg)))
    place(top + left, dx: 2.2cm, dy: 2.1cm, block(width: 16.6cm, {
      box(fill: C.ink, inset: (x: 6pt, y: 3pt), text(font: F.head, weight: 700, size: 8.5pt, tracking: 1.6pt, fill: C.card,
        "ECO463 · GROUP 7 · PROJECT REPORT"))
      v(0.6cm)
      { let t(c) = text(font: F.head, weight: 800, size: 72pt, fill: c, top-edge: "cap-height", bottom-edge: "baseline", "Itni Door?")
        box({ place(dx: 2.5pt, dy: 3pt, t(C.ink)); t(C.sindoor) }) }
      v(0.25cm)
      text(font: F.head, weight: 800, size: 26pt, fill: C.ink, "The distance discount")
      v(0.1cm)
      block(width: 12.5cm, { set par(justify: false, leading: 0.55em)
        text(size: 12.5pt, fill: C.ink-soft, if subtitle != none { subtitle }) })
      v(0.45cm)
      text(font: F.hand, size: 11pt, fill: C.ink, authors.map(a => a.name).join("  ·  "))
      v(0.2cm)
      box(width: 9cm, rail())
      v(0.1cm)
      text(size: 8.5pt, fill: C.ink-soft, [Shiv Nadar University · Gender in Economics and Business · #date])
    }))
  })

  // ---- Key findings ----
  page(header: none, {
    text(font: F.hand, weight: 700, size: 11pt, fill: C.sindoor-ink, "The report in four numbers")
    v(-8pt)
    text(font: F.head, weight: 800, size: 26pt, fill: C.ink, "Key findings")
    v(-4pt); rail(); v(10pt)
    grid(columns: (1fr, 1fr), rows: (4.9cm, 4.9cm), gutter: 10pt,
      finding("Census 2011", "9.3%", [lower odds that a person who moved to study is a woman, for each doubling of the distance of the move.],
        [Census 2011, pairs of Indian states. An association, not a cause.]),
      finding("Same score", "3.7 pts", [less likely to be admitted outside her home region: a woman against a man with the same entrance score.],
        [Maharashtra engineering admissions, 2023-25.]),
      finding("Our model", text(fill: C.sindoor)[23 · 44 · 98], [out of 100 families like each (village, town, Patna city) send the daughter to her best seat. Twins, same JEE rank.],
        [Our model, three Bihar families.], color: C.sindoor),
      finding("What would help", "3 vs 62", [in 100: how far paying the escort's fares, against a senior girl from her district or a hostel guarantee, moves Shalini's chance of NIT Delhi.],
        [Information beats money. The size rests on an assumed split of the worry; the ranking does not.], color: C.her-ink),
    )
    v(14pt)
    if abstract != none {
      text(font: F.head, weight: 700, size: 12pt, fill: C.data, "Summary")
      v(-4pt)
      set text(size: 9.6pt)
      abstract
    }
  })

  // ---- Contents ----
  page(header: none, {
    text(font: F.head, weight: 800, size: 26pt, fill: C.ink, "Contents")
    v(-4pt); rail(); v(12pt)
    show outline.entry.where(level: 1): it => {
      v(5pt)
      link(it.element.location(), grid(columns: (2.2em, 1fr, auto), align: (left, left, right),
        text(font: F.head, weight: 700, fill: C.sindoor, if it.prefix() != none { it.prefix() }),
        [#text(weight: 500, it.body()) #box(width: 1fr, repeat(text(fill: C.hair-grey, " . ")))],
        text(font: F.head, weight: 700, fill: C.data, it.page())))
    }
    outline(title: none, depth: 1, indent: 0pt)
  })
  metadata("front-matter-ends")

  doc

  // ---- Back cover ----
  page(fill: C.kraft, header: none, footer: none, margin: (x: 2.2cm, y: 2.4cm), {
    v(1fr)
    align(center, {
      text(font: F.hand, weight: 700, size: 12pt, fill: C.sindoor-ink, "the whole project, one scan away")
      v(-4pt)
      text(font: F.head, weight: 800, size: 30pt, fill: C.ink, "Itni Door?")
      v(10pt)
      box(fill: C.card, inset: 12pt, radius: 2pt, stroke: 1pt + C.ink, image("_typst/qr-site.svg", width: 4.4cm))
      v(10pt)
      text(font: F.head, weight: 700, size: 12pt, fill: C.data, "madho-shaw.github.io/itni-door")
      v(14pt)
      block(width: 12cm, { set par(justify: false); set text(size: 9.5pt, fill: C.ink-soft)
        [The video, the one-page model note, the game, the evidence room with every table and test, and our research diary.] })
    })
    v(1fr)
    rail(color: C.ink, tie: C.kraft-deep)
    v(8pt)
    set text(size: 8pt, fill: C.ink-soft)
    grid(columns: (1fr, auto),
      [#authors.map(a => a.name).join(" · ") \ ECO463 Gender in Economics and Business, Shiv Nadar University, Monsoon 2026],
      align(right, [#date]))
  })
}
