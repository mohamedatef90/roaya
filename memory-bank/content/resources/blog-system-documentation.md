# Blog System Documentation

> **Last Updated:** 2025-12-26
> **Location:** `/src/app/features/resources/blog/`
> **Service:** `/src/app/core/services/blog.service.ts`

---

## Overview

The Roaya IT blog system is a fully-featured content management solution built into the Angular application. It supports bilingual content (English/Arabic), categories, featured posts, search, filtering, and related posts functionality.

---

## File Structure

```
src/app/
├── core/
│   ├── interfaces/
│   │   └── blog.interface.ts          # TypeScript interfaces for blog entities
│   └── services/
│       └── blog.service.ts            # Blog data and business logic
│
├── features/resources/blog/
│   ├── blog.component.ts              # Blog listing page component
│   ├── blog.component.html            # Blog listing template
│   └── blog-detail/
│       ├── blog-detail.component.ts   # Single post view component
│       └── blog-detail.component.html # Single post template
│
└── shared/components/
    ├── author-card/                   # Author info component
    ├── newsletter-signup/             # Email subscription component
    ├── reading-progress/              # Reading progress indicator
    └── table-of-contents/             # ToC navigation component
```

---

## Data Interfaces

### BlogPost Interface

```typescript
interface BlogPost {
  // Unique Identifiers
  id: string;                    // Unique ID (e.g., 'post-001')
  slug: string;                  // URL-friendly slug (e.g., 'cloud-migration-strategy-egyptian-enterprises')

  // Content - English
  title: string;
  excerpt: string;               // Short description (150-200 chars)
  content: string;               // Full markdown content

  // Content - Arabic
  titleAr: string;
  excerptAr: string;
  contentAr: string;

  // Author (linked to Author object)
  author: Author;

  // Dates
  publishedDate: Date;
  updatedDate?: Date;            // Optional, for updates

  // Classification
  category: BlogCategory;        // 'cloud' | 'security' | 'sap' | 'industry' | 'updates'
  tags: string[];                // English tags
  tagsAr: string[];              // Arabic tags

  // Media
  featuredImage: string;         // Image path (e.g., '/assets/images/blog/cloud-migration.jpg')
  featuredImageAlt: string;      // English alt text
  featuredImageAltAr: string;    // Arabic alt text

  // Reading Time
  readingTime: number;           // Minutes (English content)
  readingTimeAr: number;         // Minutes (Arabic content)

  // Display
  featured: boolean;             // Show in featured section

  // SEO
  metaTitle?: string;
  metaTitleAr?: string;
  metaDescription?: string;
  metaDescriptionAr?: string;
  keywords: string[];
  keywordsAr: string[];
}
```

### Author Interface

```typescript
interface Author {
  id: string;                    // Unique ID (e.g., 'ahmed-hassan')
  name: string;                  // English name
  nameAr: string;                // Arabic name
  role: string;                  // English role/title
  roleAr: string;                // Arabic role/title
  avatar: string;                // Image path
  bio: string;                   // English biography
  bioAr: string;                 // Arabic biography
  linkedin?: string;             // Optional LinkedIn URL
  twitter?: string;              // Optional Twitter URL
}
```

### BlogCategory Type

```typescript
type BlogCategory = 'cloud' | 'security' | 'sap' | 'industry' | 'updates';
```

---

## How to Add a New Blog Post

### Step 1: Add Author (if new)

If the post is by a new author, first add them to the `authors` array in `blog.service.ts`:

```typescript
// In blog.service.ts, find the authors array
private readonly authors: Author[] = [
  // ... existing authors
  {
    id: 'new-author-id',
    name: 'Author Name',
    nameAr: 'اسم المؤلف',
    role: 'Job Title',
    roleAr: 'المسمى الوظيفي',
    avatar: '/assets/images/team/author-name.jpg',
    bio: 'Author biography in English...',
    bioAr: 'السيرة الذاتية بالعربية...',
    linkedin: 'https://linkedin.com/in/author-profile'
  }
];
```

### Step 2: Add the Blog Post

Add a new entry to the `posts` array in `blog.service.ts`:

```typescript
// In blog.service.ts, find the posts array
private readonly posts: BlogPost[] = [
  // ... existing posts
  {
    id: 'post-011',  // Increment from last ID
    slug: 'your-post-url-slug',

    // English Content
    title: 'Your Post Title',
    excerpt: 'A brief description of your post (150-200 characters).',
    content: `
## Introduction

Your markdown content here...

## Main Section

More content...

### Subsection

Details...

## Conclusion

Summary and call to action.
    `,

    // Arabic Content
    titleAr: 'عنوان المقال بالعربية',
    excerptAr: 'وصف موجز للمقال (150-200 حرف).',
    contentAr: `
## مقدمة

المحتوى بالعربية...

## القسم الرئيسي

المزيد من المحتوى...

### القسم الفرعي

التفاصيل...

## الخلاصة

