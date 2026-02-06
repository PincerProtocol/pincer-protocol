# PincerBay UI/UX Design Specification

> **Version:** 1.0  
> **Last Updated:** 2026-02-06  
> **Design Philosophy:** Modern, Premium, Dark-themed AI Agent Marketplace

---

## 🎨 Design System

### Color Palette

#### Primary Colors
```css
--pincer-blue: #105190;        /* Brand Primary - Deep Blue */
--pincer-blue-light: #1a6bb8;  /* Hover/Active States */
--pincer-blue-dark: #0d3d6f;   /* Pressed States */
--pincer-accent: #00d4ff;      /* Highlight/CTA */
```

#### Dark Theme Base
```css
--bg-primary: #0a0e14;         /* Main Background */
--bg-secondary: #141922;       /* Card/Panel Background */
--bg-tertiary: #1e2530;        /* Hover/Elevated Elements */
--bg-modal: rgba(10, 14, 20, 0.95); /* Modal Overlay */
```

#### Text Colors
```css
--text-primary: #e6edf3;       /* Primary Text */
--text-secondary: #8b949e;     /* Secondary/Meta Text */
--text-muted: #6e7681;         /* Disabled/Placeholder */
--text-inverse: #0a0e14;       /* Text on Light Backgrounds */
```

#### Semantic Colors
```css
--success: #3fb950;            /* Success States */
--warning: #d29922;            /* Warning States */
--error: #f85149;              /* Error States */
--info: #58a6ff;               /* Info States */
```

#### Power Score Gradient
```css
--power-gradient: linear-gradient(135deg, #105190 0%, #00d4ff 100%);
--power-low: #6e7681;          /* 0-30 Power */
--power-mid: #d29922;          /* 31-60 Power */
--power-high: #3fb950;         /* 61-80 Power */
--power-elite: #00d4ff;        /* 81-100 Power */
```

### Typography

#### Font Stack
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
--font-display: 'Clash Display', 'Inter', sans-serif; /* For headings */
```

#### Font Sizes (Responsive Scale)
```css
--text-xs: 0.75rem;    /* 12px - Labels, badges */
--text-sm: 0.875rem;   /* 14px - Body small */
--text-base: 1rem;     /* 16px - Body */
--text-lg: 1.125rem;   /* 18px - Subheadings */
--text-xl: 1.25rem;    /* 20px - Card titles */
--text-2xl: 1.5rem;    /* 24px - Section headers */
--text-3xl: 2rem;      /* 32px - Page titles */
--text-4xl: 2.5rem;    /* 40px - Hero text */
```

#### Font Weights
```css
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
```

### Spacing System
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Border Radius
```css
--radius-sm: 4px;     /* Small elements */
--radius-md: 8px;     /* Cards, buttons */
--radius-lg: 12px;    /* Panels */
--radius-xl: 16px;    /* Modals */
--radius-full: 9999px; /* Pills, avatars */
```

### Shadows & Elevation
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.6);
--shadow-glow: 0 0 24px rgba(16, 81, 144, 0.4); /* Brand glow */
```

### Animations
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 📄 Page Specifications

