"""Generate project and resource illustrations in the site's 600×360 visual frame."""

from html import escape
from pathlib import Path


OUT = Path(__file__).resolve().parents[1] / "assets" / "projects"
THEMES = {
    "dark": {
        "bg1": "#0c1425", "bg2": "#20213b", "panel": "#152238",
        "sub": "#1b2c45", "soft": "#213550", "stroke": "#4b607c",
        "text": "#eff5ff", "muted": "#9caec8", "grid": "#ffffff",
        "shadow": ".36", "glow": ".17",
    },
    "light": {
        "bg1": "#eaf5f6", "bg2": "#eae9f8", "panel": "#ffffff",
        "sub": "#f2f7fb", "soft": "#e6f1f5", "stroke": "#b7ccd9",
        "text": "#1e344d", "muted": "#60798f", "grid": "#2e627c",
        "shadow": ".10", "glow": ".12",
    },
}
ACCENTS = {
    "codex": (("#5de4c7", "#a78bfa"), ("#167c74", "#7555b9")),
    "markdown": (("#a78bfa", "#59d4e7"), ("#7555b9", "#147e96")),
    "shit-code": (("#f2bc65", "#a78bfa"), ("#a45e19", "#7555b9")),
    "3820": (("#5de4c7", "#59d4e7"), ("#167c74", "#147e96")),
    "ta": (("#a78bfa", "#5de4c7"), ("#7555b9", "#167c74")),
    "salary": (("#5de4c7", "#f2bc65"), ("#167c74", "#a45e19")),
    "guides": (("#f2bc65", "#5de4c7"), ("#a45e19", "#167c74")),
    "documents": (("#a78bfa", "#59d4e7"), ("#7555b9", "#147e96")),
}


def rect(x, y, w, h, fill, rx=8, stroke=None, opacity=None):
    extra = f' stroke="{stroke}"' if stroke else ""
    extra += f' opacity="{opacity}"' if opacity else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}"{extra}/>'


def line(x1, y1, x2, y2, color, width=2, opacity=None, dash=None):
    extra = f' opacity="{opacity}"' if opacity else ""
    extra += f' stroke-dasharray="{dash}"' if dash else ""
    return f'<path d="M{x1} {y1}L{x2} {y2}" fill="none" stroke="{color}" stroke-width="{width}" stroke-linecap="round"{extra}/>'


def text(x, y, value, color, size=12, weight=500, anchor=None, spacing=None):
    extra = f' text-anchor="{anchor}"' if anchor else ""
    extra += f' letter-spacing="{spacing}"' if spacing else ""
    return f'<text x="{x}" y="{y}" fill="{color}" font-family="monospace" font-size="{size}" font-weight="{weight}"{extra}>{escape(value)}</text>'


def bars(x, y, widths, color, gap=16, height=6):
    return "\n".join(rect(x, y + i * gap, w, height, color, rx=3) for i, w in enumerate(widths))


def scene_codex(p, a, b):
    parts = [
        text(73, 120, "TWO WINDOWS / LIVE", p["muted"], 10, 700, spacing=1),
        '<circle cx="164" cy="201" r="64" fill="none" stroke="' + p["soft"] + '" stroke-width="15"/>',
        '<circle cx="164" cy="201" r="64" fill="none" stroke="' + a + '" stroke-width="15" stroke-dasharray="290 402" transform="rotate(-90 164 201)"/>',
        '<circle cx="164" cy="201" r="43" fill="none" stroke="' + p["soft"] + '" stroke-width="11"/>',
        '<circle cx="164" cy="201" r="43" fill="none" stroke="' + b + '" stroke-width="11" stroke-dasharray="146 270" transform="rotate(-90 164 201)"/>',
        text(164, 199, "5h", p["text"], 26, 800, anchor="middle"),
        text(164, 218, "7d", p["muted"], 11, 700, anchor="middle"),
    ]
    for y, title, amount, color, width in [(130, "FIVE HOURS", "72% LEFT", a, 158), (204, "SEVEN DAYS", "54% LEFT", b, 118)]:
        parts += [rect(285, y, 245, 64, p["sub"], stroke=p["stroke"]),
                  text(303, y + 21, title, p["muted"], 10, 700, spacing=1),
                  text(512, y + 21, amount, color, 11, 700, anchor="end"),
                  rect(303, y + 36, 209, 8, p["soft"], rx=4),
                  rect(303, y + 36, width, 8, color, rx=4)]
    parts.append(text(74, 293, "STATUS BAR  /  EXPLORER", p["muted"], 10, 700, spacing=1))
    return "\n".join(parts)


