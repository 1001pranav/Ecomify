# Mobile Sprint Plan - Ecomify Platform

**Project:** Ecomify E-Commerce Platform
**Track:** Mobile Applications (Merchant & Customer Apps)
**Duration:** 16 weeks (8 sprints × 2 weeks)
**Team Size:** 4-6 Mobile Engineers
**Technology:** React Native, Expo, TypeScript, Redux Toolkit

---

## Architecture Principles

### Modularity Requirements
- **Independent Apps**: Merchant and Customer apps can function independently
- **Shared Core Library**: Common components, utilities, and API clients
- **Feature-Based Architecture**: Features are self-contained modules
- **Offline-First**: Core functionality works without internet
- **Graceful Degradation**: App works even if some API endpoints fail

### Design Patterns to Implement
- **Container/Presentational Pattern**
- **Custom Hooks Pattern**
- **Provider Pattern (Context)**
- **Repository Pattern (Data access)**
- **Facade Pattern (API clients)**
- **Observer Pattern (State management)**
- **Strategy Pattern (Platform-specific code)**
- **Factory Pattern (Notification handlers)**
- **Singleton Pattern (API client, Database)**
- **Adapter Pattern (Third-party SDKs)**

---

## Project Structure

```
mobile/
├── apps/
│   ├── merchant/              # Merchant app
│   │   ├── src/
│   │   │   ├── screens/       # Screens
│   │   │   ├── navigation/    # Navigation setup
│   │   │   └── app.tsx        # App entry
│   │   ├── app.json
│   │   └── package.json
│   │
│   └── customer/              # Customer app
│       ├── src/
│       │   ├── screens/
│       │   ├── navigation/
│       │   └── app.tsx
│       ├── app.json
│       └── package.json
│
└── packages/
    ├── ui/                    # Shared UI components
    ├── api/                   # API client
    ├── core/                  # Core utilities
    ├── store/                 # Redux store setup
    ├── hooks/                 # Shared hooks
    └── types/                 # TypeScript types
```

---

## Sprint 0: Foundation & Setup (Week 1-2)

### Goals
- Set up React Native project structure
- Configure development environment
- Set up shared libraries
- Configure navigation

### User Stories

#### US-MOB-001: Project Setup
**Story:** As a developer, I need a React Native monorepo so that I can share code between apps.

**Tasks:**
- [ ] Initialize React Native monorepo (Expo)
- [ ] Create merchant app
- [ ] Create customer app
- [ ] Configure TypeScript (strict mode)
- [ ] Set up ESLint and Prettier
- [ ] Configure path aliases
- [ ] Set up environment variables
- [ ] Configure app icons and splash screens

**Design Patterns:**
- Monorepo architecture

**Folder Structure:**
```
mobile/
├── apps/
│   ├── merchant/
│   └── customer/
├── packages/
│   ├── ui/
│   ├── api/
│   └── core/
├── package.json
└── tsconfig.json
```

**Acceptance Criteria:**
- Both apps run on iOS and Android
- TypeScript configured with strict mode
- Linting and formatting work
- Environment variables accessible
- Icons and splash screens configured

**Effort:** 8 story points

---

#### US-MOB-002: UI Component Library
**Story:** As a developer, I need a component library so that UI is consistent.

**Tasks:**
- [ ] Set up React Native Paper or NativeBase
- [ ] Create shared component package
- [ ] Implement design tokens (colors, spacing, typography)
- [ ] Create base components (Button, Input, Card, etc.)
- [ ] Implement theme provider
- [ ] Set up dark mode support

**Design Patterns:**
- Provider Pattern (Theme)
- Compound Component Pattern

**Components to Create:**
```typescript
// Button
<Button variant="primary" size="lg" onPress={handlePress}>
  Click Me
</Button>

// Card
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Content>
    Content
  </Card.Content>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>

// Input
<Input
  label="Email"
  placeholder="Enter email"
  error="Invalid email"
/>
```

