import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

// shadcn UI Imports
import { InputComponent } from '../../../shared/components/ui/primitives/input/input.component';
import { PasswordInputComponent } from '../../../shared/components/ui/form/password-input/password-input.component';
import { SelectComponent, SelectOption } from '../../../shared/components/ui/form/select/select.component';
import { CheckboxComponent } from '../../../shared/components/ui/form/checkbox/checkbox.component';
import { CardComponent, CardHeaderComponent, CardContentComponent } from '../../../shared/components/ui/primitives/card/card.component';
import { SpinnerComponent } from '../../../shared/components/ui/primitives/spinner/spinner.component';
import { LabelComponent } from '../../../shared/components/ui/primitives/label/label.component';
import { ToastService } from '../../../shared/components/ui/feedback/toast/toast.service';

// Services
import { UserService } from '../../../core/services/user.service';
import {
  AdminUser,
  UserRole,
  USER_ROLE_LABELS,
} from '../../../core/interfaces/admin.interface';

/** Custom validator: password complexity (matches backend auth.validators.ts) */
function passwordComplexityValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const errors: ValidationErrors = {};
  if (!/[a-z]/.test(value)) errors['missingLowercase'] = true;
  if (!/[A-Z]/.test(value)) errors['missingUppercase'] = true;
  if (!/\d/.test(value)) errors['missingDigit'] = true;
  if (!/[@$!%*?&#^()_+\-=\[\]{}|;':",.<>\/\\`~]/.test(value)) errors['missingSpecial'] = true;

  return Object.keys(errors).length ? errors : null;
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    InputComponent,
    PasswordInputComponent,
    SelectComponent,
    CheckboxComponent,
    CardComponent,
    CardHeaderComponent,
    CardContentComponent,
    SpinnerComponent,
    LabelComponent,
  ],
  template: `
    <div class="p-6 max-w-2xl mx-auto">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <button
          type="button"
          [routerLink]="['/admin/users']"
          class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white"
          aria-label="Back to users"
        >
          <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <h1 class="text-xl font-semibold text-neutral-900 dark:text-white">
            {{ isEditMode() ? 'Edit User' : 'Create New User' }}
          </h1>
          <p class="text-sm text-neutral-500 dark:text-neutral-400" *ngIf="isEditMode() && user()">
            {{ user()!.email }}
          </p>
          <p class="text-sm text-neutral-500 dark:text-neutral-400" *ngIf="!isEditMode()">
            Add a new admin panel user
          </p>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading()" class="flex items-center justify-center py-16">
        <ui-spinner size="lg"></ui-spinner>
      </div>

      <!-- Form Card -->
      <ui-card *ngIf="!loading()">
        <ui-card-content>
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="space-y-5 pt-6">

            <!-- Name Fields -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <ui-label for="firstName">First Name <span class="text-red-500">*</span></ui-label>
                <ui-input
                  id="firstName"
                  formControlName="firstName"
                  placeholder="Enter first name"
                  [variant]="userForm.get('firstName')?.touched && userForm.get('firstName')?.invalid ? 'error' : 'default'"
                ></ui-input>
                <p class="text-xs text-red-500" *ngIf="userForm.get('firstName')?.touched && userForm.get('firstName')?.invalid">
                  First name is required
                </p>
              </div>

              <div class="space-y-2">
                <ui-label for="lastName">Last Name <span class="text-red-500">*</span></ui-label>
                <ui-input
                  id="lastName"
                  formControlName="lastName"
                  placeholder="Enter last name"
                  [variant]="userForm.get('lastName')?.touched && userForm.get('lastName')?.invalid ? 'error' : 'default'"
                ></ui-input>
                <p class="text-xs text-red-500" *ngIf="userForm.get('lastName')?.touched && userForm.get('lastName')?.invalid">
                  Last name is required
                </p>
              </div>
            </div>

            <!-- Email -->
            <div class="space-y-2">
              <ui-label for="email">Email <span class="text-red-500">*</span></ui-label>
              <ui-input
                id="email"
                type="email"
                formControlName="email"
                placeholder="user@roaya.co"
                autocomplete="email"
                [variant]="userForm.get('email')?.touched && userForm.get('email')?.invalid ? 'error' : 'default'"
              ></ui-input>
              <p class="text-xs text-red-500" *ngIf="userForm.get('email')?.touched && userForm.get('email')?.invalid">
                A valid email address is required
              </p>
            </div>

            <!-- Password (create mode only) -->
            <div class="space-y-2" *ngIf="!isEditMode()">
              <div class="flex items-center justify-between">
                <ui-label for="password">Password <span class="text-red-500">*</span></ui-label>
                <button
                  type="button"
                  (click)="generatePassword()"
                  class="inline-flex items-center gap-1.5 text-xs font-medium text-[#5DB7C2] hover:text-[#3D5A80] transition-colors dark:hover:text-[#7dd3e0]"
                >
                  <svg class="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
                  Generate
                </button>
              </div>
              <ui-password-input
                id="password"
                formControlName="password"
                placeholder="Min. 12 characters"
                autocomplete="new-password"
                [variant]="userForm.get('password')?.touched && userForm.get('password')?.invalid ? 'error' : 'default'"
              ></ui-password-input>

              <!-- Password Strength Indicator -->
              <div *ngIf="userForm.get('password')?.value" class="space-y-2">
                <!-- Strength Bar -->
                <div class="flex gap-1">
                  <div
                    *ngFor="let i of [0, 1, 2, 3]"
                    class="h-1.5 flex-1 rounded-full transition-colors"
                    [ngClass]="{
                      'bg-neutral-200 dark:bg-neutral-700': i >= passwordStrength(),
                      'bg-red-500': i < passwordStrength() && passwordStrength() <= 1,
                      'bg-orange-500': i < passwordStrength() && passwordStrength() === 2,
                      'bg-yellow-500': i < passwordStrength() && passwordStrength() === 3,
                      'bg-green-500': i < passwordStrength() && passwordStrength() === 4
                    }"
                  ></div>
                </div>

                <!-- Requirement Checklist -->
                <div class="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div class="flex items-center gap-1.5 text-xs" [ngClass]="passwordChecks().length ? 'text-green-600 dark:text-green-400' : 'text-neutral-400'">
                    <svg class="h-3 w-3" *ngIf="passwordChecks().length" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <svg class="h-3 w-3" *ngIf="!passwordChecks().length" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
                    12+ characters
                  </div>
                  <div class="flex items-center gap-1.5 text-xs" [ngClass]="passwordChecks().uppercase ? 'text-green-600 dark:text-green-400' : 'text-neutral-400'">
                    <svg class="h-3 w-3" *ngIf="passwordChecks().uppercase" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <svg class="h-3 w-3" *ngIf="!passwordChecks().uppercase" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
                    Uppercase letter
                  </div>
                  <div class="flex items-center gap-1.5 text-xs" [ngClass]="passwordChecks().lowercase ? 'text-green-600 dark:text-green-400' : 'text-neutral-400'">
                    <svg class="h-3 w-3" *ngIf="passwordChecks().lowercase" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <svg class="h-3 w-3" *ngIf="!passwordChecks().lowercase" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
                    Lowercase letter
                  </div>
                  <div class="flex items-center gap-1.5 text-xs" [ngClass]="passwordChecks().digit ? 'text-green-600 dark:text-green-400' : 'text-neutral-400'">
                    <svg class="h-3 w-3" *ngIf="passwordChecks().digit" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <svg class="h-3 w-3" *ngIf="!passwordChecks().digit" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
                    Number
                  </div>
                  <div class="flex items-center gap-1.5 text-xs" [ngClass]="passwordChecks().special ? 'text-green-600 dark:text-green-400' : 'text-neutral-400'">
                    <svg class="h-3 w-3" *ngIf="passwordChecks().special" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <svg class="h-3 w-3" *ngIf="!passwordChecks().special" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
                    Special character
                  </div>
                </div>
              </div>
            </div>

            <!-- Role -->
            <div class="space-y-2">
              <ui-label for="role">Role <span class="text-red-500">*</span></ui-label>
              <ui-select
                id="role"
                formControlName="role"
                [options]="roleOptions"
                placeholder="Select a role"
                [variant]="userForm.get('role')?.touched && userForm.get('role')?.invalid ? 'error' : 'default'"
              ></ui-select>
              <p class="text-xs text-red-500" *ngIf="userForm.get('role')?.touched && userForm.get('role')?.invalid">
                Role is required
              </p>
            </div>

            <!-- Is Active (edit only) -->
            <div *ngIf="isEditMode()" class="space-y-1">
              <ui-checkbox
                formControlName="isActive"
                label="Active"
                id="isActive"
              ></ui-checkbox>
              <p class="text-xs text-neutral-500 dark:text-neutral-400 ml-6">
                Inactive users cannot log in to the admin panel
              </p>
            </div>

            <!-- Divider -->
            <div class="border-t border-neutral-200 dark:border-neutral-700"></div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-3">
              <button
                type="button"
                [routerLink]="['/admin/users']"
                class="inline-flex items-center justify-center h-10 px-4 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="userForm.invalid || saving()"
                class="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-[#3D5A80] text-sm font-medium text-white hover:bg-[#34506f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg *ngIf="saving()" class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                {{ isEditMode() ? 'Update User' : 'Create User' }}
              </button>
            </div>
          </form>
        </ui-card-content>
      </ui-card>
    </div>
  `,
})
export class UserFormComponent implements OnInit {
  user = signal<AdminUser | null>(null);
  loading = signal(false);
  saving = signal(false);
  isEditMode = signal(false);

