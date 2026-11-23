-- Typst only: turn the site's styling classes into calls to the functions in typst-template.typ.
if not quarto.doc.is_format("typst") then return {} end

local divs = { takeaway = "takeaway", ["method-box"] = "methodbox", ["course-line"] = "courseline", ["quote-real"] = "quotereal" }
local spans = { peg = "peg", src = "src", ["tag-sourced"] = "tagsourced", ["tag-assumed"] = "tagassumed",
  ["tag-calibrated"] = "tagcalibrated", ["tag-ours"] = "tagours" }

function Span(el)
  for cls, fn in pairs(spans) do
    if el.classes:includes(cls) then
      local out = pandoc.List({ pandoc.RawInline("typst", "#" .. fn .. "[") })
      out:extend(el.content)
      out:insert(pandoc.RawInline("typst", "]"))
      return out
    end
  end
end

function Div(el)
  for cls, fn in pairs(divs) do
    if el.classes:includes(cls) then
      local out = pandoc.List({ pandoc.RawBlock("typst", "#" .. fn .. "[") })
      out:extend(el.content)
      out:insert(pandoc.RawBlock("typst", "]"))
      return out
    end
  end
end

-- Tables: let Typst size the columns to their content (pipe tables otherwise get equal widths, which squeezes
-- the text columns into tall cells), and set default-aligned columns flush left.
function Table(t)
  for i, c in ipairs(t.colspecs) do
    local align = c[1]
    if align == "AlignDefault" or align == pandoc.AlignDefault then align = pandoc.AlignLeft end
    t.colspecs[i] = { align, pandoc.ColWidthDefault }
  end
  return t
end
