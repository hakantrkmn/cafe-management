# Campaign System Implementation

## Overview

Complete campaign/promotion system implemented for the cafe management application, allowing cafe owners to create promotional campaigns that customers can select during ordering.

## Database Schema

### Campaign Model

```prisma
model Campaign {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  cafeId      String   @db.ObjectId
  name        String
  description String?
  price       Float
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  cafe         Cafe           @relation(fields: [cafeId], references: [id])
  campaignItems CampaignItem[]
  orders       Order[]
}
```

### CampaignItem Model

```prisma
model CampaignItem {
  id         String @id @default(auto()) @map("_id") @db.ObjectId
  campaignId String @db.ObjectId
  menuItemId String @db.ObjectId
  quantity   Int
  size       String?

  campaign Campaign @relation(fields: [campaignId], references: [id])
  menuItem MenuItem @relation(fields: [menuItemId], references: [id])
}
```

### Updated Order Model

```prisma
model Order {
  // ... existing fields
  campaignId    String?  @db.ObjectId
  campaignName  String?
  campaignPrice Float?
  campaign      Campaign? @relation(fields: [campaignId], references: [id])
}
```

## API Endpoints

### Campaign Management

- `GET /api/cafes/[id]/campaigns` - List all campaigns for a cafe
- `POST /api/cafes/[id]/campaigns` - Create new campaign
- `GET /api/cafes/[id]/campaigns/[campaignId]` - Get specific campaign
- `PUT /api/cafes/[id]/campaigns/[campaignId]` - Update campaign
- `DELETE /api/cafes/[id]/campaigns/[campaignId]` - Delete campaign

### Order Integration

- Updated order creation to detect campaigns and handle them as individual menu items
- Campaigns are broken down into individual `OrderCartItem` entries when added to existing orders

## Frontend Components

### Campaign Management

- **CampaignCard**: Displays campaign details with items and pricing
- **CampaignList**: Grid layout for campaign management
- **CampaignForm**: Create/edit campaigns with menu item selection and validation
- **CampaignDialog**: Modal wrapper for campaign forms
- **CampaignsPage**: Main campaign management page at `/dashboard/campaigns`

### Order Integration

- **CampaignSelectionCard**: Order interface for selecting campaigns
- **MenuSelection**: Updated to include campaigns tab
- **OrderDialog**: Updated to handle campaign selection
- **OrderProducts**: Updated to display campaign items

## Key Features

### Campaign Management

- Create campaigns with name, description, and price
- Add multiple menu items with quantities and sizes
- Active/inactive status toggle
- Form validation for required fields and sizes
- Price comparison display (normal vs campaign price)

### Order Integration

- Campaigns appear in order selection interface
- Campaigns are added as individual menu items to existing orders
- Proper handling of menu item sizes within campaigns
- Type-safe implementation throughout

### UI/UX

- Responsive design with mobile support
- Turkish localization
- Modern card-based interface
- Price comparison with savings display
- Form validation with error messages

## Technical Implementation

### TypeScript Types

```typescript
export interface CampaignWithRelations extends Campaign {
  campaignItems: CampaignItemWithRelations[];
  cafe: Cafe;
}

export interface CampaignItemWithRelations extends CampaignItem {
  menuItem: MenuItemWithRelations;
}

export interface CampaignProduct {
  id: string;
  price: number;
  quantity: number;
  size?: string;
}
```

### React Query Hooks

- `useCampaigns(cafeId)` - Fetch campaigns for a cafe
- `useCampaign(cafeId, campaignId)` - Fetch specific campaign
- `useCreateCampaign()` - Create new campaign
- `useUpdateCampaign()` - Update existing campaign
- `useDeleteCampaign()` - Delete campaign

### State Management

- TanStack Query for server state management
- Zustand for local state management
- Proper cache invalidation and refetching

## Order Processing Logic

### Campaign Selection (Updated)

1. User selects campaign from order interface
2. System checks for existing unpaid orders
3. If existing orders found:
   - Campaign items converted to `OrderCartItem[]`
   - **Campaign info (ID, name, price) sent to backend**
   - Backend recognizes campaign and creates single campaign product
   - Items added to existing order via `addToExistingOrder()`
4. If no existing orders:
   - New order created with campaign items
   - Campaign recognized and stored as campaign product

### Campaign Product Storage

**Consistent behavior for both new and existing orders:**

