# Stacking Cards Animation - Technical Breakdown
## Website: https://www.ineo-sense.com/

---

## 1. OVERVIEW

The stacking card effect on the Ineo-Sense website is a scroll-driven animation where cards appear to slide up and stack on top of each other as the user scrolls down. Each card transitions upward while fading out, creating a dynamic layered effect.

### Key Characteristics:
- **Scroll-based trigger**: Animation tied to scroll position
- **CSS Custom Properties**: Uses `--scroll-progress` variable for dynamic values
- **Transform-based movement**: Cards translate vertically based on scroll progress
- **Opacity fade**: Cards fade out as they scroll up
- **Responsive behavior**: Different effects for desktop vs mobile

---

## 2. HTML STRUCTURE

### Container Hierarchy
```html
<div class="o-panels2"
     data-color-order="desc"
     data-module-panels-sec="jobaccordions"
     data-scroll=""
     data-scroll-module-progress="panelsSecScroll"
     data-scroll-offset="0%,100%">

  <div class="row">

    <!-- Panel Item 1 -->
    <div class="o-panels2__item a-panel column-23"
         data-index="0"
         data-module-text-cards-item="m2"
         data-panels-sec="panel"
         data-scroll=""
         data-scroll-module-progress=""
         data-scroll-offset="300,140"
         data-scroll-position="start,start"
         data-scroll-repeat=""
         style="--color: rgb(255,255,255)">

      <div class="o-panels2__container">

        <!-- Title Section -->
        <div class="o-panels2__title tx-sm">
          <h3>An embedded IoT technology</h3>
        </div>

        <!-- Content Section -->
        <div class="o-panels2__content m-panelContent">

          <!-- Left: Text Content -->
          <div class="m-panelContent__left">
            <div class="m-textContent">
              <p class="tx-p">Content here...</p>
            </div>
          </div>

          <!-- Right: Image -->
          <div class="m-panelContent__right">
            <figure class="a-image m-panelContent__image js-image">
              <img alt="" class="a-image__image js-image-image" />
            </figure>
          </div>

        </div>
      </div>
    </div>

    <!-- Additional panel items follow same structure... -->

  </div>
</div>
```

### Data Attributes Explained

| Attribute | Purpose | Example Value |
|-----------|---------|---------------|
| `data-module-panels-sec` | Identifies the panels module | `"jobaccordions"` |
| `data-scroll` | Marks element for scroll tracking | `""` (empty) |
| `data-scroll-module-progress` | Names the scroll progress tracker | `"panelsSecScroll"` |
| `data-scroll-offset` | Scroll trigger offsets (start, end) | `"0%,100%"` or `"300,140"` |
| `data-scroll-position` | Position reference points | `"start,start"` |
| `data-scroll-repeat` | Whether animation repeats | `""` (empty = yes) |
| `data-index` | Panel index for ordering | `"0"`, `"1"`, `"2"`, etc. |
| `data-color-order` | Color progression direction | `"desc"` (descending) |

---

## 3. CSS IMPLEMENTATION

### Core Panel Styles

```css
/* Main Container */
.o-panels2 {
  overflow: hidden;
}

/* Individual Panel Item */
.o-panels2__item {
  --scroll-progress: 0;  /* CSS Custom Property updated by JS */
  position: relative;
  z-index: var(--index, 1);
  transform-origin: center bottom;
}

/* Panel Background (pseudo-element) */
.o-panels2__item:before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  display: flex;
  width: 50vw;
  height: 100%;
  margin-right: calc(50% - 50vw);
  margin-left: calc(50% - 50vw);
  background-color: var(--color);
  transition: background-color 1s ease;
}

/* Panel Container */
.o-panels2__container {
  position: relative;
  z-index: 1;
  padding: 0 4.1666666667%;
  padding-bottom: 1.5rem;
  background-color: var(--color);
  opacity: var(--opacity, 1);
  transition: background-color 1s ease;
}

/* Title */
.o-panels2__title {
  position: relative;
  z-index: 1;
  padding: 1.5rem 0;
}

/* Content */
.o-panels2__content {
  z-index: 1;
}
```

### Desktop Animation (min-width: 1025px)