الملخص والدعوة للعمل.
    `,

    // Link to author (reference from authors array)
    author: this.authors[0],  // Or use index of your author

    // Dates
    publishedDate: new Date('2025-01-20'),

    // Classification
    category: 'cloud',  // Choose: 'cloud' | 'security' | 'sap' | 'industry' | 'updates'
    tags: ['tag1', 'tag2', 'tag3'],
    tagsAr: ['علامة1', 'علامة2', 'علامة3'],

    // Image (add image to /src/assets/images/blog/)
    featuredImage: '/assets/images/blog/your-image.jpg',
    featuredImageAlt: 'Description of the image',
    featuredImageAltAr: 'وصف الصورة',

    // Reading time (calculate based on word count / 200)
    readingTime: 7,
    readingTimeAr: 9,  // Arabic typically takes ~20% longer

    // Featured flag
    featured: false,  // Set to true to show in featured section

    // SEO
    metaTitle: 'Your Post Title | Roaya IT',
    metaTitleAr: 'عنوان المقال | رؤية لتكنولوجيا المعلومات',
    metaDescription: 'SEO description (150-160 characters).',
    metaDescriptionAr: 'وصف السيو (150-160 حرف).',
    keywords: ['keyword1', 'keyword2', 'keyword3'],
    keywordsAr: ['كلمة1', 'كلمة2', 'كلمة3']
  }
];
```

### Step 3: Add Featured Image

1. Create or obtain an image (recommended: 1200x630px for social sharing)
2. Save to `/src/assets/images/blog/your-image.jpg`
3. Reference in the post's `featuredImage` field

### Step 4: Test the Post

1. Run `npm run dev` to start the development server
2. Navigate to `http://localhost:4200/resources/blog`
3. Find your post in the listing
4. Click to view the detail page
5. Test in both English and Arabic modes
6. Verify all content displays correctly

---

## Available Service Methods

The `BlogService` provides the following methods:

| Method | Description | Return Type |
|--------|-------------|-------------|
| `getAllPosts()` | Get all posts sorted by date | `Observable<BlogPost[]>` |
| `getPostBySlug(slug)` | Get single post by URL slug | `Observable<BlogPost \| undefined>` |
| `getPostsByCategory(category)` | Filter posts by category | `Observable<BlogPost[]>` |
| `getFeaturedPosts(limit)` | Get featured posts (default: 3) | `Observable<BlogPost[]>` |
| `getRelatedPosts(post, limit)` | Get related posts based on category/tags | `Observable<BlogPost[]>` |
| `searchPosts(query)` | Search posts by title, excerpt, or tags | `Observable<BlogPost[]>` |
| `generateToc(content)` | Generate table of contents from markdown | `TocItem[]` |
| `getAuthorById(authorId)` | Get author by ID | `Author \| undefined` |
| `getAllAuthors()` | Get all authors | `Author[]` |

---

## Categories

The blog uses 5 predefined categories:

| Category ID | Description | Translation Key |
|-------------|-------------|-----------------|
| `cloud` | Cloud computing topics | `blog.categories.cloud` |
| `security` | Cybersecurity topics | `blog.categories.security` |
| `sap` | SAP solutions & implementations | `blog.categories.sap` |
| `industry` | Industry insights & trends | `blog.categories.industry` |
| `updates` | Company news & updates | `blog.categories.updates` |

---

## Content Guidelines

### Markdown Support

Blog content supports standard markdown:

- `## Heading 2` - Main sections
- `### Heading 3` - Subsections
- `**bold**` - Bold text
- `*italic*` - Italic text
- `- item` - Unordered lists
- `1. item` - Ordered lists
- `` `code` `` - Inline code
- Triple backticks for code blocks

### Writing Best Practices

1. **Headlines**: Use action-oriented, specific titles
2. **Excerpts**: Write compelling 150-200 character summaries
3. **Structure**: Use clear heading hierarchy (H2 → H3)
4. **Length**: Aim for 1000-2000 words (5-10 min read)
5. **Arabic Content**: Ensure quality translation, not just machine translation
6. **Images**: Use relevant, high-quality images with proper alt text

### SEO Guidelines

1. **Meta Title**: 50-60 characters, include primary keyword
2. **Meta Description**: 150-160 characters, include call-to-action
3. **Keywords**: 3-5 relevant keywords per post
4. **URL Slug**: Use lowercase, hyphenated, keyword-rich slugs

---

## Translation Files

Blog-related translations are in:
- `/src/assets/i18n/en.json` - English
- `/src/assets/i18n/ar.json` - Arabic

Key translation paths:
```json
{
  "blog": {
    "badge": "Blog",
    "title": "Our Blog",
    "description": "Insights, updates, and expertise...",
    "featuredPosts": "Featured Posts",
    "readingTime": "min read",
    "readMore": "Read More",
    "categories": {
      "all": "All",
      "cloud": "Cloud",
      "security": "Security",
      "sap": "SAP",
      "industry": "Industry",
      "updates": "Updates"
    }
  }
}
```

---

## Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/resources/blog` | BlogComponent | Blog listing page |
| `/resources/blog/:slug` | BlogDetailComponent | Single post view |

---

## Future Enhancements (Planned)

- [ ] CMS/API integration for content management
- [ ] Comments system
- [ ] Social sharing analytics
- [ ] Author profile pages
- [ ] Tag pages
- [ ] RSS feed generation
- [ ] Newsletter integration with email service

---

## Troubleshooting

### Post Not Appearing

1. Check the `publishedDate` is in the past
2. Verify the post ID is unique
3. Ensure the slug is unique and URL-friendly
4. Check for TypeScript errors in the service

### Images Not Loading

1. Verify the image path is correct
2. Check the image file exists in `/src/assets/images/blog/`
3. Ensure the image format is supported (jpg, png, webp)

### Arabic Content Issues

1. Verify `contentAr` field is populated
2. Check for proper RTL formatting
3. Test in Arabic language mode

---

## Contact

For questions or issues with the blog system, contact the development team.