**Acceptance Criteria:**
- 20+ base components created
- Theme provider works
- Dark mode supported
- Components work on iOS and Android
- Accessible (screen reader support)

**Effort:** 13 story points

---

#### US-MOB-003: Navigation Setup
**Story:** As a developer, I need navigation configured so that users can navigate between screens.

**Tasks:**
- [ ] Install React Navigation
- [ ] Configure stack navigator
- [ ] Configure tab navigator
- [ ] Configure drawer navigator (optional)
- [ ] Set up deep linking
- [ ] Implement authentication flow navigation

**Design Patterns:**
- Navigation pattern
- Guard pattern (Protected routes)

**Navigation Structure:**
```typescript
// Merchant App
<RootNavigator>
  {!isAuthenticated ? (
    <AuthStack>
      <Screen name="Login" component={LoginScreen} />
      <Screen name="Register" component={RegisterScreen} />
    </AuthStack>
  ) : (
    <MainTabs>
      <Tab name="Dashboard" component={DashboardScreen} />
      <Tab name="Orders" component={OrdersNavigator} />
      <Tab name="Products" component={ProductsNavigator} />
      <Tab name="More" component={MoreScreen} />
    </MainTabs>
  )}
</RootNavigator>

// Customer App
<RootNavigator>
  <MainTabs>
    <Tab name="Shop" component={ShopNavigator} />
    <Tab name="Cart" component={CartScreen} />
    <Tab name="Account" component={AccountNavigator} />
  </MainTabs>
</RootNavigator>
```

**Acceptance Criteria:**
- Navigation works on both platforms
- Auth flow switches correctly
- Deep linking works
- Smooth transitions
- Proper back button handling

**Effort:** 8 story points

---

#### US-MOB-004: API Client Setup
**Story:** As a developer, I need an API client so that I can communicate with backend.

**Tasks:**
- [ ] Create API client package
- [ ] Implement Axios wrapper
- [ ] Add request/response interceptors
- [ ] Implement token refresh logic
- [ ] Add offline queue support
- [ ] Create typed API methods

**Design Patterns:**
- Singleton Pattern (API client)
- Facade Pattern (API abstraction)
- Interceptor Pattern

**Implementation:**
```typescript
// packages/api/src/client.ts
import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

class ApiClient {
  private static instance: ApiClient;
  private axios: AxiosInstance;
  private offlineQueue: Array<() => Promise<any>> = [];

  private constructor() {
    this.axios = axios.create({
      baseURL: process.env.API_URL,
      timeout: 10000,
    });

    this.setupInterceptors();
    this.setupNetworkListener();
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private setupInterceptors() {
    // Request interceptor
    this.axios.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            return this.axios.request(error.config);
          }
        }

        // Offline handling
        if (!error.response) {
          return this.queueRequest(() => this.axios.request(error.config));
        }

        return Promise.reject(error);
      }
    );
  }

  private setupNetworkListener() {
    NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        this.processOfflineQueue();
      }
    });
  }

  private async queueRequest(request: () => Promise<any>) {
    this.offlineQueue.push(request);
    return Promise.reject(new Error('Request queued for offline'));
  }

  private async processOfflineQueue() {
    while (this.offlineQueue.length > 0) {
      const request = this.offlineQueue.shift();
      try {
        await request();
      } catch (error) {
        console.error('Offline queue error:', error);
      }
    }
  }

  // Typed API methods
  auth = {
    login: (email: string, password: string) =>
      this.axios.post('/auth/login', { email, password }),
    register: (data: RegisterData) =>
      this.axios.post('/auth/register', data),
  };

  products = {
    list: (params?: ProductParams) =>
      this.axios.get<Product[]>('/products', { params }),
    get: (id: string) =>
      this.axios.get<Product>(`/products/${id}`),
    create: (data: CreateProductData) =>
      this.axios.post<Product>('/products', data),
  };

  orders = {
    list: (params?: OrderParams) =>
      this.axios.get<Order[]>('/orders', { params }),
    get: (id: string) =>
      this.axios.get<Order>(`/orders/${id}`),
    create: (data: CreateOrderData) =>
      this.axios.post<Order>('/orders', data),
  };
}

export const apiClient = ApiClient.getInstance();
```

