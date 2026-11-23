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
