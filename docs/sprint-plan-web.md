# Web Sprint Plan - Ecomify Platform

**Project:** Ecomify E-Commerce Platform
**Track:** Web (Admin Portal & Storefront)
**Duration:** 16 weeks (8 sprints × 2 weeks)
**Team Size:** 4-6 Frontend Engineers
**Technology:** Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui

---

## Architecture Principles

### Modularity Requirements
- **Independent Applications**: Admin and Storefront are separate Next.js apps
- **Shared Component Library**: Common components in shared package
- **Feature-Based Architecture**: Features are self-contained modules
- **Lazy Loading**: Dynamic imports for non-critical features
- **Graceful Degradation**: UI works even if some API endpoints fail

### Design Patterns to Implement
- **Compound Component Pattern**
- **Higher-Order Components (HOC)**
- **Render Props Pattern**
- **Custom Hooks Pattern**
- **Provider Pattern (Context)**
- **Container/Presentational Pattern**
- **Facade Pattern (API clients)**
- **Observer Pattern (State management)**
- **Strategy Pattern (Theme, Payment methods)**
- **Factory Pattern (Form builders, Notification handlers)**

---

## Project Structure

```
apps/
├── admin/                    # Admin dashboard (Next.js)
│   ├── app/                 # Next.js 14 App Router
│   │   ├── (auth)/         # Auth routes
│   │   ├── (dashboard)/    # Dashboard routes
│   │   └── api/            # API routes (if needed)
│   ├── components/         # Admin-specific components
│   ├── features/           # Feature modules
│   │   ├── products/
│   │   ├── orders/
│   │   ├── customers/
│   │   └── analytics/
│   ├── lib/                # Utilities
│   └── styles/             # Global styles
│
├── storefront/              # Customer-facing store (Next.js)
│   ├── app/
│   │   ├── (shop)/         # Shop routes
│   │   ├── (account)/      # Account routes
│   │   └── (checkout)/     # Checkout routes
│   ├── components/
│   ├── features/
│   └── lib/
│
└── packages/
    ├── ui/                  # Shared component library
    ├── api-client/          # API client library
    ├── types/               # Shared TypeScript types
    ├── hooks/               # Shared React hooks
    └── utils/               # Shared utilities
```

---

## Sprint 0: Foundation & Setup (Week 1-2)

### Goals
- Set up monorepo structure
- Configure Next.js applications
- Set up design system
- Configure tooling

### User Stories

#### US-WEB-001: Project Setup
**Story:** As a developer, I need a monorepo setup so that I can share code between apps.

**Tasks:**
- [ ] Initialize Turborepo/Nx workspace
- [ ] Create admin Next.js app
- [ ] Create storefront Next.js app
- [ ] Configure TypeScript (strict mode)
- [ ] Set up ESLint and Prettier
- [ ] Configure Tailwind CSS
- [ ] Set up path aliases (@/, @components/, etc.)

**Design Patterns:**
- Monorepo architecture

**Acceptance Criteria:**
- Both apps run independently
- TypeScript configured with strict mode
- Linting and formatting work
- Tailwind CSS working

**Effort:** 8 story points

---

#### US-WEB-002: Design System Setup
**Story:** As a developer, I need a design system so that UI is consistent.

**Tasks:**
- [ ] Install shadcn/ui
- [ ] Create component library package
- [ ] Set up Storybook
- [ ] Create design tokens (colors, typography, spacing)
- [ ] Implement theme provider
- [ ] Create base components (Button, Input, Card, etc.)

**Design Patterns:**
- Provider Pattern (Theme)
- Compound Component Pattern

**Components to Create:**
```typescript
// Compound Component Pattern Example
<Card>
  <CardHeader>
    <CardTitle>Product Name</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Acceptance Criteria:**
- Storybook runs and shows components
- Theme provider works
- Dark mode supported
- Components are accessible (WCAG AA)
- 20+ base components created

**Effort:** 13 story points

---

#### US-WEB-003: API Client Setup
**Story:** As a developer, I need an API client so that I can communicate with backend.

**Tasks:**
- [ ] Create API client package
- [ ] Implement Axios/Fetch wrapper
- [ ] Add request/response interceptors
- [ ] Implement token refresh logic
- [ ] Add error handling
- [ ] Create typed API methods
- [ ] Set up React Query/TanStack Query

**Design Patterns:**
- Facade Pattern (API abstraction)
- Singleton Pattern (API client instance)
- Interceptor Pattern

**Implementation:**
```typescript
// api-client/src/client.ts
class ApiClient {
  private static instance: ApiClient;
  private axios: AxiosInstance;

