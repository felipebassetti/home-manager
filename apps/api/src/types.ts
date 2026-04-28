export type MemberRole = 'admin' | 'member';
export type AccountType = 'house-admin' | 'super-admin' | 'member' | 'visitor';
export type ApplicationStatus = 'submitted' | 'in_review' | 'contact_soon' | 'rejected';
export type PaymentStatus = 'pending' | 'paid' | 'overdue';

export interface Profile {
  id: string;
  name: string;
  email: string;
}

export interface Room {
  id: string;
  houseId: string;
  title: string;
  price: number;
  available: boolean;
}

export interface House {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  city: string;
  neighborhood: string;
  address: string;
  imageUrl: string;
  amenities: string[];
  createdAt: string;
}

export interface HouseMember {
  id: string;
  houseId: string;
  userId: string;
  role: MemberRole;
  status: 'active' | 'invited';
  createdAt: string;
  profile?: Profile;
}

export interface Application {
  id: string;
  houseId: string;
  roomId: string | null;
  userId: string;
  contactPhone: string;
  contactInstagram: string | null;
  status: ApplicationStatus;
  message: string;
  createdAt: string;
  statusUpdatedAt: string;
  profile?: Profile;
}

export interface MonthlyCharge {
  id: string;
  houseId: string;
  title: string;
  amount: number;
  dueDate: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  chargeId: string;
  userId: string;
  amount: number;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
}

export interface HouseSummary extends House {
  rooms: Room[];
  availableRooms: number;
  lowestPrice: number;
}

export interface HouseDetail extends HouseSummary {
  members: Array<HouseMember & { profile?: Profile }>;
  applications: Application[];
  charges: MonthlyCharge[];
  payments: Array<Payment & { profile?: Profile; charge?: MonthlyCharge }>;
}

export interface ApplicationListItem extends Application {
  houseTitle: string;
  houseNeighborhood: string;
  houseCity: string;
  roomTitle: string | null;
}

export interface CreateHouseInput {
  ownerId: string;
  title: string;
  description: string;
  city: string;
  neighborhood: string;
  address: string;
  imageUrl: string;
  amenities: string[];
  rooms: Array<Pick<Room, 'title' | 'price' | 'available'>>;
}

export interface CreateApplicationInput {
  houseId: string;
  roomId: string | null;
  userId: string;
  message: string;
  contactPhone: string;
  contactInstagram?: string | null;
}

export interface UpdateApplicationStatusInput {
  applicationId: string;
  status: ApplicationStatus;
}

export interface AddMemberInput {
  email: string;
  role: MemberRole;
}

export interface CreateChargeInput {
  houseId: string;
  title: string;
  amount: number;
  dueDate: string;
}

export interface UpsertPaymentInput {
  paymentId?: string;
  chargeId: string;
  userId: string;
  amount: number;
  status: PaymentStatus;
  paidAt?: string | null;
}

export interface Repository {
  listHouses(filters: URLSearchParams): Promise<HouseSummary[]>;
  getHouseById(houseId: string): Promise<HouseDetail | null>;
  createHouse(input: CreateHouseInput): Promise<HouseDetail>;
  getApplicationById(applicationId: string): Promise<Application | null>;
  createApplication(input: CreateApplicationInput): Promise<Application>;
  listApplicationsByUser(userId: string): Promise<ApplicationListItem[]>;
  updateApplicationStatus(applicationId: string, status: ApplicationStatus): Promise<Application | null>;
  addMember(houseId: string, input: AddMemberInput): Promise<HouseMember>;
  createCharge(input: CreateChargeInput): Promise<MonthlyCharge>;
  getChargeById(chargeId: string): Promise<MonthlyCharge | null>;
  listPayments(houseId?: string): Promise<Array<Payment & { profile?: Profile; charge?: MonthlyCharge }>>;
  upsertPayment(input: UpsertPaymentInput): Promise<Payment>;
}
