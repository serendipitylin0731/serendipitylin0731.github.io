#!/usr/bin/env python3
"""Generate the bilingual, theme-aware education and awards timeline."""
from html import escape
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / 'assets'
SCHOOLS = [
    (80, 250, 165, '温岭市城东小学', ['Wenling Chengdong', 'Primary School'], '2013.09 — 2019.06', 'https://www.baike.com/wikiid/2820791733395514682'),
    (280, 440, 360, '台州椒江北书学校', ['Taizhou Jiaojiang', 'Beishu School'], '2019.09 — 2022.06', 'https://www.beishu.xin/'),
    (480, 1080, 780, '台州市书生中学', ['Taizhou Sunson', 'Middle School'], '2022.09 — 2025.06', 'https://baike.baidu.com/item/%E5%8F%B0%E5%B7%9E%E5%B8%82%E4%B9%A6%E7%94%9F%E4%B8%AD%E5%AD%A6/5269059'),
]
AWARDS = [
    (560, '2023.09', ['全国中学生', '奥林匹克数学竞赛', '三等奖'], ['National High School', 'Math Olympiad', 'Third Prize']),
    (770, '2024.03', ['台州市数学、物理、', '信息学竞赛一等奖', '化学竞赛二等奖'], ['Taizhou competitions', 'Math, Physics, Informatics:', 'First Prizes', 'Chemistry: Second Prize']),
    (980, '2024.09', ['全国中学生', '物理竞赛', '三等奖'], ['National High School', 'Physics Competition', 'Third Prize']),
    (1190, '2025.11', ['全国大学生', '数学竞赛', '三等奖'], ['National College', 'Math Competition', 'Third Prize']),
    (1400, '2026.10', ['中国教育技术协会', '“AI+教育”', '创新应用技能大赛', '二等奖'], ['CAET “AI+Education”', 'Innovative Application', 'Skills Competition', 'Second Prize']),
    (1600, '2026.11', ['中国电信星辰杯', '高校 AI 算子开发', '挑战赛', '一等奖'], ['China Telecom Xingchen Cup', 'College AI Operator', 'Development Challenge', 'First Prize']),
]
ZH_DESC = '学校以连续线段表示在校时间：2013.09 至 2019.06 温岭市城东小学；2019.09 至 2022.06 台州椒江北书学校；2022.09 至 2025.06 台州市书生中学；2025.09 至今上海交通大学致远学院。获奖节点：2023.09 全国中学生奥林匹克数学竞赛三等奖；2024.03 台州市数学、物理、信息学竞赛一等奖及化学竞赛二等奖；2024.09 全国中学生物理竞赛三等奖；2025.11 全国大学生数学竞赛三等奖；2026.10 中国教育技术协会“AI+教育”创新应用技能大赛二等奖；2026.11 中国电信星辰杯高校AI算子开发挑战赛一等奖。'
EN_DESC = 'Education spans: Wenling Chengdong Primary School, 2013.09–2019.06; Taizhou Jiaojiang Beishu School, 2019.09–2022.06; Taizhou Sunson Middle School, 2022.09–2025.06; Zhiyuan College at Shanghai Jiao Tong University, 2025.09–present. Awards: National High School Math Olympiad third prize, 2023.09; Taizhou mathematics, physics and informatics first prizes and chemistry second prize, 2024.03; National High School Physics Competition third prize, 2024.09; National College Math Competition third prize, 2025.11; China Association for Educational Technology “AI+Education” Innovative Application Skills Competition second prize, 2026.10; China Telecom Xingchen Cup College AI Operator Development Challenge first prize, 2026.11.'