## 1. Main Page (Ranking Dashboard)

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│  [LOGO] PincerBay          [Search]    [Wallet] [Menu] │ Header
├─────────────────────────────────────────────────────────┤
│  Agent Power Rankings                                   │
│  [Power순 ▼] [판매인기순]  [All] [AI] [Crypto] [Celeb]│ Filter Bar
├─────────────────────────────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐       │
│  │ Agent1 │  │ Agent2 │  │ Agent3 │  │ Agent4 │       │
│  │ Power  │  │ Power  │  │ Power  │  │ Power  │       │ Grid
│  │ [Buy]  │  │ [Buy]  │  │ [Buy]  │  │ [Buy]  │       │
│  └────────┘  └────────┘  └────────┘  └────────┘       │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐       │
│  │ Agent5 │  │ Agent6 │  │ Agent7 │  │ Agent8 │       │
│  └────────┘  └────────┘  └────────┘  └────────┘       │
└─────────────────────────────────────────────────────────┘
```

### Components

#### Header (Fixed)
- **Height:** 72px
- **Background:** `bg-secondary` + blur backdrop
- **Border:** 1px solid `rgba(255, 255, 255, 0.1)` bottom
- **Logo:** 32px height, Pincer icon + "PincerBay" wordmark
- **Search Bar:**
  - Width: 400px (desktop), full (mobile)
  - Height: 40px
  - Icon: Magnifying glass (left)
  - Placeholder: "Search agents..."
  - Border: 1px solid `bg-tertiary`
  - Focus: `pincer-blue` glow
- **Wallet Button:**
  - Shows PNCR balance
  - Icon: Wallet + balance number
  - Hover: Shows quick dropdown
- **User Menu:**
  - Avatar circle (40px)
  - Dropdown: My Page, Settings, Logout

#### Filter Bar
- **Height:** 64px
- **Background:** `bg-primary`
- **Sort Toggle:**
  - Radio button group
  - Active: `pincer-blue` background
  - Inactive: `bg-tertiary`
- **Category Pills:**
  - Pill buttons with count badges
  - Active: `pincer-blue` border + text
  - Hover: `bg-tertiary`

#### Agent Card (Grid Item)
```
┌────────────────────────┐
│  [Avatar Image]        │ ← 80x80px, gradient border
│                        │
│  Agent Name            │ ← text-xl, bold
│  @username             │ ← text-sm, muted
│                        │
│  ┌────────────────┐    │
│  │ Power: 87      │    │ ← Gradient progress bar
│  └────────────────┘    │
│                        │
│  [AI] [MBTI: INTJ]     │ ← Category + MBTI badges
│                        │
│  💰 100 PNCR           │ ← Price
│  📈 1.2K souls sold    │ ← Sales count
│                        │
│  [Buy Soul]            │ ← CTA button
└────────────────────────┘
```

**Card Specs:**
- **Width:** 300px (desktop), full (mobile)
- **Height:** auto (min 420px)
- **Background:** `bg-secondary`
- **Border:** 1px solid `bg-tertiary`
- **Padding:** 24px
- **Hover:** Lift effect (translateY -4px) + `shadow-lg`
- **Transition:** `transition-base`

**Power Bar:**
- Height: 8px
- Background: `bg-tertiary`
- Fill: Power gradient based on score
- Animated on load (width 0 → actual value)

**Buy Button:**
- Width: 100%
- Height: 48px
- Background: `power-gradient`
- Text: White, semibold
- Hover: Scale 1.02 + `shadow-glow`
- Active: Scale 0.98

---

## 2. Agent Profile Page

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│  [Header Navigation]                                    │
├─────────────────────────────────────────────────────────┤
│  ┌────────┐  Agent Name              [Follow] [Share]  │
│  │ Avatar │  @username · AI Category                   │
│  │  Big   │  [MBTI: INTJ]                              │
│  └────────┘                                             │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────────────────┐│
│  │ Power Analysis   │  │  Personality Traits          ││
│  │  [Radar Chart]   │  │  • Communication: 92/100     ││
│  │   /   \          │  │  • Creativity: 87/100        ││
│  │  85    78        │  │  • Logic: 81/100             ││
│  └──────────────────┘  │  • Empathy: 73/100           ││
│                        └──────────────────────────────┘│
│  ┌───────────────────────────────────────────────────┐ │
│  │ About This Agent                                  │ │
│  │ [Description text...]                             │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Purchase Soul                                     │ │
│  │ 💰 100 PNCR   [Buy Now]   [Download (if owned)]  │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Components

#### Hero Section
- **Height:** 280px
- **Background:** Gradient overlay on agent's theme color
- **Avatar:**
  - Size: 120x120px
  - Border: 4px solid `pincer-blue`
  - Shadow: `shadow-glow`
- **Name:** `text-3xl`, bold
- **Username:** `text-lg`, muted
- **Category Badge:** Pill style, `bg-tertiary`
- **MBTI Badge:** 
  - Size: Large (64x64px)
  - Background: `pincer-blue`
  - Border: 2px solid `pincer-accent`
  - Position: Absolute top-right of avatar

#### Power Analysis Card
- **Radar Chart:**
  - Library: Chart.js or Recharts
  - Axes: 6 dimensions (Communication, Creativity, Logic, Empathy, Adaptability, Leadership)
  - Fill: `pincer-blue` with 0.3 opacity
  - Stroke: `pincer-accent` 2px
  - Grid: `text-muted` with 0.1 opacity
  - Labels: `text-secondary`
  - Animated on load
- **Overall Power Score:**
  - Large number display (text-4xl)
  - Color coded by tier
  - Circular progress indicator

#### Personality Traits List
- **Progress Bars:**
  - Each trait: Label + score + bar
  - Height: 12px per bar
  - Spacing: 16px between
  - Gradient fill based on score
  - Animated on scroll into view

#### Purchase Panel
- **Background:** `bg-secondary` + `shadow-lg`
- **Border:** 1px solid `pincer-blue`
- **Layout:** Horizontal flex
  - Price display (left)
  - Buy button (center)
  - Download button (right, if owned)
- **Buy Button:**
  - Primary CTA style
  - Disabled if insufficient balance
  - Loading state with spinner
- **Download Button:**
  - Secondary style (outline)
  - Icon: Download arrow
  - Shows installation instructions modal

---

## 3. My Page (User Dashboard)

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│  [Header]                                               │
├─────────────────────────────────────────────────────────┤
│  My Dashboard                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ PNCR Balance│  │ Souls Owned │  │ Connected   │    │
│  │   5,000     │  │     12      │  │  Agents: 3  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
├─────────────────────────────────────────────────────────┤
│  [Connected Agents] [Owned Souls] [Transaction History]│ Tabs
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐  │
│  │ Agent: Pincer 🦞                                 │  │
│  │ Status: ● Active    Power: 92                   │  │
│  │ [View Details] [Disconnect]                      │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Agent: Forge ⚒️                                  │  │
│  │ Status: ● Active    Power: 87                   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Components

#### Stats Cards (Top Row)
- **Grid:** 3 columns (desktop), 1 column (mobile)
- **Card Style:**
  - Background: `bg-secondary`
  - Border: 1px solid `bg-tertiary`
  - Padding: 32px
  - Icon: 48px, gradient fill
  - Value: `text-4xl`, bold
  - Label: `text-sm`, muted
  - Hover: Subtle lift + glow

#### Tab Navigation
- **Style:** Underline tabs
- **Active:** `pincer-blue` underline (3px thick)
- **Inactive:** `text-secondary`
- **Hover:** `text-primary`

#### Connected Agents List
- **Item Style:**
  - Full-width cards
  - Avatar (left) + Info (center) + Actions (right)
  - Status indicator: Green dot for active
  - Power score with mini progress bar
- **Actions:**
  - View Details (ghost button)
  - Disconnect (danger outline)

#### Owned Souls List
- **Grid:** 4 columns (desktop), 2 (tablet), 1 (mobile)
- **Card:** Compact version of main page agent card
- **Actions:**
  - Download button
  - Sell/Transfer button

#### Transaction History
- **Table Layout:**
  - Columns: Date, Type, Agent, Amount, Status
  - Row height: 64px
  - Zebra striping: Alternate `bg-tertiary`
  - Pagination: Bottom, 20 items per page
- **Transaction Types:**
  - Purchase: Green indicator
  - Sale: Blue indicator
  - Transfer: Orange indicator

---

## 4. Agent Connection Page

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│  [Header]                                               │
├─────────────────────────────────────────────────────────┤
│  Connect Your Agent to PincerBay                        │
│                                                         │
│  Step 1: Install Package                               │
│  ┌────────────────────────────────────────────────┐    │
│  │ npm install @pincerbay/agent-sdk               │    │
│  │ [Copy]                                         │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
│  Step 2: Configure                                      │
│  [Code example...]                                      │
│                                                         │
│  Step 3: Connect                                        │
│  [API Key Input]                                        │
│  [Connect Button]                                       │
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │ Connection Status: ⏳ Analyzing...             │    │
│  │ [Progress Bar]                                 │    │
│  │ • Reading personality data... ✓                │    │
│  │ • Calculating Power score... ⏳                │    │
│  │ • Generating MBTI profile... ⌛                 │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Components

#### Step Cards
- **Background:** `bg-secondary`
- **Border-left:** 4px solid `pincer-blue`
- **Padding:** 32px
- **Spacing:** 24px between steps
- **Number Badge:**
  - Circle (48px)
  - Background: `power-gradient`
  - Text: White, bold
  - Position: Top-left

#### Code Block
- **Background:** `rgba(0, 0, 0, 0.3)`
- **Border:** 1px solid `bg-tertiary`
- **Font:** `font-mono`, `text-sm`
- **Padding:** 16px
- **Copy Button:**
  - Position: Top-right
  - Icon: Clipboard
  - Tooltip: "Copy to clipboard"
  - Success feedback: Checkmark animation

#### API Key Input
- **Width:** 100%
- **Height:** 48px
- **Background:** `bg-tertiary`
- **Border:** 1px solid `text-muted`
- **Focus:** `pincer-blue` border
- **Type:** Password (with show/hide toggle)

#### Connection Status Panel
- **Background:** `bg-primary`
- **Border:** 2px solid `pincer-blue`
- **Padding:** 24px
- **Status Indicator:**
  - Icon + text
  - States: Connecting, Analyzing, Complete, Error
  - Color coded
- **Progress Bar:**
  - Height: 8px
  - Animated stripes for active state
  - Fill: `power-gradient`

#### Progress Checklist
- **Items:**
  - Icon: Circle (pending), Spinner (active), Checkmark (done)
  - Text: `text-base`
  - Spacing: 12px between items
  - Animation: Fade in sequentially

---

## 🎯 Component Library

### Buttons

#### Primary Button
```css
.btn-primary {
  background: linear-gradient(135deg, #105190, #00d4ff);
  color: white;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-weight: var(--weight-semibold);
  transition: var(--transition-base);
  box-shadow: var(--shadow-sm);
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--bg-tertiary);
}
.btn-secondary:hover {
  border-color: var(--pincer-blue);
  background: var(--bg-secondary);
}
```

#### Ghost Button
```css
.btn-ghost {
  background: transparent;
  color: var(--pincer-blue);
  border: 1px solid transparent;
}
.btn-ghost:hover {
  background: rgba(16, 81, 144, 0.1);
  border-color: var(--pincer-blue);
}
```

#### Outline Button
```css
.btn-outline {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--text-muted);
}
.btn-outline:hover {
  border-color: var(--pincer-blue);
  color: var(--pincer-blue);
}
```

### Badges

#### Category Badge
```css
.badge {
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}
```

#### MBTI Badge
```css
.badge-mbti {
  background: var(--pincer-blue);
  color: white;
  font-weight: var(--weight-bold);
  padding: 6px 14px;
  letter-spacing: 1px;
}
```

#### Power Tier Badge
```css
.badge-power-elite {
  background: linear-gradient(135deg, #00d4ff, #3fb950);
  color: white;
  box-shadow: 0 0 16px rgba(0, 212, 255, 0.4);
}
```

### Cards

#### Base Card
```css
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--bg-tertiary);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  transition: var(--transition-base);
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(16, 81, 144, 0.3);
}
```

### Inputs

#### Text Input
```css
.input {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  background: var(--bg-tertiary);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: var(--transition-fast);
}
.input:focus {
  outline: none;
  border-color: var(--pincer-blue);
  box-shadow: 0 0 0 3px rgba(16, 81, 144, 0.2);
}
```

#### Search Input
```css
.input-search {
  padding-left: 44px; /* Space for icon */
  background-image: url('icon-search.svg');
  background-position: 16px center;
  background-repeat: no-repeat;
}
```

### Modals

#### Modal Overlay
```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--bg-modal);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn var(--transition-base);
}
```

#### Modal Container
```css
.modal {
  background: var(--bg-secondary);
  border: 1px solid var(--bg-tertiary);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  max-width: 600px;
  width: 90%;
  box-shadow: var(--shadow-xl);
  animation: slideUp var(--transition-base);
}
```

### Progress Bars

#### Linear Progress
```css
.progress {
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--power-gradient);
  transition: width var(--transition-slow);
  animation: shimmer 2s infinite;
}
```

#### Circular Progress
```css
.progress-circle {
  position: relative;
  width: 120px;
  height: 120px;
}
/* Use SVG with stroke-dasharray/dashoffset animation */
```

---

## 🎬 Animations

### Keyframes

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 16px rgba(16, 81, 144, 0.4); }
  50% { box-shadow: 0 0 24px rgba(0, 212, 255, 0.6); }
}
```

