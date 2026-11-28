---
name: Socratink
description: Warm cream paper, dark ink, and one drawing beside a short passage.
colors:
  paper: "#fffcf0"
  paper-2: "#f2f0e9"
  ui: "#e6e4d9"
  ui-2: "#dad8ce"
  tx: "#100f0f"
  tx-2: "#575653"
  tx-3: "#686762"
  accent: "#1f7a72"
  accent-ink: "#fffcf0"
  error: "#d14d41"
typography:
  display:
    fontFamily: "Newsreader, ui-serif, Georgia, serif"
    fontWeight: 400
    lineHeight: 1.08
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 400
---

# Socratink landing page

The landing page should feel like an illustrated book. In the map chapter,
the tree stands alone on the same cream paper as the words. Leave room around
its branches so the reader can see the shape of each stroke.

## Paper, ink, and type

Keep the sheets flat and warm cream. Set headings in carbon ink and supporting
text in graphite. Where two sheets meet, use a single hairline at 10% ink.
Let the ink drawing meet the paper without a frame or a shadow around it.

Use Newsreader at regular weight for the title and chapter headings. Keep a
heading in one face across its line breaks. Use Inter for the paragraphs,
links, and controls. Keep the lines short, up to 42ch in the opening paragraph
and 34ch in the chapters.

Use verdigris for the main action and keyboard focus. In dark mode, use
carbon paper (`#100f0f`), pale ink (`#cecdc3`), and the lighter verdigris
(`#3aa99f`). Use the ink drawing made for each background.

## The page

- Align the wordmark, headings, paragraphs, and leading edge of the main button.
  The shared column is at most 72rem wide, with 1rem side padding on phones
  and 2rem from 640px up. The header holds the wordmark and appearance control.
  On hover or keyboard focus, the name changes to its pronunciation while
  the ink dot stays in place.
- Pair the opening invitation with the living ink sphere. Each chapter that
  follows has one heading, one short paragraph, and one ink study. The studies
  illustrate the ideas. Claims about a learner belong to their work in the app.
- On desktop, align chapter artwork to the right edge of the column. On phones,
  center it below the words. Each phone chapter fills at least 65% of the screen
  height and grows with its contents. Let the next heading come into view when
  there is room.
- Close with the same invitation, the three small ink marks, and a fine rule
  above the footer. Align the last legal link with the right margin on desktop.
  On phones, start the links at the left margin, clear of the browser controls.

## Actions and motion

The opening and closing **Start learning** links use a flat verdigris fill
36px high inside a 44px touch target. The outward arrow sits beside the label.
Set “No account needed to start” in 13px graphite beneath the action.

**See how it works** sits beside the main action in graphite, with a down
arrow. On hover or keyboard focus, underline the words only. Give controls
a 44px touch target and a visible keyboard focus outline. The filled button
uses an ink outline separated from the fill by a thin band of paper.

Let the chapter ink draw as the reader scrolls. Show a finished ink study when
the reader requests reduced motion or the browser cannot render the animation.

The [page stylesheet](src/app/globals.css) owns the palette, type, shared
margins, and controls. The [chapter stylesheet](src/components/site/how-it-works/how-it-works.css)
sets the text and artwork side by side or in a single column.
For the learner’s writing space, see the [conversation design guide](https://github.com/jon-devlapaz/socratink/blob/main/DESIGN.md).