```css
@media only screen and (min-width: 1025px) {
  .o-panels2__container {
    min-height: 52rem;  /* 520px */
  }

  /* KEY ANIMATION PROPERTIES */
  .o-panels2__item {
    /* Fade out as scroll progress increases */
    opacity: calc(1 - var(--scroll-progress));

    /* Translate upward by 100% of height × progress */
    transform: translateY(calc(100% * var(--scroll-progress)));
  }

  .o-panels2__title {
    padding: 3rem 0;
  }

  .o-panels2__content {
    padding-bottom: 3rem;
  }
}
```

### Mobile Animation (max-width: 1024px)

```css
@media only screen and (max-width: 1024px) {
  /* Only fade out title and content (no transform) */
  .o-panels2__title,
  .o-panels2__content {
    opacity: calc(1 - var(--scroll-progress));
  }
}
```

### Generic Panel Styles (.a-panel)

```css
.a-panel:before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  width: 50vw;
  height: 100%;
  margin-right: calc(50% - 50vw);
  margin-left: calc(50% - 50vw);
  background-color: var(--color);
  pointer-events: none;
}

.a-panel.-right:before {
  right: 0;
  left: auto;
}
```

---

## 4. ANIMATION MECHANICS

### How the Stacking Effect Works

1. **CSS Custom Property**: `--scroll-progress` (0 to 1)
   - Value 0 = Card at rest (fully visible)
   - Value 0.5 = Card halfway through animation
   - Value 1 = Card fully scrolled/hidden

2. **Opacity Calculation**:
   ```css
   opacity: calc(1 - var(--scroll-progress));
   ```
   - Progress 0 → Opacity 1 (fully visible)
   - Progress 0.5 → Opacity 0.5 (50% transparent)
   - Progress 1 → Opacity 0 (invisible)

3. **Transform Calculation**:
   ```css
   transform: translateY(calc(100% * var(--scroll-progress)));
   ```
   - Progress 0 → translateY(0%) (original position)
   - Progress 0.5 → translateY(50%) (moved up halfway)
   - Progress 1 → translateY(100%) (moved up by full height)

4. **Transform Origin**:
   ```css
   transform-origin: center bottom;
   ```
   - Cards scale/transform from their bottom center point
   - Creates natural upward sliding motion

### Example Progress Values (Captured from Live Site)

| Panel Index | Scroll Progress | Opacity | Transform |
|-------------|----------------|---------|-----------|
| 0 | 0.0626 | 0.937 | translateY(32.56px) |
| 1 | 0 | 1 | translateY(0px) |
| 2 | 0 | 1 | translateY(0px) |
| 3 | 0 | 1 | translateY(0px) |

---

## 5. JAVASCRIPT/SCROLL LIBRARY

### Scroll Tracking System

The site uses a **custom scroll module** (not Locomotive Scroll) with the following characteristics:

**Scroll Attributes:**
- `data-scroll`: Marks elements for scroll observation
- `data-scroll-module-progress`: Names the progress tracker
- `data-scroll-offset`: Defines when animation starts/ends
- `data-scroll-position`: Reference points for scroll calculations
- `data-scroll-repeat`: Controls animation repetition

**JavaScript Responsibilities:**
1. Monitor scroll position relative to each panel
2. Calculate scroll progress (0-1 range)
3. Update `--scroll-progress` CSS custom property
4. Apply to each `.o-panels2__item` element

### Pseudo-Code Logic

```javascript
// On scroll event
function updatePanelsProgress() {
  const panels = document.querySelectorAll('.o-panels2__item');

  panels.forEach((panel) => {
    // Get scroll offset values
    const offset = panel.getAttribute('data-scroll-offset').split(',');
    const startOffset = parseInt(offset[0]);
    const endOffset = parseInt(offset[1]);

    // Calculate element position relative to viewport
    const rect = panel.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Calculate scroll progress (0 to 1)
    let progress = 0;

    // When element enters viewport from bottom
    if (rect.top < viewportHeight - startOffset) {
      const scrolled = viewportHeight - startOffset - rect.top;
      const totalDistance = rect.height + startOffset + endOffset;
      progress = Math.min(Math.max(scrolled / totalDistance, 0), 1);
    }

    // Update CSS custom property
    panel.style.setProperty('--scroll-progress', progress);
  });
}

// Attach to scroll event
window.addEventListener('scroll', updatePanelsProgress);
```

