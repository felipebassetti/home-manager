import type {
  ActiveProfile,
  AddMemberInput,
  Application,
  ApplicationListItem,
  AccountType,
  CreateApplicationInput,
  CreateChargeInput,
  CreateHouseInput,
  House,
  HouseDetail,
  HouseFilters,
  HouseMember,
  HouseSummary,
  MonthlyCharge,
  Payment,
  Profile,
  Room,
  UpdateApplicationStatusInput,
  UpsertPaymentInput
} from '../models/domain.models';

const deepClone = <T>(value: T): T => structuredClone(value);
const nowIso = () => new Date().toISOString();

const profiles: Profile[] = [
  { id: 'user-admin-1', name: 'Ana Paula Souza', email: 'ana@republichouse.app' },
  { id: 'user-superadmin-1', name: 'Marcos Lima', email: 'marcos@republichouse.app' },
  { id: 'user-member-1', name: 'Bruno Lima', email: 'bruno@republichouse.app' },
  { id: 'user-member-2', name: 'Carla Nunes', email: 'carla@republichouse.app' },
  { id: 'user-visitor-1', name: 'Diego Martins', email: 'diego@republichouse.app' }
];

const activeProfile = (profileIndex: number, accountType: AccountType): ActiveProfile => ({
  ...profiles[profileIndex],
  accountType
});

export const mockProfiles: ActiveProfile[] = [
  activeProfile(0, 'house-admin'),
  activeProfile(1, 'super-admin'),
  activeProfile(2, 'member'),
  activeProfile(4, 'visitor')
];

const houses: House[] = [
  {
    id: 'house-curitiba-centro',
    ownerId: 'user-admin-1',
    title: 'Republic House Centro',
    description: 'Casa compartilhada com operacao enxuta, perto de linhas expressas e com rotina pensada para estudantes e jovens profissionais.',
    city: 'Curitiba',
    neighborhood: 'Centro',
    address: 'Rua Emiliano Perneta, 210',
    imageUrl: 'assets/images/house-curitiba.png',
    galleryImages: [
      'assets/images/house-curitiba.png',
      'assets/images/house-pinheiros.png',
      'assets/images/house-savassi.png'
    ],
    amenities: ['wifi 500mb', 'limpeza semanal', 'cozinha equipada', 'lavanderia'],
    createdAt: '2026-04-18T12:00:00.000Z'
  },
  {
    id: 'house-curitiba-batel',
    ownerId: 'user-admin-1',
    title: 'Casa Batel Compartilhada',
    description: 'Operacao mais compacta em uma regiao bem conectada, com quartos individuais e ambiente silencioso para estudo e trabalho.',
    city: 'Curitiba',
    neighborhood: 'Batel',
    address: 'Avenida Silva Jardim, 3021',
    imageUrl: 'assets/images/house-pinheiros.png',
    galleryImages: [
      'assets/images/house-pinheiros.png',
      'assets/images/house-curitiba.png',
      'assets/images/house-savassi.png'
    ],
    amenities: ['coworking', 'armario individual', 'bicicletario', 'limpeza semanal'],
    createdAt: '2026-04-16T08:30:00.000Z'
  },
  {
    id: 'house-curitiba-reboucas',
    ownerId: 'user-admin-1',
    title: 'Rep Rebouças',
    description: 'Opção econômica para quem precisa de acesso rápido a campus, terminal e rotina compartilhada com custos previsíveis.',
    city: 'Curitiba',
    neighborhood: 'Rebouças',
    address: 'Rua Chile, 1490',
    imageUrl: 'assets/images/house-savassi.png',
    galleryImages: [
      'assets/images/house-savassi.png',
      'assets/images/house-curitiba.png',
      'assets/images/house-pinheiros.png'
    ],
    amenities: ['contas inclusas', 'espaço de estudo', 'mercado perto'],
    createdAt: '2026-04-12T15:00:00.000Z'
  }
];

const rooms: Room[] = [
  { id: 'room-centro-1', houseId: 'house-curitiba-centro', title: 'Suite 01', price: 980, available: false },
  { id: 'room-centro-2', houseId: 'house-curitiba-centro', title: 'Quarto Individual 02', price: 860, available: true },
  { id: 'room-centro-3', houseId: 'house-curitiba-centro', title: 'Vaga Compartilhada 03', price: 690, available: true },
  { id: 'room-batel-1', houseId: 'house-curitiba-batel', title: 'Quarto Premium', price: 1320, available: true },
  { id: 'room-batel-2', houseId: 'house-curitiba-batel', title: 'Quarto Standard', price: 1160, available: false },
  { id: 'room-reboucas-1', houseId: 'house-curitiba-reboucas', title: 'Quarto Frente', price: 790, available: true },
  { id: 'room-reboucas-2', houseId: 'house-curitiba-reboucas', title: 'Quarto Fundos', price: 740, available: true }
];

