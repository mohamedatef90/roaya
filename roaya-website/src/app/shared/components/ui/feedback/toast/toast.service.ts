import { Injectable, signal, computed } from '@angular/core';

export interface Toast {
  id: string;
  variant: 'default' | 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSignal = signal<Toast[]>([]);

  readonly toasts = computed(() => this.toastsSignal());

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  show(toast: Omit<Toast, 'id'>): string {
    const id = this.generateId();
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };

    this.toastsSignal.update(current => [...current, newToast]);

    // Auto-dismiss after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => this.dismiss(id), newToast.duration);
    }

    return id;
  }

  success(message: string, title?: string, duration?: number): string {
    return this.show({ variant: 'success', message, title, duration });
  }

  error(message: string, title?: string, duration?: number): string {
    return this.show({ variant: 'error', message, title, duration });
  }

  warning(message: string, title?: string, duration?: number): string {
    return this.show({ variant: 'warning', message, title, duration });
  }

  info(message: string, title?: string, duration?: number): string {
    return this.show({ variant: 'info', message, title, duration });
  }

  dismiss(id: string): void {
    this.toastsSignal.update(current => current.filter(t => t.id !== id));
  }

  dismissAll(): void {
    this.toastsSignal.set([]);
  }
}