def render(lang, theme):
    light = theme == 'light'
    en = lang == 'en'
    c = dict(bg1='#f6f9fc', bg2='#eef0fa', grid='#536480', border='#d1dce9', green='#188a7a', purple='#745ac7', text='#1d2b43', muted='#50617b', line='#a6b4cb', card='#eeeafa') if light else dict(bg1='#101728', bg2='#1b1b33', grid='#ffffff', border='#465574', green='#5de4c7', purple='#a78bfa', text='#f3f6ff', muted='#b6c2d9', line='#4a5874', card='#22213e')
    card_fill = c['card'] if light else 'url(#award-card)'
    title = 'Education and competition awards timeline' if en else '学习经历与竞赛获奖时间轴'
    desc = EN_DESC if en else ZH_DESC
    items = [f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1700 565">
  <style>:root {{ color-scheme: only {theme}; }}</style>
  <title>{escape(title)}</title>
  <desc>{escape(desc)}</desc>
  <defs><linearGradient id="award-card"><stop offset="0" stop-color="{c['card']}"/><stop offset="1" stop-color="{c['card']}"/></linearGradient><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{c['bg1']}"/><stop offset="1" stop-color="{c['bg2']}"/></linearGradient><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="{c['grid']}" stroke-opacity=".045"/></pattern></defs>
  <rect x="1" y="1" width="1698" height="563" rx="24" fill="url(#bg)" stroke="{c['border']}"/>
  <rect x="1" y="1" width="1698" height="563" rx="24" fill="url(#grid)"/>
  <g font-family="Noto Sans CJK SC, PingFang SC, Microsoft YaHei, Inter, sans-serif">
    <text x="44" y="52" fill="{c['green']}" font-size="24" font-weight="700" letter-spacing="2">{'EDUCATION' if en else '学习经历'}</text>
    <text x="44" y="391" fill="{c['purple']}" font-size="24" font-weight="700" letter-spacing="2">{'AWARDS' if en else '竞赛获奖'}</text>
    <path d="M66 250H1665" stroke="{c['line']}" stroke-width="5" stroke-linecap="round" opacity=".6"/>''']
    for start, end, x, zh, english, dates, url in SCHOOLS:
        lines = english if en else [zh]
        size = 18 if en else 22
        ys = [145, 174] if en else [172]
        text = ''.join(f'<text x="{x}" y="{y}" text-anchor="middle" fill="{c["green"]}" font-size="{size}" font-weight="700" text-decoration="underline">{escape(line)}</text>' for y, line in zip(ys, lines))
        items.append(f'''    <a href="{escape(url, quote=True)}" target="_blank" rel="noopener noreferrer" style="cursor:pointer">{text}</a>
    <text x="{x}" y="208" text-anchor="middle" fill="{c['muted']}" font-size="17" font-weight="600">{dates}</text>
    <path d="M{start} 250H{end}" stroke="{c['green']}" stroke-width="11" stroke-linecap="round"/>''')
    x = 1400
    if en:
        sjtu = f'<text x="{x}" y="130" text-anchor="middle" fill="{c["green"]}" font-size="18" font-weight="700" text-decoration="underline">Shanghai Jiao Tong</text><text x="{x}" y="154" text-anchor="middle" fill="{c["green"]}" font-size="18" font-weight="700" text-decoration="underline">University</text>'
        college = 'Zhiyuan College'
        dates = '2025.09 — present'
    else:
        sjtu = f'<text x="{x}" y="151" text-anchor="middle" fill="{c["green"]}" font-size="22" font-weight="700" text-decoration="underline">上海交通大学</text>'
        college = '致远学院'
        dates = '2025.09 — 至今'
    items.append(f'''    <a href="https://www.sjtu.edu.cn/" target="_blank" rel="noopener noreferrer" style="cursor:pointer">{sjtu}</a>
    <a href="https://zhiyuan.sjtu.edu.cn/" target="_blank" rel="noopener noreferrer" style="cursor:pointer"><text x="{x}" y="180" text-anchor="middle" fill="{c['green']}" font-size="{18 if en else 22}" font-weight="700" text-decoration="underline">{college}</text></a>
    <text x="{x}" y="208" text-anchor="middle" fill="{c['muted']}" font-size="17" font-weight="600">{dates}</text>
    <path d="M1120 250H1660" stroke="{c['green']}" stroke-width="11" stroke-linecap="round"/>''')
    for (x, date, zh, english), medals in zip(AWARDS, ((3,), (1, 2), (3,), (3,), (2,), (1,))):
        lines = english if en else zh
        size = 15 if en else 17
        y0 = 412 if len(lines) >= 4 else 421
        item_text = '\n'.join(f'    <text x="{x}" y="{y0 + n * 25}" text-anchor="middle" fill="{c["text"]}" font-size="{size}" font-weight="600"{fit}>{escape(line)}</text>' for n, line in enumerate(lines) for fit in [' textLength="178" lengthAdjust="spacingAndGlyphs"' if en and len(line) > 22 else ''])
        medal_colors = {1: ('#bc954f', '#ecd496'), 2: ('#9aa8b5', '#d6dfe6'), 3: ('#a47759', '#cfaa91')}
        medal_svg = ''.join(f'<g transform="translate({x + (n - (len(medals) - 1) / 2) * 22:g} 510)"><circle r="8" fill="{medal_colors[value][0]}" stroke="{medal_colors[value][1]}" stroke-width="1.4"/><text y="3" text-anchor="middle" fill="#273047" font-size="9" font-weight="700">{value}</text></g>' for n, value in enumerate(medals))
        items.append(f'''    <circle cx="{x}" cy="250" r="13" fill="{c['bg1']}" stroke="{c['purple']}" stroke-width="3"/>
    <circle cx="{x}" cy="250" r="5" fill="{c['purple']}"/>
    <path d="M{x} 265V349" stroke="{c['purple']}" stroke-width="2" opacity=".8"/>
    <rect x="{x - 95}" y="349" width="190" height="180" rx="18" fill="{card_fill}" stroke="{c['purple']}" stroke-opacity=".48"/>
    <text x="{x}" y="381" text-anchor="middle" fill="{c['purple']}" font-size="19" font-weight="700">{date}</text>
{item_text}
    {medal_svg}''')
    items.append('  </g>\n</svg>\n')
    return '\n'.join(items)


if __name__ == '__main__':
    for language in ('zh', 'en'):
        for mode in ('dark', 'light'):
            suffix = '-en' if language == 'en' else ''
            (OUT / f'timeline-medals-subtle{suffix}-{mode}.svg').write_text(render(language, mode), encoding='utf-8')