**Acceptance Criteria:**
- API client works
- Token refresh works
- Offline queue works
- TypeScript types correct
- Network status handled

**Effort:** 13 story points

---

#### US-MOB-005: State Management Setup
**Story:** As a developer, I need state management so that I can manage app state.

**Tasks:**
- [ ] Set up Redux Toolkit
- [ ] Create store slices (auth, cart, UI)
- [ ] Implement persistence (AsyncStorage)
- [ ] Set up Redux DevTools
- [ ] Create typed hooks

**Design Patterns:**
- Observer Pattern (Redux)
- Singleton Pattern (Store)

**Implementation:**
```typescript
// packages/store/src/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setAuth, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;

// Typed hooks
export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  );

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.auth.login(email, password);
      const { user, token } = response.data;

      await AsyncStorage.setItem('authToken', token);
      dispatch(setAuth({ user, token }));
    } catch (error) {
      throw error;
    }
  };

  const logoutUser = async () => {
    await AsyncStorage.removeItem('authToken');
    dispatch(logout());
  };

  return { user, isAuthenticated, isLoading, login, logout: logoutUser };
};
```

**Acceptance Criteria:**
- Redux store configured
- Slices work correctly
- Persistence works
- Typed hooks available
- DevTools connected

**Effort:** 13 story points

**Sprint 0 Total:** 55 story points

---

## Sprint 1: Merchant App - Core Features (Week 3-4)

### Goals
- Authentication screens
- Dashboard
- Order list
- Order details

### User Stories

#### US-MOB-101: Merchant Authentication
**Story:** As a merchant, I can log in so that I can access my store.

**Tasks:**
- [ ] Create login screen
- [ ] Create registration screen
- [ ] Implement form validation
- [ ] Add biometric authentication
- [ ] Implement remember me
- [ ] Add forgot password flow

**Design Patterns:**
- Form handling pattern
- Validation pattern

**Implementation:**
```typescript
// apps/merchant/src/screens/LoginScreen.tsx
import { useAuth } from '@ecomify/store';
import * as LocalAuthentication from 'expo-local-authentication';

export function LoginScreen({ navigation }) {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [useBiometric, setUseBiometric] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
    tryBiometricLogin();
  }, []);

  const checkBiometricAvailability = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setUseBiometric(compatible && enrolled);
  };

  const tryBiometricLogin = async () => {
    if (!useBiometric) return;

    const savedEmail = await AsyncStorage.getItem('savedEmail');
    if (!savedEmail) return;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to log in',
    });

    if (result.success) {
      // Auto-login with saved credentials
      const savedPassword = await SecureStore.getItemAsync('savedPassword');
      if (savedPassword) {
        handleLogin(savedEmail, savedPassword);
      }
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);

      // Save for biometric login
      if (useBiometric) {
        await AsyncStorage.setItem('savedEmail', email);
        await SecureStore.setItemAsync('savedPassword', password);
      }

      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Error', 'Invalid credentials');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Ecomify Merchant</Text>

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {useBiometric && (
          <TouchableOpacity onPress={tryBiometricLogin}>
            <Text style={styles.biometricText}>
              Use Face ID / Touch ID
            </Text>
          </TouchableOpacity>
        )}

        <Button
          onPress={() => handleLogin(email, password)}
          loading={isLoading}
          disabled={!email || !password}
        >
          Log In
        </Button>

        <Button
          variant="text"
          onPress={() => navigation.navigate('Register')}
        >
          Create Account
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
```

