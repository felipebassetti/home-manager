import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { HouseDetail } from '../../models/domain.models';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-house-manage-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './house-manage.page.html',
  styleUrl: './house-manage.page.css'
})
export class HouseManagePageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  readonly createdHouse = signal<HouseDetail | null>(null);
  readonly feedback = signal('');
  readonly error = signal('');

  readonly form = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    city: ['', Validators.required],
    neighborhood: ['', Validators.required],
    address: ['', Validators.required],
    imageUrl: ['assets/images/house-savassi.png', Validators.required],
    amenities: ['wifi 500mb, lavanderia, cozinha equipada', Validators.required],
    rooms: this.fb.array([
      this.createRoomGroup('Quarto Individual', 900),
      this.createRoomGroup('Vaga Compartilhada', 650)
    ])
  });

  get rooms() {
    return this.form.controls.rooms;
  }

  addRoom() {
    this.rooms.push(this.createRoomGroup('Nova vaga', 700));
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.feedback.set('');
    this.error.set('');
    const value = this.form.getRawValue();
    this.api
      .createHouse({
        ownerId: this.auth.activeProfile().id,
        title: value.title ?? '',
        description: value.description ?? '',
        city: value.city ?? '',
        neighborhood: value.neighborhood ?? '',
        address: value.address ?? '',
        imageUrl: value.imageUrl ?? '',
        amenities: (value.amenities ?? '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        rooms:
          value.rooms?.map((room) => ({
            title: room.title ?? '',
            price: Number(room.price ?? 0),
            available: room.available ?? true
          })) ?? []
      })
      .subscribe({
        next: (house) => {
          this.createdHouse.set(house);
          this.feedback.set('Casa criada e publicada no marketplace.');
        },
        error: () => {
          this.error.set('Nao foi possivel criar a casa agora.');
        }
      });
  }

  private createRoomGroup(title: string, price: number) {
    return this.fb.group({
      title: [title, Validators.required],
      price: [price, [Validators.required, Validators.min(1)]],
      available: [true]
    });
  }
}
