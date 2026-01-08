# Test Guide: Table of Contents Fix

## Quick Test (2 minutes)

1. **Open your browser** to http://localhost:4200/resources/blog/cloud-migration-strategy-egyptian-enterprises

2. **Wait 2 seconds** for the page to fully load

3. **Click any TOC item** on the right sidebar (desktop) or expand the TOC accordion (mobile)

4. **Verify**:
   - Page scrolls smoothly to the section
   - The clicked TOC item becomes highlighted/active
   - Section heading is visible below the sticky header

5. **Test mobile**:
   - Resize browser to < 1024px width
   - Click TOC toggle button to expand
   - Click any item
   - Verify: TOC collapses after clicking and page scrolls

## Detailed Test Cases

### Test Case 1: Desktop - Immediate Click
**Steps:**
1. Open blog post
2. Immediately click first TOC item (within 1 second)
3. Observe behavior

**Expected:**
- Page scrolls to section (may have slight delay if innerHTML still rendering)
- No console errors
- Section appears below header

**Actual:** _______________

---

### Test Case 2: Desktop - All TOC Items
**Steps:**
1. Open blog post
2. Wait 3 seconds
3. Click each TOC item one by one from top to bottom
4. Observe each scroll

**Expected:**
- All items scroll correctly
- Active state updates for each
- Smooth scrolling animation

**Actual:** _______________

---

### Test Case 3: Mobile Viewport
**Steps:**
1. Open blog post
2. Resize to 375px width (iPhone size)
3. Click "Table of Contents" button to expand
4. Click any item
5. Observe behavior

**Expected:**
- TOC expands to show items
- Clicking item scrolls to section
- TOC automatically collapses after click

**Actual:** _______________

---

### Test Case 4: Arabic Content
**Steps:**
1. Switch language to Arabic (AR)
2. Navigate to any Arabic blog post
3. Click TOC items
4. Observe behavior

**Expected:**
- Arabic headings render correctly
- TOC items have Arabic text
- Scrolling works for Arabic sections
- RTL layout is maintained

**Actual:** _______________

---

### Test Case 5: Scroll Tracking (IntersectionObserver)
**Steps:**
1. Open blog post
2. Wait 2 seconds
3. Manually scroll down the page slowly
4. Watch TOC active state

**Expected:**
- Active TOC item updates as you scroll past sections
- Active state matches the currently visible section
- Smooth transition between active states

**Actual:** _______________

---

### Test Case 6: Deep Linking (Future)
**Steps:**
1. Open blog post with hash: `...blog-post#introduction`
2. Observe if page scrolls to that section

**Expected (current):**
- Hash is ignored (not implemented yet)
- Page loads at top

**Expected (future):**
- Page scrolls to section matching hash

**Actual:** _______________

---

## Browser Compatibility Test

Test in each browser:

| Browser | Version | TOC Click Works? | Scroll Smooth? | Notes |
|---------|---------|------------------|----------------|-------|
| Chrome  | _____   | ☐ Yes ☐ No      | ☐ Yes ☐ No    | _____ |
| Firefox | _____   | ☐ Yes ☐ No      | ☐ Yes ☐ No    | _____ |
| Safari  | _____   | ☐ Yes ☐ No      | ☐ Yes ☐ No    | _____ |
| Edge    | _____   | ☐ Yes ☐ No      | ☐ Yes ☐ No    | _____ |

---

## Console Check

Open browser console (F12) and check for:

**Expected Console Output:**
- No errors
- No warnings (unless element truly doesn't exist)

**If you see warnings:**
- `[TOC] Failed to find heading element with ID "..." after 3 attempts.`
  - This means the ID generation is mismatched or content didn't render
  - Report this with the specific ID and blog post

**Unacceptable Console Output:**
- Any JavaScript errors
- `Cannot read property 'getBoundingClientRect' of null`
- `getElementById is not a function`

---

## Performance Check

**Page Load:**
- ☐ Page loads in < 3 seconds
- ☐ TOC renders immediately with content

**Scroll Performance:**
- ☐ Smooth scroll animation (60fps)
- ☐ No jank or stuttering
- ☐ Active state updates quickly

**Mobile Performance:**
- ☐ TOC accordion opens/closes smoothly
- ☐ No layout shift when clicking TOC

---

## Regression Check

Verify these features still work:

- ☐ Blog listing page loads
- ☐ Blog search works
- ☐ Category filtering works
- ☐ Related posts show correctly
- ☐ Social sharing buttons work
- ☐ Author card displays
- ☐ Reading progress bar works
- ☐ Newsletter signup form works

---

## Sign-off

**Tested by:** _______________
**Date:** _______________
**Result:** ☐ PASS ☐ FAIL ☐ NEEDS WORK

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________

**Issues Found:**
_____________________________________________
_____________________________________________
_____________________________________________

**Recommended Actions:**
_____________________________________________
_____________________________________________
_____________________________________________
