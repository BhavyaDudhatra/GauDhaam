import pathlib
p = pathlib.Path('B:/Study/Projects/VibeCoding/GauDham/Web/lib/actions/admin.ts')
txt = p.read_text(errors='ignore')
# Find updateOrderAction and insert notification after update
# Simple insertion after await store.orders.update
marker = 'await store.orders.update(id, {'
if marker in txt:
    # Find the section where status is updated
    # Insert after the update call
    # We'll insert after the closing }); of update
    # Find first occurrence of 'await store.orders.update' block end
    import re
    pattern = r'(await store\.orders\.update\(id,\s*\{[^}]*\}\s*\);)'
    def repl(m):
        return m.group(1) + '''
  if (status === 'shipped' && existing.status !== 'shipped') {
    // Send notification placeholder
    // TODO: send email/SMS via Resend/Twilio
    console.log(`Order ${id} shipped to ${existing.customerEmail}, ETA 48 hours`);
  }
'''
    txt = re.sub(pattern, repl, txt, count=1)
    p.write_text(txt, errors='ignore')
    print('updated admin actions')
else:
    print('marker not found')