def scene_markdown(p, a, b):
    parts = [
        text(73, 120, "EDIT", p["muted"], 10, 700, spacing=1),
        text(319, 120, "PREVIEW", p["muted"], 10, 700, spacing=1),
        line(299, 112, 299, 283, p["stroke"], 1, ".65"),
        rect(75, 137, 202, 137, p["sub"], stroke=p["stroke"]),
        text(93, 162, "# Project notes", a, 13, 800),
        text(93, 188, "- write", p["muted"], 12),
        text(93, 210, "- preview", p["muted"], 12),
        text(93, 232, "- export PDF", p["muted"], 12),
        rect(318, 137, 207, 137, p["sub"], stroke=p["stroke"]),
        text(335, 167, "Project notes", p["text"], 16, 800),
        line(335, 177, 501, 177, p["stroke"], 1),
    ]
    for i, label in enumerate(("write", "preview", "export PDF")):
        y = 202 + i * 21
        parts += [rect(336, y - 8, 7, 7, b, rx=2), text(352, y, label, p["muted"], 11)]
    parts += [rect(432, 279, 93, 22, a, rx=11, opacity=".15"),
              text(478, 294, "PDF READY", a, 10, 700, anchor="middle")]
    return "\n".join(parts)


def scene_shit_code(p, a, b):
    parts = [
        text(74, 123, "STYLE SCORE / 0–9", p["muted"], 10, 700, spacing=1),
        '<circle cx="167" cy="201" r="67" fill="none" stroke="' + p["soft"] + '" stroke-width="15"/>',
        '<circle cx="167" cy="201" r="67" fill="none" stroke="' + a + '" stroke-width="15" stroke-dasharray="150 421" transform="rotate(-90 167 201)"/>',
        text(167, 208, "3.2", p["text"], 42, 800, anchor="middle"),
        text(167, 231, "TRACEABLE", p["muted"], 10, 700, anchor="middle", spacing=1),
        text(285, 123, "ISSUES / REVIEW", p["muted"], 10, 700, spacing=1),
    ]
    for y, label, color, width in [(135, "COMPLEXITY", a, 100), (182, "REPETITION", b, 74), (229, "STYLE", a, 135)]:
        parts += [rect(285, y, 242, 38, p["sub"], stroke=p["stroke"]),
                  rect(297, y + 12, 12, 12, color, rx=4, opacity=".7"),
                  text(321, y + 24, label, p["text"], 10, 700),
                  rect(446, y + 16, 70, 6, p["soft"], rx=3),
                  rect(446, y + 16, min(width * .45, 64), 6, color, rx=3)]
    parts += [text(74, 292, "WORKSPACE  ·  FILE  ·  GIT", p["muted"], 10, 700, spacing=1),
              text(524, 292, "AI / OPTIONAL", b, 10, 700, anchor="end")]
    return "\n".join(parts)


def scene_3820(p, a, b):
    parts = [
        text(76, 121, "FUZHOU / 1992—2010", p["muted"], 10, 700, spacing=1),
        rect(75, 137, 278, 137, p["sub"], stroke=p["stroke"]),
        line(98, 239, 326, 239, p["stroke"], 2),
        text(98, 260, "1992", p["muted"], 10, 700),
        text(326, 260, "2010", p["muted"], 10, 700, anchor="end"),
    ]
    for x, h, color in [(106, 42, a), (149, 64, b), (192, 86, a), (235, 76, b), (278, 103, a)]:
        parts += [rect(x, 238 - h, 24, h, color, rx=5, opacity=".7")]
    parts += [rect(370, 137, 156, 137, p["sub"], stroke=p["stroke"]),
              text(388, 162, "SOURCED Q&A", a, 11, 800),
              bars(388, 180, [113, 91, 119, 68], p["stroke"], gap=18),
              rect(388, 250, 76, 15, b, rx=7, opacity=".18"),
              text(426, 261, "MAP / DATA", b, 8, 700, anchor="middle"),
              text(75, 294, "STRATEGY  /  INDICATORS  /  SOURCES", p["muted"], 10, 700, spacing=1)]
    return "\n".join(parts)