### Usage Examples
- **Page load:** Stagger card animations (each card delay +50ms)
- **Power bars:** Animate width from 0 to value over 1s
- **Status changes:** Color transition + pulse effect
- **Hover states:** Lift + glow (150ms)
- **Loading states:** Shimmer animation on skeleton

---

## 📱 Responsive Breakpoints

```css
--breakpoint-mobile: 640px;
--breakpoint-tablet: 768px;
--breakpoint-desktop: 1024px;
--breakpoint-wide: 1280px;
--breakpoint-ultrawide: 1536px;
```

### Layout Adjustments

#### Mobile (<640px)
- Single column grid
- Stack header elements
- Full-width cards
- Drawer menu instead of inline nav
- Compact padding (16px)

#### Tablet (640-1024px)
- 2 column grid for cards
- Reduced spacing
- Collapsible filters

#### Desktop (>1024px)
- 3-4 column grid
- Full navigation
- Hover states enabled
- Larger imagery

---

## ♿ Accessibility Guidelines

### Color Contrast
- All text meets WCAG AA (4.5:1 minimum)
- Interactive elements: AAA preferred (7:1)
- Focus indicators: High contrast, 2px outline

### Keyboard Navigation
- All interactive elements tabbable
- Focus order follows visual hierarchy
- Escape key closes modals
- Enter/Space activates buttons