---

## 6. VISUAL DESIGN ELEMENTS

### Color System (Progressive Tint)

Each card has a progressively lighter tint of cyan/turquoise:

| Panel Index | Background Color | Hex Equivalent |
|-------------|-----------------|----------------|
| 0 | rgb(255, 255, 255) | #FFFFFF (White) |
| 1 | rgb(238, 249, 248) | #EEF9F8 |
| 2 | rgb(221, 243, 241) | #DDF3F1 |
| 3 | rgb(204, 237, 235) | #CCEDEB |
| 4 | rgb(187, 231, 228) | #BBE7E4 |
| 5 | rgb(170, 225, 221) | #AAE1DD |

**Color Pattern**: Each card is ~17 points lighter (in RGB) than the previous one, creating a subtle gradient effect when stacked.

### Spacing & Sizing

```css
/* Container Padding */
padding: 0 4.1666666667%; /* ~48px on 1200px wide */
padding-bottom: 1.5rem;    /* 24px */

/* Desktop Min Height */
min-height: 52rem;         /* 520px */

/* Title Padding */
padding: 3rem 0;           /* 48px top/bottom */

/* Content Padding */
padding-bottom: 3rem;      /* 48px */
```

### Typography

**Title Styling:**
- Class: `.tx-sm` (small text)
- Element: `<h3>`
- Font: "Golos Text", "Helvetica Neue", Helvetica, Arial, sans-serif
- Color: `rgb(2, 3, 71)` (#020347 - Dark navy blue)

**Body Text:**
- Class: `.tx-p`
- Element: `<p>`
- Same font family
- Same color

### Borders & Shadows

**No explicit borders or shadows** on the panels themselves. The stacking effect is achieved purely through:
- Background color transitions
- Transform animations
- Opacity changes

### Layout Grid

The panels use a **column-based grid system**:
- `.column-23`: 23-column width (likely 23/24 of container width)
- `.offset-1`: 1-column left offset
- `.row`: Grid row container

---

## 7. ACCESSIBILITY CONSIDERATIONS

### Potential Issues

1. **Reduced Motion**: No `prefers-reduced-motion` media query detected
   - Users sensitive to motion may experience discomfort
   - Should add static fallback

2. **Scroll-jacking Risk**: Scroll-driven animations can interfere with natural scrolling
   - Current implementation appears smooth (no forced scroll positions)

3. **Opacity Changes**: Fading content could be harder to read mid-animation
   - Content remains readable as opacity changes gradually

### Recommendations

```css
@media (prefers-reduced-motion: reduce) {
  .o-panels2__item {
    transform: none !important;
    opacity: 1 !important;
  }
}
```

---

## 8. IMPLEMENTATION GUIDE

### Step-by-Step Recreation

#### 1. HTML Structure

```html
<div class="stacking-panels" data-scroll-container>
  <div class="panel" style="--color: #FFFFFF;">
    <div class="panel-container">
      <h3>Card Title 1</h3>
      <p>Card content...</p>
    </div>
  </div>

  <div class="panel" style="--color: #EEF9F8;">
    <div class="panel-container">
      <h3>Card Title 2</h3>
      <p>Card content...</p>
    </div>
  </div>

  <!-- More panels... -->
</div>
```

#### 2. Base CSS

```css
.stacking-panels {
  overflow: hidden;
}

.panel {
  --scroll-progress: 0;
  position: relative;
  z-index: 1;
  transform-origin: center bottom;
}

.panel::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 50vw;
  height: 100%;
  margin-left: calc(50% - 50vw);
  background-color: var(--color);
  z-index: 0;
  transition: background-color 1s ease;
}

.panel-container {
  position: relative;
  z-index: 1;
  min-height: 520px;
  padding: 48px 5%;
  background-color: var(--color);
  transition: background-color 1s ease;
}

/* Desktop Animation */
@media (min-width: 1025px) {
  .panel {
    opacity: calc(1 - var(--scroll-progress));
    transform: translateY(calc(100% * var(--scroll-progress)));
  }
}

/* Mobile Fallback */
@media (max-width: 1024px) {
  .panel-container {
    opacity: calc(1 - var(--scroll-progress));
  }
}
```

#### 3. JavaScript Implementation

**Option A: Vanilla JavaScript**

```javascript
function updateScrollProgress() {
  const panels = document.querySelectorAll('.panel');
  const viewportHeight = window.innerHeight;

  panels.forEach(panel => {
    const rect = panel.getBoundingClientRect();
    const panelHeight = panel.offsetHeight;

    // Calculate when panel enters viewport
    const startTrigger = viewportHeight * 0.8; // Start at 80% viewport
    const endTrigger = 0; // End when it reaches top

    let progress = 0;

    if (rect.top < startTrigger && rect.bottom > endTrigger) {
      const scrolled = startTrigger - rect.top;
      const totalDistance = panelHeight + startTrigger;
      progress = Math.min(Math.max(scrolled / totalDistance, 0), 1);
    } else if (rect.top <= endTrigger) {
      progress = 1;
    }

    panel.style.setProperty('--scroll-progress', progress);
  });
}

// Throttle scroll events for performance
let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      updateScrollProgress();
      ticking = false;
    });
    ticking = true;
  }
});

// Initial calculation
updateScrollProgress();
```

**Option B: Intersection Observer API**

```javascript
const observerOptions = {
  threshold: buildThresholdArray(), // [0, 0.01, 0.02, ..., 0.99, 1]
  rootMargin: '0px 0px -20% 0px'
};

function buildThresholdArray() {
  const steps = 100;
  return Array.from({ length: steps + 1 }, (_, i) => i / steps);
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const progress = 1 - entry.intersectionRatio;
    entry.target.style.setProperty('--scroll-progress', progress);
  });
}, observerOptions);

document.querySelectorAll('.panel').forEach(panel => {
  observer.observe(panel);
});
```

**Option C: GSAP ScrollTrigger**

```javascript
gsap.utils.toArray('.panel').forEach(panel => {
  gsap.to(panel, {
    '--scroll-progress': 1,
    scrollTrigger: {
      trigger: panel,
      start: 'top 80%',
      end: 'top top',
      scrub: true
    }
  });
});
```

#### 4. Color Progression (Optional Enhancement)

```javascript
// Generate progressive colors
function generateColorScale(startColor, endColor, steps) {
  const colors = [];
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    const r = Math.round(startColor.r + (endColor.r - startColor.r) * ratio);
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * ratio);
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * ratio);
    colors.push(`rgb(${r}, ${g}, ${b})`);
  }
  return colors;
}

const colorScale = generateColorScale(
  { r: 255, g: 255, b: 255 },  // White
  { r: 170, g: 225, b: 221 },  // Turquoise
  6
);

// Apply to panels
document.querySelectorAll('.panel').forEach((panel, i) => {
  panel.style.setProperty('--color', colorScale[i]);
});
```

---

## 9. PERFORMANCE OPTIMIZATION

### Critical Performance Tips

1. **Use CSS Custom Properties for Animation**
   - Updating `--scroll-progress` triggers style recalculation only
   - Better than updating `transform` directly via JS

2. **RequestAnimationFrame**
   - Throttle scroll events to animation frames
   - Prevents layout thrashing

3. **Will-Change Property**
   ```css
   .panel {
     will-change: transform, opacity;
   }
   ```
   - Hints browser to optimize these properties
   - Use sparingly (only on scrolling containers)

4. **Transform Over Top/Left**
   - `transform: translateY()` uses GPU acceleration
   - Avoids layout recalculation

5. **Contain Property**
   ```css
   .panel-container {
     contain: layout style paint;
   }
   ```
   - Isolates panel rendering from rest of page

---

## 10. BROWSER COMPATIBILITY

### CSS Features Used

| Feature | Support | Fallback |
|---------|---------|----------|
| CSS Custom Properties | Modern browsers (IE11+ with polyfill) | Static values |
| `calc()` | All modern browsers | Pre-calculated values |
| `transform` | All modern browsers | None needed |
| `::before` pseudo-element | Universal support | None needed |

### JavaScript APIs

| API | Support | Polyfill |
|-----|---------|----------|
| `requestAnimationFrame` | All modern browsers | setTimeout fallback |
| `IntersectionObserver` | Chrome 51+, Firefox 55+ | Polyfill available |
| `getBoundingClientRect` | Universal | None needed |

---

## 11. TAILWIND IMPLEMENTATION

### Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'panel-0': '#FFFFFF',
        'panel-1': '#EEF9F8',
        'panel-2': '#DDF3F1',
        'panel-3': '#CCEDEB',
        'panel-4': '#BBE7E4',
        'panel-5': '#AAE1DD',
      },
      minHeight: {
        'panel': '520px',
      },
      spacing: {
        'panel-padding': '4.1666666667%',
      },
    },
  },
};
```

### Tailwind Classes

```html
<div class="overflow-hidden">
  <div class="relative z-[1] origin-bottom" style="--scroll-progress: 0;">

    <!-- Pseudo-element replaced with actual element -->
    <div class="absolute top-0 left-0 w-screen h-full -ml-[50vw] ml-[50%] bg-panel-0 transition-colors duration-1000 z-0 pointer-events-none"></div>

    <div class="relative z-[1] min-h-panel px-[4.1666666667%] pb-6 md:pb-12 bg-panel-0 transition-colors duration-1000">
      <h3 class="relative z-[1] py-6 md:py-12">Title</h3>
      <div class="relative z-[1] pb-12">Content</div>
    </div>
  </div>
