export const profiles = [
    { id: 'user-admin-1', name: 'Ana Paula Souza', email: 'ana@flatsharing.app' },
    { id: 'user-member-1', name: 'Bruno Lima', email: 'bruno@flatsharing.app' },
    { id: 'user-member-2', name: 'Carla Nunes', email: 'carla@flatsharing.app' },
    { id: 'user-visitor-1', name: 'Diego Martins', email: 'diego@flatsharing.app' }
];
export const houses = [
    {
        id: 'house-curitiba-centro',
        ownerId: 'user-admin-1',
        title: 'flatsharing Centro',
        description: 'Casa compartilhada com rotina tranquila, internet de alta velocidade e foco em estudantes e jovens profissionais em Curitiba.',
        city: 'Curitiba',
        neighborhood: 'Centro',
        address: 'Rua Emiliano Perneta, 210',
        imageUrl: 'assets/images/house-curitiba.png',
        amenities: ['wifi 500mb', 'lavanderia', 'cozinha equipada', 'limpeza semanal'],
        createdAt: '2026-04-18T12:00:00.000Z'
    },
    {
        id: 'house-curitiba-batel',
        ownerId: 'user-admin-1',
        title: 'Casa Batel Compartilhada',
        description: 'Sobrado com vagas individuais, ambiente organizado e acesso simples para rotina de estudo e trabalho.',
        city: 'Curitiba',
        neighborhood: 'Batel',
        address: 'Avenida Silva Jardim, 3021',
        imageUrl: 'assets/images/house-pinheiros.png',
        amenities: ['coworking', 'armario individual', 'bicicletario', 'limpeza semanal'],
        createdAt: '2026-04-16T08:30:00.000Z'
    },
    {
        id: 'house-curitiba-reboucas',
        ownerId: 'user-admin-1',
        title: 'Rep Reboucas',
        description: 'Opcao economica para estudantes com contas rateadas e proximidade de campus e transporte.',
        city: 'Curitiba',
        neighborhood: 'Reboucas',
        address: 'Rua Chile, 1490',
        imageUrl: 'assets/images/house-savassi.png',
        amenities: ['contas inclusas', 'espaco de estudo', 'mercado perto'],
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
        amenities: ['quartos amplos', 'area comum', 'terminal perto', 'wifi 600mb'],
        createdAt: '2026-04-01T09:30:00.000Z'
    }
];
export const rooms = [
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
export const members = [
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
export const applications = [
    {
        id: 'application-1',
        houseId: 'house-curitiba-centro',
        roomId: 'room-centro-2',
        userId: 'user-visitor-1',
        status: 'pending',
        message: 'Procuro vaga para entrar em maio e trabalhar remoto.',
        createdAt: '2026-04-24T09:00:00.000Z'
    }
];
export const charges = [
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
export const payments = [
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
