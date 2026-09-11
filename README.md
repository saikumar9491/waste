# ♻️ WasteWise — AI-Powered Smart Waste Management Platform

> **“WasteWise doesn't just report waste—it intelligently detects and prioritizes waste, assigns it to the nearest available collector, verifies collection, and provides real-time insights for smarter waste management.”**

WasteWise is a full-stack, responsive **MERN-stack + AI Smart Waste Management Platform** connecting **Citizens**, **Waste Collectors**, and **Municipal Administrators**.

---

## 🌟 Key Features

### 👤 Citizen Portal
- **Zero-Typing Camera Capture**: Direct integration with mobile camera (`capture="environment"`).
- **Automatic GPS Location**: Browser Geolocation API (`navigator.geolocation`) with interactive Leaflet pin fine-tuning.
- **AI Waste Classification**: Detects Plastic, Organic, Metal, Glass, Paper, E-Waste, Hazardous, and General waste with confidence percentages.
- **AI Priority Assessment**: Automatic severity grading (**CRITICAL**, **HIGH**, **MEDIUM**, **LOW**) based on material hazard and public area density.
- **Live Complaint Tracking**: Visual 6-stage lifecycle stepper: `Created → AI Analyzed → Assigned → In Progress → Waste Collected → Resolved`.
- **Citizen Rewards & Leaderboard**: Earn +50 Eco Points per resolved report; Eco Champions leaderboard and badges.

### 🚛 Collector Console
- **Proximity-Based Task Dispatch**: Real-time task cards with distance in km (Haversine formula).
- **Turn-by-Turn Navigation**: One-click Google Maps navigation routing to incident GPS coordinates.
- **Task Lifecycle Control**: Mark `Start Route` (In Progress) and `Upload Proof`.
- **Proof-of-Collection Verification**: Upload before/after photo evidence and field sanitization notes.
- **Completed Collection Archive**: History of resolved community clean-ups.

### 👨‍💼 Municipal Admin Command Center
- **Executive Dashboard Metrics**: Real-time totals for Reports, Pending, In Progress, Resolved, and Collection Efficiency Rate (%).
- **Estimated Sustainability Telemetry**: Waste Diverted (kg), CO₂ Avoided (kg), and Recyclable Yield (kg).
- **Live Geospatial Waste Map**: Color-coded pins (Red: Critical, Orange: High, Yellow: Medium, Green: Resolved, Blue: Collector Trucks) with interactive popup dispatching.
- **Real-Time Driver & Fleet GPS Tracking (`/track-drivers`)**: Live animated truck telemetry, moving GPS coordinates, battery & speed gauges, ETA calculations, and active pickup route polylines.
- **Smart Collector Dispatch**: Ranks collectors dynamically by proximity distance, truck capacity, and current task load.
- **Smart Hotspot Detection**: Flags high-density waste clusters (e.g. *Market Area & Bazaar Circle - 47 reports*).
- **Predictive Collection Forecasting**: AI recommendations for pre-scheduling collection sweeps.
- **Interactive Recharts Analytics**: Charts for waste by type, complaints over time, resolution donuts, and collector leaderboard KPIs.

### 🔐 Authentication & Security
- **Google OAuth 2.0 Identity Services**: Native one-click account chooser popup with full browser profile integration.
- **JWT Authentication & Bcrypt Hashing**: Secure stateless tokens and encrypted credentials.
- **Role-Based Access Control (RBAC)**: Strict separation of privileges across Citizen, Collector, and Municipal Admin.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, React Router v6, Axios, Recharts, Leaflet, Lucide React, React Hot Toast
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT Authentication, Bcrypt.js, Multer
- **AI Engine**: Dual-mode architecture — Google Gemini Vision & Generative AI integration with fallback intelligent heuristic inference engine
- **GIS / Mapping**: Leaflet with custom color-coded SVG markers and Haversine distance calculations

---

## 🔑 Pre-Configured Demo Credentials

Use the floating **Role Switcher** widget (bottom-right corner) for 1-click role swapping during presentations, or use these credentials:

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **👤 Citizen** | `citizen@wastewise.org` | `citizen123` | Sai Kumar (420 Eco Points, 3 Reports) |
| **🚛 Collector** | `raj@wastewise.org` | `collector123` | Raj Kumar (Truck-12 Compactor, ~2.1 km away) |
| **👨‍💼 Admin** | `admin@wastewise.org` | `admin123` | Pooja Verma (Chief Municipal Officer) |

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- **Node.js**: v18 or higher
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` (or MongoDB Atlas URI)

### 2. Installation
From the `wastewise` directory:

```bash
# Install root, server, and client dependencies
npm run install:all
```

### 3. Environment Configuration
Verify `.env` in `wastewise/` and `wastewise/server/`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/wastewise_db
JWT_SECRET=wastewise_hackathon_super_secret_jwt_key_2026!
CLIENT_URL=http://localhost:5173

# Optional: Google Gemini API Key for real-time vision inference
GEMINI_API_KEY=
```

### 4. Seed Realistic Demo Data
```bash
npm run seed
```

### 5. Run the Application
Run both backend API and Vite client concurrently:
```bash
npm run dev
```

- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🎬 Hackathon Presentation Demo Flow

1. **Sign In as Citizen**: Tap the demo switcher or log in with `citizen@wastewise.org`.
2. **Report Waste**: Click `🚨 Report Waste`.
3. **Capture Photo**: Tap `📷 Take Photo` (or click `🥤 Plastic Waste` demo shortcut).
4. **GPS Lock**: Tap `📍 Get My Location` to retrieve coordinates and view the Leaflet map pin.
5. **AI Detection**: Observe AI classification (*Plastic Waste, 94% confidence, HIGH Priority*).
6. **Submit**: Click `🚀 REPORT WASTE` to generate Complaint ID (`WW-XXXXX`).
7. **Switch to Admin**: Click `Admin` on the bottom-right demo pill.
8. **View Live Map**: Open `Live Waste Map` to see the newly submitted pin.
9. **Smart Dispatch**: Click the complaint and notice the system recommends *Raj Kumar (Distance: 2.1 km, Truck-12)*. Click `Assign`.
10. **Switch to Collector**: Click `Collector` on the demo pill.
11. **Navigate & Collect**: Observe the task, click `Start Route`, then tap `Upload Proof`.
12. **Submit Clean Proof**: Select sample clean proof photo and click `✅ MARK AS COLLECTED`.
13. **Observe Resolution**: Citizen receives notification and +50 Eco Points; Admin analytics and resolution rates update dynamically!

---

## 📡 API Reference

- `POST /api/auth/register` — Citizen registration (+50 initial Eco Points)
- `POST /api/auth/login` — Role-based JWT authentication
- `POST /api/auth/demo-login` — Instant 1-click test login
- `POST /api/complaints` — Submit report with image and AI classification
- `GET  /api/complaints` — Filtered complaint telemetry
- `GET  /api/complaints/:id` — Details with lifecycle timeline and recommended collectors
- `PUT  /api/complaints/:id/assign` — Dispatch collector to complaint
- `GET  /api/collectors/tasks` — Collector assigned route tasks
- `POST /api/collectors/tasks/:id/proof` — Upload clean area photo and resolve task
- `GET  /api/admin/dashboard` — Executive counts and sustainability impact
- `GET  /api/admin/analytics` — Recharts data (types, trends, resolution donuts)
- `GET  /api/admin/hotspots` — Smart hotspot detection and predictive collection forecasts
- `GET  /api/notifications` — Real-time user alert feed

---

© 2026 WasteWise Technologies. Built for Clean Sustainable Smart Cities.
