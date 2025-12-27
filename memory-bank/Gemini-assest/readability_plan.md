# Readability Improvement Plan - Blog Pages

## 1. Analysis Findings

### Issues Identified
- **Critical Contrast Issue (Dark Mode):** On both the blog listing (`/resources/blog`) and blog detail pages, the Hero Section background remains very light in dark mode while the text changes to white. This makes the title and meta information nearly invisible.
- **Cause:** The Tailwind classes `dark:from-navy`, `dark:via-navy/90`, and `dark:to-teal/80` used in the Hero Section do not appear to resolve to valid colors. Since `navy` is not defined in the top-level Tailwind configuration, the background defaults to its light-mode gradient (`from-neutral-100 via-neutral-50 to-white`), which is very light.
- **Typography:** While the main article body text has good contrast, the sidebar (Table of Contents) and tags could benefit from slightly more distinct coloring in dark mode to improve visual hierarchy.

## 2. Proposed Fixes

### A. Hero Section Background (Priority: Critical)
Update the Hero Section background gradient to use valid, dark colors in dark mode.

**Required Changes:**
- Map `navy` and `teal` in `tailwind.config.js` or use existing brand colors like `primary-900` and `secondary-700`.
- Update the Hero Section gradient classes:
  - **Listing Page:** `roaya-website/src/app/features/resources/blog/blog.component.html`
  - **Detail Page:** `roaya-website/src/app/features/resources/blog/blog-detail/blog-detail.component.html`

### B. Sidebar & Secondary Info (Priority: Medium)
Improve the visibility of the "Table of Contents" and "Tags" in dark mode.

**Required Changes:**
- Update `app-table-of-contents` component to use a more distinct hover/active state color in dark mode.
- Ensure tags have sufficient contrast against the background.

## 3. Implementation Steps

1. **Fix Color Definitions:**
   Add `navy` and `teal` to the `colors` extension in `tailwind.config.js` to ensure the classes `dark:from-navy` etc. work correctly.

2. **Verify Hero Gradients:**
   Check all instances of hero sections to ensure they correctly transition to a dark background.

3. **Accessibility Audit:**
   Use browser developer tools (Lighthouse or Accessibility tab) to verify that all text-to-background contrast ratios meet WCAG AA standards (at least 4.5:1).

## 4. Verification Plan

- [ ] Inspect Hero Section in Dark Mode on Blog Listing.
- [ ] Inspect Hero Section in Dark Mode on Blog Detail.
- [ ] Verify that Light Mode remains unaffected.
- [ ] Run Accessibility audit on both pages.
