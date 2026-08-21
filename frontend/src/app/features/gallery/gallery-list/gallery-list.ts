import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Gallery } from '../../../core/models/gallery.model';
import { GalleryService } from '../../../core/services/gallery.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-gallery-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery-list.html',
})
export class GalleryList {
  private readonly galleryService = inject(GalleryService);
  private readonly notifications = inject(NotificationService);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly items = signal<Gallery[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly activeCategory = signal<string | null>(null);
  readonly selectedItem = signal<Gallery | null>(null);
  readonly likingId = signal<number | null>(null);

  readonly categories = computed(() => {
    const set = new Set(this.items().map((item) => item.category));
    return Array.from(set);
  });

  readonly filteredItems = computed(() => {
    const category = this.activeCategory();
    return category ? this.items().filter((item) => item.category === category) : this.items();
  });

  constructor() {
    this.fetchGallery();
    this.notifications.markSeen('gallery');
  }

  fetchGallery(): void {
    this.loading.set(true);
    this.galleryService.list().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('Impossible de charger la galerie pour le moment.');
        this.loading.set(false);
      },
    });
  }

  setCategory(category: string | null): void {
    this.activeCategory.set(category);
  }

  openItem(item: Gallery): void {
    this.selectedItem.set(item);
  }

  closeItem(): void {
    this.selectedItem.set(null);
  }

  toggleLike(item: Gallery, event: Event): void {
    event.stopPropagation();

    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/connexion']);
      return;
    }

    this.likingId.set(item.id);
    this.galleryService.toggleLike(item.id).subscribe({
      next: ({ liked, likes_count }) => {
        this.likingId.set(null);
        this.items.update((list) =>
          list.map((i) => (i.id === item.id ? { ...i, is_liked: liked, likes_count } : i))
        );
        const selected = this.selectedItem();
        if (selected?.id === item.id) {
          this.selectedItem.set({ ...selected, is_liked: liked, likes_count });
        }
      },
      error: () => this.likingId.set(null),
    });
  }
}