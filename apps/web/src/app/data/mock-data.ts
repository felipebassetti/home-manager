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
  { id: 'user-admin-1', name: 'Ana Paula Souza', email: 'ana@flatsharing.app' },
  { id: 'user-superadmin-1', name: 'Marcos Lima', email: 'marcos@flatsharing.app' },
  { id: 'user-member-1', name: 'Bruno Lima', email: 'bruno@flatsharing.app' },
  { id: 'user-member-2', name: 'Carla Nunes', email: 'carla@flatsharing.app' },
  { id: 'user-visitor-1', name: 'Diego Martins', email: 'diego@flatsharing.app' }
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
    title: 'flatsharing Centro',
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
  },
  {
    id: 'house-curitiba-bigorrilho',
    ownerId: 'user-admin-1',
    title: 'Casa Bigorrilho Jardim',
    description: 'Casa com quartos individuais, cozinha ampla e facil acesso a ciclovias, mercados e linhas para o centro.',
    city: 'Curitiba',
    neighborhood: 'Bigorrilho',
    address: 'Rua Padre Anchieta, 1850',
    imageUrl: 'assets/images/house-pinheiros.png',
    galleryImages: [
      'assets/images/house-pinheiros.png',
      'assets/images/house-savassi.png',
      'assets/images/house-curitiba.png'
    ],
    amenities: ['wifi 600mb', 'quintal', 'cozinha ampla', 'bicicletario'],
    createdAt: '2026-04-10T11:30:00.000Z'
  },
  {
    id: 'house-curitiba-cabral',
    ownerId: 'user-admin-1',
    title: 'Moradia Cabral Norte',
    description: 'Imovel silencioso com escritorio compartilhado, lavanderia e quartos para rotina de estudo e trabalho remoto.',
    city: 'Curitiba',
    neighborhood: 'Cabral',
    address: 'Rua Sao Pedro, 640',
    imageUrl: 'assets/images/house-curitiba.png',
    galleryImages: [
      'assets/images/house-curitiba.png',
      'assets/images/house-pinheiros.png',
      'assets/images/house-savassi.png'
    ],
    amenities: ['coworking', 'lavanderia', 'limpeza quinzenal', 'sala de TV'],
    createdAt: '2026-04-09T10:00:00.000Z'
  },
  {
    id: 'house-curitiba-cristo-rei',
    ownerId: 'user-admin-1',
    title: 'flatsharing Cristo Rei',
    description: 'Casa perto de mercados e transporte, com quartos compactos, contas organizadas e rotina tranquila.',
    city: 'Curitiba',
    neighborhood: 'Cristo Rei',
    address: 'Rua Oyapock, 322',
    imageUrl: 'assets/images/house-savassi.png',
    galleryImages: [
      'assets/images/house-savassi.png',
      'assets/images/house-curitiba.png',
      'assets/images/house-pinheiros.png'
    ],
    amenities: ['contas inclusas', 'cozinha equipada', 'mercado perto', 'wifi 400mb'],
    createdAt: '2026-04-08T14:20:00.000Z'
  },
  {
    id: 'house-curitiba-prado-velho',
    ownerId: 'user-admin-1',
    title: 'Casa Prado Velho Campus',
    description: 'Opcao pratica para estudantes, com vagas economicas, area de estudo e deslocamento rapido para universidades.',
    city: 'Curitiba',
    neighborhood: 'Prado Velho',
    address: 'Rua Imaculada Conceicao, 920',
    imageUrl: 'assets/images/house-curitiba.png',
    galleryImages: [
      'assets/images/house-curitiba.png',
      'assets/images/house-savassi.png',
      'assets/images/house-pinheiros.png'
    ],
    amenities: ['espaco de estudo', 'contas inclusas', 'lavanderia', 'onibus perto'],
    createdAt: '2026-04-07T09:40:00.000Z'
  },
  {
    id: 'house-curitiba-campo-comprido',
    ownerId: 'user-admin-1',
    title: 'Casa Campo Comprido',
    description: 'Sobrado com quintal, quartos mobiliados e gestao simples para quem busca uma rotina mais residencial.',
    city: 'Curitiba',
    neighborhood: 'Campo Comprido',
    address: 'Rua Eduardo Sprada, 4110',
    imageUrl: 'assets/images/house-pinheiros.png',
    galleryImages: [
      'assets/images/house-pinheiros.png',
      'assets/images/house-curitiba.png',
      'assets/images/house-savassi.png'
    ],
    amenities: ['quintal', 'quartos mobiliados', 'garagem bike', 'wifi 500mb'],
    createdAt: '2026-04-06T16:15:00.000Z'
  },
  {
    id: 'house-curitiba-bacacheri',
    ownerId: 'user-admin-1',
    title: 'Casa Bacacheri',
    description: 'Casa bem ventilada, com quartos individuais, area externa e combinados claros para despesas mensais.',
    city: 'Curitiba',
    neighborhood: 'Bacacheri',
    address: 'Rua Estados Unidos, 1212',
    imageUrl: 'assets/images/house-savassi.png',
    galleryImages: [
      'assets/images/house-savassi.png',
      'assets/images/house-pinheiros.png',
      'assets/images/house-curitiba.png'
    ],
    amenities: ['area externa', 'limpeza semanal', 'armario individual', 'wifi 500mb'],
    createdAt: '2026-04-05T13:10:00.000Z'
  },
  {
    id: 'house-curitiba-boa-vista',
    ownerId: 'user-admin-1',
    title: 'Casa Boa Vista',
    description: 'Moradia compartilhada com valores acessiveis, cozinha reformada e facil acesso a comercio de bairro.',
    city: 'Curitiba',
    neighborhood: 'Boa Vista',
    address: 'Avenida Parana, 3100',
    imageUrl: 'assets/images/house-curitiba.png',
    galleryImages: [
      'assets/images/house-curitiba.png',
      'assets/images/house-pinheiros.png',
      'assets/images/house-savassi.png'
    ],
    amenities: ['cozinha reformada', 'mercado perto', 'contas rateadas', 'lavanderia'],
    createdAt: '2026-04-04T08:00:00.000Z'
  },
  {
    id: 'house-curitiba-agua-verde',
    ownerId: 'user-admin-1',
    title: 'Suite Agua Verde',
    description: 'Casa organizada em rua tranquila, com suites e quartos individuais para moradores que valorizam privacidade.',
    city: 'Curitiba',
    neighborhood: 'Agua Verde',
    address: 'Rua Chile, 690',
    imageUrl: 'assets/images/house-pinheiros.png',
    galleryImages: [
      'assets/images/house-pinheiros.png',
      'assets/images/house-savassi.png',
      'assets/images/house-curitiba.png'
    ],
    amenities: ['suite', 'cozinha equipada', 'lavanderia', 'limpeza semanal'],
    createdAt: '2026-04-03T12:45:00.000Z'
  },
  {
    id: 'house-curitiba-juveve',
    ownerId: 'user-admin-1',
    title: 'Casa Juveve Compacta',
    description: 'Imovel pequeno e bem localizado, ideal para poucos moradores e rotina com despesas previsiveis.',
    city: 'Curitiba',
    neighborhood: 'Juveve',
    address: 'Rua Rocha Pombo, 480',
    imageUrl: 'assets/images/house-savassi.png',
    galleryImages: [
      'assets/images/house-savassi.png',
      'assets/images/house-curitiba.png',
      'assets/images/house-pinheiros.png'
    ],
    amenities: ['poucos moradores', 'wifi 500mb', 'limpeza quinzenal', 'onibus perto'],
    createdAt: '2026-04-02T17:00:00.000Z'
  },
  {
    id: 'house-curitiba-portao',
    ownerId: 'user-admin-1',
    title: 'Casa Portao Sul',
    description: 'Casa com quartos amplos, area comum integrada e acesso rapido a shopping, terminal e mercados.',
    city: 'Curitiba',
    neighborhood: 'Portao',
    address: 'Avenida Presidente Kennedy, 3900',
    imageUrl: 'assets/images/house-curitiba.png',
    galleryImages: [
      'assets/images/house-curitiba.png',
      'assets/images/house-savassi.png',
      'assets/images/house-pinheiros.png'
    ],
    amenities: ['quartos amplos', 'area comum', 'terminal perto', 'wifi 600mb'],
    createdAt: '2026-04-01T09:30:00.000Z'
  }
];

