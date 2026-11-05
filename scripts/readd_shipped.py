import pathlib, re
p = pathlib.Path('B:/Study/Projects/VibeCoding/GauDham/Web/lib/actions/admin.ts')
txt = p.read_text(errors='ignore')
pattern = r'(await store\.orders\.update\(id,\s*\{[^}]*\}\s*\);)'
repl = r'\1\n  if (status === \'shipped\' && existing.status !== \'shipped\') {\n    try {\n      console.log(`Order ${id} shipped to ${existing.email}`);\n    } catch {}\n  }'
newtxt = re.sub(pattern, repl, txt, count=1)
p.write_text(newtxt, encoding='utf-8')
print('done')
