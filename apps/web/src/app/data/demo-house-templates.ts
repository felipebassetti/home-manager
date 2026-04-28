import type { CreateHouseInput } from '../models/domain.models';

const buildBatchLabel = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${day}${month}-${hours}${minutes}`;
};

export const buildDemoHouseInputs = (ownerId: string): CreateHouseInput[] => {
  const batchLabel = buildBatchLabel();

  return [
    {
      ownerId,
      title: `Casa Cabral Demo ${batchLabel}`,
      description: 'Casa organizada para estudantes e jovens profissionais, com rotina tranquila, internet boa e espacos compartilhados prontos para uso diario.',
      city: 'Curitiba',
      neighborhood: 'Cabral',
      address: `Rua dos Demo, 101 - Cabral - Lote ${batchLabel}`,
      imageUrl: 'assets/images/house-curitiba.png',
      amenities: ['wifi 600mb', 'cozinha equipada', 'lavanderia', 'limpeza quinzenal'],
      rooms: [
        { title: 'Suite individual', price: 1250, available: true },
        { title: 'Quarto individual', price: 980, available: true },
        { title: 'Quarto duplo', price: 780, available: false }
      ]
    },
    {
      ownerId,
      title: `Casa Juveve Demo ${batchLabel}`,
      description: 'Opcao pensada para quem quer morar perto de mercado, ponto de onibus e cafeterias, com clima mais urbano e espacos confortaveis.',
      city: 'Curitiba',
      neighborhood: 'Juveve',
      address: `Alameda Teste, 245 - Juveve - Lote ${batchLabel}`,
      imageUrl: 'assets/images/house-savassi.png',
      amenities: ['wifi 500mb', 'coworking', 'armario individual', 'cozinha completa'],
      rooms: [
        { title: 'Quarto individual premium', price: 1400, available: true },
        { title: 'Quarto individual standard', price: 1120, available: true },
        { title: 'Vaga compartilhada', price: 690, available: true }
      ]
    },
    {
      ownerId,
      title: `Casa Reboucas Demo ${batchLabel}`,
      description: 'Casa com perfil economico para fluxo de testes, ideal para validar listagem, detalhe, filtros e acompanhamento de vagas abertas.',
      city: 'Curitiba',
      neighborhood: 'Reboucas',
      address: `Rua Ambiente, 88 - Reboucas - Lote ${batchLabel}`,
      imageUrl: 'assets/images/house-pinheiros.png',
      amenities: ['wifi 400mb', 'lavanderia', 'bicicletario', 'area externa'],
      rooms: [
        { title: 'Quarto individual', price: 860, available: true },
        { title: 'Quarto compacto', price: 760, available: false },
        { title: 'Vaga compartilhada', price: 620, available: true }
      ]
    }
  ];
};
