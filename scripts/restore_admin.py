import subprocess, pathlib
out = subprocess.check_output(['git','show','fc4c574:lib/actions/admin.ts'])
p = pathlib.Path('B:/Study/Projects/VibeCoding/GauDham/Web/lib/actions/admin.ts')
p.write_bytes(out)
print('restored')