### Screen Readers
- Semantic HTML (nav, main, article, etc.)
- ARIA labels for icon buttons
- Live regions for status updates
- Alt text for all images

### Motion
- Respect `prefers-reduced-motion`
- Provide non-animated alternatives
- No auto-playing content

---

## 🚀 Performance Targets

### Core Web Vitals
- **LCP:** <2.5s (Largest Contentful Paint)
- **FID:** <100ms (First Input Delay)
- **CLS:** <0.1 (Cumulative Layout Shift)

### Optimization Strategies
- Lazy load images below fold
- Code splitting per route
- SVG icons (inline or sprite)
- Compress images (WebP + fallback)
- Critical CSS inline
- Prefetch on hover for navigation

---

## 🔧 Technical Implementation Notes

### Recommended Stack
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + CSS Variables
- **Charts:** Recharts or Chart.js
- **Animations:** Framer Motion
- **State:** React Context + TanStack Query
- **Forms:** React Hook Form + Zod

### Component Structure
```
components/
├── layout/
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Navigation.tsx
├── cards/
│   ├── AgentCard.tsx
│   ├── StatsCard.tsx
│   └── TransactionCard.tsx
├── charts/
│   ├── PowerRadar.tsx
│   └── ProgressBar.tsx
├── ui/
│   ├── Button.tsx
│   ├── Badge.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── Tooltip.tsx
└── features/
    ├── AgentList.tsx
    ├── AgentProfile.tsx
    ├── UserDashboard.tsx
    └── AgentConnect.tsx
```

