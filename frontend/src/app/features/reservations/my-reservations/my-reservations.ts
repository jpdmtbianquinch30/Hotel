import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { ReservationService } from '../../../core/services/reservation.service';
import {
  Reservation,
  RESERVATION_STATUS_LABELS,
} from '../../../core/models/reservation.model';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-reservations.html',
})
export class MyReservations {
  readonly reservations = signal<Reservation[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly cancellingId = signal<number | null>(null);
  readonly statusLabels = RESERVATION_STATUS_LABELS;

  constructor(private readonly reservationService: ReservationService) {
    this.fetch();
  }

  fetch(): void {
    this.loading.set(true);
    this.reservationService.list().subscribe({
      next: (list) => {
        this.reservations.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger vos réservations.');
        this.loading.set(false);
      },
    });
  }

  cancel(reservation: Reservation): void {
    if (!confirm('Annuler cette réservation ?')) return;
    this.cancellingId.set(reservation.id);
    this.reservationService.cancel(reservation.id).subscribe({
      next: () => {
        this.cancellingId.set(null);
        this.fetch();
      },
      error: () => {
        this.cancellingId.set(null);
        this.error.set("Impossible d'annuler cette réservation.");
      },
    });
  }
}
