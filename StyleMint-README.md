# StyleMint – Microservices Web Platform
**Spring Advanced @ SoftUni – Individual Project Assignment**

## 🚀 Overview

StyleMint is a microservices-based creative commerce platform that brings together:

- 3D clothing customization
- Digital audio marketplace (samples & sample packs)
- Reward-based HTML5 mini-games (Godot)
- Pseudo-blockchain NFT rewards
- Stripe Checkout payments
- Kafka event-driven delivery flow

The system is built using a clean microservice architecture with Feign communication and Kafka-based asynchronous messaging.

---

## 👥 User Roles & Access Control

StyleMint uses Role-Based Access Control (RBAC) in the main backend.

### Available Roles

| Role | Description |
|------|-------------|
| **Customer** | Default role for all newly registered users |
| **Designer** | Automatically granted when a user publishes a 3D design |
| **Author** | Automatically granted when uploading an audio sample or sample pack |
| **Admin** | Full system privileges; can manage users, roles, designs, and content |

### 🛡️ System Administrator (Bootstrap Admin)

A system admin is automatically created at application startup.

- **Credentials** are stored in `application.properties`
- Has full access to the system, including:
  - Managing user roles
  - Promoting/demoting Admins
  - Moderating content
  - Accessing the Admin Panel

---

## ✨ User Features

### Public (no login required)
- Home page
- Login/Register
- Browse public designs
- View audio sample packs

### Authenticated users
- Create customizable 3D clothing designs (color/decal editing)
- Publish designs → gains **Designer** role
- Upload audio samples/sample packs → gains **Author** role
- Add items to cart
- Checkout via Stripe
- Receive NFTs from achievements and purchases
- Gift discount NFTs to other users
- Access purchased digital items

### Admin Panel
- User management
- Change user roles for all users (except system admin)
- Manage designs, audio items, and content
- View system-wide statistical data

---

## 🎁 NFT System

NFTs are created, transferred, and validated through a dedicated NFT microservice implementing a lightweight pseudo-blockchain.

### Types of NFTs

| NFT Type | Transferable | Description |
|----------|--------------|-------------|
| **Discount Token NFT** | ✅ YES | Provides discount % at checkout; can be gifted to other users |
| **Author Badge NFT** | ❌ NO | Non-transferable creative badge for Authors |

### NFT Transfer Rules

- Only **Discount NFTs** can be transferred between users
- Transfer process:
  1. Ownership is verified
  2. Transaction recorded on the blockchain
  3. MongoDB updates token → new owner
  4. Receiver sees NFT in their inventory

---

## 🧩 Microservices Architecture

```
                 ┌───────────────────────────┐
                 │       React Frontend       │
                 │  React + Three.js + Godot  │
                 └──────────────┬────────────┘
                                │ REST (JWT Cookies)
                                ▼
         ┌────────────────────────────────────────────────┐
         │        Main Backend (stylemint-backend)        │
         │  - Auth (JWT cookies)                           │
         │  - Designs & Audio CRUD                         │
         │  - Admin Panel / Roles                          │
         │  - NFT Gifting                                  │
         │  - Feign → Order Service                        │
         │  - Feign → NFT Service                          │
         └──────────────┬─────────────────────────────────┘
                        │ Feign Clients
         ┌──────────────┼──────────────┐
         ▼              ▼               
┌────────────────┐  ┌─────────────────────┐   
│  Order Service │  │     NFT Service     │   
│  - Stripe API  │  │ - Pseudo-blockchain │   
│  - Webhooks    │  │ - Mint NFTs         │   
│  - Outbox→Kafka│  │ - MongoDB storage   │   
└────────┬───────┘  └─────────────────────┘   
         │                       
         │ Kafka Topics: order-delivery-events
         ▼                      
┌─────────────────────────┐
│   Delivery Service      │
│  - Kafka Consumer       │
│  - Kafka Producer       │
│  - Courier Webhooks     │
└─────────────────────────┘
```

---

## 📦 Microservices Overview

### 🟦 1. Main Backend (`stylemint-backend`)
The orchestrator of the entire platform.

**Responsibilities:**
- JWT HttpOnly cookie authentication
- User, roles & system admin bootstrap
- Designs CRUD
- Audio sample & sample pack CRUD
- Cart & checkout workflow
- NFT gifting logic
- Feign → Order Service
- Feign → NFT Service
- Stores digital item ownership
- **MySQL** storage

### 🟧 2. Order Service
Handles all payment logic.

**Responsibilities:**
- Create Stripe Checkout Sessions
- Handle Stripe webhooks (succeeded, failed)
- Manage order & order item statuses
- Notify Main Backend via REST callbacks
- Publish Kafka events using Outbox Pattern
- **MySQL** storage

