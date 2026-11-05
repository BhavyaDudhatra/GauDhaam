import pathlib
p = pathlib.Path('B:/Study/Projects/VibeCoding/GauDham/Web/lib/actions/admin.ts')
txt = p.read_text(errors='ignore')
txt = txt.replace('â€œ','"').replace('â€','"')
p.write_text(txt, encoding='utf-8')
print('fixed')