const rooms: Room[] = [
  { id: 'room-centro-1', houseId: 'house-curitiba-centro', title: 'Suite 01', price: 980, available: false },
  { id: 'room-centro-2', houseId: 'house-curitiba-centro', title: 'Quarto Individual 02', price: 860, available: true },
  { id: 'room-centro-3', houseId: 'house-curitiba-centro', title: 'Vaga Compartilhada 03', price: 690, available: true },
  { id: 'room-batel-1', houseId: 'house-curitiba-batel', title: 'Quarto Premium', price: 1320, available: true },
  { id: 'room-batel-2', houseId: 'house-curitiba-batel', title: 'Quarto Standard', price: 1160, available: false },
  { id: 'room-reboucas-1', houseId: 'house-curitiba-reboucas', title: 'Quarto Frente', price: 790, available: true },
  { id: 'room-reboucas-2', houseId: 'house-curitiba-reboucas', title: 'Quarto Fundos', price: 740, available: true },
  { id: 'room-bigorrilho-1', houseId: 'house-curitiba-bigorrilho', title: 'Quarto Jardim', price: 1180, available: true },
  { id: 'room-bigorrilho-2', houseId: 'house-curitiba-bigorrilho', title: 'Quarto Varanda', price: 1250, available: true },
  { id: 'room-bigorrilho-3', houseId: 'house-curitiba-bigorrilho', title: 'Quarto Compacto', price: 980, available: false },
  { id: 'room-cabral-1', houseId: 'house-curitiba-cabral', title: 'Quarto Home Office', price: 1240, available: true },
  { id: 'room-cabral-2', houseId: 'house-curitiba-cabral', title: 'Quarto Individual', price: 1090, available: true },
  { id: 'room-cristo-rei-1', houseId: 'house-curitiba-cristo-rei', title: 'Quarto Sol', price: 920, available: true },
  { id: 'room-cristo-rei-2', houseId: 'house-curitiba-cristo-rei', title: 'Quarto Interno', price: 820, available: false },
  { id: 'room-prado-1', houseId: 'house-curitiba-prado-velho', title: 'Vaga Estudante 01', price: 680, available: true },
  { id: 'room-prado-2', houseId: 'house-curitiba-prado-velho', title: 'Quarto Individual', price: 790, available: true },
  { id: 'room-prado-3', houseId: 'house-curitiba-prado-velho', title: 'Vaga Estudante 02', price: 650, available: true },
  { id: 'room-campo-1', houseId: 'house-curitiba-campo-comprido', title: 'Quarto Quintal', price: 890, available: true },
  { id: 'room-campo-2', houseId: 'house-curitiba-campo-comprido', title: 'Quarto Mobiliado', price: 960, available: false },
  { id: 'room-bacacheri-1', houseId: 'house-curitiba-bacacheri', title: 'Quarto Frente', price: 870, available: true },
  { id: 'room-bacacheri-2', houseId: 'house-curitiba-bacacheri', title: 'Quarto Lateral', price: 820, available: true },
  { id: 'room-boa-vista-1', houseId: 'house-curitiba-boa-vista', title: 'Quarto Individual 01', price: 760, available: true },
  { id: 'room-boa-vista-2', houseId: 'house-curitiba-boa-vista', title: 'Quarto Individual 02', price: 790, available: true },
  { id: 'room-agua-verde-1', houseId: 'house-curitiba-agua-verde', title: 'Suite 02', price: 1380, available: true },
  { id: 'room-agua-verde-2', houseId: 'house-curitiba-agua-verde', title: 'Quarto Individual', price: 1120, available: false },
  { id: 'room-juveve-1', houseId: 'house-curitiba-juveve', title: 'Quarto Compacto', price: 930, available: true },
  { id: 'room-juveve-2', houseId: 'house-curitiba-juveve', title: 'Quarto Principal', price: 1080, available: false },
  { id: 'room-portao-1', houseId: 'house-curitiba-portao', title: 'Quarto Amplo', price: 880, available: true },
  { id: 'room-portao-2', houseId: 'house-curitiba-portao', title: 'Quarto Fundos', price: 820, available: true },
  { id: 'room-portao-3', houseId: 'house-curitiba-portao', title: 'Suite Terrea', price: 1180, available: false }
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
  const normalizedEmail = input.email.trim().toLowerCase();
  const profile = profiles.find((item) => item.email.toLowerCase() === normalizedEmail);

  if (!profile) {
    throw new Error('Nenhum usuario com esse email foi encontrado.');
  }

  const existingMember = members.find((member) => member.houseId === houseId && member.userId === profile.id);
  if (existingMember) {
    throw new Error('Esse usuario ja esta vinculado a casa.');
  }

  const member: HouseMember = {
    id: crypto.randomUUID(),
    houseId,
    userId: profile.id,
    role: input.role,
    status: 'active',
    createdAt: nowIso(),
    profile
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