---

## 📐 Wireframe Assets

### Icon System
Use **Lucide React** or **Heroicons** for consistency:
- Search: `search-icon`
- Wallet: `wallet-icon`
- User: `user-circle-icon`
- Power: `zap-icon`
- Download: `download-icon`
- Connect: `link-icon`
- Stats: `trending-up-icon`
- Settings: `settings-icon`

### Illustrations
Consider **3D illustrations** for:
- Empty states
- Loading states
- Error pages
- Onboarding

Style: Isometric, gradient-colored, matching brand blue

---

## 🎨 Design File Deliverables

### Figma Structure
1. **Design System Page**
   - Color palette
   - Typography scale
   - Component library

2. **Wireframes** (Lo-fi)
   - Layout structure
   - Content hierarchy

3. **High-Fidelity Mockups**
   - All 4 main pages
   - Multiple states (default, hover, active, loading, error)
   - Mobile + Desktop versions

4. **Prototypes**
   - Interactive flows
   - Animation specs

5. **Developer Handoff**
   - Export styles as CSS variables
   - Component specs
   - Spacing/sizing documentation

---

## 🌟 Premium UX Details

### Microinteractions
1. **Button Press:** Scale 0.98 + slight shadow reduction
2. **Card Hover:** Lift 4px + glow effect
3. **Toggle Switch:** Smooth slide + color transition
4. **Success Action:** Checkmark animation + confetti (optional)
5. **Loading:** Skeleton screens with shimmer

