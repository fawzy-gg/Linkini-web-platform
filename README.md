# Linkini — Intelligent Event Networking Platform

Linkini is a lightweight, privacy-oriented web ecosystem designed to optimize professional networking during live events (conferences, hackathons, university career forums). Instead of requiring permanent accounts or extensive data harvesting, Linkini relies on ephemeral, event-scoped user profiles that exist only for the duration of the event.

The platform balances high-friction corporate matching tools with localized discovery, bridging the gap between student networking, organizational visibility, and immediate employability outcomes.

---

## 🚀 Core Features

### 1. Onboarding & Event Management
* **Frictionless Entry:** Participants join events instantaneously using an 8-character alphanumeric token or a browser-based QR-code scan without creating permanent accounts.
* **Contextual Personas:** Supports tailored setup structures for both **Student Personas** (focusing on competencies and academic background) and **Company Personas** (focusing on organizational footprint and job openings).
* **Event Lifecycle Control:** Organizers can spin up new events, pause entry, or systematically close sessions to purge active temporary records.

### 2. Hybrid Matching Layer
* **Two-Stage Processing:** Applied deterministic constraints isolate active, visible, and unconnected peers within the event before executing a rule-based matrix prioritization algorithm.
* **Intent Tracking:** Profiles are dynamically ranked based on explicit alignment parameters (e.g., *Hiring*, *Collaboration*, *Peer Learning*) combined with a recency index.

### 3. Consent-Driven Interaction
* **Safe Submissions:** Mutual consent rules ensure no interaction happens without explicit acceptance of connection requests.
* **Invisible Rejections:** Declining incoming invitations silently clears the view without notifying the sender to avoid social anxiety during active networking.

### 4. Career & Analytics Hub
* **Real-Time Organizers Dashboard:** Aggregates real-time KPIs (active check-ins within the last 30 minutes, submission conflicts, match-to-connection rates).
* **Broadcast Sub-Module:** Allows organizers to push event-wide notifications directly to the browser view.
* **Employability Pipelines:** Companies can publish job vacancies directly inside the event context while students discover positions and apply natively.

---

## 🛠️ Technical Stack

* **Frontend:** React (SPA), Vite (Build Engine/Dev Server), Responsive UI Engine.
* **Backend Runtime:** Node.js (Asynchronous architecture built for high concurrent operations).
* **API Layer:** Express.js REST API using modular architecture patterns (Routes ➡️ Controllers ➡️ Services ➡️ Data Access).
* **Database Management:** PostgreSQL (Relational constraints, strong unique indexes, transactional integrity via cascade-deletion dependencies).
* **Testing & Tools:** Postman API Framework, PlantUML Environment.

---

## 📦 Directory Structure

```text
linkini-platform/
├── backend/            # Express.js REST API, Database migrations, Business Logic
├── frontend/           # React + Vite Client SPA
├── docs/               # PlantUML diagrams & UML Architecture blueprints
└── README.md