```typescript
// Stored as single campaign product with nested items
{
  id: campaign_id,
  isPaid: false,
  price: campaign_price,
  campaignId: campaign_id,
  campaignName: campaign_name,
  products: [
    { id: menuItem1_id, price: item_price, quantity: qty, size: size },
    { id: menuItem2_id, price: item_price, quantity: qty, size: size }
  ]
}
```

This ensures campaigns are always stored as a single entity with internal product breakdown, making the order structure consistent and easier to manage.

### Campaign Item Conversion

```typescript
const campaignCartItems = campaign.campaignItems.map((campaignItem) => {
  const fullMenuItem = menu.menuItems.find(
    (item) => item.id === campaignItem.menuItemId
  );

  // Handle size selection and pricing
  let size = campaignItem.size;
  let itemPrice = fullMenuItem.price;

  if (fullMenuItem.hasSizes && !size) {
    const availableSizes = fullMenuItem.prices?.map((p) => p.size) || [];
    if (availableSizes.length > 0) {
      size = availableSizes[0];
    }
  }

  if (fullMenuItem.hasSizes && size && fullMenuItem.prices) {
    const sizePrice = fullMenuItem.prices.find((p) => p.size === size);
    if (sizePrice) {
      itemPrice = sizePrice.price;
    }
  }

  return {
    id: `${campaignItem.menuItemId}_${Date.now()}`,
    menuItemId: campaignItem.menuItemId,
    menuItemName: fullMenuItem.name,
    menuItemPrice: itemPrice,
    quantity: campaignItem.quantity,
    size: size || undefined,
    extras: [],
    subtotal: itemPrice * campaignItem.quantity,
  };
});
```

## CSS Styling

### Campaign-specific Styles

- `.campaign-card` - Campaign card styling
- `.campaign-price` - Price display styling
- `.campaign-savings` - Savings calculation display
- `.campaign-items` - Campaign items list styling
- `.campaign-form` - Form styling for campaign creation/editing

### Responsive Design

- Mobile-first approach
- Grid layouts for campaign cards
- Responsive form layouts
- Touch-friendly interface elements

## Navigation Integration

### Dashboard Header

- Added "Kampanyalar" (Campaigns) link for managers
- Tag icon for visual identification
- Both desktop and mobile navigation support

### Page Routing

- `/dashboard/campaigns` - Main campaign management page
- Integrated with existing dashboard layout
- Role-based access control (managers only)

## Error Handling

### Form Validation

- Required field validation
- Size selection validation for items with sizes
- Error message display for validation failures
- User-friendly error messages in Turkish

### API Error Handling

- Proper error responses from API routes
- Client-side error handling with toast notifications
- Fallback mechanisms for missing data

## Performance Optimizations

### Data Fetching

- Efficient React Query implementation
- Proper cache management
- Conditional data fetching based on user role
- Optimistic updates for better UX

### Component Optimization

- Memoized components where appropriate
- Efficient re-rendering patterns
- Proper dependency arrays in hooks

## Order History Display (Updated)

### Campaign Visualization in Order History

Campaigns are now properly displayed in the order history component with clear visual distinction:

**Features:**

- Blue-styled campaign card (`bg-blue-50` with `border-blue-200`)
- Campaign badge showing "Kampanya" label
- Campaign name prominently displayed
- Campaign price shown on the right
- Internal products listed in nested format with left border
- Each internal product shows:
  - Quantity (e.g., "1x")
  - Product name
  - Size badge (Küçük/Orta/Büyük) if applicable

**Implementation:**

- Campaign detection: `product.campaignId && product.campaignName`
- Separate render logic for campaign vs regular products
- OrderHistory component (`OrderHistory.tsx`) handles both product types
- No more "Bilinmeyen Ürün" errors for campaigns

### Example Display

```
┌─────────────────────────────────────────────┐
│ 🏷️ Kampanya | Burger + Soda Seti | 250₺   │
├─────────────────────────────────────────────┤
│ ├─ 1x Burger (Büyük)                        │
│ └─ 1x Soda                                  │
└─────────────────────────────────────────────┘
```

## Future Considerations

### Potential Enhancements

- Campaign date/time validity
- Campaign usage analytics
- Bulk campaign operations
- Campaign templates
- Advanced campaign rules (minimum order value, etc.)

### Scalability

- Database indexing for campaign queries
- Pagination for large campaign lists
- Caching strategies for frequently accessed campaigns
- Performance monitoring for campaign operations

## Testing Status

- Manual testing completed
- All TypeScript errors resolved
- Linter errors fixed
- Production-ready implementation

## Documentation Status

- Complete API documentation
- Component documentation
- Type definitions documented
- Memory bank updated with implementation details