**Acceptance Criteria:**
- Login works
- Biometric auth works
- Form validation works
- Registration works
- Forgot password works
- Accessible

**Effort:** 13 story points

---

#### US-MOB-102: Merchant Dashboard
**Story:** As a merchant, I can see key metrics so that I can monitor my store.

**Tasks:**
- [ ] Create dashboard screen
- [ ] Display metric cards (revenue, orders)
- [ ] Add sales chart
- [ ] Show recent orders
- [ ] Implement pull-to-refresh
- [ ] Add real-time updates (optional)

**Design Patterns:**
- Container/Presentational Pattern
- Custom Hooks Pattern

**Implementation:**
```typescript
// apps/merchant/src/screens/DashboardScreen.tsx
import { useQuery } from '@tanstack/react-query';
import { RefreshControl } from 'react-native';

export function DashboardScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiClient.analytics.getDashboard(),
    refetchInterval: 30000, // Refresh every 30s
  });

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Metric Cards */}
          <View style={styles.metricsGrid}>
            <MetricCard
              title="Today's Sales"
              value={formatCurrency(data.todaySales)}
              change="+12.5%"
              trend="up"
              icon="dollar-sign"
            />
            <MetricCard
              title="Orders"
              value={data.orders}
              change="+8.2%"
              trend="up"
              icon="shopping-cart"
            />
            <MetricCard
              title="Visitors"
              value={data.visitors}
              change="-3.1%"
              trend="down"
              icon="users"
            />
            <MetricCard
              title="Conversion"
              value={`${data.conversionRate}%`}
              change="+1.2%"
              trend="up"
              icon="trending-up"
            />
          </View>

          {/* Sales Chart */}
          <Card style={styles.chartCard}>
            <Card.Header>
              <Card.Title>Sales Overview</Card.Title>
            </Card.Header>
            <Card.Content>
              <SalesChart data={data.salesData} />
            </Card.Content>
          </Card>

          {/* Recent Orders */}
          <Card>
            <Card.Header>
              <Card.Title>Recent Orders</Card.Title>
              <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </Card.Header>
            <Card.Content>
              {data.recentOrders.map((order) => (
                <OrderListItem
                  key={order.id}
                  order={order}
                  onPress={() =>
                    navigation.navigate('OrderDetail', { orderId: order.id })
                  }
                />
              ))}
            </Card.Content>
          </Card>
        </>
      )}
    </ScrollView>
  );
}

// Metric Card Component
function MetricCard({ title, value, change, trend, icon }) {
  return (
    <Card style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <Icon name={icon} size={24} color="#666" />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
      <View style={styles.metricChange}>
        <Icon
          name={trend === 'up' ? 'trending-up' : 'trending-down'}
          size={16}
          color={trend === 'up' ? '#10b981' : '#ef4444'}
        />
        <Text
          style={[
            styles.changeText,
            { color: trend === 'up' ? '#10b981' : '#ef4444' },
          ]}
        >
          {change}
        </Text>
      </View>
    </Card>
  );
}
```

**Acceptance Criteria:**
- Dashboard displays metrics
- Charts render correctly
- Pull-to-refresh works
- Real-time updates work
- Responsive layout

**Effort:** 13 story points

---

#### US-MOB-103: Order List
**Story:** As a merchant, I can view orders so that I can manage them.

**Tasks:**
- [ ] Create orders list screen
- [ ] Implement infinite scroll
- [ ] Add search functionality
- [ ] Add filters (status, date)
- [ ] Show order status badges
- [ ] Add swipe actions (fulfill, view)

**Design Patterns:**
- Infinite scroll pattern
- Swipeable pattern