const members: HouseMember[] = [
  {
    id: 'member-1',
    houseId: 'house-curitiba-centro',
    userId: 'user-admin-1',
    role: 'admin',
    status: 'active',
    createdAt: '2026-04-18T12:10:00.000Z'
  },
  {
    id: 'member-2',
    houseId: 'house-curitiba-centro',
    userId: 'user-member-1',
    role: 'member',
    status: 'active',
    createdAt: '2026-04-18T12:20:00.000Z'
  },
  {
    id: 'member-3',
    houseId: 'house-curitiba-centro',
    userId: 'user-member-2',
    role: 'member',
    status: 'active',
    createdAt: '2026-04-18T12:25:00.000Z'
  }
];

const applications: Application[] = [
  {
    id: 'application-1',
    houseId: 'house-curitiba-centro',
    roomId: 'room-centro-2',
    userId: 'user-visitor-1',
    status: 'in_review',
    message: 'Procuro vaga para entrar em maio e trabalhar remoto.',
    contactPhone: '+55 41 99999-1200',
    contactInstagram: '@diegomartins',
    createdAt: '2026-04-24T09:00:00.000Z',
    statusUpdatedAt: '2026-04-24T16:00:00.000Z'
  }
];

const charges: MonthlyCharge[] = [
  {
    id: 'charge-1',
    houseId: 'house-curitiba-centro',
    title: 'Mensalidade Abril',
    amount: 860,
    dueDate: '2026-04-10',
    createdAt: '2026-04-01T08:00:00.000Z'
  },
  {
    id: 'charge-2',
    houseId: 'house-curitiba-centro',
    title: 'Mensalidade Abril',
    amount: 690,
    dueDate: '2026-04-10',
    createdAt: '2026-04-01T08:00:00.000Z'
  },
  {
    id: 'charge-3',
    houseId: 'house-curitiba-centro',
    title: 'Internet e limpeza',
    amount: 120,
    dueDate: '2026-04-15',
    createdAt: '2026-04-05T08:00:00.000Z'
  }
];

const payments: Payment[] = [
  {
    id: 'payment-1',
    chargeId: 'charge-1',
    userId: 'user-member-1',
    amount: 860,
    status: 'paid',
    paidAt: '2026-04-09T14:22:00.000Z',
    createdAt: '2026-04-01T08:00:00.000Z'
  },
  {
    id: 'payment-2',
    chargeId: 'charge-2',
    userId: 'user-member-2',
    amount: 690,
    status: 'pending',
    paidAt: null,
    createdAt: '2026-04-01T08:00:00.000Z'
  },
  {
    id: 'payment-3',
    chargeId: 'charge-3',
    userId: 'user-member-2',
    amount: 120,
    status: 'overdue',
    paidAt: null,
    createdAt: '2026-04-05T08:00:00.000Z'
  }
];

const summarizeHouse = (house: House): HouseSummary => {
  const houseRooms = rooms.filter((room) => room.houseId === house.id);
  return {
    ...house,
    rooms: deepClone(houseRooms),
    availableRooms: houseRooms.filter((room) => room.available).length,
    lowestPrice: houseRooms.reduce((lowest, room) => Math.min(lowest, room.price), Number.POSITIVE_INFINITY)
  };
};

const attachProfile = (userId: string) => profiles.find((profile) => profile.id === userId);
const attachRoom = (roomId: string | null) => (roomId ? rooms.find((room) => room.id === roomId) : undefined);
const toApplicationListItem = (application: Application): ApplicationListItem => {
  const house = houses.find((item) => item.id === application.houseId);
  const room = attachRoom(application.roomId);

  return {
    ...application,
    houseTitle: house?.title ?? 'Casa',
    houseNeighborhood: house?.neighborhood ?? '-',
    houseCity: house?.city ?? '-',
    roomTitle: room?.title ?? null
  };
};

export const findMockProfileByEmail = (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  return mockProfiles.find((profile) => profile.email.toLowerCase() === normalizedEmail);
};

export const registerMockProfile = (
  email: string,
  name?: string,
  accountType: AccountType = 'visitor'
): ActiveProfile => {
  const normalizedEmail = email.trim().toLowerCase();
  const profileName =
    name?.trim() ||
    normalizedEmail
      .split('@')[0]
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() + part.slice(1))
      .join(' ') ||
    'Visitante';

  const baseProfile: Profile = {
    id: crypto.randomUUID(),
    name: profileName,
    email: normalizedEmail
  };

  profiles.push(baseProfile);

  const activeVisitor = {
    ...baseProfile,
    accountType
  };

  mockProfiles.push(activeVisitor);
  return deepClone(activeVisitor);
};

export const registerMockVisitorProfile = (email: string, name?: string): ActiveProfile => {
  return registerMockProfile(email, name, 'visitor');
};

export const listMockHouses = (filters: HouseFilters = {}): HouseSummary[] => {
  const selectedNeighborhoods = filters.neighborhood?.map((item) => item.toLowerCase()) ?? [];

  return houses
    .map(summarizeHouse)
    .filter((house) => (filters.city ? house.city.toLowerCase().includes(filters.city.toLowerCase()) : true))
    .filter((house) =>
      selectedNeighborhoods.length ? selectedNeighborhoods.some((item) => house.neighborhood.toLowerCase() === item) : true
    )
    .filter((house) => (filters.maxPrice ? house.lowestPrice <= filters.maxPrice : true))
    .map((house) => deepClone(house));
};

