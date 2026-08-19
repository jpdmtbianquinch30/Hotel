import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
})
export class Profile {
  protected readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly editing = signal(false);
  readonly submitting = signal(false);
  readonly formError = signal<string | null>(null);

  readonly selectedAvatar = signal<File | null>(null);
  readonly avatarPreview = signal<string | null>(null);
  readonly removeExistingAvatar = signal(false);

  readonly profileForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    address: [''],
  });

  readonly passwordOpen = signal(false);
  readonly passwordSubmitting = signal(false);
  readonly passwordError = signal<string | null>(null);
  readonly passwordSuccess = signal<string | null>(null);

  readonly passwordForm = this.fb.nonNullable.group({
    current_password: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', Validators.required],
  });

  startEdit(): void {
    const user = this.auth.currentUser();
    if (!user) return;

    this.formError.set(null);
    this.selectedAvatar.set(null);
    this.avatarPreview.set(user.avatar);
    this.removeExistingAvatar.set(false);
    this.profileForm.reset({
      name: user.name,
      email: user.email,
      phone: user.phone ?? '',
      address: user.address ?? '',
    });
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.formError.set('Le fichier sélectionné doit être une image.');
      return;
    }

    this.formError.set(null);
    this.removeExistingAvatar.set(false);
    this.selectedAvatar.set(file);

    const reader = new FileReader();
    reader.onload = () => this.avatarPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  clearAvatar(): void {
    this.selectedAvatar.set(null);
    this.avatarPreview.set(null);
    this.removeExistingAvatar.set(!!this.auth.currentUser()?.avatar);
  }

  submitProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const raw = this.profileForm.getRawValue();
    this.submitting.set(true);
    this.formError.set(null);

    this.auth
      .updateProfile({
        name: raw.name,
        email: raw.email,
        phone: raw.phone || null,
        address: raw.address || null,
        avatar: this.selectedAvatar(),
        remove_avatar: this.removeExistingAvatar(),
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.editing.set(false);
        },
        error: (err) => {
          this.submitting.set(false);
          this.formError.set(err?.error?.message ?? 'La mise à jour du profil a échoué.');
        },
      });
  }

  togglePasswordForm(): void {
    this.passwordOpen.set(!this.passwordOpen());
    this.passwordError.set(null);
    this.passwordSuccess.set(null);
    this.passwordForm.reset({ current_password: '', password: '', password_confirmation: '' });
  }

  submitPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.passwordSubmitting.set(true);
    this.passwordError.set(null);
    this.passwordSuccess.set(null);

    this.auth.updatePassword(this.passwordForm.getRawValue()).subscribe({
      next: () => {
        this.passwordSubmitting.set(false);
        this.passwordSuccess.set('Mot de passe mis à jour.');
        this.passwordForm.reset({ current_password: '', password: '', password_confirmation: '' });
      },
      error: (err) => {
        this.passwordSubmitting.set(false);
        this.passwordError.set(
          err?.error?.errors?.current_password?.[0] ??
            err?.error?.message ??
            'La mise à jour du mot de passe a échoué.'
        );
      },
    });
  }
}