# 🚀 DSA Playground

> **An interactive, exclusive, zero-dependency educational website that teaches Data Structures and Algorithms to COMPLETE BEGINNERS through interactive visualizations and C++17 code.**

---

## 🌟 Key Highlights

- **100% Offline by Design**: Works instantly by double-clicking `index.html` via the `file://` protocol. No localhost server, no Node.js, no npm, and zero external CDNs (no Google Fonts, FontAwesome, or CDN scripts).
- **Pure Web Standards**: Built exclusively with semantic HTML5, modern CSS3 (custom properties & dark/light theme variables), and clean vanilla JavaScript.
- **Interactive Visualizer Engine**: Step forward, step back, play/pause, reset, and adjust playback speed with synchronized live C++ line highlighting and in-visualizer code pills.
- **Side-by-Side Sorting Race**: Watch Bubble Sort, Selection Sort, Insertion Sort, and Quick Sort race simultaneously on identical data with live comparison and swap counters.
- **Zero-Dependency C++ Syntax Highlighter**: Built-in offline regex tokenizer that styles keywords, types, STL classes, preprocessor directives, and comments with 1-click clipboard copying.
- **Persistent Progress Tracking**: Automatically tracks completed topics and remembers where you left off using safe `localStorage` with full fallback.
- **GitHub Pages-Ready**: All assets use relative paths—deploy in under 60 seconds with zero build steps.

---

## 📂 Project Structure

```text
LEARN_DSA/
├── index.html                   # Landing page, "How to Use", and vertical roadmap
├── big-o.html                   # Complete Big-O cheat sheet & comparison tables
├── README.md                    # Setup, teacher editing guide, and deployment steps
├── css/
│   └── style.css                # Shared design system, CSS variables, dark/light themes
├── js/
│   ├── main.js                  # Theme switcher, progress engine, roadmap sync
│   ├── visualizer.js            # Reusable step playback engine & control bar
│   ├── highlight.js             # Tiny offline C++ syntax highlighter
│   └── viz/
│       ├── arrays.js            # Array Insert, Delete, Search visualizer
│       ├── linked-lists.js      # Singly & Doubly Linked List visualizer
│       ├── stacks.js            # LIFO vertical stack container visualizer
│       ├── queues.js            # Circular queue modulo wrap visualizer
│       ├── hashing.js           # Hash table: Chaining & Linear Probing
│       ├── trees.js             # SVG BST Search & In/Pre/Post traversals
│       ├── heaps.js             # Dual Tree + Array Max/Min Heap visualizer
│       ├── graphs.js            # SVG Network BFS (Queue) & DFS (Stack)
│       ├── sorting.js           # Sorting algorithms + side-by-side race
│       └── searching.js         # Linear vs. Binary search pointer visualizer
└── topics/
    ├── arrays.html              # Topic 1: Arrays
    ├── linked-lists.html        # Topic 2: Linked Lists (Singly & Doubly)
    ├── stacks.html              # Topic 3: Stacks
    ├── queues.html              # Topic 4: Queues & Deques
    ├── hashing.html             # Topic 5: Hashing & Hash Tables
    ├── trees.html               # Topic 6: Trees & BST
    ├── heaps.html               # Topic 7: Heaps & Priority Queues
    ├── graphs.html              # Topic 8: Graphs & Traversals
    ├── sorting.html             # Topic 9: Sorting Algorithms
    └── searching.html           # Topic 10: Searching Algorithms
```

---

## 🖥️ How to Run Offline (Direct Double-Click)

1. Open your computer's file explorer and navigate to this folder:
   ```text
   LEARN_DSA/
   ```
2. Double-click **`index.html`**.
3. It opens directly in your default browser (Chrome, Edge, Firefox, Safari) using the `file://` protocol. 
4. **No internet connection, web server, terminal commands, or installations are required!**

*(Optional terminal shortcut on Windows PowerShell: `Start-Process "index.html"`)*