**Implementation:**
```typescript
// apps/merchant/src/screens/OrdersScreen.tsx
import { FlashList } from '@shopify/flash-list';
import { Swipeable } from 'react-native-gesture-handler';

export function OrdersScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<OrderFilters>({});

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['orders', search, filters],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.orders.list({
        page: pageParam,
        search,
        ...filters,
      }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const orders = data?.pages.flatMap((page) => page.orders) || [];

  const renderRightActions = (order: Order) => (
    <View style={styles.swipeActions}>
      <TouchableOpacity
        style={[styles.swipeAction, styles.fulfillAction]}
        onPress={() => handleFulfill(order)}
      >
        <Icon name="check" size={20} color="#fff" />
        <Text style={styles.swipeActionText}>Fulfill</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.swipeAction, styles.viewAction]}
        onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
      >
        <Icon name="eye" size={20} color="#fff" />
        <Text style={styles.swipeActionText}>View</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search orders..."
      />

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filters}>
          <FilterChip
            label="All"
            active={!filters.status}
            onPress={() => setFilters({})}
          />
          <FilterChip
            label="Unfulfilled"
            active={filters.status === 'unfulfilled'}
            onPress={() => setFilters({ status: 'unfulfilled' })}
          />
          <FilterChip
            label="Fulfilled"
            active={filters.status === 'fulfilled'}
            onPress={() => setFilters({ status: 'fulfilled' })}
          />
        </View>
      </ScrollView>

      {/* Order List */}
      {isLoading ? (
        <OrderListSkeleton />
      ) : (
        <FlashList
          data={orders}
          renderItem={({ item }) => (
            <Swipeable renderRightActions={() => renderRightActions(item)}>
              <OrderListItem
                order={item}
                onPress={() =>
                  navigation.navigate('OrderDetail', { orderId: item.id })
                }
              />
            </Swipeable>
          )}
          estimatedItemSize={100}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator /> : null
          }
        />
      )}
    </View>
  );
}

// Order List Item
function OrderListItem({ order, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.orderItem}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
        <StatusBadge status={order.fulfillmentStatus} />
      </View>

      <Text style={styles.orderCustomer}>{order.email}</Text>

      <View style={styles.orderFooter}>
        <Text style={styles.orderDate}>
          {formatDate(order.createdAt)}
        </Text>
        <Text style={styles.orderTotal}>
          {formatCurrency(order.totalPrice)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
```

**Acceptance Criteria:**
- Orders display correctly
- Infinite scroll works
- Search works
- Filters work
- Swipe actions work
- Performance optimized

**Effort:** 13 story points

---

#### US-MOB-104: Order Detail
**Story:** As a merchant, I can view order details so that I can process orders.

**Tasks:**
- [ ] Create order detail screen
- [ ] Display order information
- [ ] Show line items
- [ ] Display customer info
- [ ] Add action buttons (fulfill, refund)
- [ ] Show order timeline

**Design Patterns:**
- Container/Presentational Pattern

**Acceptance Criteria:**
- Order details display
- Line items shown
- Actions work
- Timeline displays
- Accessible

**Effort:** 8 story points

**Sprint 1 Total:** 47 story points

---

## Sprint 2: Merchant App - Product Management (Week 5-6)

### Goals
- Product list
- Product creation/editing
- Image upload
- Inventory management

### User Stories

#### US-MOB-201: Product List
**Story:** As a merchant, I can view products so that I can manage my catalog.

**Tasks:**
- [ ] Create products screen
- [ ] Implement infinite scroll
- [ ] Add search
- [ ] Add filters
- [ ] Show product images
- [ ] Add quick actions

**Acceptance Criteria:**
- Products display in list
- Search works
- Filters work
- Images load efficiently
- Quick actions available

**Effort:** 8 story points

---

#### US-MOB-202: Product Creation/Edit
**Story:** As a merchant, I can create/edit products so that I can manage inventory.

**Tasks:**
- [ ] Create product form screen
- [ ] Implement multi-step form
- [ ] Add image picker (camera/gallery)
- [ ] Implement variant builder
- [ ] Add form validation
- [ ] Handle offline creation

