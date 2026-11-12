from pathlib import Path

assets = Path(__file__).resolve().parent.parent / 'assets'
for suffix in ('', '-en', '-light', '-en-light'):
    source = (assets / f'hero{suffix}.svg').read_text(encoding='utf-8')
    source = source.replace('viewBox="0 0 1200 360" preserveAspectRatio="xMinYMid slice"', 'viewBox="0 0 600 600"')
    source = source.replace('width="1200" height="360"', 'width="600" height="600"')
    source = source.replace('M24 0H1176', 'M24 0H576').replace('cx="1035" cy="65"', 'cx="520" cy="65"').replace('cx="876" cy="297"', 'cx="300" cy="480"')
    source = source.replace('<g font-family="Noto Sans CJK SC', '<g transform="translate(-12 0) scale(.9)" font-family="Noto Sans CJK SC', 2)
    source = source.replace('transform="translate(705 49)"', 'transform="translate(87 310)"')
    (assets / f'hero-mobile{suffix}.svg').write_text(source, encoding='utf-8')