def scene_ta(p, a, b):
    parts = [text(75, 122, "TEXTBOOK LIBRARY", p["muted"], 10, 700, spacing=1)]
    for x, color, code in [(75, a, "01"), (129, b, "02"), (183, a, "03")]:
        parts += [rect(x, 145, 45, 116, p["sub"], rx=7, stroke=p["stroke"]),
                  rect(x + 4, 149, 4, 108, color, rx=2),
                  text(x + 22, 189, code, color, 14, 800, anchor="middle"),
                  line(x + 15, 211, x + 33, 211, p["stroke"], 2)]
    parts += [text(75, 289, "113 BOOKS / SEARCH", p["muted"], 10, 700, spacing=1),
              rect(269, 125, 256, 151, p["sub"], stroke=p["stroke"]),
              text(286, 149, "QUESTION → ANSWER", b, 10, 800),
              bars(286, 166, [198, 174, 188], p["stroke"], gap=18),
              rect(286, 226, 92, 23, a, rx=11, opacity=".18"),
              text(332, 242, "BOOK / P.42", a, 9, 700, anchor="middle"),
              rect(389, 226, 116, 23, b, rx=11, opacity=".16"),
              text(447, 242, "PDF / P.45", b, 9, 700, anchor="middle")]
    return "\n".join(parts)


def scene_salary(p, a, b):
    parts = [
        text(74, 121, "ATTENDANCE / VALIDATION", p["muted"], 10, 700, spacing=1),
        rect(74, 137, 287, 139, p["sub"], stroke=p["stroke"]),
        text(90, 159, "CLASS", p["muted"], 10, 700),
        text(237, 159, "SESSIONS", p["muted"], 10, 700, anchor="end"),
        text(340, 159, "OK", a, 10, 700, anchor="end"),
    ]
    for y, label, sessions in [(186, "A-01", "16"), (214, "A-02", "18"), (242, "A-03", "17")]:
        parts += [line(90, y - 16, 344, y - 16, p["stroke"], 1, ".55"),
                  text(90, y, label, p["text"], 11, 700),
                  text(237, y, sessions, p["muted"], 11, 700, anchor="end"),
                  text(340, y, "✓", a, 14, 800, anchor="end")]
    parts += [rect(379, 137, 147, 139, p["sub"], stroke=p["stroke"]),
              text(395, 161, "PAYROLL", p["muted"], 10, 700),
              text(395, 212, "Σ 51", a, 29, 800),
              text(395, 236, "SESSIONS", p["muted"], 10, 700),
              rect(395, 247, 115, 17, b, rx=8, opacity=".18"),
              text(452, 259, "EXPORT XLSX", b, 9, 700, anchor="middle"),
              text(75, 294, "IMPORT  →  CHECK  →  EXPORT", p["muted"], 10, 700, spacing=1)]
    return "\n".join(parts)


def scene_guides(p, a, b):
    parts = [text(74, 120, "START HERE / TOOLKIT", p["muted"], 10, 700, spacing=1)]
    for x, label, name, color in [(70, "01 / WRITE", "Markdown", a),
                                  (226, "02 / VERSION", "Git", b),
                                  (382, "03 / BUILD", "WSL", a)]:
        parts += [rect(x, 135, 148, 141, p["sub"], stroke=p["stroke"]),
                  rect(x + 1, 135, 146, 3, color, rx=1),
                  text(x + 12, 159, label, p["muted"], 9, 700),
                  text(x + 12, 257, name, p["text"], 13, 800)]
    parts += [text(144, 226, "#", a, 55, 800, anchor="middle"),
              rect(246, 173, 106, 60, p["soft"], rx=9),
              '<path d="M276 185v31c0 7 6 11 13 11h28M276 201c0 7 6 11 13 11h28" fill="none" stroke="' + b + '" stroke-width="3" stroke-linecap="round"/>',
              '<circle cx="276" cy="185" r="5" fill="' + p["sub"] + '" stroke="' + b + '" stroke-width="3"/>',
              '<circle cx="317" cy="212" r="5" fill="' + p["sub"] + '" stroke="' + b + '" stroke-width="3"/>',
              '<circle cx="317" cy="227" r="5" fill="' + p["sub"] + '" stroke="' + b + '" stroke-width="3"/>',
              rect(402, 173, 106, 60, p["soft"], rx=9),
              text(455, 214, ">_", b, 30, 800, anchor="middle"),
              text(74, 295, "READ  /  PRACTICE  /  REFERENCE", p["muted"], 10, 700, spacing=1)]
    return "\n".join(parts)