**Design Patterns:**
- Multi-step form pattern
- Image upload pattern

**Implementation:**
```typescript
// apps/merchant/src/screens/ProductFormScreen.tsx
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export function ProductFormScreen({ route, navigation }) {
  const { productId } = route.params || {};
  const isEdit = !!productId;

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    price: '',
    images: [],
    variants: [],
  });

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Camera roll access is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...result.assets],
      }));
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Camera access is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, result.assets[0]],
      }));
    }
  };

  const handleSave = async () => {
    try {
      // Upload images first
      const uploadedImages = await Promise.all(
        formData.images.map(async (image) => {
          const formData = new FormData();
          formData.append('file', {
            uri: image.uri,
            type: 'image/jpeg',
            name: 'product.jpg',
          } as any);

          const response = await apiClient.media.upload(formData);
          return response.data;
        })
      );

      // Create/update product
      const productData = {
        ...formData,
        images: uploadedImages,
      };

      if (isEdit) {
        await apiClient.products.update(productId, productData);
      } else {
        await apiClient.products.create(productData);
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save product');
    }
  };

  return (
    <KeyboardAwareScrollView>
      {step === 1 && (
        <View style={styles.step}>
          <Text style={styles.stepTitle}>Product Details</Text>

          <Input
            label="Title"
            value={formData.title}
            onChangeText={(title) => setFormData({ ...formData, title })}
            required
          />

          <TextArea
            label="Description"
            value={formData.description}
            onChangeText={(description) =>
              setFormData({ ...formData, description })
            }
          />

          <Input
            label="Price"
            value={formData.price}
            onChangeText={(price) => setFormData({ ...formData, price })}
            keyboardType="decimal-pad"
            required
          />

          <Button onPress={() => setStep(2)}>
            Next
          </Button>
        </View>
      )}

      {step === 2 && (
        <View style={styles.step}>
          <Text style={styles.stepTitle}>Product Images</Text>

          <View style={styles.imageGrid}>
            {formData.images.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: image.uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImage}
                  onPress={() => {
                    setFormData((prev) => ({
                      ...prev,
                      images: prev.images.filter((_, i) => i !== index),
                    }));
                  }}
                >
                  <Icon name="x" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.addImage} onPress={pickImage}>
              <Icon name="plus" size={24} color="#666" />
              <Text>Add Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.addImage} onPress={takePhoto}>
              <Icon name="camera" size={24} color="#666" />
              <Text>Take Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <Button variant="outline" onPress={() => setStep(1)}>
              Back
            </Button>
            <Button onPress={() => setStep(3)}>
              Next
            </Button>
          </View>
        </View>
      )}

      {step === 3 && (
        <View style={styles.step}>
          <Text style={styles.stepTitle}>Variants</Text>

          <VariantBuilder
            value={formData.variants}
            onChange={(variants) => setFormData({ ...formData, variants })}
          />

          <View style={styles.buttonRow}>
            <Button variant="outline" onPress={() => setStep(2)}>
              Back
            </Button>
            <Button onPress={handleSave} loading={isLoading}>
              Save Product
            </Button>
          </View>
        </View>
      )}
    </KeyboardAwareScrollView>
  );
}
```

**Acceptance Criteria:**
- Form works for create/edit
- Images can be uploaded from gallery
- Photos can be taken with camera
- Validation works
- Variants can be created
- Works offline (queued)

**Effort:** 21 story points

---

#### US-MOB-203: Push Notifications
**Story:** As a merchant, I receive notifications so that I'm informed of important events.

**Tasks:**
- [ ] Set up Firebase Cloud Messaging
- [ ] Request notification permissions
- [ ] Handle notification reception
- [ ] Implement deep linking from notifications
- [ ] Add notification settings screen

**Design Patterns:**
- Observer Pattern (Notification handlers)
- Factory Pattern (Notification actions)

