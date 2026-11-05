import pathlib
p = pathlib.Path('B:/Study/Projects/VibeCoding/GauDham/Web/app/(site)/page.tsx')
txt = p.read_text()
# Add slides import
old_import = "import { getStore } from \"@/lib/store\";"
new_import = "import { getStore } from \"@/lib/store\";\nimport { getDb } from \"@/lib/firebase\";"
if old_import in txt:
    txt = txt.replace(old_import, new_import)
# Add slides fetch
old_fetch = """const store = await getStore();
  const [products, services] = await Promise.all([
    store.products.list(),
    store.services.list(),
  ]);"""
new_fetch = """const store = await getStore();
  const db = await getDb();
  let slides = [];
  if (db) {
    const snap = await db.collection('slides').orderBy('order','asc').get();
    slides = snap.docs.map(d=>({id:d.id,...d.data()}));
  }
  const [products, services] = await Promise.all([
    store.products.list(),
    store.services.list(),
  ]);"""
if old_fetch in txt:
    txt = txt.replace(old_fetch, new_fetch)
# Add slideshow section after hero? Find hero section end.
# Insert simple slideshow after opening fragment
# We'll insert after the closing of hero section
# Find first </section> after hero
import re
# Insert slideshow before featured products section
# Look for comment or section with id
# For simplicity, insert after hero closing </section> first occurrence
hero_close = '</section>'
if hero_close in txt:
    idx = txt.find(hero_close) + len(hero_close)
    slideshow = '''
      <section className="section">
        <div className="container-gd">
          {slides.length > 0 && (
            <div className="relative overflow-hidden rounded-banner border border-line">
              <div className="flex overflow-x-auto gap-4 py-4">
                {slides.map(s => (
                  <div key={s.id} className="min-w-[320px] shrink-0">
                    <img src={s.imageUrl} alt={s.title} className="h-48 w-full object-cover rounded-card"/>
                    <div className="mt-2 p-3 bg-white rounded-card border border-line">
                      <h3 className="text-[16px] font-semibold">{s.title}</h3>
                      <p className="text-[13px] text-body/80">{s.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
'''
    txt = txt[:idx] + slideshow + txt[idx:]
p.write_text(txt)
print('home page updated')
