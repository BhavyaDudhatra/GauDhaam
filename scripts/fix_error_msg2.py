import pathlib, re
p = pathlib.Path('B:/Study/Projects/VibeCoding/GauDham/Web/lib/actions/admin.ts')
txt = p.read_text(errors='ignore')
txt = re.sub(r'Use 3[^\"]+30 letters, numbers, dashes or underscores for the code\.', 'Use 3-30 letters, numbers, dashes or underscores for the code.', txt)
p.write_text(txt, encoding='utf-8')
print('done')