**Acceptance Criteria:**
- Notifications received
- Tapping opens relevant screen
- Works in foreground/background
- Settings allow control

**Effort:** 13 story points

**Sprint 2 Total:** 42 story points

---

## Sprint 3: Customer App - Shopping (Week 7-8)

### Goals
- Product browsing
- Product details
- Shopping cart
- Search

### User Stories

#### US-MOB-301: Product Browsing
**Story:** As a customer, I can browse products so that I can shop.

**Tasks:**
- [ ] Create shop screen
- [ ] Implement product grid
- [ ] Add infinite scroll
- [ ] Implement filters
- [ ] Add sorting
- [ ] Show product images

**Design Patterns:**
- Infinite scroll pattern
- Grid layout pattern

**Acceptance Criteria:**
- Products display in grid
- Infinite scroll works
- Filters work
- Sorting works
- Images load efficiently

**Effort:** 13 story points

---

#### US-MOB-302: Product Details
**Story:** As a customer, I can view product details so that I can make purchase decisions.

**Tasks:**
- [ ] Create product detail screen
- [ ] Implement image gallery (swiper)
- [ ] Add variant selector
- [ ] Show price and availability
- [ ] Add to cart button
- [ ] Show related products

**Design Patterns:**
- Carousel pattern
- Variant selection pattern

**Implementation:**
```typescript
// apps/customer/src/screens/ProductDetailScreen.tsx
import Carousel from 'react-native-reanimated-carousel';

export function ProductDetailScreen({ route }) {
  const { productId } = route.params;
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => apiClient.products.get(productId),
  });

  const [selectedVariant, setSelectedVariant] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (product && !selectedVariant) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  if (isLoading) return <LoadingScreen />;

  return (
    <ScrollView>
      {/* Image Carousel */}
      <Carousel
        width={Dimensions.get('window').width}
        height={Dimensions.get('window').width}
        data={product.images}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item.url }}
            style={styles.productImage}
            resizeMode="cover"
          />
        )}
        loop={false}
        pagingEnabled
      />

      <View style={styles.content}>
        {/* Product Info */}
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.price}>
          {formatCurrency(selectedVariant?.price)}
        </Text>

        {/* Variant Selector */}
        {product.options.map((option) => (
          <View key={option.name} style={styles.optionGroup}>
            <Text style={styles.optionLabel}>{option.name}</Text>
            <View style={styles.optionValues}>
              {option.values.map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.optionValue,
                    selectedVariant?.options[option.name] === value &&
                      styles.optionValueSelected,
                  ]}
                  onPress={() => {
                    const variant = product.variants.find(
                      (v) => v.options[option.name] === value
                    );
                    setSelectedVariant(variant);
                  }}
                >
                  <Text>{value}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Add to Cart */}
        <Button
          size="lg"
          disabled={!selectedVariant || selectedVariant.inventoryQty === 0}
          onPress={() => {
            addToCart(selectedVariant);
            showToast('Added to cart');
          }}
        >
          {selectedVariant?.inventoryQty === 0
            ? 'Out of Stock'
            : 'Add to Cart'}
        </Button>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* Related Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>You May Also Like</Text>
          <RelatedProducts productId={product.id} />
        </View>
      </View>
    </ScrollView>
  );
}
```

**Acceptance Criteria:**
- Product details display
- Image carousel works
- Variant selection works
- Add to cart works
- Related products shown

**Effort:** 13 story points

---

#### US-MOB-303: Shopping Cart
**Story:** As a customer, I can manage my cart so that I can checkout.

**Tasks:**
- [ ] Create cart screen
- [ ] Display cart items
- [ ] Update quantities
- [ ] Remove items
- [ ] Calculate totals
- [ ] Persist cart
- [ ] Add discount code input

**Design Patterns:**
- Observer Pattern (Cart state)
- Persistence pattern