  userForm!: FormGroup;

  roleOptions: SelectOption[] = Object.entries(USER_ROLE_LABELS).map(([value, label]) => ({
    label,
    value,
  }));

  /** Computed password checks for the requirement checklist */
  passwordChecks = computed(() => {
    const pw = this.userForm?.get('password')?.value || '';
    return {
      length: pw.length >= 12,
      uppercase: /[A-Z]/.test(pw),
      lowercase: /[a-z]/.test(pw),
      digit: /\d/.test(pw),
      special: /[@$!%*?&#^()_+\-=\[\]{}|;':",.<>\/\\`~]/.test(pw),
    };
  });

  /** Computed password strength (0-4) */
  passwordStrength = computed(() => {
    const checks = this.passwordChecks();
    return [checks.length, checks.uppercase, checks.lowercase, checks.digit, checks.special]
      .filter(Boolean).length;
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.initForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.loadUser(id);
    }
  }

  initForm(): void {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      password: [
        '',
        this.isEditMode()
          ? []
          : [Validators.required, Validators.minLength(12), passwordComplexityValidator],
      ],
      role: [UserRole.VIEWER, Validators.required],
      isActive: [true],
    });
  }

  /** Generate a strong password that meets all requirements */
  generatePassword(): void {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghjkmnpqrstuvwxyz';
    const digits = '23456789';
    const specials = '@$!%*?&#^_+-=';
    const all = upper + lower + digits + specials;

    // Guarantee one from each category
    let password = '';
    password += upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += digits[Math.floor(Math.random() * digits.length)];
    password += specials[Math.floor(Math.random() * specials.length)];

    // Fill to 16 characters
    for (let i = 4; i < 16; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle
    password = password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');

    this.userForm.get('password')?.setValue(password);
    this.userForm.get('password')?.markAsTouched();
  }

  loadUser(id: string): void {
    this.loading.set(true);
    this.userService.getUser(id).subscribe({
      next: (user) => {
        this.user.set(user);
        this.userForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        });
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('password')?.updateValueAndValidity();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.toast.error('Failed to load user', 'Error');
        this.loading.set(false);
        this.router.navigate(['/admin/users']);
      },
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach((key) => {
        this.userForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.saving.set(true);

    if (this.isEditMode()) {
      const { password, ...updateData } = this.userForm.value;
      this.userService.updateUser(this.user()!.id, updateData).subscribe({
        next: () => {
          this.toast.success('User updated successfully', 'Success');
          this.saving.set(false);
          this.router.navigate(['/admin/users']);
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.toast.error(error.error?.message || 'Failed to update user', 'Error');
          this.saving.set(false);
        },
      });
    } else {
      this.userService.createUser(this.userForm.value).subscribe({
        next: () => {
          this.toast.success('User created successfully', 'Success');
          this.saving.set(false);
          this.router.navigate(['/admin/users']);
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.toast.error(error.error?.message || 'Failed to create user', 'Error');
          this.saving.set(false);
        },
      });
    }
  }
}
