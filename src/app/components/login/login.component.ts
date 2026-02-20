import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    grecaptcha?: {
      render: (container: HTMLElement, options: { sitekey: string }) => number;
      getResponse: (widgetId?: number) => string;
      reset: (widgetId?: number) => void;
      ready: (cb: () => void) => void;
    };
    onRecaptchaReady?: () => void;
  }
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-white px-4">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <img src="assets/logo.png" alt="TravelWindow Logo" class="h-24 mx-auto mb-4 object-contain" />
          <p class="text-gray-600 text-sm">Booking Management System</p>
        </div>
        <div class="bg-white rounded-xl shadow-lg p-8 space-y-6 border border-gray-200">
          <h2 class="text-2xl font-bold text-gray-800 text-center">Sign In</h2>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                formControlName="email"
                class="input"
                placeholder="Enter your email"
                [class.border-red-500]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
              />
              <p *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="text-red-500 text-xs mt-1">
                Valid email is required
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                formControlName="password"
                class="input"
                placeholder="Enter your password"
                [class.border-red-500]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
              />
              <p *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="text-red-500 text-xs mt-1">
                Password is required
              </p>
            </div>
            <div class="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                formControlName="rememberMe"
                class="h-4 w-4 rounded border-gray-300 accent-button focus:ring-2 focus:ring-button focus:ring-offset-0"
              />
              <label for="rememberMe" class="ml-2 block text-sm text-gray-700">Remember me</label>
            </div>
            <div *ngIf="recaptchaEnabled" class="flex justify-center">
              <div #recaptchaContainer></div>
            </div>
            <div *ngIf="recaptchaEnabled && recaptchaError" class="text-red-500 text-sm">
              Please complete the captcha.
            </div>
            <div *ngIf="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {{ error }}
            </div>
            <button
              type="submit"
              class="btn btn-primary w-full py-3 text-base font-semibold"
              [disabled]="loginForm.invalid || loading"
            >
              <span *ngIf="!loading">Sign In</span>
              <span *ngIf="loading">Signing in...</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('recaptchaContainer') recaptchaContainer!: ElementRef<HTMLDivElement>;
  loginForm: FormGroup;
  loading = false;
  error = '';
  recaptchaEnabled = false;
  recaptchaError = false;
  private recaptchaWidgetId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.recaptchaEnabled = !!environment.recaptchaSiteKey;
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [true]
    });
  }

  ngOnInit() {
    if (this.recaptchaEnabled && !document.querySelector('script[src*="google.com/recaptcha"]')) {
      window.onRecaptchaReady = () => this.renderRecaptcha();
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaReady&render=explicit`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }

  ngAfterViewInit() {
    if (this.recaptchaEnabled && window.grecaptcha?.ready) {
      window.grecaptcha.ready(() => this.renderRecaptcha());
    }
  }

  private renderRecaptcha() {
    if (!this.recaptchaContainer?.nativeElement || !environment.recaptchaSiteKey || this.recaptchaWidgetId != null) return;
    try {
      this.recaptchaWidgetId = window.grecaptcha!.render(this.recaptchaContainer.nativeElement, {
        sitekey: environment.recaptchaSiteKey
      });
    } catch (_) {}
  }

  ngOnDestroy() {
    window.onRecaptchaReady = undefined;
  }

  onSubmit() {
    if (!this.loginForm.valid) return;
    if (this.recaptchaEnabled) {
      const token = window.grecaptcha?.getResponse?.();
      if (!token) {
        this.recaptchaError = true;
        return;
      }
      this.recaptchaError = false;
    }
    this.loading = true;
    this.error = '';
    const recaptchaToken = this.recaptchaEnabled ? (window.grecaptcha?.getResponse?.() || undefined) : undefined;
    this.authService.login(
      this.loginForm.value.email,
      this.loginForm.value.password,
      this.loginForm.value.rememberMe ?? true,
      recaptchaToken
    ).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Invalid credentials';
        this.loading = false;
        if (this.recaptchaEnabled && this.recaptchaWidgetId != null) {
          window.grecaptcha?.reset?.(this.recaptchaWidgetId);
        }
      }
    });
  }
}