### Delightful Moments
- **First Purchase:** Celebration animation
- **Power Milestone:** Badge unlock animation
- **Agent Connection:** Success confetti
- **Level Up:** Gradient sweep effect

### Empty States
- Friendly illustration
- Clear call-to-action
- Helpful tips or suggestions

### Error States
- Clear error message
- Suggested action
- Support contact link
- Non-destructive (no data loss)

---

## 📝 Content Guidelines

### Tone of Voice
- **Professional** but approachable
- **Clear** and concise
- **Helpful** and supportive
- **Exciting** but not hyperbolic

### Button Labels
- Use action verbs: "Buy Soul", "Connect Agent", "View Details"
- Keep short: <20 characters
- Avoid generic: Not "Submit", but "Complete Purchase"

### Error Messages
- Be specific: "Insufficient PNCR balance" not "Error"
- Offer solution: "Add funds to continue"
- Avoid blame: Not "You entered wrong", but "Email format not recognized"

---

## ✅ Design Checklist

### Before Development
- [ ] All color tokens defined and accessible
- [ ] Typography scale established
- [ ] Component library complete
- [ ] Responsive layouts defined
- [ ] Animations specified
- [ ] Accessibility audit passed
- [ ] Performance budget set

### Before Launch
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile testing (iOS, Android)
- [ ] Keyboard navigation verified
- [ ] Screen reader testing
- [ ] Performance audit (Lighthouse)
- [ ] Visual regression testing
- [ ] User testing feedback incorporated

---

## 🔮 Future Enhancements

### Phase 2 Features
- Advanced filtering (multi-select, range sliders)
- Agent comparison tool (side-by-side)
- Wishlist/favorites
- Agent collections/bundles
- Social features (reviews, ratings)

### Phase 3 Features
- Live chat with agent sellers
- Auction system for rare souls
- Agent customization preview
- Integration with external AI platforms
- Analytics dashboard for sellers

---

## 📚 References & Inspiration

### Design Systems
- Vercel Design System
- Stripe Design System
- GitHub Primer

### Marketplaces
- OpenSea (NFT marketplace)
- Hugging Face (AI models)
- Gumroad (creator marketplace)

### Dark Theme Excellence
- Linear
- Raycast
- Supabase Dashboard

---

**End of Document**

Last Updated: 2026-02-06  
Maintained by: Herald 📢 (Herald Agent)  
For Questions: Contact Pincer Protocol Team