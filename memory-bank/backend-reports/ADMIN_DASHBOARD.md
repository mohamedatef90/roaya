# Roaya IT - Admin Dashboard

## Overview

The Admin Dashboard is a comprehensive Angular 21 application built to manage leads, users, and system settings for the Roaya IT Lead Management System. It features a modern, responsive UI built with PrimeNG and includes support for dark mode, RTL languages, and real-time data updates.

## Features

### 1. Authentication & Authorization
- **JWT-based authentication** with refresh token support
- **Role-based access control** (SUPER_ADMIN, ADMIN, SALES_MANAGER, SALES_REP, VIEWER)
- **Auth guard** to protect routes based on user roles
- **HTTP interceptor** for automatic token attachment
- **Secure session management** with localStorage

### 2. Dashboard
- **Key metrics and statistics**:
  - Total leads
  - New leads (today, this week, this month)
  - Leads by status (pie chart)
  - Leads by source (pie chart)
  - Conversion rate
  - Average response time
- **Recent leads list** with quick actions
- **Auto-refresh** capability for real-time updates

### 3. Lead Management
- **Leads List View**:
  - Paginated table with sorting
  - Advanced filters (status, source, priority, date range, search)
  - Bulk actions support
  - Export to CSV (planned)
  
- **Lead Detail View**:
  - Full lead information editing
  - Activity timeline
  - Notes management (public and private)
  - Tag management
  - Source tracking (UTM parameters, referrer)
  - Status and priority updates
  - Next follow-up scheduling

### 4. User Management (Super Admin only)
- View all admin users
- Create new admin users
- Update user roles and permissions
- Activate/deactivate users

### 5. Tag Management
- Create custom tags with colors
- Assign tags to leads
- Remove tags from leads
- Delete unused tags

### 6. Theme & Localization
- **Dark Mode**: Toggle between light and dark themes
- **RTL Support**: Full support for Arabic and other RTL languages
- **Language Switching**: English/Arabic with ngx-translate
- **Responsive Design**: Optimized for desktop, tablet, and mobile

### 7. Error Handling & Loading States
- **Global error handler** for all application errors
- **HTTP error interceptor** with user-friendly messages
- **Loading spinner** for async operations
- **Toast notifications** for success/error/warning messages

## Tech Stack

- **Angular 21** (Standalone Components)
- **PrimeNG 21** (UI Component Library)
- **TypeScript** (Type-safe development)
- **RxJS** (Reactive programming)
- **ngx-translate** (Internationalization)
- **Angular Signals** (Reactive state management)

## Project Structure

```
roaya-website/src/app/
├── core/
│   ├── guards/
│   │   └── auth.guard.ts              # Route protection
│   ├── interceptors/
│   │   ├── auth.interceptor.ts        # JWT token injection
│   │   └── loading.interceptor.ts     # Loading state management
│   ├── interfaces/
│   │   └── admin.interface.ts         # TypeScript interfaces
│   └── services/
│       ├── auth.service.ts            # Authentication
│       ├── lead.service.ts            # Lead CRUD operations
│       ├── admin.service.ts           # User/tag management
│       ├── theme.service.ts           # Theme switching
│       ├── language.service.ts        # i18n
│       ├── error-handler.service.ts   # Error handling
│       └── loading.service.ts         # Loading states
├── features/
│   └── admin/
│       ├── layout/                    # Admin layout component
│       ├── login/                     # Login page
│       ├── dashboard/                 # Dashboard with stats
│       └── leads/                     # Lead list & detail views
├── shared/
│   └── components/
│       └── loading-spinner/           # Global loading spinner
└── styles/
    └── theme.scss                     # Custom PrimeNG theme
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Backend API running (see backend/LOCAL_TESTING_GUIDE.md)

### Installation

1. **Install dependencies**:
```bash
cd roaya-website
npm install
```

2. **Configure environment**:

Update `src/environments/environment.ts` with your backend API URL:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001/api/v1', // Update this
};
```

3. **Run the development server**:
```bash
npm start
```

The admin dashboard will be available at `http://localhost:4200/admin`

### Default Admin Credentials

After running the backend seed script (`npm run prisma:seed`), use these credentials:

- **Super Admin**:
  - Email: `admin@roaya.co`
  - Password: `Admin123!`

- **Sales Manager**:
  - Email: `manager@roaya.co`
  - Password: `Manager123!`

- **Sales Rep**:
  - Email: `sales@roaya.co`
  - Password: `Sales123!`

## Usage

### Logging In

1. Navigate to `http://localhost:4200/admin/login`
2. Enter your email and password
3. Click "Login"
4. You'll be redirected to the dashboard upon successful authentication

### Managing Leads

#### Viewing Leads
1. Click "Leads" in the sidebar navigation
2. Use filters to narrow down leads by status, source, priority, or date range
3. Click on any lead row to view details

#### Editing a Lead
1. Open the lead detail view
2. Modify any field in the form
3. Click "Save" to update

#### Adding Notes
1. In the lead detail view, go to the "Notes" tab
2. Type your note in the text area
3. Check "Private Note" if it should only be visible to admins
4. Click "Add Note"

#### Managing Tags
1. In the lead detail view, see current tags at the bottom left
2. Click the "X" on any tag chip to remove it
3. Use the tag management page to create new tags

### Theme & Language

