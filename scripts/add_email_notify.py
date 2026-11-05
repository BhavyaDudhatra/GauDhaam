import pathlib, re
p = pathlib.Path('B:/Study/Projects/VibeCoding/GauDham/Web/lib/actions/admin.ts')
txt = p.read_text(errors='ignore')
# Find updateOrderAction
pattern = r'(await store\.orders\.update\(id,\s*\{[^}]*\}\s*\);)'
def repl(m):
    return m.group(1) + '''
  if (status === 'shipped' && existing.status !== 'shipped') {
    try {
      const { Resend } = await import('resend');
      const apiKey = process.env.RESEND_API_KEY;
      const from = process.env.EMAIL_FROM || 'GauDhaam <onboarding@resend.dev>';
      if (apiKey) {
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from,
          to: existing.email,
          subject: `Your order ${existing.number} is on its way`,
          html: `<p>Hi ${existing.customerName},</p><p>Your order ${existing.number} has been shipped. It will arrive in ~48 hours.</p>`,
        });
      } else {
        console.log(`[notify] Shipped ${existing.number} to ${existing.email}`);
      }
    } catch {}
  }
'''
txt = re.sub(pattern, repl, txt, count=1)
p.write_text(txt, errors='ignore')
print('updated')
