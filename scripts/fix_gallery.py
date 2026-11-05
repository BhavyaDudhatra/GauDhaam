import pathlib
p = pathlib.Path('B:/Study/Projects/VibeCoding/GauDham/Web/app/(site)/product/[slug]/page.tsx')
txt = p.read_text(errors='ignore')
old = '{product.galleryImages.map((src, idx) => ('
new = '{product.galleryImages.filter(Boolean).map((src, idx) => ('
txt = txt.replace(old, new)
p.write_text(txt, encoding='utf-8')
print('fixed')