  private constructor() {
    this.axios = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
    });

    this.setupInterceptors();
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private setupInterceptors() {
    // Request interceptor
    this.axios.interceptors.request.use((config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor
    this.axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await refreshToken();
          return this.axios.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  // Typed API methods
  products = {
    list: (params) => this.axios.get<Product[]>('/products', { params }),
    get: (id) => this.axios.get<Product>(`/products/${id}`),
    create: (data) => this.axios.post<Product>('/products', data),
    update: (id, data) => this.axios.patch<Product>(`/products/${id}`, data),
    delete: (id) => this.axios.delete(`/products/${id}`),
  };

  // ... other resource methods
}

export const apiClient = ApiClient.getInstance();

// React Query hook
export function useProducts(params) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => apiClient.products.list(params),
  });
}
```

**Acceptance Criteria:**
- API client works for all resources
- Token refresh works automatically
- Errors are handled gracefully
- TypeScript types are correct
- React Query integrated

**Effort:** 13 story points

---

#### US-WEB-004: State Management Setup
**Story:** As a developer, I need state management so that I can manage application state.

**Tasks:**
- [ ] Set up Zustand for client state
- [ ] Create store slices (auth, cart, UI)
- [ ] Implement persistence (localStorage)
- [ ] Create custom hooks for state access
- [ ] Set up React Query for server state

**Design Patterns:**
- Observer Pattern (State subscriptions)
- Singleton Pattern (Store)
- Custom Hooks Pattern

**Implementation:**
```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Custom hook
export function useAuth() {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  return { user, isAuthenticated, login, logout };
}
```

**Acceptance Criteria:**
- Auth state persists across refreshes
- Cart state works
- UI state (theme, sidebar) works
- React Query caches server data
- DevTools available

**Effort:** 8 story points

---

#### US-WEB-005: Authentication Flow
**Story:** As a user, I can log in so that I can access protected pages.

**Tasks:**
- [ ] Create login page
- [ ] Create registration page
- [ ] Implement form validation (React Hook Form + Zod)
- [ ] Create auth API calls
- [ ] Implement protected route HOC
- [ ] Add loading and error states

**Design Patterns:**
- HOC Pattern (Protected routes)
- Custom Hooks Pattern
- Form validation pattern

**Implementation:**
```typescript
// components/auth/ProtectedRoute.tsx
function withAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ProtectedRoute(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) return <LoadingSpinner />;
    if (!isAuthenticated) return null;

    return <Component {...props} />;
  };
}

// Usage
export default withAuth(DashboardPage);

// Or with hook
function useMustBeAuthenticated() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);
}
```

**Acceptance Criteria:**
- Login works and stores token
- Registration works
- Protected routes redirect to login
- Form validation works
- Error messages displayed

**Effort:** 13 story points

**Sprint 0 Total:** 55 story points

---

## Sprint 1: Admin - Dashboard & Products (Week 3-4)

### Goals
- Admin dashboard layout
- Product listing
- Product creation/editing

### User Stories

#### US-WEB-101: Admin Layout
**Story:** As a merchant, I need a dashboard layout so that I can navigate the admin.

**Tasks:**
- [ ] Create admin layout component
- [ ] Implement sidebar navigation
- [ ] Create topbar with user menu
- [ ] Add breadcrumbs
- [ ] Implement mobile responsive menu
- [ ] Add store selector (multi-store)

**Design Patterns:**
- Layout Pattern
- Compound Component Pattern

**Implementation:**
```typescript
// app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}

// components/Sidebar.tsx
const Sidebar = () => {
  const menuItems = [
    { icon: HomeIcon, label: 'Dashboard', href: '/dashboard' },
    { icon: PackageIcon, label: 'Products', href: '/products' },
    { icon: ShoppingCartIcon, label: 'Orders', href: '/orders' },
    { icon: UsersIcon, label: 'Customers', href: '/customers' },
    // ...
  ];

  return (
    <aside className="w-64 bg-white border-r">
      <div className="p-4">
        <Logo />
      </div>
      <nav>
        {menuItems.map((item) => (
          <SidebarItem key={item.href} {...item} />
        ))}
      </nav>
    </aside>
  );
};
```

**Acceptance Criteria:**
- Layout renders correctly
- Navigation works
- Mobile menu works
- User menu with logout
- Store selector works

**Effort:** 8 story points

---

#### US-WEB-102: Dashboard Overview
**Story:** As a merchant, I can see key metrics so that I can monitor my store.

**Tasks:**
- [ ] Create dashboard page
- [ ] Implement metric cards (revenue, orders, etc.)
- [ ] Add sales chart (Recharts)
- [ ] Create recent orders widget
- [ ] Add top products widget
- [ ] Implement real-time updates (optional)

**Design Patterns:**
- Container/Presentational Pattern
- Custom Hooks Pattern

**Implementation:**
```typescript
// features/dashboard/Dashboard.tsx
export function Dashboard() {
  const { data: metrics, isLoading } = useDashboardMetrics();

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <h1>Dashboard</h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.revenue)}
          change="+12.5%"
          trend="up"
        />
        <MetricCard
          title="Orders"
          value={metrics.orders}
          change="+8.2%"
          trend="up"
        />
        {/* ... */}
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesChart data={metrics.salesData} />
        </CardContent>
      </Card>

      {/* Widgets */}
      <div className="grid grid-cols-2 gap-6">
        <RecentOrdersWidget />
        <TopProductsWidget />
      </div>
    </div>
  );
}