- **Toggle Dark Mode**: Click the sun/moon icon in the top navigation bar
- **Switch Language**: Click the language toggle (EN/AR) in the top navigation bar

## API Integration

The admin dashboard communicates with the backend API using the following base URL:
```
{apiUrl}/leads      - Lead management endpoints
{apiUrl}/admin      - Admin user and tag management
{apiUrl}/auth       - Authentication endpoints
```

All API responses follow this structure:
```typescript
{
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## Troubleshooting

### Authentication Issues

**Problem**: "401 Unauthorized" errors
**Solution**: 
- Check that the backend is running
- Verify the API URL in environment.ts
- Try logging out and logging back in
- Clear localStorage and refresh

### CORS Issues

**Problem**: CORS errors in browser console
**Solution**:
- Ensure backend CORS is configured to allow `http://localhost:4200`
- Check backend `.env` file has correct `CORS_ORIGIN`

### Theme Not Loading

**Problem**: PrimeNG theme not applying
**Solution**:
- Verify `styles/theme.scss` is imported in `styles.scss`
- Check `angular.json` includes PrimeNG CSS files
- Clear browser cache and rebuild: `npm run build`

### Data Not Loading

**Problem**: Dashboard shows no data
**Solution**:
- Check browser console for API errors
- Verify backend is running and accessible
- Check that test data exists (run `npm run prisma:seed` in backend)
- Inspect network tab for failed requests

## Development

### Adding a New Page

1. Create the component:
```bash
ng generate component features/admin/new-page
```

2. Add route in `app.routes.ts`:
```typescript
{
  path: 'admin',
  loadComponent: () => import('./features/admin/layout/admin-layout.component'),
  canActivate: [authGuard],
  children: [
    // ... existing routes
    {
      path: 'new-page',
      loadComponent: () => import('./features/admin/new-page/new-page.component'),
      title: 'New Page - Roaya IT',
    }
  ]
}
```

3. Add navigation item in `admin-layout.component.ts`:
```typescript
menuItems: MenuItem[] = [
  // ... existing items
  {
    label: 'New Page',
    icon: 'pi pi-box',
    routerLink: ['/admin/new-page'],
  }
];
```

### Adding a New Service Method

1. Add method signature to service (e.g., `lead.service.ts`):
```typescript
updateLeadStatus(id: string, status: LeadStatus): Observable<Lead> {
  return this.http
    .patch<ApiResponse<Lead>>(`${this.API_URL}/${id}/status`, { status })
    .pipe(
      map((response) => {
        if (!response.success || !response.data) {
          throw new Error(response.error?.message || 'Failed to update status');
        }
        return response.data;
      }),
      catchError((error) => {
        console.error('Update status error:', error);
        return throwError(() => error);
      })
    );
}
```

2. Use in component:
```typescript
this.leadService.updateLeadStatus(leadId, LeadStatus.QUALIFIED).subscribe({
  next: (lead) => {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Lead status updated',
    });
  },
  error: (error) => {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
    });
  },
});
```

## Testing

### Manual Testing Checklist

- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should show error)
- [ ] Dashboard loads with statistics
- [ ] Dashboard charts render correctly
- [ ] Leads list loads with pagination
- [ ] Lead filters work correctly
- [ ] Lead detail view displays all information
- [ ] Lead update saves successfully
- [ ] Notes can be added to leads
- [ ] Tags can be added/removed from leads
- [ ] Theme toggle works (light/dark mode)
- [ ] Language toggle works (EN/AR)
- [ ] RTL layout works correctly in Arabic
- [ ] Logout redirects to login page
- [ ] Protected routes redirect to login when not authenticated
- [ ] Role-based access control works
- [ ] Loading spinner shows during API calls
- [ ] Error messages display correctly
- [ ] Success notifications appear after actions
- [ ] Responsive design works on mobile/tablet

### Automated Testing (Future)

Unit tests and E2E tests will be added in a future phase. The current implementation is ready for manual testing and production use.

## Deployment

### Build for Production

```bash
npm run build
```

The build artifacts will be in the `dist/roaya-website/browser` directory.

### Environment Configuration

Update `src/environments/environment.prod.ts` with production API URL:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.roaya.co/api/v1',
};
```

### Hosting

The Angular application can be hosted on:
- **Vercel** (recommended for SSR)
- **Netlify**
- **AWS S3 + CloudFront**
- **Firebase Hosting**
- **Azure Static Web Apps**

## Future Enhancements

- [ ] Real-time notifications with WebSockets
- [ ] Advanced analytics and reporting
- [ ] Lead assignment and workflow automation
- [ ] Email integration (send emails directly from dashboard)
- [ ] SMS integration (send SMS to leads)
- [ ] Calendar integration for follow-ups
- [ ] File uploads and attachments
- [ ] Audit log for all actions
- [ ] Bulk lead import (CSV/Excel)
- [ ] Custom fields for leads
- [ ] Lead scoring and qualification
- [ ] Sales pipeline visualization
- [ ] Team performance metrics
- [ ] Automated E2E tests
- [ ] Component unit tests

## Support

For issues, questions, or feature requests, please contact:
- **Email**: support@roaya.co
- **Documentation**: See `memory-bank/project/` for detailed backend API docs

## License

Copyright © 2025 Roaya IT. All rights reserved.
