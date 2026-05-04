# ShopHub — E-commerce Product Catalog

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Features Implemented

- **Product grid** — responsive layout (1 col mobile → 2 tablet → 3–4 desktop), with skeleton loaders on initial load
- **Add to cart** — adds items, quantity +/− controls, remove individual items, clear entire cart
- **Cart sidebar** — slides in from the right, shows subtotal, persists across page refreshes via localStorage
- **Real-time search** — debounced 300ms so it filters after you stop typing, not on every single keystroke
- **Category filter** — click to filter by category
- **Price range slider** — dual-thumb draggable slider with manual number inputs so you can type an exact value instead of dragging
- **Toast notifications** — pops up when you add an item to cart, auto-dismisses after 3s
- **Cart export** — flattens nested cart state into dot-notation JSON (e.g. `items.0.name`), viewable in a modal and downloadable as a `.json` file
- **Shareable filter URLs** — category and price range sync to URL params so you can share a filtered view (e.g. `?category=Electronics&priceMax=500`)

---

## Time Spent

~3 hours

---

## Technical Decisions & Trade-offs

**Debounced search (300ms) instead of instant filtering**
Filtering on every single keystroke causes a re-render for every character typed. A 300ms debounce waits until you stop typing before updating the product grid. The trade-off is a tiny delay, but it feels more natural and avoids unnecessary work.

**Search is local state — category and price sync to the URL, search does not**
Category and price make sense as shareable links (e.g. "here are all electronics under $500"). A half-typed search query does not — you don't share "I was typing 'moni'". So search lives only in React state and never touches the URL.
