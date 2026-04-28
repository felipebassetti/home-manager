import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import type { AddMemberInput, CreateChargeInput, HouseDetail } from '../../models/domain.models';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { HouseDetailPageComponent } from './house-detail.page';

class ApiServiceStub {
  readonly createChargeCalls: CreateChargeInput[] = [];
  readonly addMemberCalls: AddMemberInput[] = [];
  private readonly house: HouseDetail = {
    id: 'house-curitiba-centro',
    ownerId: 'user-admin-1',
    title: 'flatsharing Centro',
    description: 'Casa teste',
    city: 'Curitiba',
    neighborhood: 'Centro',
    address: 'Rua Teste, 123',
    imageUrl: 'assets/images/house-curitiba.png',
    amenities: ['wifi'],
    createdAt: '2026-04-20T10:00:00.000Z',
    rooms: [
      {
        id: 'room-1',
        houseId: 'house-curitiba-centro',
        title: 'Suite 01',
        price: 980,
        available: true
      }
    ],
    availableRooms: 1,
    lowestPrice: 980,
    members: [
      {
        id: 'member-1',
        houseId: 'house-curitiba-centro',
        userId: 'user-admin-1',
        role: 'admin',
        status: 'active',
        createdAt: '2026-04-20T10:10:00.000Z',
        profile: {
          id: 'user-admin-1',
          name: 'Ana Paula Souza',
          email: 'ana@flatsharing.app'
        }
      }
    ],
    applications: [],
    charges: [
      {
        id: 'charge-1',
        houseId: 'house-curitiba-centro',
        title: 'Mensalidade Abril',
        amount: 860,
        dueDate: '2026-04-10',
        createdAt: '2026-04-01T08:00:00.000Z'
      }
    ],
    payments: []
  };

  getHouseById() {
    return of(structuredClone(this.house));
  }

  createCharge(input: CreateChargeInput) {
    this.createChargeCalls.push(input);

    return of({
      id: 'charge-new',
      houseId: input.houseId,
      title: input.title,
      amount: input.amount,
      dueDate: input.dueDate,
      createdAt: '2026-04-27T10:00:00.000Z'
    });
  }

  createApplication() {
    return of(null);
  }

  addMember(_houseId: string, input: AddMemberInput) {
    this.addMemberCalls.push(input);

    return of({
      id: 'member-new',
      houseId: 'house-curitiba-centro',
      userId: 'user-member-2',
      role: input.role,
      status: 'active' as const,
      createdAt: '2026-04-27T10:00:00.000Z',
      profile: {
        id: 'user-member-2',
        name: 'Carla Nunes',
        email: input.email
      }
    });
  }

  updateApplicationStatus() {
    return of(null);
  }
}

class AuthServiceStub {
  private readonly profile = signal({
    id: 'user-admin-1',
    name: 'Ana Paula Souza',
    email: 'ana@flatsharing.app',
    accountType: 'house-admin' as const
  });

  readonly activeProfile = computed(() => this.profile());
  readonly isAuthenticated = computed(() => true);
  readonly isSupabaseConfigured = false;
  readonly profiles = [
    this.profile(),
    {
      id: 'user-member-2',
      name: 'Carla Nunes',
      email: 'carla@flatsharing.app',
      accountType: 'member' as const
    }
  ];

  profileRoleLabel() {
    return 'Gestor da casa';
  }
}

describe('HouseDetailPageComponent', () => {
  let api: ApiServiceStub;

  beforeEach(async () => {
    api = new ApiServiceStub();

    await TestBed.configureTestingModule({
      imports: [HouseDetailPageComponent],
      providers: [
        { provide: ApiService, useValue: api },
        { provide: AuthService, useClass: AuthServiceStub },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: 'house-curitiba-centro' }))
          }
        },
        {
          provide: Router,
          useValue: {
            url: '/houses/house-curitiba-centro',
            navigate: async () => true
          }
        }
      ]
    }).compileComponents();
  });

  it('bloqueia envio de cobranca com formulario invalido', () => {
    const fixture = TestBed.createComponent(HouseDetailPageComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.submitCharge();

    expect(api.createChargeCalls.length).toBe(0);
    expect(component.chargeForm.controls.title.touched).toBe(true);
    expect(component.chargeForm.controls.amount.touched).toBe(true);
    expect(component.chargeForm.controls.dueDate.touched).toBe(true);
  });

  it('cria cobranca valida e atualiza a lista local da casa', () => {
    const fixture = TestBed.createComponent(HouseDetailPageComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.chargeForm.setValue({
      title: 'Mensalidade Maio',
      amount: 950,
      dueDate: '2026-05-10'
    });

    component.submitCharge();

    expect(api.createChargeCalls).toEqual([
      {
        houseId: 'house-curitiba-centro',
        title: 'Mensalidade Maio',
        amount: 950,
        dueDate: '2026-05-10'
      }
    ]);
    expect(component.house()?.charges[0].title).toBe('Mensalidade Maio');
    expect(component.chargeFeedback()).toContain('Cobranca criada');
    expect(component.chargeForm.getRawValue()).toEqual({
      title: '',
      amount: null,
      dueDate: ''
    });
  });

  it('bloqueia adicao de morador com formulario invalido', () => {
    const fixture = TestBed.createComponent(HouseDetailPageComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.submitMember();

    expect(api.addMemberCalls.length).toBe(0);
    expect(component.memberForm.controls.email.touched).toBe(true);
  });

  it('adiciona morador e atualiza a lista local da casa', () => {
    const fixture = TestBed.createComponent(HouseDetailPageComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.memberForm.setValue({
      email: 'carla@flatsharing.app',
      role: 'member'
    });

    component.submitMember();

    expect(api.addMemberCalls).toEqual([
      {
        email: 'carla@flatsharing.app',
        role: 'member'
      }
    ]);
    expect(component.house()?.members.at(-1)?.profile?.email).toBe('carla@flatsharing.app');
    expect(component.memberFeedback()).toContain('Morador vinculado');
    expect(component.memberForm.getRawValue()).toEqual({
      email: '',
      role: 'member'
    });
  });
});
