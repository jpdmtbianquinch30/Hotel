import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Gallery } from '../../../core/models/gallery.model';
import { GalleryService } from '../../../core/services/gallery.service';

@Component({
  selector: 'app-gallery-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery-list.html',
})
export class GalleryList {
  private readonly galleryService = inject(GalleryService);

  readonly items = signal<Gallery[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly activeCategory = signal<string | null>(null);
  readonly selectedItem = signal<Gallery | null>(null);

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
}