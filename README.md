# Laundry Dog 🧺🐶

A side-scrolling browser game where you control a cute retriever dog navigating through a house, leaping over and sliding under furniture, dodging dust bunnies, and retrieving laundry to deposit into a washing machine at the end of each room!

Live demonstration and code are completely self-contained. Ready for instant publishing to **GitHub Pages**.

## Features

- **Procedural 2D Vector Canvas Graphics**: Dynamic rendering of the dog (running legs, floppy ears, wagging tail, and a wobbly pile of laundry stacked on its back) and indoor rooms (couches, dining tables, kitchen counters, multi-story stairs, and chandeliers). Everything is sharp on Retina/High-DPI screens.
- **Audio Synthesizer (Web Audio API)**: Sound effects (jumping sweeps, collection chimes, sloshing machines, and victory melodies) are generated programmatically. No external asset loading required, avoiding CORS or download latency issues.
- **Physics Engine**: Smooth gravity, acceleration, horizontal bounds, semi-solid platforms (land on couches/shelves, pass through from below), clearance checks (cannot stand up when under a table), and incline stair support.
- **3 Unique Rooms (Levels)**:
  - **Level 1: The Living Room** - Easy obstacles like coffee tables, armchairs, and long couches.
  - **Level 2: The Kitchen & Dining Room** - Dining tables requiring crawling, counter shelves, and falling kitchen pots/mugs hazards.
  - **Level 3: The Hallway & Stairs** - Multi-story navigation using climbing stairs, mezzanine floors, and hanging chandeliers you can jump on.

## Keyboard Controls

- **Move Left / Right**: `◀` / `▶` (or `A` / `D`)
- **Jump**: `▲` (or `W` or `Space`). *Tip: Hold down the key to jump higher!*
- **Duck / Crawl**: `▼` (or `S`). *Use this to slide under tables, beds, and low gaps.*
- **Pause / Unpause**: `P` (or `Escape`)

---

## How to Play Locally

To play locally, you must run a simple HTTP server (running straight from the file system `file://` protocol will block modern ES6 script loading due to browser security policies).

1. Open your terminal in the game folder.
2. Start a local server:
   ```bash
   python3 -m http.server 8000
   ```
3. Open your browser and go to `http://localhost:8000`.

---

## How to Host on GitHub Pages

Since the game is composed of static HTML, CSS, and JS files, it is extremely easy to host on GitHub Pages:

1. **Create a GitHub Repository**: Create a new public repository on GitHub (e.g. named `laundry-dog`).
2. **Push Code to GitHub**:
   Initialize git in the folder and push your files:
   ```bash
   git init
   git add index.html style.css game.js README.md
   git commit -m "Initial commit of Laundry Dog game"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/laundry-dog.git
   git push -u origin main
   ```
3. **Enable GitHub Pages**:
   - Go to your repository on GitHub.
   - Click on the **Settings** tab.
   - In the left sidebar, click on **Pages**.
   - Under **Build and deployment**, set **Source** to `Deploy from a branch`.
   - Select the `main` branch and folder `/ (root)`.
   - Click **Save**.
4. **Play!**: After a minute, GitHub will host the game at `https://YOUR_USERNAME.github.io/laundry-dog/`.
