import pathlib
p = pathlib.Path('B:/Study/Projects/VibeCoding/GauDham/Web/app/admin/(dashboard)/orders/page.tsx')
txt = p.read_text()
# Add paid param handling
# Find searchParams definition
old = """export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string }>;
}) {
  const { updated } = await searchParams;
  const store = await getStore();
  const orders = await store.orders.list();"""
new = """export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string; paid?: string }>;
}) {
  const { updated, paid } = await searchParams;
  const store = await getStore();
  let orders = await store.orders.list();
  if (paid === 'true') {
    orders = orders.filter(o => o.payment.status === 'paid');
  }"""
if old in txt:
    txt = txt.replace(old, new)
    p.write_text(txt)
    print('updated orders page')
else:
    print('not found')