**Acceptance Criteria:**
- Cart displays items
- Quantities can be updated
- Items can be removed
- Totals calculate correctly
- Cart persists
- Discount codes work

**Effort:** 13 story points

---

#### US-MOB-304: Product Search
**Story:** As a customer, I can search products so that I can find what I need.

**Tasks:**
- [ ] Create search screen
- [ ] Implement search bar with autocomplete
- [ ] Show search suggestions
- [ ] Display search results
- [ ] Add search filters
- [ ] Handle no results

**Design Patterns:**
- Debouncing pattern
- Autocomplete pattern

**Acceptance Criteria:**
- Search works
- Autocomplete works
- Results display correctly
- Filters work
- No results handled

**Effort:** 8 story points

**Sprint 3 Total:** 47 story points

---

## Sprint 4: Customer App - Checkout (Week 9-10)

### Goals
- Checkout flow
- Payment integration
- Order confirmation
- Order tracking

### User Stories

#### US-MOB-401: Checkout Flow
**Story:** As a customer, I can checkout so that I can complete my purchase.

**Tasks:**
- [ ] Create checkout screens
- [ ] Implement address form
- [ ] Add shipping method selection
- [ ] Create payment screen
- [ ] Implement Apple Pay / Google Pay
- [ ] Add order review

**Design Patterns:**
- Wizard pattern (Multi-step)
- Strategy pattern (Payment methods)

**Acceptance Criteria:**
- Checkout flow works
- Address can be entered
- Shipping methods shown
- Payment works
- Order created successfully

**Effort:** 21 story points

---

#### US-MOB-402: Order Tracking
**Story:** As a customer, I can track my orders so that I know delivery status.

**Tasks:**
- [ ] Create orders screen
- [ ] Show order list
- [ ] Create order detail screen
- [ ] Display tracking information
- [ ] Show order timeline
- [ ] Add reorder functionality

**Acceptance Criteria:**
- Orders display
- Order details shown
- Tracking info visible
- Timeline displays
- Reorder works

**Effort:** 13 story points

---

#### US-MOB-403: User Account
**Story:** As a customer, I can manage my account so that I can control my info.

**Tasks:**
- [ ] Create account screen
- [ ] Display profile info
- [ ] Add address management
- [ ] Implement profile editing
- [ ] Add logout

**Acceptance Criteria:**
- Account info displays
- Profile can be edited
- Addresses can be managed
- Logout works

**Effort:** 8 story points

**Sprint 4 Total:** 42 story points

---

## Sprint 5-8: Advanced Features & Polish (Week 11-18)

### Remaining Features
- Offline mode and sync
- Wishlist
- Push notifications (customer app)
- Biometric authentication
- App performance optimization
- Accessibility improvements
- Deep linking
- Analytics tracking
- Testing (unit, integration, E2E)
- App store submission prep

---

## Module Independence

### Merchant App Can Function Without:
- Customer app
- Web admin
- Specific backend services (with offline mode)

### Customer App Can Function Without:
- Merchant app
- Web storefront
- Admin services

### Both Apps Share:
- API client package
- UI component library
- Type definitions
- Core utilities

---

## Success Metrics

**Performance:**
- App launch time < 3s
- Screen transitions < 16ms (60 FPS)
- API response handling < 100ms
- Image loading optimized

**Quality:**
- Test coverage > 70%
- Zero crashes
- Accessibility score > 90%
- App size < 50MB

**User Experience:**
- Intuitive navigation
- Smooth animations
- Offline functionality
- Fast interactions

---

## Platform-Specific Considerations

### iOS
- Use native navigation bar
- Follow iOS Human Interface Guidelines
- Implement haptic feedback
- Support iOS-specific features (Face ID, etc.)

### Android
- Use Material Design components
- Support back button navigation
- Implement Android-specific features (fingerprint, etc.)
- Handle Android permissions

---

**END OF MOBILE SPRINT PLAN**
