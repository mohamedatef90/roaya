import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// shadcn-style UI Components
import { SpinnerComponent } from '../../../shared/components/ui';

// Services
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    SpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex">
      <!-- Left Panel - Decorative -->
      <div class="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-gradient-to-br from-[#3D5A80] via-[#4A6D94] to-[#5DB7C2]">
        <!-- Animated Background Pattern -->
        <div class="absolute inset-0">
          <div class="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div class="absolute bottom-40 right-20 w-96 h-96 bg-[#5DB7C2]/20 rounded-full blur-3xl animate-float-delayed"></div>
          <div class="absolute top-1/2 left-1/3 w-64 h-64 bg-[#6B4C9A]/15 rounded-full blur-3xl animate-float-slow"></div>
        </div>

        <!-- Grid Pattern Overlay -->
        <div class="absolute inset-0 opacity-10 grid-pattern"></div>

        <!-- Content -->
        <div class="relative z-10 flex flex-col justify-center h-full p-12 xl:p-16">

          <!-- Center Content -->
          <div class="space-y-8">
            <div>
              <h1 class="text-4xl xl:text-5xl font-bold text-white leading-tight">
                Welcome to<br/>
                <span class="text-white/90">Admin Dashboard</span>
              </h1>
              <p class="mt-4 text-lg text-white/70 max-w-md">
                Manage your website, track analytics, and control all aspects of your digital presence from one powerful platform.
              </p>
            </div>

            <!-- Feature Cards -->
            <div class="grid grid-cols-2 gap-4 max-w-lg">
              <div class="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all">
                <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                  <svg class="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 3v18h18"/>
                    <path d="m19 9-5 5-4-4-3 3"/>
                  </svg>
                </div>
                <h3 class="font-semibold text-white">Analytics</h3>
                <p class="text-sm text-white/60 mt-1">Real-time insights</p>
              </div>
              <div class="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all">
                <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                  <svg class="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <h3 class="font-semibold text-white">Team</h3>
                <p class="text-sm text-white/60 mt-1">Manage users</p>
              </div>
              <div class="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all">
                <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                  <svg class="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                  </svg>
                </div>
                <h3 class="font-semibold text-white">Content</h3>
                <p class="text-sm text-white/60 mt-1">Easy editing</p>
              </div>
              <div class="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all">
                <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                  <svg class="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <h3 class="font-semibold text-white">Security</h3>
                <p class="text-sm text-white/60 mt-1">Enterprise grade</p>
              </div>
            </div>
          </div>

        </div>

        <!-- Bottom - Absolute positioned -->
        <div class="absolute bottom-8 left-12 xl:left-16 flex items-center gap-2 text-white/50 text-sm">
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>Your data is protected with enterprise-grade security</span>
        </div>
      </div>

      <!-- Right Panel - Login Form -->
      <div class="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center p-6 sm:p-12 bg-white dark:bg-neutral-900">
        <div class="w-full max-w-md space-y-8 animate-fade-in">
          <!-- Logo (shown on right panel for all screens) -->
          <div class="text-center lg:text-left">
            <img
              src="/assets/images/roaya-logo.webp"
              alt="Roaya IT"
              class="h-16 w-auto mx-auto lg:mx-0"
            />
          </div>

          <!-- Header -->
          <div class="text-center lg:text-left">
            <h2 class="text-3xl font-bold text-neutral-900 dark:text-white">
              Welcome back
            </h2>
            <p class="mt-2 text-neutral-500 dark:text-neutral-400">
              Sign in to your admin dashboard
            </p>
          </div>

          <!-- Error Alert -->
          @if (error()) {
            <div class="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-shake">
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 w-5 h-5 text-red-500 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" x2="12" y1="8" y2="12"/>
                    <line x1="12" x2="12.01" y1="16" y2="16"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-red-800 dark:text-red-200">{{ error() }}</p>
                </div>
                <button (click)="error.set(null)" class="text-red-500 hover:text-red-700 transition-colors">
                  <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                  </svg>
                </button>
              </div>
            </div>
          }

          <!-- Login Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Email Field -->
            <div class="space-y-2">
              <label for="email" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Email address
                <span class="text-red-500 ml-0.5">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-neutral-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  placeholder="admin@roaya.ai"
                  autocomplete="email"
                  class="w-full h-12 pl-12 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#5DB7C2] focus:border-transparent transition-all"
                  [class.border-red-500]="isFieldInvalid('email')"
                  [class.focus:ring-red-500]="isFieldInvalid('email')"
                />
              </div>
              @if (isFieldInvalid('email')) {
                <p class="text-xs text-red-500 flex items-center gap-1.5 mt-1">
                  <svg class="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="m15 9-6 6"/><path d="m9 9 6 6"/>
                  </svg>
                  {{ getFieldError('email') }}
                </p>
              }
            </div>

            <!-- Password Field -->
            <div class="space-y-2">
              <label for="password" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Password
                <span class="text-red-500 ml-0.5">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-neutral-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  class="w-full h-12 pl-12 pr-12 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#5DB7C2] focus:border-transparent transition-all"
                  [class.border-red-500]="isFieldInvalid('password')"
                  [class.focus:ring-red-500]="isFieldInvalid('password')"
                />
                <button
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  class="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                >
                  @if (showPassword()) {
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" x2="23" y1="1" y2="23"/>
                    </svg>
                  } @else {
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  }
                </button>
              </div>
              @if (isFieldInvalid('password')) {
                <p class="text-xs text-red-500 flex items-center gap-1.5 mt-1">
                  <svg class="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="m15 9-6 6"/><path d="m9 9 6 6"/>
                  </svg>
                  {{ getFieldError('password') }}
                </p>
              }
            </div>

            <!-- Remember Me & Forgot Password -->
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2.5 cursor-pointer group">
                <div class="relative">
                  <input
                    type="checkbox"
                    formControlName="rememberMe"
                    class="peer sr-only"
                  />
                  <div class="w-5 h-5 rounded-md border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 peer-checked:bg-[#5DB7C2] peer-checked:border-[#5DB7C2] transition-all flex items-center justify-center group-hover:border-[#5DB7C2]">
                    <svg class="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <svg class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span class="text-sm text-neutral-600 dark:text-neutral-400">Remember me</span>
              </label>
              <a
                routerLink="/admin/forgot-password"
                class="text-sm font-medium text-[#5DB7C2] hover:text-[#3D5A80] dark:hover:text-[#7DC8D0] transition-colors"
              >
                Forgot password?
              </a>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="loading()"
              class="relative w-full h-12 rounded-xl font-semibold text-white bg-gradient-to-r from-[#3D5A80] to-[#5DB7C2] hover:from-[#355170] hover:to-[#4FA9B4] shadow-lg shadow-[#5DB7C2]/25 hover:shadow-xl hover:shadow-[#5DB7C2]/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 overflow-hidden group"
            >
              <span class="relative z-10 flex items-center justify-center gap-2">
                @if (loading()) {
                  <ui-spinner size="sm" variant="white"></ui-spinner>
                  <span>Signing in...</span>
                } @else {
                  <span>Sign in</span>
                  <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                  </svg>
                }
              </span>
              <!-- Shimmer effect -->
              <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </button>
          </form>

          <!-- Footer -->
          <p class="text-center text-sm text-neutral-400 dark:text-neutral-500">
            © 2026 Roaya IT. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .grid-pattern {
      background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }

    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0) rotate(0deg);
      }
      50% {
        transform: translateY(-20px) rotate(5deg);
      }
    }

    @keyframes float-delayed {
      0%, 100% {
        transform: translateY(0) rotate(0deg);
      }
      50% {
        transform: translateY(-30px) rotate(-5deg);
      }
    }

    @keyframes float-slow {
      0%, 100% {
        transform: translateY(0) scale(1);
      }
      50% {
        transform: translateY(-15px) scale(1.05);
      }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
      20%, 40%, 60%, 80% { transform: translateX(4px); }
    }

    .animate-fade-in {
      animation: fade-in 0.6s ease-out;
    }

    .animate-float {
      animation: float 6s ease-in-out infinite;
    }

    .animate-float-delayed {
      animation: float-delayed 8s ease-in-out infinite;
      animation-delay: 1s;
    }

    .animate-float-slow {
      animation: float-slow 10s ease-in-out infinite;
      animation-delay: 2s;
    }

    .animate-shake {
      animation: shake 0.5s ease-in-out;
    }

    @media (prefers-reduced-motion: reduce) {
      .animate-fade-in,
      .animate-float,
      .animate-float-delayed,
      .animate-float-slow,
      .animate-shake {
        animation: none;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(12),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{}|;':",.<>\/\\`~])[A-Za-z\d@$!%*?&#^()_+\-=\[\]{}|;':",.<>\/\\`~]{12,}$/)
      ]],
      rememberMe: [false],
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/dashboard']);
      return;
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.error.set(null);
    this.loading.set(true);

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        const redirectUrl = sessionStorage.getItem('redirectUrl') || '/admin/dashboard';
        sessionStorage.removeItem('redirectUrl');
        this.router.navigate([redirectUrl]);
      },
      error: (error) => {
        if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
          return;
        }
        this.loading.set(false);
        const errorMessage =
          error?.error?.error?.message ||
          error?.message ||
          'Login failed. Please check your credentials.';
        this.error.set(errorMessage);
      },
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    if (!this.loginForm) return false;
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    if (!this.loginForm) return '';
    const field = this.loginForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field.errors['email']) {
      return 'Invalid email format';
    }
    if (field.errors['minlength']) {
      const minLength = field.errors['minlength'].requiredLength;
      return `Password must be at least ${minLength} characters`;
    }
    if (field.errors['pattern']) {
      return 'Password must contain: uppercase, lowercase, number, and special character';
    }

    return 'Invalid field';
  }
}
