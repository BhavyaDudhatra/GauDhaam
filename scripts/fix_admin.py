import pathlib
p = pathlib.Path('B:/Study/Projects/VibeCoding/GauDham/Web/lib/actions/admin.ts')
txt = p.read_text(errors='ignore')
idx = txt.find('addComplementaryGiftAction')
if idx != -1:
    new_part = '''export async function addComplementaryGiftAction(_prev, formData):
  await requireAdmin()
  const name = clean(formData.get("name"), 120);
  const type = clean(formData.get("type"), 20);
  const itemId = clean(formData.get("itemId"), 120);
  const notes = clean(formData.get("notes"), 500);
  if (!name || !itemId || !type) {
    return { error: "Name and item are required." };
  }
  const { getDb } = await import("@/lib/firebase");
  const db = await getDb();
  if (!db) return { error: "Database not configured." };
  await db.collection("complementary_gifts").add({
    name,
    type,
    itemId,
    notes,
    createdAt: new Date().toISOString()
  });
  revalidatePath("/admin/complementary");
  return { success: "Complementary gift added." };
}
'''
    # Find end of file after the corrupted function
    # Replace from idx to end with new_part
    new_txt = txt[:idx] + new_part
    p.write_text(new_txt, encoding='utf-8')
    print('fixed')
else:
    print('not found')