// Custom hook
function useDashboardMetrics() {
  const { storeId } = useStore();
  return useQuery({
    queryKey: ['dashboard', storeId],
    queryFn: () => apiClient.analytics.getDashboard(storeId),
    refetchInterval: 30000, // Refresh every 30s
  });
}
```

**Acceptance Criteria:**
- Metrics display correctly
- Charts render properly
- Widgets show data
- Loading states work
- Responsive design

**Effort:** 13 story points

---

#### US-WEB-103: Product List
**Story:** As a merchant, I can view my products so that I can manage my catalog.

**Tasks:**
- [ ] Create products page
- [ ] Implement product table/grid
- [ ] Add search functionality
- [ ] Implement filters (status, category, tags)
- [ ] Add sorting
- [ ] Implement pagination
- [ ] Add bulk actions

**Design Patterns:**
- Container/Presentational Pattern
- Custom Hooks Pattern
- Compound Component Pattern (Table)

**Implementation:**
```typescript
// features/products/ProductList.tsx
export function ProductList() {
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useProducts({
    ...filters,
    search,
    page,
    limit: 20,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1>Products</h1>
        <Button asChild>
          <Link href="/products/new">Add Product</Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search products..."
        />
        <ProductFilters filters={filters} onChange={setFilters} />
      </div>

      {/* Product Table */}
      <DataTable
        columns={productColumns}
        data={data?.products || []}
        isLoading={isLoading}
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={data?.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}

// Reusable DataTable component
function DataTable<T>({ columns, data, isLoading }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={col.key}>{col.label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableSkeleton columns={columns.length} rows={5} />
        ) : (
          data.map((row) => (
            <TableRow key={row.id}>
              {columns.map((col) => (
                <TableCell key={col.key}>
                  {col.render ? col.render(row) : row[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
```

**Acceptance Criteria:**
- Products display in table
- Search works
- Filters work
- Sorting works
- Pagination works
- Responsive design

**Effort:** 13 story points

---

#### US-WEB-104: Create/Edit Product
**Story:** As a merchant, I can create products so that I can sell items.

**Tasks:**
- [ ] Create product form page
- [ ] Implement multi-step form (details, variants, images)
- [ ] Add image upload with preview
- [ ] Implement variant builder
- [ ] Add rich text editor for description
- [ ] Implement form validation
- [ ] Add save/publish actions

**Design Patterns:**
- Builder Pattern (Form construction)
- Compound Component Pattern
- Custom Hooks Pattern

**Implementation:**
```typescript
// features/products/ProductForm.tsx
export function ProductForm({ productId }: { productId?: string }) {
  const isEdit = !!productId;
  const { data: product } = useProduct(productId, { enabled: isEdit });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product || defaultValues,
  });

  const { mutate: saveProduct, isLoading } = useMutation({
    mutationFn: (data) =>
      isEdit
        ? apiClient.products.update(productId, data)
        : apiClient.products.create(data),
    onSuccess: () => {
      toast.success('Product saved');
      router.push('/products');
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(saveProduct)}>
        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <RichTextEditor {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  value={form.watch('images')}
                  onChange={(images) => form.setValue('images', images)}
                  maxFiles={10}
                />
              </CardContent>
            </Card>

            {/* Variants */}
            <Card>
              <CardHeader>
                <CardTitle>Variants</CardTitle>
              </CardHeader>
              <CardContent>
                <VariantBuilder
                  value={form.watch('variants')}
                  onChange={(variants) => form.setValue('variants', variants)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CategorySelect
                  value={form.watch('categoryId')}
                  onChange={(id) => form.setValue('categoryId', id)}
                />

                <TagInput
                  value={form.watch('tags')}
                  onChange={(tags) => form.setValue('tags', tags)}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Product'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

// Validation schema
const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']),
  variants: z.array(z.object({
    title: z.string(),
    price: z.number().positive(),
    sku: z.string().optional(),
  })).min(1),
  images: z.array(z.object({
    url: z.string(),
    altText: z.string().optional(),
  })),
  categoryId: z.string().optional(),
  tags: z.array(z.string()),
});
```

**Acceptance Criteria:**
- Form works for create and edit
- Validation works
- Image upload works
- Variant builder works
- Rich text editor works
- Saves successfully

**Effort:** 21 story points

**Sprint 1 Total:** 55 story points

---

## Sprint 2: Admin - Orders & Customers (Week 5-6)

### Goals
- Order management
- Customer management
- Order details and fulfillment

### User Stories

#### US-WEB-201: Order List
**Story:** As a merchant, I can view orders so that I can manage them.

**Tasks:**
- [ ] Create orders page
- [ ] Implement order table
- [ ] Add search and filters
- [ ] Show order status badges
- [ ] Add quick actions (fulfill, refund)
- [ ] Implement export to CSV

**Design Patterns:**
- Container/Presentational Pattern
- Factory Pattern (Status badges)

**Implementation:**
```typescript
// features/orders/OrderList.tsx
export function OrderList() {
  const [filters, setFilters] = useState<OrderFilters>({});

  const { data, isLoading } = useOrders(filters);

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h1>Orders</h1>
        <Button variant="outline" onClick={exportOrders}>
          Export
        </Button>
      </div>

      <OrderFilters value={filters} onChange={setFilters} />

      <DataTable
        columns={[
          {
            key: 'orderNumber',
            label: 'Order',
            render: (order) => (
              <Link href={`/orders/${order.id}`}>{order.orderNumber}</Link>
            ),
          },
          {
            key: 'createdAt',
            label: 'Date',
            render: (order) => formatDate(order.createdAt),
          },
          {
            key: 'customer',
            label: 'Customer',
            render: (order) => order.email,
          },
          {
            key: 'total',
            label: 'Total',
            render: (order) => formatCurrency(order.totalPrice),
          },
          {
            key: 'financialStatus',
            label: 'Payment',
            render: (order) => <StatusBadge status={order.financialStatus} />,
          },
          {
            key: 'fulfillmentStatus',
            label: 'Fulfillment',
            render: (order) => <StatusBadge status={order.fulfillmentStatus} />,
          },
          {
            key: 'actions',
            label: '',
            render: (order) => <OrderActions order={order} />,
          },
        ]}
        data={data?.orders || []}
        isLoading={isLoading}
      />
    </div>
  );
}

// Factory pattern for status badges
function StatusBadge({ status }: { status: string }) {
  const variants = {
    paid: 'success',
    pending: 'warning',
    refunded: 'destructive',
    fulfilled: 'success',
    unfulfilled: 'warning',
  };

  return (
    <Badge variant={variants[status]}>
      {status}
    </Badge>
  );
}
```

**Acceptance Criteria:**
- Orders display correctly
- Filters work
- Search works
- Status badges show correctly
- Quick actions work
- Export works

**Effort:** 13 story points

---

#### US-WEB-202: Order Details
**Story:** As a merchant, I can view order details so that I can process the order.

**Tasks:**
- [ ] Create order detail page
- [ ] Display order information
- [ ] Show line items
- [ ] Display customer info
- [ ] Show payment details
- [ ] Add order timeline
- [ ] Implement order actions (fulfill, refund, cancel)

**Design Patterns:**
- Compound Component Pattern
- Custom Hooks Pattern

**Implementation:**
```typescript
// features/orders/OrderDetail.tsx
export function OrderDetail({ orderId }: { orderId: string }) {
  const { data: order, isLoading } = useOrder(orderId);

  if (isLoading) return <OrderDetailSkeleton />;
  if (!order) return <NotFound />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1>Order {order.orderNumber}</h1>
          <p className="text-muted-foreground">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <OrderActions order={order} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderLineItems items={order.lineItems} />
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline orderId={orderId} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <strong>{order.email}</strong>
                </div>
                {order.phone && <div>{order.phone}</div>}
                <Button variant="link" size="sm">
                  View customer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <Address address={order.shippingAddress} />
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatCurrency(order.totalShipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(order.totalTax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(order.totalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- Order details display correctly
- Line items shown
- Customer info visible
- Timeline shows events
- Actions work (fulfill, refund, cancel)

**Effort:** 13 story points

---

#### US-WEB-203: Order Fulfillment
**Story:** As a merchant, I can fulfill orders so that I can ship products.

**Tasks:**
- [ ] Create fulfillment modal/dialog
- [ ] Select items to fulfill
- [ ] Add tracking number input
- [ ] Carrier selection
- [ ] Send fulfillment notification option
- [ ] Update order status

**Design Patterns:**
- Modal/Dialog Pattern
- Form handling

**Implementation:**
```typescript
// features/orders/FulfillmentDialog.tsx
export function FulfillmentDialog({ order, open, onClose }) {
  const form = useForm<FulfillmentFormValues>({
    defaultValues: {
      lineItems: order.lineItems.map((item) => ({
        lineItemId: item.id,
        quantity: item.quantity,
      })),
      trackingNumber: '',
      carrier: '',
      notifyCustomer: true,
    },
  });

  const { mutate: fulfillOrder, isLoading } = useMutation({
    mutationFn: (data) => apiClient.orders.fulfill(order.id, data),
    onSuccess: () => {
      toast.success('Order fulfilled');
      onClose();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fulfill Order</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(fulfillOrder)} className="space-y-4">
            {/* Items to fulfill */}
            <div>
              <Label>Items</Label>
              {order.lineItems.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={form.watch(`lineItems.${index}.quantity`) > 0}
                    onCheckedChange={(checked) => {
                      form.setValue(
                        `lineItems.${index}.quantity`,
                        checked ? item.quantity : 0
                      );
                    }}
                  />
                  <span>{item.title}</span>
                  <Input
                    type="number"
                    min={0}
                    max={item.quantity}
                    {...form.register(`lineItems.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
                    className="w-20"
                  />
                  <span>of {item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Tracking info */}
            <FormField
              control={form.control}
              name="trackingNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tracking Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="carrier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carrier</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fedex">FedEx</SelectItem>
                      <SelectItem value="ups">UPS</SelectItem>
                      <SelectItem value="usps">USPS</SelectItem>
                      <SelectItem value="dhl">DHL</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notifyCustomer"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Send shipment details to customer</FormLabel>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Fulfilling...' : 'Fulfill Items'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

**Acceptance Criteria:**
- Fulfillment dialog opens
- Can select items to fulfill
- Tracking info can be added
- Notification option works
- Order status updates

**Effort:** 8 story points

---

#### US-WEB-204: Customer List & Details
**Story:** As a merchant, I can view customers so that I can manage relationships.

**Tasks:**
- [ ] Create customers page
- [ ] Implement customer table
- [ ] Add search and filters
- [ ] Create customer detail page
- [ ] Show customer orders
- [ ] Display customer stats (total spent, orders)
- [ ] Add customer tags

**Design Patterns:**
- Container/Presentational Pattern
- Custom Hooks Pattern

**Acceptance Criteria:**
- Customers display in table
- Search works
- Customer details page works
- Shows order history
- Stats display correctly
- Tags can be added

**Effort:** 13 story points

**Sprint 2 Total:** 47 story points

---

## Sprint 3: Admin - Analytics & Settings (Week 7-8)

### Goals
- Analytics dashboard
- Store settings
- Theme customization

### User Stories

#### US-WEB-301: Analytics Page
**Story:** As a merchant, I can view analytics so that I can make informed decisions.

**Tasks:**
- [ ] Create analytics page
- [ ] Implement date range selector
- [ ] Add sales charts (line, bar)
- [ ] Create product performance table
- [ ] Add customer analytics
- [ ] Implement data export

**Design Patterns:**
- Custom Hooks Pattern
- Strategy Pattern (Chart types)

**Implementation:**
```typescript
// features/analytics/AnalyticsPage.tsx
export function AnalyticsPage() {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const { data: salesData } = useSalesAnalytics(dateRange);
  const { data: products } = useTopProducts({ limit: 10 });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1>Analytics</h1>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Total Sales"
          value={formatCurrency(salesData?.revenue)}
          change={salesData?.revenueChange}
          icon={DollarSignIcon}
        />
        {/* More cards... */}
      </div>

      {/* Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesChart data={salesData?.timeSeries} />
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          <TopProductsTable products={products} />
        </CardContent>
      </Card>
    </div>
  );
}
```

**Acceptance Criteria:**
- Analytics page displays
- Charts render correctly
- Date range filtering works
- Data updates when range changes
- Export works

**Effort:** 13 story points

---

#### US-WEB-302: Store Settings
**Story:** As a merchant, I can configure store settings so that I can customize my store.

**Tasks:**
- [ ] Create settings page with tabs
- [ ] General settings form
- [ ] Payment gateway configuration
- [ ] Shipping zones and rates
- [ ] Tax settings
- [ ] Checkout settings

**Design Patterns:**
- Tabs Pattern
- Form handling
- Strategy Pattern (Settings sections)

**Acceptance Criteria:**
- Settings page with tabs
- All settings can be updated
- Form validation works
- Changes save successfully

**Effort:** 13 story points

---

#### US-WEB-303: Theme Customization
**Story:** As a merchant, I can customize my store theme so that it matches my brand.

**Tasks:**
- [ ] Create theme customizer page
- [ ] Color picker for brand colors
- [ ] Font selector
- [ ] Logo upload
- [ ] Live preview
- [ ] Save theme settings

**Design Patterns:**
- Observer Pattern (Live preview)
- Builder Pattern (Theme builder)

**Acceptance Criteria:**
- Theme customizer works
- Live preview updates in real-time
- Settings save correctly
- Theme applies to storefront

**Effort:** 13 story points

**Sprint 3 Total:** 39 story points

---

## Sprint 4: Storefront - Product Browsing (Week 9-10)

### Goals
- Storefront layout
- Product listing page
- Product detail page
- Search functionality

### User Stories

#### US-WEB-401: Storefront Layout
**Story:** As a customer, I see a consistent layout so that I can navigate easily.

**Tasks:**
- [ ] Create storefront layout
- [ ] Implement header with navigation
- [ ] Add search bar
- [ ] Create cart icon with count
- [ ] Implement mobile menu
- [ ] Add footer

**Design Patterns:**
- Layout Pattern
- Compound Component Pattern

**Acceptance Criteria:**
- Layout renders correctly
- Header navigation works
- Mobile menu works
- Cart icon shows count
- Footer displays

**Effort:** 8 story points

---

#### US-WEB-402: Product Listing Page
**Story:** As a customer, I can browse products so that I can find what I want.

**Tasks:**
- [ ] Create product listing page
- [ ] Implement product grid
- [ ] Add filters sidebar
- [ ] Implement sorting
- [ ] Add pagination/infinite scroll
- [ ] Show product quick view

**Design Patterns:**
- Container/Presentational Pattern
- Custom Hooks Pattern
- Observer Pattern (URL params)

**Implementation:**
```typescript
// features/storefront/ProductListing.tsx
export function ProductListing() {
  const [filters, setFilters] = useQueryParams<ProductFilters>();
  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteProducts(filters);

  const products = data?.pages.flatMap((page) => page.products) || [];

  return (
    <div className="container py-8">
      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <ProductFilters value={filters} onChange={setFilters} />
        </aside>

        {/* Products */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1>{data?.pages[0]?.total} Products</h1>
            <ProductSort value={filters.sort} onChange={(sort) => setFilters({ sort })} />
          </div>

          {isLoading ? (
            <ProductGridSkeleton />
          ) : (
            <>
              <div className="grid grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {hasNextPage && (
                <div className="mt-8 text-center">
                  <Button onClick={() => fetchNextPage()}>
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.handle}`}>
      <Card className="group cursor-pointer hover:shadow-lg transition">
        <div className="aspect-square relative overflow-hidden">
          <Image
            src={product.images[0]?.url}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold">{product.title}</h3>
          <p className="text-lg font-bold">
            {formatCurrency(product.price)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
```

**Acceptance Criteria:**
- Products display in grid
- Filters work and update URL
- Sorting works
- Infinite scroll works
- Quick view works
- Responsive design

**Effort:** 13 story points

---

#### US-WEB-403: Product Detail Page
**Story:** As a customer, I can view product details so that I can make a purchase decision.

**Tasks:**
- [ ] Create product detail page
- [ ] Implement image gallery
- [ ] Add variant selector
- [ ] Show price and availability
- [ ] Add to cart button
- [ ] Display product description
- [ ] Show related products

**Design Patterns:**
- Compound Component Pattern
- State management

**Implementation:**
```typescript
// features/storefront/ProductDetail.tsx
export function ProductDetail({ handle }: { handle: string }) {
  const { data: product, isLoading } = useProduct(handle);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (product && !selectedVariant) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product, selectedVariant]);

  if (isLoading) return <ProductDetailSkeleton />;
  if (!product) return <NotFound />;

  return (
    <div className="container py-8">
      <div className="grid grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <ProductImageGallery images={product.images} />
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.title}</h1>
            <div className="text-2xl font-bold mt-2">
              {formatCurrency(selectedVariant?.price)}
            </div>
          </div>

          {/* Variant Selector */}
          <div>
            {product.options.map((option) => (
              <VariantOption
                key={option.name}
                option={option}
                selectedValue={selectedVariant?.options[option.name]}
                onChange={(value) => {
                  const variant = product.variants.find(
                    (v) => v.options[option.name] === value
                  );
                  setSelectedVariant(variant);
                }}
              />
            ))}
          </div>

          {/* Add to Cart */}
          <Button
            size="lg"
            className="w-full"
            disabled={!selectedVariant || selectedVariant.inventoryQty === 0}
            onClick={() => addToCart(selectedVariant)}
          >
            {selectedVariant?.inventoryQty === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>

          {/* Description */}
          <div>
            <h2 className="font-semibold mb-2">Description</h2>
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
        <RelatedProducts productId={product.id} />
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- Product details display
- Image gallery works
- Variant selection works
- Add to cart works
- Out of stock handling
- Related products shown

**Effort:** 13 story points

---

#### US-WEB-404: Product Search
**Story:** As a customer, I can search for products so that I can find what I need quickly.

**Tasks:**
- [ ] Implement search input with autocomplete
- [ ] Create search results page
- [ ] Add search suggestions
- [ ] Highlight search terms
- [ ] Show search filters
- [ ] Handle no results state

**Design Patterns:**
- Debouncing Pattern
- Custom Hooks Pattern

**Implementation:**
```typescript
// components/SearchBar.tsx
export function SearchBar() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Debounced search
  const debouncedQuery = useDebounce(query, 300);

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['search-suggestions', debouncedQuery],
    queryFn: () => apiClient.products.search({ q: debouncedQuery, limit: 5 }),
    enabled: debouncedQuery.length > 2,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${query}`);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <form onSubmit={handleSearch}>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            placeholder="Search products..."
            className="pl-10"
          />
        </div>
      </form>

      <PopoverContent>
        {isLoading ? (
          <div>Loading...</div>
        ) : suggestions?.length > 0 ? (
          <div>
            {suggestions.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.handle}`}
                className="flex items-center gap-3 p-2 hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                <Image
                  src={product.images[0]?.url}
                  alt={product.title}
                  width={40}
                  height={40}
                  className="rounded"
                />
                <div>
                  <div className="font-medium">{product.title}</div>
                  <div className="text-sm text-gray-600">
                    {formatCurrency(product.price)}
                  </div>
                </div>
              </Link>
            ))}
            <div className="pt-2 border-t">
              <Button variant="link" onClick={handleSearch}>
                See all results for "{query}"
              </Button>
            </div>
          </div>
        ) : query.length > 2 ? (
          <div className="text-center text-gray-600">No products found</div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
```

**Acceptance Criteria:**
- Search autocomplete works
- Search results page displays
- Filters can be applied to search
- No results state shown
- Search is fast (<300ms)

**Effort:** 13 story points

**Sprint 4 Total:** 47 story points

---

## Sprint 5: Storefront - Cart & Checkout (Week 11-12)

### Goals
- Shopping cart
- Checkout flow
- Payment integration

### User Stories

#### US-WEB-501: Shopping Cart
**Story:** As a customer, I can manage my cart so that I can purchase products.

**Tasks:**
- [ ] Implement cart state management
- [ ] Create cart drawer/page
- [ ] Add/remove/update items
- [ ] Calculate totals
- [ ] Apply discount codes
- [ ] Persist cart in localStorage
- [ ] Cart sync across tabs

**Design Patterns:**
- Observer Pattern (Cart state)
- Strategy Pattern (Discount calculation)

**Implementation:**
```typescript
// stores/cartStore.ts
interface CartItem {
  variantId: string;
  productId: string;
  title: string;
  variantTitle: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartStore {
  items: CartItem[];
  discountCode: string | null;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  applyDiscount: (code: string) => Promise<void>;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      discountCode: null,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        }));
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity === 0) {
          get().removeItem(variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i
          ),
        }));
      },

      applyDiscount: async (code) => {
        // API call to validate discount
        const discount = await apiClient.discounts.validate(code);
        set({ discountCode: code });
      },

      clearCart: () => set({ items: [], discountCode: null }),

      getTotal: () => {
        const state = get();
        return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

// Cart Drawer Component
export function CartDrawer({ open, onClose }) {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const router = useRouter();

  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Shopping Cart ({items.length})</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-4">
                {items.map((item) => (
                  <CartItem
                    key={item.variantId}
                    item={item}
                    onRemove={() => removeItem(item.variantId)}
                    onUpdateQuantity={(qty) => updateQuantity(item.variantId, qty)}
                  />
                ))}
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(getTotal())}</span>
                </div>

                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  Checkout
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

**Acceptance Criteria:**
- Items can be added to cart
- Quantities can be updated
- Items can be removed
- Totals calculate correctly
- Cart persists on refresh
- Cart syncs across tabs

**Effort:** 13 story points

---

#### US-WEB-502: Checkout Flow
**Story:** As a customer, I can checkout so that I can complete my purchase.

**Tasks:**
- [ ] Create multi-step checkout
- [ ] Implement information step (email, shipping)
- [ ] Implement shipping method selection
- [ ] Create payment step
- [ ] Add order review
- [ ] Show order summary sidebar
- [ ] Implement form validation

**Design Patterns:**
- Wizard/Stepper Pattern
- Form validation
- State machine (checkout steps)

**Implementation:**
```typescript
// features/checkout/CheckoutPage.tsx
export function CheckoutPage() {
  const [step, setStep] = useState<'information' | 'shipping' | 'payment'>('information');
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({});

  const { items, getTotal } = useCartStore();

  const steps = [
    { key: 'information', label: 'Information' },
    { key: 'shipping', label: 'Shipping' },
    { key: 'payment', label: 'Payment' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-6xl py-8">
        {/* Progress Steps */}
        <CheckoutProgress steps={steps} currentStep={step} />

        <div className="grid grid-cols-3 gap-8 mt-8">
          {/* Checkout Form */}
          <div className="col-span-2">
            {step === 'information' && (
              <InformationStep
                data={checkoutData}
                onNext={(data) => {
                  setCheckoutData({ ...checkoutData, ...data });
                  setStep('shipping');
                }}
              />
            )}

            {step === 'shipping' && (
              <ShippingStep
                data={checkoutData}
                onNext={(data) => {
                  setCheckoutData({ ...checkoutData, ...data });
                  setStep('payment');
                }}
                onBack={() => setStep('information')}
              />
            )}

            {step === 'payment' && (
              <PaymentStep
                data={checkoutData}
                onBack={() => setStep('shipping')}
              />
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-3">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={60}
                      height={60}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-gray-600">
                        {item.variantTitle}
                      </div>
                      <div className="text-sm">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(getTotal())}</span>
                  </div>
                  {checkoutData.shippingRate && (
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{formatCurrency(checkoutData.shippingRate)}</span>
                    </div>
                  )}
                  {checkoutData.tax && (
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>{formatCurrency(checkoutData.tax)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>
                      {formatCurrency(
                        getTotal() +
                          (checkoutData.shippingRate || 0) +
                          (checkoutData.tax || 0)
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Information Step
function InformationStep({ data, onNext }) {
  const form = useForm({
    defaultValues: data,
    resolver: zodResolver(informationSchema),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onNext)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <h3 className="font-semibold">Shipping Address</h3>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* More address fields... */}

            <Button type="submit" size="lg" className="w-full">
              Continue to Shipping
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
```

**Acceptance Criteria:**
- Multi-step checkout works
- Form validation works
- Can navigate between steps
- Order summary updates
- Shipping and tax calculated
- Responsive design

**Effort:** 21 story points

---

#### US-WEB-503: Payment Integration
**Story:** As a customer, I can pay for my order so that I can complete checkout.

**Tasks:**
- [ ] Integrate Stripe Elements
- [ ] Implement payment form
- [ ] Handle payment submission
- [ ] Add Apple Pay / Google Pay
- [ ] Show order confirmation
- [ ] Handle payment errors

**Design Patterns:**
- Strategy Pattern (Payment methods)
- Adapter Pattern (Stripe SDK)

**Implementation:**
```typescript
// features/checkout/PaymentStep.tsx
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

export function PaymentStep({ data, onBack }) {
  const { items, clearCart } = useCartStore();
  const router = useRouter();

  // Create payment intent
  const { data: paymentIntent } = useQuery({
    queryKey: ['payment-intent'],
    queryFn: async () => {
      const response = await apiClient.payments.createIntent({
        amount: calculateTotal(data),
        currency: 'usd',
      });
      return response.data;
    },
  });

  if (!paymentIntent) return <LoadingSpinner />;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret: paymentIntent.clientSecret }}>
      <PaymentForm
        data={data}
        onBack={onBack}
        onSuccess={(orderId) => {
          clearCart();
          router.push(`/orders/${orderId}/confirmation`);
        }}
      />
    </Elements>
  );
}

function PaymentForm({ data, onBack, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const { mutate: createOrder } = useMutation({
    mutationFn: (orderData) => apiClient.orders.create(orderData),
    onSuccess: (order) => onSuccess(order.id),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    // Confirm payment
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      toast.error(error.message);
      setIsProcessing(false);
      return;
    }

    // Create order
    createOrder({
      ...data,
      paymentIntentId: paymentIntent.id,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <PaymentElement />

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!stripe || isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Pay Now'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

**Acceptance Criteria:**
- Stripe Elements loads
- Payment form works
- Apple Pay / Google Pay available
- Payment processes successfully
- Order confirmation shown
- Errors handled gracefully

**Effort:** 13 story points

**Sprint 5 Total:** 47 story points

---

## Sprint 6-8: Additional Features & Optimization (Week 13-18)

### Remaining Features
- User account pages
- Order tracking
- Wishlist
- Product reviews
- SEO optimization
- Performance optimization
- Accessibility improvements
- Testing (unit, integration, E2E)
- Documentation

---

## Module Independence Examples

### Admin Module Can Be Disabled
- Storefront continues to function
- Customers can browse and purchase
- API is still accessible
- Mobile apps work

### Storefront Module Can Be Disabled
- Admin still functions
- Merchants can manage products/orders
- Headless commerce mode
- APIs available for custom frontends

### Product Module Can Be Disabled (Admin)
- Orders can still be managed
- Analytics still work
- Customer management works
- Settings accessible

---

## Success Metrics

**Performance:**
- Lighthouse score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- Core Web Vitals passing

**Quality:**
- Test coverage > 80%
- Zero accessibility violations (WCAG AA)
- Zero console errors in production
- Bundle size < 200KB (initial)

**User Experience:**
- Intuitive navigation
- Fast interactions (< 100ms)
- Mobile-friendly
- Consistent design

---

**END OF WEB SPRINT PLAN**
