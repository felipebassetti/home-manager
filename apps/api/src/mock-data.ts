import type {
  Application,
  House,
  HouseMember,
  MonthlyCharge,
  Payment,
  Profile,
  Room
} from './types';

export const profiles: Profile[] = [
  { id: 'user-admin-1', name: 'Ana Paula Souza', email: 'ana@republichouse.app' },
  { id: 'user-member-1', name: 'Bruno Lima', email: 'bruno@republichouse.app' },
  { id: 'user-member-2', name: 'Carla Nunes', email: 'carla@republichouse.app' },
  { id: 'user-visitor-1', name: 'Diego Martins', email: 'diego@republichouse.app' }
];

export const houses: House[] = [
  {
    id: 'house-bh-centro',
    ownerId: 'user-admin-1',
    title: 'Republic House Savassi',
    description: 'Casa compartilhada com rotina tranquila, internet de alta velocidade e foco em universitarios e profissionais em transicao.',
    city: 'Belo Horizonte',
    neighborhood: 'Savassi',
    address: 'Rua Pernambuco, 850',
    imageUrl: 'assets/images/house-savassi.png',
    amenities: ['wifi 500mb', 'lavanderia', 'cozinha equipada', 'limpeza semanal'],
    createdAt: '2026-04-18T12:00:00.000Z'
  },
  {
    id: 'house-sp-pinheiros',
    ownerId: 'user-admin-1',
    title: 'Vila Pinheiros House',
    description: 'Sobrado com vagas individuais, ambiente organizado e acesso rapido ao metro Fradique Coutinho.',
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
    description: 'Opcao economica para estudantes com contas rateadas e proximidade de linhas expressas.',
    city: 'Curitiba',
    neighborhood: 'Centro',
    address: 'Rua Emiliano Perneta, 210',
    imageUrl: 'assets/images/house-curitiba.png',
    amenities: ['contas inclusas', 'espaco de estudo', 'mercado perto'],
    createdAt: '2026-04-12T15:00:00.000Z'
  }
];

export const rooms: Room[] = [
  { id: 'room-savassi-1', houseId: 'house-bh-centro', title: 'Suite 01', price: 950, available: false },
  { id: 'room-savassi-2', houseId: 'house-bh-centro', title: 'Quarto Individual 02', price: 820, available: true },
  { id: 'room-savassi-3', houseId: 'house-bh-centro', title: 'Vaga Compartilhada 03', price: 650, available: true },
  { id: 'room-pinheiros-1', houseId: 'house-sp-pinheiros', title: 'Quarto Premium', price: 1450, available: true },
  { id: 'room-pinheiros-2', houseId: 'house-sp-pinheiros', title: 'Quarto Standard', price: 1180, available: false },
  { id: 'room-curitiba-1', houseId: 'house-curitiba-centro', title: 'Quarto Frente', price: 780, available: true },
  { id: 'room-curitiba-2', houseId: 'house-curitiba-centro', title: 'Quarto Fundos', price: 720, available: true }
];

export const members: HouseMember[] = [
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

export const applications: Application[] = [
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

export const charges: MonthlyCharge[] = [
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

export const payments: Payment[] = [
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
