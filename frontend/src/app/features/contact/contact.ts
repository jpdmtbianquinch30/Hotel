import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { MessageService } from '../../core/services/message.service';
import { MessageType } from '../../core/models/message.model';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.html',
})
export class Contact {
  protected readonly auth = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  readonly type = signal<MessageType>('contact');
  readonly submitting = signal(false);
  readonly submitted = signal(false);
  readonly formError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: [''],
    email: ['', [Validators.email]],
    phone: [''],
    subject: ['', Validators.required],
    message: ['', Validators.required],
  });

  setType(type: MessageType): void {
    this.type.set(type);
    this.submitted.set(false);
    this.formError.set(null);
  }

  submit(): void {
    const loggedIn = this.auth.isAuthenticated();

    if (!loggedIn) {
      this.form.get('name')?.addValidators(Validators.required);
      this.form.get('email')?.addValidators([Validators.required, Validators.email]);
      this.form.get('name')?.updateValueAndValidity();
      this.form.get('email')?.updateValueAndValidity();
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.submitting.set(true);
    this.formError.set(null);

    this.messageService
      .send({
        type: this.type(),
        name: loggedIn ? undefined : raw.name,
        email: loggedIn ? undefined : raw.email,
        phone: raw.phone || null,
        subject: raw.subject,
        message: raw.message,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.submitted.set(true);
          this.form.reset({ name: '', email: '', phone: '', subject: '', message: '' });
        },
        error: (err) => {
          this.submitting.set(false);
          this.formError.set(err?.error?.message ?? "L'envoi a échoué. Réessaie.");
        },
      });
  }
}