# Kampus Web API Context & Integration Blueprint

> [!IMPORTANT]
> This document provides the complete **Backend API Specification, Endpoint Registry, Data Payloads, and Authentication Lifecycle** for building the web version of **Kampus** with Antigravity IDE.

---

## 1. Base Configuration & Environments

```env
# Production API Gateway
NEXT_PUBLIC_API_BASE_URL=https://kampus-backend.vercel.app/api
VITE_API_BASE_URL=https://kampus-backend.vercel.app/api

# Payment Integration
NEXT_PUBLIC_PAYMENT_GATEWAY=paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...

# Map Provider (Optional for Web Explore Map)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.ey...
```

### Request Headers
All authenticated endpoints require standard Bearer token authorization:
```http
Authorization: Bearer <accessToken>
Content-Type: application/json
Accept: application/json
```

---

## 2. Authentication & Token Lifecycle

```
    ┌────────────────────────────────────────────────────────┐
    │                 JWT AUTHENTICATION FLOW                │
    └────────────────────────────────────────────────────────┘
            │                                     │
    (Student Flow)                        (Landlord Flow)
            │                                     │
    POST /auth/login                       POST /auth/login
    or /auth/verify-otp                    or /auth/verify-otp
            │                                     │
            ▼                                     ▼
    ┌────────────────────────────────────────────────────────┐
    │     Receive: { accessToken, refreshToken, user }       │
    │     Store accessToken (in memory / cookie)             │
    │     Store refreshToken (httpOnly cookie / storage)     │
    └────────────────────────────────────────────────────────┘
                               │
                On 401 Unauthorized API Response:
                               │
            ┌──────────────────▼──────────────────┐
            │       POST /auth/refresh            │
            │       Body: { refreshToken }        │
            └──────────────────┬──────────────────┘
                     /                   \
           (Success: 200)             (Fail: 401/403)
                 /                             \
    ┌──────────────────────────┐    ┌──────────────────────────┐
    │ Store new token pair     │    │ Wipe state & cache       │
    │ Retry original request   │    │ Redirect to /login       │
    └──────────────────────────┘    └──────────────────────────┘
```

---

## 3. Complete Endpoint Registry

### A. Authentication & User Profile (`/auth/*`)

#### 1. Login with Password
- **Endpoint**: `POST /auth/login`
- **Auth**: Public
- **Request Body**:
```json
{
  "emailOrPhone": "student@university.edu.ng",
  "password": "SecurePassword123!",
  "role": "STUDENT" // or "LANDLORD"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "user": {
      "id": "usr_01HXYZ...",
      "phone": "+2348123456789",
      "email": "student@university.edu.ng",
      "fullName": "Chioma Adeleke",
      "role": "STUDENT",
      "profileStatus": "COMPLETED",
      "profilePicture": "https://res.cloudinary.com/.../avatar.jpg",
      "student": {
        "id": "std_01H...",
        "userId": "usr_01H...",
        "matricNumber": "PSC/2021/0482",
        "department": "Computer Science",
        "university": "University of Lagos"
      },
      "landlord": null
    }
  }
}
```

#### 2. Request OTP Code
- **Endpoint**: `POST /auth/send-otp`
- **Auth**: Public
- **Request Body**:
```json
{
  "phone": "+2348123456789",
  "role": "STUDENT" // "STUDENT" | "LANDLORD"
}
```
- **Response**: `{ "success": true, "requestId": "otp_req_123", "expiresIn": 300 }`

#### 3. Verify OTP Code
- **Endpoint**: `POST /auth/verify-otp`
- **Auth**: Public
- **Request Body**:
```json
{
  "phone": "+2348123456789",
  "code": "123456"
}
```
- **Response**: Returns `{ accessToken, refreshToken, user }`

#### 4. Refresh Access Token
- **Endpoint**: `POST /auth/refresh`
- **Auth**: Public (Body requires refresh token)
- **Request Body**:
```json
{
  "refreshToken": "eyJhbGciOi..."
}
```
- **Response**: Returns `{ "accessToken": "new_access_token", "refreshToken": "new_refresh_token" }`

#### 5. Get Current Authenticated Profile
- **Endpoint**: `GET /auth/me`
- **Auth**: Bearer Token
- **Response**: Returns current user object (`CurrentUserResponse`) with active student and landlord sub-profiles.

#### 6. Complete / Update Student Profile
- **Endpoint**: `PUT /auth/profile`
- **Auth**: Bearer Token
- **Request Body**:
```json
{
  "fullName": "Chioma Adeleke",
  "matricNumber": "PSC/2021/0482",
  "department": "Computer Science",
  "university": "University of Lagos",
  "profilePicture": "https://..."
}
```

