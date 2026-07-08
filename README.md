# TerritoryFlow 🚀

**TerritoryFlow** is an intelligent, GIS-enabled field dispatch console designed to automate territory planning and route optimization for field sales officers in micro-finance operations. 

By replacing manual scheduling with algorithm-driven logistics, TerritoryFlow increases customer coverage, eliminates resource overlaps, and dramatically reduces fuel overhead.

---

## 🚀 Key Features

* **AI Territory Clustering**: Uses a **Capacitated K-Means** algorithm with a $15\%$ workload headroom multiplier. This guarantees that all active field officers get a highly balanced, similar number of visits (typically 6–10 stops) in tight geographical clusters.
* **Traveling Salesperson Route Solver (TSP)**: Automatically computes the absolute shortest closed-loop path starting and ending at the regional branch depot using a Greedy Nearest Neighbor solver.
* **Interactive Route Isolation View**: Clicking on any officer in the roster isolates their route and assigned customer pins at full opacity while fading out other dispatches to prevent map clutter.
* **Live Road Conditions & Monsoon Simulator**: Allows managers to simulate weather events (*Clear*, *Monsoon Mud*, *Severe Flood*). This dynamically scales travel speeds and estimated times in the roster to prepare officers for field realities.
* **Integrated Field Officer App Simulator**: A mobile UI mockup simulating the agent experience on the ground, supporting offline checking, verification sync, and real-time motorcycle directions using **Google Maps Directions API**.
* **Excel Sheet Import & Export Support**: Drag-and-drop spreadsheets directly onto the browser window to instantly load customer locations, or download the optimized routes as pre-formatted schedules in one click.

---

## 🛠️ Technology Stack

* **Frontend**: React.js, Vite
* **Map Engine**: React-Leaflet, Leaflet.js
* **Excel Engines**: SheetJS (`xlsx`)
* **Styling**: Vanilla CSS (sleek dark mode overlays, glassmorphism, responsive grid)
* **Icons**: Lucide React