</div>
```

**Note**: Tailwind cannot style `::before` pseudo-elements directly, so you need to add an actual div for the background.

---

## 12. FLUTTER IMPLEMENTATION

### Flutter Theme

```dart
class StackingPanelTheme {
  static const List<Color> panelColors = [
    Color(0xFFFFFFFF), // White
    Color(0xFFEEF9F8),
    Color(0xFFDDF3F1),
    Color(0xFFCCEDEB),
    Color(0xFFBBE7E4),
    Color(0xFFAAE1DD),
  ];

  static const double minHeight = 520.0;
  static const double horizontalPadding = 0.041666666667; // 4.1666%
  static const double verticalPadding = 48.0;

  static const TextStyle titleStyle = TextStyle(
    fontFamily: 'GolosText',
    fontSize: 24,
    fontWeight: FontWeight.w600,
    color: Color(0xFF020347),
  );

  static const TextStyle bodyStyle = TextStyle(
    fontFamily: 'GolosText',
    fontSize: 16,
    fontWeight: FontWeight.w400,
    color: Color(0xFF020347),
  );
}
```

### Flutter Widget Implementation

```dart
import 'package:flutter/material.dart';

class StackingPanel extends StatefulWidget {
  final String title;
  final String content;
  final Color backgroundColor;
  final int index;