def scene_documents(p, a, b):
    parts = [
        text(75, 121, "OPEN ARCHIVE / MATERIALS", p["muted"], 10, 700, spacing=1),
        rect(74, 137, 208, 139, p["sub"], stroke=p["stroke"]),
    ]
    for y, label, color in [(163, "PRESENTATIONS", a), (200, "POSTERS", b),
                            (237, "RESEARCH NOTES", a)]:
        parts += [rect(89, y - 16, 178, 31, p["soft"], rx=7),
                  rect(99, y - 8, 9, 14, color, rx=2),
                  text(120, y + 3, label, p["text"], 10, 700)]
    parts += [rect(299, 127, 226, 156, p["sub"], stroke=p["stroke"]),
              rect(319, 144, 186, 121, p["panel"], rx=8, stroke=p["stroke"]),
              rect(335, 161, 55, 6, a, rx=3),
              text(335, 189, "REFERENCE FILE", p["text"], 14, 800),
              bars(335, 204, [151, 139, 122], p["stroke"], gap=17, height=5),
              rect(421, 246, 68, 15, b, rx=7, opacity=".17"),
              text(455, 257, "PDF / DOC", b, 8, 700, anchor="middle"),
              text(75, 296, "SLIDES  /  POSTERS  /  NOTES", p["muted"], 10, 700, spacing=1)]
    return "\n".join(parts)


SCENES = {
    "codex": ("Codex Quota Rings", "Quota rings and status cards for five-hour and seven-day windows.", "CODEX QUOTA RINGS", scene_codex),
    "markdown": ("Markdown Preview and Compiler", "A source editor beside rendered Markdown and a PDF export badge.", "MARKDOWN / PDF", scene_markdown),
    "shit-code": ("Shit Code Detector", "A 0–9 code style score beside traceable issue categories.", "SHIT CODE DETECTOR", scene_shit_code),
    "3820": ("3820 strategic analysis", "A strategic timeline with sourced question answering and data.", "3820 / STRATEGY", scene_3820),
    "ta": ("Zhiye TA Agent", "A textbook library beside answers with page references.", "ZHIYE TA AGENT", scene_ta),
    "salary": ("Teacher attendance and payroll", "Validated attendance rows beside a payroll export card.", "ATTENDANCE / PAYROLL", scene_salary),
    "guides": ("Beginner computing guides", "Illustrated cards for Markdown, Git, and WSL beginner guides.", "BEGINNER GUIDES", scene_guides),
    "documents": ("Open materials archive", "Presentation slides, posters, and research notes beside a document preview.", "DOCUMENTS / ARCHIVE", scene_documents),
}


def make_svg(name, theme):
    p = THEMES[theme]
    a, b = ACCENTS[name][0 if theme == "dark" else 1]
    title, desc, header, scene = SCENES[name]
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" role="img" aria-labelledby="title desc">
  <title id="title">{escape(title)}</title>
  <desc id="desc">{escape(desc)}</desc>
  <defs>
    <linearGradient id="bg" x2="1" y2="1"><stop stop-color="{p['bg1']}"/><stop offset="1" stop-color="{p['bg2']}"/></linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1"><stop stop-color="{a}"/><stop offset="1" stop-color="{b}"/></linearGradient>
    <radialGradient id="glow"><stop stop-color="{a}" stop-opacity="{p['glow']}"/><stop offset="1" stop-color="{a}" stop-opacity="0"/></radialGradient>
    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="{p['grid']}" stroke-opacity=".06"/></pattern>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="10" stdDeviation="13" flood-color="{p['bg1']}" flood-opacity="{p['shadow']}"/></filter>
  </defs>
  <rect width="600" height="360" rx="24" fill="url(#bg)"/>
  <rect width="600" height="360" rx="24" fill="url(#grid)"/>
  <circle cx="494" cy="75" r="196" fill="url(#glow)"/>
  <path d="M25 0H575" stroke="url(#accent)" stroke-width="4" stroke-linecap="round"/>
  <g filter="url(#shadow)">{rect(43, 44, 514, 272, p['panel'], rx=21, stroke=p['stroke'])}</g>
  {line(43, 96, 557, 96, p['stroke'], 1, '.6')}
  {rect(67, 59, 24, 22, p['soft'], rx=6)}
  {text(79, 75, '◈', a, 14, 800, anchor='middle')}
  {text(104, 75, header, p['text'], 12, 800, spacing=1)}
  {line(474, 72, 527, 72, p['stroke'], 2)}
  <circle cx="535" cy="72" r="4" fill="{a}"/>
  {scene(p, a, b)}
</svg>'''


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for project in SCENES:
        for mode in THEMES:
            (OUT / f"{project}-visual-{mode}.svg").write_text(make_svg(project, mode) + "\n")