---

## 👩‍🏫 Teacher's Editing Guide

This project was built specifically with teachers and educators in mind. Everything is modular and well-commented so you can customize lessons easily.

### 1. Editing Plain-English Explanations & Analogies
Open any file in `/topics/<topic>.html` and locate **Section 1**:
```html
<!-- SECTION 1: What is it? + Analogy -->
<section class="content-section" aria-labelledby="sec-analogy">
  <div class="analogy-card">
    <div class="analogy-title">💡 Real-Life Analogy: Numbered School Lockers</div>
    <p>Replace this text with your own classroom analogy...</p>
  </div>
</section>
```

### 2. Updating C++ Code Snippets
Find **Section 4** in any topic file:
```html
<!-- SECTION 4: C++17 Implementation -->
<pre class="code-pre" id="my-code-block">
// Add or edit C++ code here. 
// highlight.js automatically handles syntax highlighting and line numbers!
#include <iostream>
...
</pre>
```

### 3. Adding or Editing Mini Quiz Questions
Locate **Section 6** in any topic file:
```html
<div class="quiz-card" id="quiz-q1">
  <div class="quiz-question">Your question text here?</div>
  <div class="quiz-options">
    <button type="button" class="quiz-option" data-correct="false">A) Wrong choice</button>
    <button type="button" class="quiz-option" data-correct="true">B) Correct choice</button>
    <button type="button" class="quiz-option" data-correct="false">C) Another wrong choice</button>
  </div>
  <div class="quiz-feedback"></div>
</div>
```
*Note: Set `data-correct="true"` on the correct option. The built-in quiz handler takes care of color states and instant feedback.*

### 4. Customizing Default Visualizer Data
Open `/js/viz/<topic>.js` and modify the initial array or node values at the top of the file:
```javascript
// Example in js/viz/arrays.js:
let arrayData = [15, 42, 8, 23, 74, 39];
```

---

## 🌐 Deploying to GitHub Pages (Free Hosting in 1 Minute)

Since all paths are strictly relative, this repository is ready for instant deployment on **GitHub Pages**:

1. Initialize git and push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of DSA Playground"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. In your GitHub repository:
   - Click on **Settings** (top tab).
   - In the left sidebar, click on **Pages**.
   - Under **Build and deployment** $\to$ **Source**, select **Deploy from a branch**.
   - Under **Branch**, select **`main`** and **`/ (root)`**, then click **Save**.
3. In about 30 seconds, GitHub will provide your live URL:
   ```text
   https://<your-username>.github.io/<your-repo-name>/
   ```
4. Share this link with your students—it works instantly on desktops, tablets, and smartphones.

---

## 📦 How to Download as a ZIP File

If sharing with students who do not use Git:
1. **From GitHub**:
   - Navigate to your repository page on GitHub.
   - Click the green **`<> Code`** button.
   - Click **Download ZIP**.
   - Extract the ZIP file anywhere on your computer.
   - Double-click `index.html` to start learning!
2. **From Windows File Explorer**:
   - Right-click the `LEARN_DSA` folder.
   - Select **Send to** $\to$ **Compressed (zipped) folder** (or use 7-Zip).
   - Distribute the resulting `.zip` file via email, Google Drive, or USB drive.

---

## ♿ Accessibility & Browser Support

- **Screen Reader & Keyboard Navigable**: Includes skip-to-content links, semantic `<main>`, `<header>`, `<article>`, `<section>`, and `<nav>` landmarks, ARIA labels on all icon buttons, and high-contrast `:focus-visible` outlines.
- **Theme Memory**: Respects system `prefers-color-scheme` automatically and persists the learner's theme choice in `localStorage`.
- **Cross-Browser Compatible**: Fully tested on modern Chrome, Microsoft Edge, Mozilla Firefox, Safari, and mobile WebKit.

---

*Created for beginners, teachers, and students who want to build real intuition for Data Structures and Algorithms.*
