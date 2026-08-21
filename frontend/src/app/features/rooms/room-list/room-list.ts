import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { RoomService } from '../../../core/services/room.service';
import { Room } from '../../../core/models/room.model';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './room-list.html',
})
export class RoomList {
  private readonly roomService = inject(RoomService);
  private readonly reservationService = inject(ReservationService);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly rooms = signal<Room[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);

  readonly minPrice = signal<number | null>(null);
  readonly maxPrice = signal<number | null>(null);
  readonly likingId = signal<number | null>(null);

  readonly filteredRooms = computed(() => {
    const min = this.minPrice();
    const max = this.maxPrice();

    return this.rooms().filter((room) => {
      const price = Number(room.price);
      if (min !== null && price < min) return false;
      if (max !== null && price > max) return false;
      return true;
    });
  });

  readonly selectedRoom = signal<Room | null>(null);
  readonly submitting = signal(false);
  readonly formError = signal<string | null>(null);
  readonly success = signal(false);

  readonly form = this.fb.nonNullable.group({
    firstname: ['', Validators.required],
    middlename: [''],
    lastname: ['', Validators.required],
    address: [''],
    contact_no: [''],
    extra_bed: [false],
    checkin: ['', Validators.required],
    checkout: ['', Validators.required],
  });

  constructor() {
    this.fetchRooms();
    this.notifications.markSeen('rooms');
  }

  fetchRooms(): void {
    this.loading.set(true);
    this.roomService.list().subscribe({
      next: (rooms) => {
        this.rooms.set(rooms);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('Impossible de charger les chambres pour le moment.');
        this.loading.set(false);
      },
    });
  }

  onMinPriceChange(value: string): void {
    this.minPrice.set(value ? Number(value) : null);
  }

  onMaxPriceChange(value: string): void {
    this.maxPrice.set(value ? Number(value) : null);
  }

  resetPriceFilter(): void {
    this.minPrice.set(null);
    this.maxPrice.set(null);
  }

  toggleLike(room: Room, event: Event): void {
    event.stopPropagation();

    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/connexion']);
      return;
    }

    this.likingId.set(room.id);
    this.roomService.toggleLike(room.id).subscribe({
      next: ({ liked, likes_count }) => {
        this.likingId.set(null);
        this.rooms.update((list) =>
          list.map((r) => (r.id === room.id ? { ...r, is_liked: liked, likes_count } : r))
        );
      },
      error: () => this.likingId.set(null),
    });
  }

  openReservation(room: Room): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/connexion']);
      return;
    }
    this.success.set(false);
    this.formError.set(null);
    this.form.reset({ extra_bed: false });
    this.selectedRoom.set(room);
  }

  closeModal(): void {
    this.selectedRoom.set(null);
  }

  private computeDays(): number {
    const { checkin, checkout } = this.form.getRawValue();
    const start = new Date(checkin);
    const end = new Date(checkout);
    const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }

  submit(): void {
    const room = this.selectedRoom();
    if (!room) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const days = this.computeDays();
    if (days <= 0) {
      this.formError.set('La date de départ doit être après la date d\'arrivée.');
      return;
    }

    this.submitting.set(true);
    this.formError.set(null);

    this.reservationService
      .create({ room_id: room.id, days, ...this.form.getRawValue() })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.success.set(true);
        },
        error: (err) => {
          this.submitting.set(false);
          this.formError.set(
            err?.error?.message ?? 'La réservation a échoué. Veuillez réessayer.'
          );
        },
      });
  }
}