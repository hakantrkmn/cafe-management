# Table Drag-and-Drop Feature Implementation

## 🎯 Summary

Masaları gridde gösterirken, artık sürükleyerek yeniden düzenleyebilirsiniz! Düzenleme otomatik olarak kaydedilir ve sayfa açıldığında aynı sırayla görüntülenir.

## ✅ What's New

### 1. **Zustand Store** (`src/store/tableOrderStore.ts`)
- Table sıralamalarını localStorage'a kaydeder
- Her cafe için ayrı sıralama tutar
- Otomatik serialization/deserialization

### 2. **Updated TableLayoutEditor** (`src/components/orders/TableLayoutEditor.tsx`)
- SortableJS entegrasyonu
- Drag-and-drop UI
- GripVertical handle icons
- Zustand store integration

### 3. **Updated Orders Page** (`src/app/dashboard/orders/page.tsx`)
- cafeId prop gönderme

### 4. **CSS Enhancements** (`src/styles/orders.css`)
- Drag animation stili
- Grab cursor
- Opacity feedback
- Smooth transitions

## 🚀 How It Works

```
1. Masaya sürükle → 2. React Sortable tespit eder → 3. Zustand store günceller 
→ 4. localStorage kaydeder → 5. Sayfa kapatıl/açılsın → 6. Aynı sırada görüntülenir
```

## 📦 Dependencies

Already installed:
- ✅ `sortablejs` v1.15.6
- ✅ `react-sortablejs` v6.1.4
- ✅ `zustand` v5.0.8

## 🎨 UI Features

- **Drag Handle**: GripVertical icon gösterir
- **Visual Feedback**: 50% opacity during drag
- **Smooth Animation**: 150ms transition
- **Cursor Hints**: grab/grabbing cursor
- **Responsive**: Grid layout maintained

## 📍 File Changes

### New Files
- `src/store/tableOrderStore.ts` - Zustand store with localStorage

### Modified Files
- `src/components/orders/TableLayoutEditor.tsx` - Added drag-drop
- `src/app/dashboard/orders/page.tsx` - Pass cafeId
- `src/styles/orders.css` - Added drag-drop styles

## 🔍 Data Flow

```typescript
// Zustand store
interface TableOrderStore {
  tableOrder: Record<string, string[]>;  // cafeId -> [tableId, ...]
  reorderTables: (cafeId: string, tableIds: string[]) => void;
  getTableOrder: (cafeId: string) => string[] | undefined;
}

// localStorage structure
{
  "table-order-store": {
    "state": {
      "tableOrder": {
        "cafe-123": ["table-1", "table-3", "table-2"],
        "cafe-456": ["table-5", "table-4"]
      }
    }
  }
}
```

## 🎯 Usage

1. Orders sayfasına git
2. Masa kartlarını sürükle
3. Otomatik kaydedilir
4. Sayfa yenilerse, aynı sırada açılır

## ✨ Features

- ✅ Per-cafe table ordering (her cafe'nin kendi sırası)
- ✅ Automatic persistence (otomatik kayıt)
- ✅ No backend required (sadece client-side)
- ✅ Full TypeScript support
- ✅ Mobile responsive
- ✅ Smooth animations (150ms)
- ✅ Visual drag indicators

## 🌍 Browser Support

| Browser | Status |
|---------|--------|
| Chrome  | ✅     |
| Firefox | ✅     |
| Safari  | ✅     |
| Edge    | ✅     |
| Mobile  | ✅     |

## ⚙️ Implementation Details

### Zustand Store Pattern
```typescript
// useEffect initializes sorted tables
const savedOrder = getTableOrder(cafeId);
if (savedOrder && savedOrder.length === tables.length) {
  const reorderedTables = savedOrder
    .map(id => tables.find(t => t.id === id))
    .filter(t => t !== undefined) as Table[];
  setSortedTables(reorderedTables);
}

// handleSortChange updates store
const handleSortChange = (newSortedTables: Table[]) => {
  setSortedTables(newSortedTables);
  if (cafeId) {
    reorderTables(cafeId, newSortedTables.map(t => t.id));
  }
};
```

### ReactSortable Component
```typescript
<ReactSortable
  list={sortedTables}
  setList={handleSortChange}
  animation={150}
  ghostClass="opacity-50"
  dragClass="dragging"
  className="orders-table-sortable-list"
>
  {sortedTables.map((table) => (
    <div key={table.id} className="orders-table-item">
      <GripVertical className="h-4 w-4" />
      {/* table content */}
    </div>
  ))}
</ReactSortable>
```

## 🔧 Troubleshooting

**Q: Masa sırası kayıt olmuyorsa?**
- localStorage etkin mi kontrol et
- cafeId doğru geçiliyor mu?

**Q: Drag-drop çalışmıyorsa?**
- react-sortablejs kurulu mu?
- CSS classes doğru mu?

**Q: Masalar kendi kendine karışıyorsa?**
- Table ID'leri stable mi?
- Duplicate IDs var mı?

## 📚 Related Documentation

- Memory Bank: `memory-bank/tableOrderingFeature.md`
- System Patterns: `memory-bank/systemPatterns.md` (Pattern #5)
- Active Context: `memory-bank/activeContext.md`

## 🚀 Future Enhancements

- [ ] Server-side sync (multi-device)
- [ ] Undo/Redo functionality
- [ ] Reset to default order button
- [ ] Table grouping (Salon, Bahçe, etc.)
- [ ] Favorite tables

---

**Last Updated**: October 2025
**Status**: ✅ Production Ready
**Type**: User-facing Feature
