import pathlib
p = pathlib.Path('B:/Study/Projects/VibeCoding/GauDham/Web/app/admin/(dashboard)/page.tsx')
txt = p.read_text()
old = '{ label: "Revenue (paid)", value: formatINR(revenue), icon: ShoppingCart }'
new = '{ label: "Revenue (paid)", value: formatINR(revenue), icon: ShoppingCart, href: "/admin/orders?paid=true" }'
if old in txt:
    txt = txt.replace(old, new)
    p.write_text(txt)
    print('updated')
else:
    print('old not found')
