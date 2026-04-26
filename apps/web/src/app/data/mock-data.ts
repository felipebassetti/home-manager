import type {
  ActiveProfile,
  AddMemberInput,
  Application,
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
  UpsertPaymentInput
} from '../models/domain.models';

const deepClone = <T>(value: T): T => structuredClone(value);
const nowIso = () => new Date().toISOString();

const profiles: Profile[] = [
  { id: 'user-admin-1', name: 'Ana Paula Souza', email: 'ana@republichouse.app' },
  { id: 'user-member-1', name: 'Bruno Lima', email: 'bruno@republichouse.app' },
  { id: 'user-member-2', name: 'Carla Nunes', email: 'carla@republichouse.app' },
  { id: 'user-visitor-1', name: 'Diego Martins', email: 'diego@republichouse.app' }
];

export const mockProfiles: ActiveProfile[] = [
  { ...profiles[0], accountType: 'admin' },
  { ...profiles[1], accountType: 'member' },
  { ...profiles[3], accountType: 'visitor' }
];

const houses: House[] = [
  {
    id: 'house-bh-centro',
    ownerId: 'user-admin-1',
    title: 'Republic House Savassi',
    description: 'Casa compartilhada com operacao enxuta, ambiente organizado e vagas para estudantes e profissionais em mobilidade.',
    city: 'Belo Horizonte',
    neighborhood: 'Savassi',
    address: 'Rua Pernambuco, 850',
    imageUrl: 'assets/images/house-savassi.png',
    amenities: ['wifi 500mb', 'limpeza semanal', 'cozinha equipada', 'lavanderia'],
    createdAt: '2026-04-18T12:00:00.000Z'
  },
  {
    id: 'house-sp-pinheiros',
    ownerId: 'user-admin-1',
    title: 'Vila Pinheiros House',
    description: 'Sobrado perto do metro, com quartos individuais e regras claras para rotina compartilhada.',
    city: 'Sao Paulo',
    neighborhood: 'Pinheiros',
    address: 'Rua dos Pinheiros, 1210',
    imageUrl: 'assets/images/house-pinheiros.png',
    amenities: ['coworking', 'armario individual', 'bicicletario', 'pet friendly'],
    createdAt: '2026-04-16T08:30:00.000Z'
  },
  {
    id: 'house-curitiba-centro',
    ownerId: 'user-admin-1',
    title: 'Rep Centro Curitiba',
    description: 'Opcao economica com contas rateadas e perfil mais academico para estudantes de graduacao e pos.',
    city: 'Curitiba',
    neighborhood: 'Centro',
    address: 'Rua Emiliano Perneta, 210',
    imageUrl: 'assets/images/house-curitiba.png',
    amenities: ['contas inclusas', 'espaco de estudo', 'mercado perto'],
    createdAt: '2026-04-12T15:00:00.000Z'
  }
];

const rooms: Room[] = [
  { id: 'room-savassi-1', houseId: 'house-bh-centro', title: 'Suite 01', price: 950, available: false },
  { id: 'room-savassi-2', houseId: 'house-bh-centro', title: 'Quarto Individual 02', price: 820, available: true },
  { id: 'room-savassi-3', houseId: 'house-bh-centro', title: 'Vaga Compartilhada 03', price: 650, available: true },
  { id: 'room-pinheiros-1', houseId: 'house-sp-pinheiros', title: 'Quarto Premium', price: 1450, available: true },
  { id: 'room-pinheiros-2', houseId: 'house-sp-pinheiros', title: 'Quarto Standard', price: 1180, available: false },
  { id: 'room-curitiba-1', houseId: 'house-curitiba-centro', title: 'Quarto Frente', price: 780, available: true },
  { id: 'room-curitiba-2', houseId: 'house-curitiba-centro', title: 'Quarto Fundos', price: 720, available: true }
];

const members: HouseMember[] = [
  {
    id: 'member-1',
    houseId: 'house-bh-centro',
    userId: 'user-admin-1',
    role: 'admin',
    status: 'active',
    createdAt: '2026-04-18T12:10:00.000Z'
  },
  {
    id: 'member-2',
    houseId: 'house-bh-centro',
    userId: 'user-member-1',
    role: 'member',
    status: 'active',
    createdAt: '2026-04-18T12:20:00.000Z'
  },
  {
    id: 'member-3',
    houseId: 'house-bh-centro',
    userId: 'user-member-2',
    role: 'member',
    status: 'active',
    createdAt: '2026-04-18T12:25:00.000Z'
  }
];

const applications: Application[] = [
  {
    id: 'application-1',
    houseId: 'house-bh-centro',
    roomId: 'room-savassi-2',
    userId: 'user-visitor-1',
    status: 'pending',
    message: 'Procuro vaga para entrar em maio e trabalhar remoto.',
    createdAt: '2026-04-24T09:00:00.000Z'
  }
];

const charges: MonthlyCharge[] = [
  {
    id: 'charge-1',
    houseId: 'house-bh-centro',
    title: 'Mensalidade Abril',
    amount: 820,
    dueDate: '2026-04-10',
    createdAt: '2026-04-01T08:00:00.000Z'
  },
  {
    id: 'charge-2',
    houseId: 'house-bh-centro',
    title: 'Mensalidade Abril',
    amount: 650,
    dueDate: '2026-04-10',
    createdAt: '2026-04-01T08:00:00.000Z'
  },
  {
    id: 'charge-3',
    houseId: 'house-bh-centro',
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
    amount: 820,
    status: 'paid',
    paidAt: '2026-04-09T14:22:00.000Z',
    createdAt: '2026-04-01T08:00:00.000Z'
  },
  {
    id: 'payment-2',
    chargeId: 'charge-2',
    userId: 'user-member-2',
    amount: 650,
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

export const listMockHouses = (filters: HouseFilters = {}): HouseSummary[] => {
  return houses
    .map(summarizeHouse)
    .filter((house) => (filters.city ? house.city.toLowerCase().includes(filters.city.toLowerCase()) : true))
    .filter((house) =>
      filters.neighborhood ? house.neighborhood.toLowerCase().includes(filters.neighborhood.toLowerCase()) : true
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
    applications: applications.filter((application) => application.houseId === houseId),
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
  const application: Application = {
    id: crypto.randomUUID(),
    houseId: input.houseId,
    roomId: input.roomId,
    userId: input.userId,
    message: input.message,
    status: 'pending',
    createdAt: nowIso()
  };

  applications.unshift(application);
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
