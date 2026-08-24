import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ContactComponent } from './contact.component';
import enTranslations from '../../../assets/i18n/en.json';
import arTranslations from '../../../assets/i18n/ar.json';

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', enTranslations, false);
    translate.setTranslation('ar', arTranslations, false);
    translate.use('en');

    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('form accessibility: native required attribute', () => {
    it('name input has native required attribute', () => {
      const nameInput = fixture.nativeElement.querySelector('#name');
      expect(nameInput).toBeTruthy();
      expect(nameInput.hasAttribute('required')).toBe(true);
    });

    it('email input has native required attribute', () => {
      const emailInput = fixture.nativeElement.querySelector('#email');
      expect(emailInput).toBeTruthy();
      expect(emailInput.hasAttribute('required')).toBe(true);
    });

    it('message textarea has native required attribute', () => {
      const messageTextarea = fixture.nativeElement.querySelector('#message');
      expect(messageTextarea).toBeTruthy();
      expect(messageTextarea.hasAttribute('required')).toBe(true);
    });

    it('phone input does NOT have required attribute (optional field)', () => {
      const phoneInput = fixture.nativeElement.querySelector('#phone');
      expect(phoneInput).toBeTruthy();
      expect(phoneInput.hasAttribute('required')).toBe(false);
    });
  });

  describe('form accessibility: aria-invalid binding', () => {
    it('name input has no aria-invalid when pristine', () => {
      const nameInput = fixture.nativeElement.querySelector('#name');
      expect(nameInput.getAttribute('aria-invalid')).toBeNull();
    });

    it('name input has aria-invalid="true" when touched and empty', async () => {
      const nameControl = component.contactForm.get('name');
      nameControl?.markAsTouched();
      fixture.detectChanges();

      const nameInput = fixture.nativeElement.querySelector('#name');
      expect(nameInput.getAttribute('aria-invalid')).toBe('true');
    });

    it('email input has aria-invalid="true" for invalid email format', async () => {
      const emailControl = component.contactForm.get('email');
      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched();
      fixture.detectChanges();

      const emailInput = fixture.nativeElement.querySelector('#email');
      expect(emailInput.getAttribute('aria-invalid')).toBe('true');
    });

    it('message textarea has aria-invalid="true" when too short', async () => {
      const messageControl = component.contactForm.get('message');
      messageControl?.setValue('short');
      messageControl?.markAsTouched();
      fixture.detectChanges();

      const messageTextarea = fixture.nativeElement.querySelector('#message');
      expect(messageTextarea.getAttribute('aria-invalid')).toBe('true');
    });

    it('valid input has no aria-invalid attribute', async () => {
      const nameControl = component.contactForm.get('name');
      nameControl?.setValue('Valid Name');
      nameControl?.markAsTouched();
      fixture.detectChanges();

      const nameInput = fixture.nativeElement.querySelector('#name');
      expect(nameInput.getAttribute('aria-invalid')).toBeNull();
    });
  });

  describe('form accessibility: aria-describedby and error IDs', () => {
    it('name input references name-error when invalid', async () => {
      const nameControl = component.contactForm.get('name');
      nameControl?.markAsTouched();
      fixture.detectChanges();

      const nameInput = fixture.nativeElement.querySelector('#name');
      expect(nameInput.getAttribute('aria-describedby')).toBe('name-error');

      const errorElement = fixture.nativeElement.querySelector('#name-error');
      expect(errorElement).toBeTruthy();
    });

    it('email input references email-error when invalid', async () => {
      const emailControl = component.contactForm.get('email');
      emailControl?.markAsTouched();
      fixture.detectChanges();

      const emailInput = fixture.nativeElement.querySelector('#email');
      expect(emailInput.getAttribute('aria-describedby')).toBe('email-error');

      const errorElement = fixture.nativeElement.querySelector('#email-error');
      expect(errorElement).toBeTruthy();
    });

    it('message textarea references message-error when invalid', async () => {
      const messageControl = component.contactForm.get('message');
      messageControl?.markAsTouched();
      fixture.detectChanges();

      const messageTextarea = fixture.nativeElement.querySelector('#message');
      expect(messageTextarea.getAttribute('aria-describedby')).toBe('message-error');

      const errorElement = fixture.nativeElement.querySelector('#message-error');
      expect(errorElement).toBeTruthy();
    });

    it('valid fields have no aria-describedby', async () => {
      const nameControl = component.contactForm.get('name');
      nameControl?.setValue('Valid Name');
      nameControl?.markAsTouched();
      fixture.detectChanges();

      const nameInput = fixture.nativeElement.querySelector('#name');
      expect(nameInput.getAttribute('aria-describedby')).toBeNull();

      const errorElement = fixture.nativeElement.querySelector('#name-error');
      expect(errorElement).toBeNull();
    });
  });

  describe('form accessibility: role="alert" on error messages', () => {
    it('field error messages have role="alert"', async () => {
      // Trigger validation errors
      component.contactForm.get('name')?.markAsTouched();
      component.contactForm.get('email')?.markAsTouched();
      component.contactForm.get('message')?.markAsTouched();
      fixture.detectChanges();

      const errorMessages = fixture.nativeElement.querySelectorAll('[role="alert"]');
      expect(errorMessages.length).toBeGreaterThanOrEqual(3);
    });

    it('error icons are aria-hidden', async () => {
      component.contactForm.get('name')?.markAsTouched();
      fixture.detectChanges();

      const errorElement = fixture.nativeElement.querySelector('#name-error');
      const errorIcon = errorElement?.querySelector('svg');
      expect(errorIcon?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('form accessibility: form-level error', () => {
    it('submission error alert has role="alert"', async () => {
      component.hasError.set(true);
      fixture.detectChanges();

      // Find form-level error by its distinctive class pattern
      const formErrorAlerts = fixture.nativeElement.querySelectorAll('[role="alert"].bg-red-50');
      expect(formErrorAlerts.length).toBeGreaterThan(0);
    });
  });

  describe('form labels and associations', () => {
    it('all required inputs have associated labels via for/id', () => {
      const requiredFields = ['name', 'email', 'message'];

      for (const fieldId of requiredFields) {
        const label = fixture.nativeElement.querySelector(`label[for="${fieldId}"]`);
        const input = fixture.nativeElement.querySelector(`#${fieldId}`);
        expect(label).toBeTruthy();
        expect(input).toBeTruthy();
      }
    });
  });
});