---

### B. Lodges & Student Exploration (`/lodges/*`)

#### 1. Browse / Filter Lodges
- **Endpoint**: `GET /lodges`
- **Auth**: Public (Optional Bearer to include `saved: boolean` flag)
- **Query Parameters**:
  - `page`: `1` (number)
  - `pageSize`: `20` (number)
  - `priceMin`: `150000` (number, NGN)
  - `priceMax`: `600000` (number, NGN)
  - `category`: `"single"` | `"self_con"` | `"flat"` | `"hostel"` | `"premium"`
  - `amenityIds`: `"amenity_01,amenity_04"` (comma-separated string)
  - `university`: `"UNILAG"` (string)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "lodge_001",
        "title": "A-Z Luxury Student Lodge",
        "description": "Executive self-contained room with private balcony, 24/7 borehole water and prepaid meter.",
        "address": "14 University Road, Akoka",
        "city": "Yaba",
        "state": "Lagos",
        "latitude": 6.518,
        "longitude": 3.389,
        "rent": 350000,
        "serviceFee": 35000,
        "numberOfRooms": 1,
        "capacity": 2,
        "category": "lodge",
        "status": "available",
        "distanceToCampus": 0.8,
        "saved": false,
        "primaryImage": {
          "id": "img_01",
          "url": "https://res.cloudinary.com/.../room1.jpg",
          "isPrimary": true
        },
        "images": [
          { "id": "img_01", "url": "https://...", "isPrimary": true },
          { "id": "img_02", "url": "https://...", "isPrimary": false }
        ],
        "amenities": [
          { "id": "am_water", "name": "Borehole Water", "icon": "water-drop" },
          { "id": "am_power", "name": "Prepaid Meter", "icon": "flash-on" }
        ],
        "landlord": {
          "id": "host_01",
          "fullName": "Adeyemi Properties",
          "isVerified": true,
          "rating": 4.8,
          "reviewCount": 24
        }
      }
    ],
    "total": 42,
    "page": 1,
    "pageSize": 20,
    "hasMore": true
  }
}
```

#### 2. Get Lodge Details by ID
- **Endpoint**: `GET /lodges/:id`
- **Auth**: Public (Optional Bearer for saved state)
- **Response**: Full `Lodge` schema with complete image gallery, landlord profile, rules, and nearby campus distance.

#### 3. Save / Wishlist a Lodge
- **Endpoint**: `POST /lodges/:id/save`
- **Auth**: Bearer Token
- **Response**: `{ "success": true, "message": "Lodge saved to wishlist" }`

#### 4. Remove from Wishlist
- **Endpoint**: `POST /lodges/:id/unsave`
- **Auth**: Bearer Token

#### 5. Get Saved Lodges
- **Endpoint**: `GET /lodges/saved?page=1&pageSize=20`
- **Auth**: Bearer Token

---

### C. Bookings, Escrow & Payments (`/bookings/*`, `/payments/*`, `/escrow/*`)

#### 1. Create a Booking Reservation
- **Endpoint**: `POST /bookings`
- **Auth**: Bearer Token
- **Request Body**:
```json
{
  "lodgeId": "lodge_001",
  "moveInDate": "2026-11-15T00:00:00.000Z",
  "specialRequests": "Prefer ground floor room if available."
}
```
- **Response**: Returns created `Booking` with status `"pending"` and initial `EscrowTransaction`.

#### 2. Initialize Payment Gateway (Paystack / Flutterwave)
- **Endpoint**: `POST /payments/init`
- **Auth**: Bearer Token
- **Request Body**:
```json
{
  "bookingId": "bk_01H...",
  "amount": 385000,
  "email": "student@university.edu.ng",
  "phone": "+2348123456789"
}
```
- **Response**:
```json
{
  "success": true,
  "paymentReference": "KMP_PAY_9823749823",
  "paymentUrl": "https://checkout.paystack.com/...",
  "amount": 385000,
  "currency": "NGN"
}
```

#### 3. Verify Payment
- **Endpoint**: `POST /payments/verify`
- **Auth**: Bearer Token
- **Request Body**:
```json
{
  "reference": "KMP_PAY_9823749823",
  "amount": 385000
}
```
- **Response**: Updates booking to `"active"` and transitions escrow status to `"held"`.

#### 4. Get Student Bookings
- **Endpoint**: `GET /bookings?page=1&pageSize=20`
- **Auth**: Bearer Token
- **Response**: Paginated list of student bookings with live escrow transaction statuses:
  - `status`: `"pending"` | `"confirmed"` | `"active"` | `"inspection_pending"` | `"completed"` | `"disputed"` | `"cancelled"`

#### 5. Submit Physical Inspection (Escrow Release Key)
- **Endpoint**: `POST /bookings/:id/submit-inspection`
- **Auth**: Bearer Token
- **Request Body**:
```json
{
  "inspectionCode": "KMP-8492",
  "evidence": [
    { "imageUri": "https://..." }
  ]
}
```
- **Outcome**: Triggers automatic release of escrow funds to host bank account.

#### 6. Open a Dispute
- **Endpoint**: `POST /disputes`
- **Auth**: Bearer Token
- **Request Body**:
```json
{
  "bookingId": "bk_01H...",
  "reason": "Property does not match listed photos; roof is leaking and power meter is damaged.",
  "evidence": [
    { "type": "image", "url": "https://..." }
  ]
}
```

---

### D. Landlord & Host Portal (`/landlords/*`)

#### 1. Get Host Profile & Settlement Bank
- **Endpoint**: `GET /landlords/profile`
- **Auth**: Bearer Token (Landlord Role)
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "usr_01H...",
    "fullName": "Adeyemi Properties",
    "email": "adeyemi@properties.ng",
    "phone": "+2349012345678",
    "isVerified": true,
    "kycStatus": "approved",
    "rating": 4.8,
    "reviewCount": 24,
    "bankName": "Zenith Bank",
    "bankAccountNumber": "1234567890",
    "bankAccountName": "Adeyemi Properties",
    "bvn": "12345678901",
    "businessName": "Adeyemi Properties Limited",
    "businessRegistration": "RC-1234567"
  }
}
```

#### 2. Update Host Payout Bank Details
- **Endpoint**: `PATCH /landlords/profile`
- **Auth**: Bearer Token (Landlord Role)
- **Request Body**:
```json
{
  "bankName": "Access Bank",
  "bankAccountNumber": "0123456789",
  "bankAccountName": "ADEYEMI JOHN",
  "bvn": "22334455667"
}
```

#### 3. Host Dashboard Statistics & Financials
- **Endpoint**: `GET /landlords/stats`
- **Auth**: Bearer Token
- **Response**:
```json
{
  "success": true,
  "data": {
    "totalProperties": 6,
    "availableProperties": 2,
    "bookedProperties": 4,
    "maintenanceProperties": 0,
    "totalBookings": 18,
    "pendingConfirmations": 3,
    "confirmedBookings": 15,
    "revenue": 5250000,
    "averageRating": 4.9,
    "reviewCount": 24
  }
}
```

#### 4. Host Property Listings
- **Endpoint**: `GET /landlords/properties?page=1&pageSize=20&status=available`
- **Auth**: Bearer Token
- **Filter**: `status` can be `"all"`, `"available"`, `"booked"`, or `"maintenance"`.

#### 5. Create New Property Listing
- **Endpoint**: `POST /landlords/properties`
- **Auth**: Bearer Token
- **Request Body**:
```json
{
  "title": "Prime Green Hostel, UNILAG",
  "description": "Newly renovated 4-bedroom student flat...",
  "category": "hostel",
  "address": "8 University Close",
  "city": "Yaba",
  "state": "Lagos",
  "rent": 400000,
  "serviceFee": 40000,
  "numberOfRooms": 4,
  "capacity": 8,
  "distanceToCampus": 0.5,
  "amenities": ["am_water", "am_power", "am_security"],
  "images": [
    { "url": "https://...", "isPrimary": true },
    { "url": "https://...", "isPrimary": false }
  ]
}
```

#### 6. Update Property / Change Live Availability Status (1-Click)
- **Endpoint**: `PATCH /landlords/properties/:id`
- **Auth**: Bearer Token
- **Request Body**:
```json
{
  "status": "available" // "available" | "booked" | "maintenance"
}
```

#### 7. Landlord Reservation Actions (Confirm or Reject)
- **Endpoint**: `POST /landlords/bookings/:bookingId/confirm`
- **Request Body**: `{ "action": "confirm" }`
- **Endpoint**: `POST /landlords/bookings/:bookingId/reject`
- **Request Body**: `{ "action": "reject", "message": "Room currently undergoing emergency repair." }`

---

## 4. Web HTTP Client & Token Re-Auth Example

Place this standard Axios or Fetch client in `src/api/client.ts` for your web app:

```typescript
import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.VITE_API_BASE_URL ||
  "https://kampus-backend.vercel.app/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor: attach token
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("kampus_access_token") : null;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("kampus_refresh_token");
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefresh } = data.data;

        localStorage.setItem("kampus_access_token", accessToken);
        localStorage.setItem("kampus_refresh_token", newRefresh);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        // Clear auth and redirect
        localStorage.removeItem("kampus_access_token");
        localStorage.removeItem("kampus_refresh_token");
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);
```