  const StackingPanel({
    Key? key,
    required this.title,
    required this.content,
    required this.backgroundColor,
    required this.index,
  }) : super(key: key);

  @override
  _StackingPanelState createState() => _StackingPanelState();
}

class _StackingPanelState extends State<StackingPanel> {
  double _scrollProgress = 0.0;

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final horizontalPadding = screenWidth * StackingPanelTheme.horizontalPadding;

    // Calculate opacity and transform based on scroll progress
    final opacity = 1.0 - _scrollProgress;
    final translateY = MediaQuery.of(context).size.height * _scrollProgress;

    return Opacity(
      opacity: opacity,
      child: Transform.translate(
        offset: Offset(0, translateY),
        child: Container(
          constraints: BoxConstraints(
            minHeight: StackingPanelTheme.minHeight,
          ),
          decoration: BoxDecoration(
            color: widget.backgroundColor,
          ),
          child: Stack(
            children: [
              // Background pseudo-element equivalent
              Positioned(
                top: 0,
                left: -screenWidth * 0.5,
                child: Container(
                  width: screenWidth,
                  height: double.infinity,
                  color: widget.backgroundColor,
                ),
              ),

              // Content
              Padding(
                padding: EdgeInsets.symmetric(
                  horizontal: horizontalPadding,
                  vertical: StackingPanelTheme.verticalPadding,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.title,
                      style: StackingPanelTheme.titleStyle,
                    ),
                    SizedBox(height: 24),
                    Text(
                      widget.content,
                      style: StackingPanelTheme.bodyStyle,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void updateScrollProgress(double progress) {
    setState(() {
      _scrollProgress = progress.clamp(0.0, 1.0);
    });
  }
}
```

### Scroll Controller Integration

```dart
class StackingPanelsView extends StatefulWidget {
  @override
  _StackingPanelsViewState createState() => _StackingPanelsViewState();
}

class _StackingPanelsViewState extends State<StackingPanelsView> {
  final ScrollController _scrollController = ScrollController();
  final List<GlobalKey> _panelKeys = List.generate(6, (_) => GlobalKey());

  final List<Map<String, String>> _panelData = [
    {'title': 'An embedded IoT technology', 'content': 'Content 1...'},
    {'title': 'Sustainability', 'content': 'Content 2...'},
    {'title': 'High level of services', 'content': 'Content 3...'},
    {'title': 'Flexibility', 'content': 'Content 4...'},
    {'title': 'Mass Deployment', 'content': 'Content 5...'},
    {'title': 'Scalability', 'content': 'Content 6...'},
  ];

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_updatePanelProgress);
  }

  void _updatePanelProgress() {
    for (int i = 0; i < _panelKeys.length; i++) {
      final RenderBox? renderBox =
          _panelKeys[i].currentContext?.findRenderObject() as RenderBox?;

      if (renderBox != null) {
        final position = renderBox.localToGlobal(Offset.zero);
        final screenHeight = MediaQuery.of(context).size.height;
        final panelHeight = renderBox.size.height;

        // Calculate scroll progress
        final startTrigger = screenHeight * 0.8;
        double progress = 0.0;

        if (position.dy < startTrigger && position.dy + panelHeight > 0) {
          final scrolled = startTrigger - position.dy;
          final totalDistance = panelHeight + startTrigger;
          progress = (scrolled / totalDistance).clamp(0.0, 1.0);
        } else if (position.dy <= 0) {
          progress = 1.0;
        }

        // Update panel
        final panelState = _panelKeys[i].currentState as _StackingPanelState?;
        panelState?.updateScrollProgress(progress);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      controller: _scrollController,
      child: Column(
        children: List.generate(_panelData.length, (index) {
          return StackingPanel(
            key: _panelKeys[index],
            title: _panelData[index]['title']!,
            content: _panelData[index]['content']!,
            backgroundColor: StackingPanelTheme.panelColors[index],
            index: index,
          );
        }),
      ),
    );
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }
}
```

---

## 13. ASSETS & RESOURCES

### Screenshots
- `/Users/mohamedatef/Downloads/roaya/.playwright-mcp/stacking-cards-initial.png` - Initial state
- `/Users/mohamedatef/Downloads/roaya/.playwright-mcp/stacking-cards-scrolled.png` - Mid-scroll state

### External Files
- CSS: `https://www.ineo-sense.com/assets/site.BB9VvIc6.css`
- JavaScript: `https://www.ineo-sense.com/assets/site.B2JqqkN1.js`

### Color Palette (Extracted)
```
#FFFFFF - Panel 0 (White)
#EEF9F8 - Panel 1 (Very light cyan)
#DDF3F1 - Panel 2 (Light cyan)
#CCEDEB - Panel 3 (Soft cyan)
#BBE7E4 - Panel 4 (Medium cyan)
#AAE1DD - Panel 5 (Turquoise)
#020347 - Text (Dark navy)
```

---

## 14. SUMMARY

### What Makes This Effect Work

1. **CSS Custom Properties** (`--scroll-progress`) bridge JavaScript and CSS
2. **Transform-based animation** for GPU acceleration
3. **Opacity fade** synchronized with upward movement
4. **Progressive color tints** create depth perception
5. **Scroll-driven logic** provides smooth, natural interaction
6. **Responsive breakpoints** adapt effect for mobile

### Key Takeaways for Developers

- **Simple is powerful**: Only 2 CSS properties animated (transform, opacity)
- **Performance first**: Use transforms and custom properties, avoid layout changes
- **Progressive enhancement**: Works on mobile with simplified animation
- **Accessibility matters**: Add reduced-motion support
- **Color psychology**: Gradient suggests layering and progression

### Recommended Libraries

- **GSAP ScrollTrigger**: Most robust, production-ready
- **Framer Motion**: Great for React projects
- **Intersection Observer API**: Vanilla JS, good browser support
- **Custom solution**: Best for learning and full control

---

**Analysis completed on**: 2025-12-07
**Website analyzed**: https://www.ineo-sense.com/
**Section**: `.o-panels2[data-module-panels-sec="jobaccordions"]`
