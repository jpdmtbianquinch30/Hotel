import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
})
export class Navbar {
  protected readonly auth = inject(AuthService);
  protected readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  menuOpen = false;

  constructor() {
    this.notifications.refresh();
    if (this.auth.isAdmin()) {
      this.notifications.refreshAdminSummary();
    }
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.auth.clearSession();
        this.router.navigate(['/']);
      },
    });
    this.closeMenu();
  }
}