export const getMockHouseById = (houseId: string): HouseDetail | null => {
  const house = houses.find((item) => item.id === houseId);
  if (!house) {
    return null;
  }

  const summary = summarizeHouse(house);
  const houseCharges = charges.filter((charge) => charge.houseId === houseId);

  return deepClone({
    ...summary,
    members: members
      .filter((member) => member.houseId === houseId)
      .map((member) => ({ ...member, profile: attachProfile(member.userId) })),
    applications: applications
      .filter((application) => application.houseId === houseId)
      .map((application) => ({ ...application, profile: attachProfile(application.userId) })),
    charges: houseCharges,
    payments: payments
      .filter((payment) => houseCharges.some((charge) => charge.id === payment.chargeId))
      .map((payment) => ({
        ...payment,
        profile: attachProfile(payment.userId),
        charge: houseCharges.find((charge) => charge.id === payment.chargeId)
      }))
  });
};

export const createMockHouse = (input: CreateHouseInput): HouseDetail => {
  const house: House = {
    id: crypto.randomUUID(),
    ownerId: input.ownerId,
    title: input.title,
    description: input.description,
    city: input.city,
    neighborhood: input.neighborhood,
    address: input.address,
    imageUrl: input.imageUrl,
    amenities: input.amenities,
    createdAt: nowIso()
  };

  houses.unshift(house);
  members.unshift({
    id: crypto.randomUUID(),
    houseId: house.id,
    userId: input.ownerId,
    role: 'admin',
    status: 'active',
    createdAt: nowIso(),
    profile: attachProfile(input.ownerId)
  });

  input.rooms.forEach((room) => {
    rooms.unshift({
      id: crypto.randomUUID(),
      houseId: house.id,
      title: room.title,
      price: room.price,
      available: room.available
    });
  });

  return getMockHouseById(house.id)!;
};

export const createMockApplication = (input: CreateApplicationInput): Application => {
  const createdAt = nowIso();
  const application: Application = {
    id: crypto.randomUUID(),
    houseId: input.houseId,
    roomId: input.roomId,
    userId: input.userId,
    message: input.message,
    contactPhone: input.contactPhone,
    contactInstagram: input.contactInstagram?.trim() || null,
    status: 'submitted',
    createdAt,
    statusUpdatedAt: createdAt,
    profile: attachProfile(input.userId)
  };

  applications.unshift(application);
  return deepClone(application);
};

export const listMockApplicationsByUser = (userId: string): ApplicationListItem[] => {
  return deepClone(
    applications
      .filter((application) => application.userId === userId)
      .map(toApplicationListItem)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
  );
};

export const updateMockApplicationStatus = (input: UpdateApplicationStatusInput): Application | null => {
  const application = applications.find((item) => item.id === input.applicationId);
  if (!application) {
    return null;
  }

  application.status = input.status;
  application.statusUpdatedAt = nowIso();
  return deepClone(application);
};

export const addMockMember = (houseId: string, input: AddMemberInput): HouseMember => {
  const member: HouseMember = {
    id: crypto.randomUUID(),
    houseId,
    userId: input.userId,
    role: input.role,
    status: 'active',
    createdAt: nowIso(),
    profile: attachProfile(input.userId)
  };

  members.unshift(member);
  return deepClone(member);
};

export const createMockCharge = (input: CreateChargeInput): MonthlyCharge => {
  const charge: MonthlyCharge = {
    id: crypto.randomUUID(),
    houseId: input.houseId,
    title: input.title,
    amount: input.amount,
    dueDate: input.dueDate,
    createdAt: nowIso()
  };

  charges.unshift(charge);
  return deepClone(charge);
};

export const listMockPayments = (houseId?: string): Payment[] => {
  const houseCharges = houseId ? charges.filter((charge) => charge.houseId === houseId) : charges;
  return deepClone(
    payments
      .filter((payment) => houseCharges.some((charge) => charge.id === payment.chargeId))
      .map((payment) => ({
        ...payment,
        profile: attachProfile(payment.userId),
        charge: houseCharges.find((charge) => charge.id === payment.chargeId)
      }))
  );
};

export const upsertMockPayment = (input: UpsertPaymentInput): Payment => {
  const existing = input.paymentId ? payments.find((payment) => payment.id === input.paymentId) : undefined;

  if (existing) {
    existing.status = input.status;
    existing.amount = input.amount;
    existing.paidAt = input.paidAt ?? existing.paidAt;
    existing.charge = charges.find((charge) => charge.id === existing.chargeId);
    existing.profile = attachProfile(existing.userId);
    return deepClone(existing);
  }

  const payment: Payment = {
    id: crypto.randomUUID(),
    chargeId: input.chargeId,
    userId: input.userId,
    amount: input.amount,
    status: input.status,
    paidAt: input.paidAt ?? null,
    createdAt: nowIso(),
    charge: charges.find((charge) => charge.id === input.chargeId),
    profile: attachProfile(input.userId)
  };

  payments.unshift(payment);
  return deepClone(payment);
};
