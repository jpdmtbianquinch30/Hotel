import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Room, RoomPayload } from '../../../core/models/room.model';
import { GALLERY_CATEGORIES, Gallery, GalleryPayload } from '../../../core/models/gallery.model';
import { User } from '../../../core/models/user.model';
import { UserService, UserPayload } from '../../../core/services/user.service';
import {
  Reservation,
  RESERVATION_STATUS_LABELS,
  ReservationStatus,
} from '../../../core/models/reservation.model';
import { RoomService } from '../../../core/services/room.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { GalleryService } from '../../../core/services/gallery.service';
import { Rule, RulePayload } from '../../../core/models/rule.model';
import { RuleService } from '../../../core/services/rule.service';

type Tab = 'rooms' | 'gallery' | 'reservations' | 'users' | 'rules';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly roomService = inject(RoomService);
  private readonly reservationService = inject(ReservationService);
    private readonly galleryService = inject(GalleryService);
    private readonly userService = inject(UserService);
  private readonly ruleService = inject(RuleService);
  private readonly fb = inject(FormBuilder);

  readonly tab = signal<Tab>('rooms');
  readonly statusLabels = RESERVATION_STATUS_LABELS;
  readonly statusOptions: ReservationStatus[] = [
    'pending',
    'confirmed',
    'checked_in',
    'checked_out',
    'cancelled',
  ];

  // --- Chambres ---
  readonly rooms = signal<Room[]>([]);
  readonly roomsLoading = signal(true);
  readonly roomsError = signal<string | null>(null);

  readonly roomModalOpen = signal(false);
  readonly editingRoom = signal<Room | null>(null);
  readonly roomSubmitting = signal(false);
  readonly roomFormError = signal<string | null>(null);
  readonly deletingRoomId = signal<number | null>(null);

  readonly selectedPhoto = signal<File | null>(null);
  readonly photoPreview = signal<string | null>(null);
  readonly removeExistingPhoto = signal(false);

  readonly roomForm = this.fb.nonNullable.group({
    room_type: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    description: [''],
    is_available: [true],
  });

  // --- Galerie ---
  readonly galleryCategories = GALLERY_CATEGORIES;
  readonly galleryItems = signal<Gallery[]>([]);
  readonly galleryLoading = signal(true);
  readonly galleryError = signal<string | null>(null);

  readonly galleryModalOpen = signal(false);
  readonly editingGalleryItem = signal<Gallery | null>(null);
  readonly gallerySubmitting = signal(false);
  readonly galleryFormError = signal<string | null>(null);
  readonly deletingGalleryId = signal<number | null>(null);

  readonly selectedImage = signal<File | null>(null);
  readonly imagePreview = signal<string | null>(null);

  readonly galleryForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    category: ['', Validators.required],
    description: [''],
    is_published: [false],
  });

  // --- Réservations ---
  readonly reservations = signal<Reservation[]>([]);
  readonly reservationsLoading = signal(true);
  readonly reservationsError = signal<string | null>(null);
  readonly updatingStatusId = signal<number | null>(null);

  constructor() {
    this.fetchRooms();
    this.fetchGallery();
    this.fetchReservations();
   this.fetchUsers();
   this.fetchRules();
  }

  setTab(tab: Tab): void {
    this.tab.set(tab);
  }
    // --- Utilisateurs : gestion ---

  fetchUsers(): void {
    this.usersLoading.set(true);
    this.userService.list().subscribe({
      next: (list) => {
        this.users.set(list);
        this.usersLoading.set(false);
      },
      error: () => {
        this.usersError.set('Impossible de charger les utilisateurs.');
        this.usersLoading.set(false);
      },
    });
  }

  openCreateUser(): void {
    this.userFormError.set(null);
    this.userForm.reset({ name: '', email: '', password: '', phone: '', role: 'client' });
    this.userModalOpen.set(true);
  }

  closeUserModal(): void {
    this.userModalOpen.set(false);
  }

  submitUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const raw = this.userForm.getRawValue();
    const payload: UserPayload = {
      name: raw.name,
      email: raw.email,
      password: raw.password,
      phone: raw.phone || null,
      role: raw.role,
    };

    this.userSubmitting.set(true);
    this.userFormError.set(null);

    this.userService.create(payload).subscribe({
      next: () => {
        this.userSubmitting.set(false);
        this.userModalOpen.set(false);
        this.fetchUsers();
      },
      error: (err) => {
        this.userSubmitting.set(false);
        this.userFormError.set(err?.error?.message ?? "La création de l'utilisateur a échoué.");
      },
    });
  }
  
  // --- Règlements : CRUD ---

  fetchRules(): void {
    this.rulesLoading.set(true);
    this.ruleService.list().subscribe({
      next: (list) => {
        this.rules.set(list);
        this.rulesLoading.set(false);
      },
      error: () => {
        this.rulesError.set('Impossible de charger les règlements.');
        this.rulesLoading.set(false);
      },
    });
  }

  openCreateRule(): void {
    this.editingRule.set(null);
    this.ruleFormError.set(null);
    this.ruleForm.reset({ title: '', content: '' });
    this.ruleModalOpen.set(true);
  }

  openEditRule(rule: Rule): void {
    this.editingRule.set(rule);
    this.ruleFormError.set(null);
    this.ruleForm.reset({ title: rule.title, content: rule.content });
    this.ruleModalOpen.set(true);
  }

  closeRuleModal(): void {
    this.ruleModalOpen.set(false);
  }

  submitRule(): void {
    if (this.ruleForm.invalid) {
      this.ruleForm.markAllAsTouched();
      return;
    }

    const raw = this.ruleForm.getRawValue();
    const payload: RulePayload = { title: raw.title, content: raw.content };

    this.ruleSubmitting.set(true);
    this.ruleFormError.set(null);

    const editing = this.editingRule();
    const request = editing
      ? this.ruleService.update(editing.id, payload)
      : this.ruleService.create(payload);

    request.subscribe({
      next: () => {
        this.ruleSubmitting.set(false);
        this.ruleModalOpen.set(false);
        this.fetchRules();
      },
      error: (err) => {
        this.ruleSubmitting.set(false);
        this.ruleFormError.set(err?.error?.message ?? "L'enregistrement du règlement a échoué.");
      },
    });
  }

  deleteRule(rule: Rule): void {
    if (!confirm(`Supprimer le règlement "${rule.title}" ?`)) return;

    this.deletingRuleId.set(rule.id);
    this.ruleService.delete(rule.id).subscribe({
      next: () => {
        this.deletingRuleId.set(null);
        this.fetchRules();
      },
      error: () => {
        this.deletingRuleId.set(null);
        this.rulesError.set('Impossible de supprimer ce règlement.');
      },
    });
  }

  moveRule(rule: Rule, direction: 'up' | 'down'): void {
    const list = [...this.rules()].sort((a, b) => a.position - b.position);
    const index = list.findIndex((r) => r.id === rule.id);
    const swapWith = direction === 'up' ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= list.length) return;

    [list[index], list[swapWith]] = [list[swapWith], list[index]];
    const ids = list.map((r) => r.id);

    this.reorderingRules.set(true);
    this.ruleService.reorder(ids).subscribe({
      next: (updated) => {
        this.rules.set(updated);
        this.reorderingRules.set(false);
      },
      error: () => {
        this.reorderingRules.set(false);
        this.rulesError.set("Impossible de réordonner les règlements.");
      },
    });
  }

  toggleRole(user: User): void {
    const newRole = user.role === 'admin' ? 'client' : 'admin';
    if (!confirm(`Passer ${user.name} en "${newRole}" ?`)) return;

    this.updatingUserId.set(user.id);
    this.userService.update(user.id, { role: newRole }).subscribe({
      next: (updated) => {
        this.updatingUserId.set(null);
        this.users.update((list) => list.map((u) => (u.id === updated.id ? updated : u)));
      },
      error: (err) => {
        this.updatingUserId.set(null);
        this.usersError.set(err?.error?.message ?? 'Impossible de changer le rôle.');
      },
    });
  }

  deleteUser(user: User): void {
    if (!confirm(`Supprimer le compte de "${user.name}" ?`)) return;

    this.deletingUserId.set(user.id);
    this.userService.delete(user.id).subscribe({
      next: () => {
        this.deletingUserId.set(null);
        this.fetchUsers();
      },
      error: (err) => {
        this.deletingUserId.set(null);
        this.usersError.set(err?.error?.message ?? 'Impossible de supprimer cet utilisateur.');
      },
    });
  }
    // --- Utilisateurs ---
  readonly users = signal<User[]>([]);
  readonly usersLoading = signal(true);
  readonly usersError = signal<string | null>(null);
  readonly updatingUserId = signal<number | null>(null);
  readonly deletingUserId = signal<number | null>(null);

  readonly userModalOpen = signal(false);
  readonly userSubmitting = signal(false);
  readonly userFormError = signal<string | null>(null);

  readonly userForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    phone: [''],
    role: ['client' as 'admin' | 'client', Validators.required],
  });

    // --- Règlements ---
  readonly rules = signal<Rule[]>([]);
  readonly rulesLoading = signal(true);
  readonly rulesError = signal<string | null>(null);
  readonly deletingRuleId = signal<number | null>(null);
  readonly reorderingRules = signal(false);

  readonly ruleModalOpen = signal(false);
  readonly editingRule = signal<Rule | null>(null);
  readonly ruleSubmitting = signal(false);
  readonly ruleFormError = signal<string | null>(null);

  readonly ruleForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    content: ['', Validators.required],
  });


  // --- Chambres : CRUD ---

  fetchRooms(): void {
    this.roomsLoading.set(true);
    this.roomService.list().subscribe({
      next: (rooms) => {
        this.rooms.set(rooms);
        this.roomsLoading.set(false);
      },
      error: () => {
        this.roomsError.set('Impossible de charger les chambres.');
        this.roomsLoading.set(false);
      },
    });
  }

  openCreateRoom(): void {
    this.editingRoom.set(null);
    this.roomFormError.set(null);
    this.selectedPhoto.set(null);
    this.photoPreview.set(null);
    this.removeExistingPhoto.set(false);
    this.roomForm.reset({
      room_type: '',
      price: 0,
      description: '',
      is_available: true,
    });
    this.roomModalOpen.set(true);
  }

  openEditRoom(room: Room): void {
    this.editingRoom.set(room);
    this.roomFormError.set(null);
    this.selectedPhoto.set(null);
    this.photoPreview.set(room.photo);
    this.removeExistingPhoto.set(false);
    this.roomForm.reset({
      room_type: room.room_type,
      price: Number(room.price),
      description: room.description ?? '',
      is_available: room.is_available,
    });
    this.roomModalOpen.set(true);
  }

  closeRoomModal(): void {
    this.roomModalOpen.set(false);
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.roomFormError.set('Le fichier sélectionné doit être une image.');
      return;
    }

    this.roomFormError.set(null);
    this.removeExistingPhoto.set(false);
    this.selectedPhoto.set(file);

    const reader = new FileReader();
    reader.onload = () => this.photoPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  clearPhoto(): void {
    this.selectedPhoto.set(null);
    this.photoPreview.set(null);
    this.removeExistingPhoto.set(!!this.editingRoom()?.photo);
  }

  submitRoom(): void {
    if (this.roomForm.invalid) {
      this.roomForm.markAllAsTouched();
      return;
    }

    const raw = this.roomForm.getRawValue();
    const payload: RoomPayload = {
      room_type: raw.room_type,
      price: raw.price,
      description: raw.description || null,
      is_available: raw.is_available,
      photo: this.selectedPhoto(),
      remove_photo: this.removeExistingPhoto(),
    };

    this.roomSubmitting.set(true);
    this.roomFormError.set(null);

    const editing = this.editingRoom();
    const request = editing
      ? this.roomService.update(editing.id, payload)
      : this.roomService.create(payload);

    request.subscribe({
      next: () => {
        this.roomSubmitting.set(false);
        this.roomModalOpen.set(false);
        this.fetchRooms();
      },
      error: (err) => {
        this.roomSubmitting.set(false);
        this.roomFormError.set(
          err?.error?.message ?? "L'enregistrement de la chambre a échoué."
        );
      },
    });
  }

  deleteRoom(room: Room): void {
    if (!confirm(`Supprimer la chambre "${room.room_type}" ?`)) return;

    this.deletingRoomId.set(room.id);
    this.roomService.delete(room.id).subscribe({
      next: () => {
        this.deletingRoomId.set(null);
        this.fetchRooms();
      },
      error: () => {
        this.deletingRoomId.set(null);
        this.roomsError.set('Impossible de supprimer cette chambre.');
      },
    });
  }

  // --- Galerie : CRUD ---

  fetchGallery(): void {
    this.galleryLoading.set(true);
    this.galleryService.listAll().subscribe({
      next: (items) => {
        this.galleryItems.set(items);
        this.galleryLoading.set(false);
      },
      error: () => {
        this.galleryError.set('Impossible de charger la galerie.');
        this.galleryLoading.set(false);
      },
    });
  }

  openCreateGalleryItem(): void {
    this.editingGalleryItem.set(null);
    this.galleryFormError.set(null);
    this.selectedImage.set(null);
    this.imagePreview.set(null);
    this.galleryForm.reset({
      title: '',
      category: '',
      description: '',
      is_published: false,
    });
    this.galleryModalOpen.set(true);
  }

  openEditGalleryItem(item: Gallery): void {
    this.editingGalleryItem.set(item);
    this.galleryFormError.set(null);
    this.selectedImage.set(null);
    this.imagePreview.set(item.image);
    this.galleryForm.reset({
      title: item.title,
      category: item.category,
      description: item.description ?? '',
      is_published: item.is_published,
    });
    this.galleryModalOpen.set(true);
  }

  closeGalleryModal(): void {
    this.galleryModalOpen.set(false);
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.galleryFormError.set('Le fichier sélectionné doit être une image.');
      return;
    }

    this.galleryFormError.set(null);
    this.selectedImage.set(file);

    const reader = new FileReader();
    reader.onload = () => this.imagePreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  submitGalleryItem(): void {
    if (this.galleryForm.invalid) {
      this.galleryForm.markAllAsTouched();
      return;
    }

    const editing = this.editingGalleryItem();

    if (!editing && !this.selectedImage()) {
      this.galleryFormError.set('Une image est requise.');
      return;
    }

    const raw = this.galleryForm.getRawValue();
    const payload: GalleryPayload = {
      title: raw.title,
      category: raw.category,
      description: raw.description || null,
      is_published: raw.is_published,
      image: this.selectedImage(),
    };

    this.gallerySubmitting.set(true);
    this.galleryFormError.set(null);

    const request = editing
      ? this.galleryService.update(editing.id, payload)
      : this.galleryService.create(payload);
      

    request.subscribe({
      next: () => {
        this.gallerySubmitting.set(false);
        this.galleryModalOpen.set(false);
        this.fetchGallery();
      },
      error: (err) => {
        this.gallerySubmitting.set(false);
        this.galleryFormError.set(
          err?.error?.message ?? "L'enregistrement de l'image a échoué."
        );
      },
    });
  }

  togglePublish(item: Gallery): void {
    this.galleryService.update(item.id, { is_published: !item.is_published }).subscribe({
      next: (updated) => {
        this.galleryItems.update((list) =>
          list.map((g) => (g.id === updated.id ? updated : g))
        );
      },
      error: () => {
        this.galleryError.set('Impossible de changer la publication.');
      },
    });
  }

  deleteGalleryItem(item: Gallery): void {
    if (!confirm(`Supprimer l'image "${item.title}" ?`)) return;

    this.deletingGalleryId.set(item.id);
    this.galleryService.delete(item.id).subscribe({
      next: () => {
        this.deletingGalleryId.set(null);
        this.fetchGallery();
      },
      error: () => {
        this.deletingGalleryId.set(null);
        this.galleryError.set('Impossible de supprimer cette image.');
      },
    });
  }

  // --- Réservations : gestion ---

  fetchReservations(): void {
    this.reservationsLoading.set(true);
    this.reservationService.list().subscribe({
      next: (list) => {
        this.reservations.set(list);
        this.reservationsLoading.set(false);
      },
      error: () => {
        this.reservationsError.set('Impossible de charger les réservations.');
        this.reservationsLoading.set(false);
      },
    });
  }

  changeStatus(reservation: Reservation, status: string): void {
    const newStatus = status as ReservationStatus;
    if (newStatus === reservation.status) return;

    this.updatingStatusId.set(reservation.id);
    this.reservationService.updateStatus(reservation.id, newStatus).subscribe({
      next: (updated) => {
        this.updatingStatusId.set(null);
        this.reservations.update((list) =>
          list.map((r) => (r.id === updated.id ? { ...r, status: updated.status } : r))
        );
      },
      error: () => {
        this.updatingStatusId.set(null);
        this.reservationsError.set('Impossible de mettre à jour le statut.');
      },
    });
  }
} 