### 🟩 3. NFT Service
Implements a minimal pseudo-blockchain.

**Responsibilities:**
- Mint NFTs (discount tokens, author badges)
- Store blocks/transactions in MongoDB
- Validate transfers
- Update NFT ownership
- Feign API for Main Backend

### 🟫 4. Delivery Service
Event-driven microservice.

**Responsibilities:**
- Consumes Kafka events from Order Service
- Produces Kafka events back to Order Service
- Processes shipped/delivered states
- Courier Webhook controller for external delivery updates
- Pure event-driven communication (no REST calls to Order Service)

---

## 🔗 Shared Libraries

### 📘 `shared-dtos`
Contains:
- User DTOs
- Orders & Order Items DTOs
- NFT DTOs
- Design & Audio DTOs

**Used by:**
- Main Backend
- Order Service
- NFT Service

### 📙 `shared-events`
Contains event schemas shared between:
- Order Service
- Delivery Service

---

## 💵 Stripe Integration

The payment flow is handled fully by the Order Service.

**Order Service handles:**
- Payment intent creation
- Checkout Session creation
- Success & failure webhooks
- Status updates
- Digital unlock logic

Because the system is not deployed publicly, Stripe CLI is used:
```bash
stripe listen --forward-to localhost:8081/webhook/stripe
```

---

## 📡 Kafka (KRaft Mode)

Kafka runs without Zookeeper, using KRaft.

**Commands used:**
```bash
kafka-storage.bat random-uuid
kafka-storage.bat format --standalone -t <UUID> -c config/server.properties
kafka-server-start.bat config/server.properties
```

**Event Flow:** 
- Order Service → Kafka → Delivery Service (`StartDeliveryEvent`)
- Delivery Service → Kafka → Order Service (`DeliveryRegisteredEvent`, `DeliveryCompletedEvent`)

Pure event-driven architecture with no REST communication between these services.

---

## ⚙️ Configuration (`application.properties`)

All backend modules use `.properties` (no YAML).

### Ports

| Service | Port |
|---------|------|
| Main Backend | 8080 |
| Order Service | 8081 |
| NFT Service | 8082 |
| Delivery Service | 8083 |
| Frontend | 5173 |
| Kafka Broker | 9092 |

Each microservice defines:
```properties
server.port=XXXX
```

**System Admin bootstrap example:**
```properties
admin.bootstrap.email=admin@stylemint.io
admin.bootstrap.password=super-secure-password
```

**Feign endpoints example:**
```properties
order.service.url=http://localhost:8081
nft.service.url=http://localhost:8082
```

---

## 🛠️ Build & Run Instructions

### Backend
```bash
cd Backend
mvn clean install
```

**Start each service:**
```bash
mvn spring-boot:run
```

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

**Production build:**
```bash
npm run build
```

> **Note:** Godot HTML5 games are pre-built and packaged inside the frontend.

---

## 🧪 Testing Strategy

Each microservice includes both:

### 🧪 1. API Tests (Web Layer)
**Using:**
- `@WebMvcTest`
- MockMvc
- Mockito

**Covers:**
- Controller endpoints
- Validation
- Role-based access
- Feign calls (mocked)
- Stripe webhook controller (mocked)

### 🔧 2. Integration Tests
**Using:**
- `@SpringBootTest`
- **Testcontainers** for:
  - MySQL (Order Service / Main Backend)
  - MongoDB (NFT Service)
  - Kafka (Order → Delivery)
- Mock Stripe services

**Covers:**
- Full order flow (checkout → success → unlock)
- NFT minting & gifting
- Kafka delivery events
- Main Backend + DB integration

---

## 📂 Project Structure

```
StyleMint
 ├── Backend
 │    ├── stylemint-backend         # Main orchestrator
 │    ├── orderservice              # Stripe / orders / outbox
 │    ├── nft-service               # Blockchain + NFT logic
 │    ├── delivery-service          # Kafka consumer
 │    ├── shared-dtos               # Shared DTOs
 │    └── shared-events             # Kafka event models
 └── Frontend                       # React + TS + Three.js + Godot games
```

---

## 🏁 Conclusion

StyleMint is a fully functional microservice-based creative marketplace featuring:

- 3D product customization
- Audio marketplace
- Stripe payments
- NFT rewards & gifting
- Kafka delivery processing
- Multiple microservices with Feign and event-driven design
- Automated role progression
- Full frontend & backend integration

This README describes the complete architecture, configuration, testing strategy, and operational workflow of the system.