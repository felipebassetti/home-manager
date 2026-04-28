import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  AddMemberInput,
  Application,
  ApplicationListItem,
  ApplicationStatus,
  CreateApplicationInput,
  CreateChargeInput,
  CreateHouseInput,
  HouseDetail,
  HouseMember,
  HouseSummary,
  MonthlyCharge,
  Payment,
  Profile,
  Repository,
  Room,
  SiteRole,
  UpsertPaymentInput
} from './types';

const nowIso = () => new Date().toISOString();

type RepositoryEnv = {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

class SupabaseRepository implements Repository {
  constructor(private readonly client: SupabaseClient) {}

  async getUserAccess(userId: string) {
    const [{ data: roleRows, error: rolesError }, { data: membershipRows, error: membershipsError }] = await Promise.all([
      this.client.from('user_roles').select('role').eq('user_id', userId),
      this.client.from('house_members').select('house_id, role').eq('user_id', userId).eq('status', 'active')
    ]);

    if (rolesError) {
      throw rolesError;
    }

    if (membershipsError) {
      throw membershipsError;
    }

    const { data: ownedHouses, error: ownedHousesError } = await this.client.from('houses').select('id').eq('owner_id', userId);
    if (ownedHousesError) {
      throw ownedHousesError;
    }

    const siteRoles = Array.from(
      new Set(
        ((roleRows ?? []) as Array<{ role?: unknown }>)
          .map((item) => item.role)
          .filter((role): role is SiteRole => role === 'site_admin' || role === 'site_operator')
      )
    );
    const activeMemberships = (membershipRows ?? []) as Array<{ house_id: string; role: string }>;
    const ownedHouseIds = ((ownedHouses ?? []) as Array<{ id: string }>).map((item) => String(item.id));

    return {
      siteRoles,
      managedHouseIds: Array.from(new Set([...ownedHouseIds, ...activeMemberships.filter((item) => item.role === 'admin').map((item) => String(item.house_id))])),
      memberHouseIds: Array.from(new Set([...ownedHouseIds, ...activeMemberships.map((item) => String(item.house_id))]))
    };
  }

  async listHouses(filters: URLSearchParams): Promise<HouseSummary[]> {
    let query = this.client.from('houses').select('*, rooms(*)').order('created_at', { ascending: false });
    const city = filters.get('city');
    const neighborhood = filters.get('neighborhood');
    const maxPrice = filters.get('maxPrice');

    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    if (neighborhood) {
      query = query.ilike('neighborhood', `%${neighborhood}%`);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    return (data ?? [])
      .map((house: Record<string, unknown>) => {
        const houseRooms = (house.rooms as Room[] | undefined) ?? [];
        const lowestPrice = houseRooms.reduce((lowest, room) => Math.min(lowest, room.price), Number.POSITIVE_INFINITY);

        return {
          id: String(house.id),
          ownerId: String(house.owner_id),
          title: String(house.title),
          description: String(house.description),
          city: String(house.city),
          neighborhood: String(house.neighborhood),
          address: String(house.address),
          imageUrl: String(house.image_url ?? ''),
          amenities: (house.amenities as string[] | undefined) ?? [],
          createdAt: String(house.created_at),
          rooms: houseRooms.map((room) => ({
            id: String(room.id),
            houseId: String((room as Room & { house_id?: string }).houseId ?? (room as Room & { house_id?: string }).house_id),
            title: String(room.title),
            price: Number(room.price),
            available: Boolean(room.available)
          })),
          availableRooms: houseRooms.filter((room) => room.available).length,
          lowestPrice
        } satisfies HouseSummary;
      })
      .filter((house) => (maxPrice ? house.lowestPrice <= Number(maxPrice) : true));
  }

  async getHouseById(houseId: string): Promise<HouseDetail | null> {
    const { data: house, error } = await this.client
      .from('houses')
      .select('*, rooms(*), house_members(*, profiles(*)), applications(*, profiles(*)), monthly_charges(*, payments(*, profiles(*)))')
      .eq('id', houseId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }

      throw error;
    }

    const houseRooms = ((house.rooms as Record<string, unknown>[] | undefined) ?? []).map((room) => ({
      id: String(room.id),
      houseId: String(room.house_id),
      title: String(room.title),
      price: Number(room.price),
      available: Boolean(room.available)
    }));

    const detail: HouseDetail = {
      id: String(house.id),
      ownerId: String(house.owner_id),
      title: String(house.title),
      description: String(house.description),
      city: String(house.city),
      neighborhood: String(house.neighborhood),
      address: String(house.address),
      imageUrl: String(house.image_url ?? ''),
      amenities: (house.amenities as string[] | undefined) ?? [],
      createdAt: String(house.created_at),
      rooms: houseRooms,
      availableRooms: houseRooms.filter((room) => room.available).length,
      lowestPrice: houseRooms.reduce((lowest, room) => Math.min(lowest, room.price), Number.POSITIVE_INFINITY),
      members: ((house.house_members as Record<string, unknown>[] | undefined) ?? []).map((member) => ({
        id: String(member.id),
        houseId: String(member.house_id),
        userId: String(member.user_id),
        role: member.role === 'admin' ? 'admin' : 'member',
        status: (member.status as 'active' | 'invited' | undefined) ?? 'active',
        createdAt: String(member.created_at),
        profile: member.profiles as Profile | undefined
      })),
      applications: ((house.applications as Record<string, unknown>[] | undefined) ?? []).map((application) => ({
        id: String(application.id),
        houseId: String(application.house_id),
        roomId: application.room_id ? String(application.room_id) : null,
        userId: String(application.user_id),
        status: application.status as Application['status'],
        contactPhone: String(application.contact_phone ?? ''),
        contactInstagram: application.contact_instagram ? String(application.contact_instagram) : null,
        message: String(application.message ?? ''),
        createdAt: String(application.created_at),
        statusUpdatedAt: String(application.status_updated_at ?? application.created_at),
        profile: application.profiles as Profile | undefined
      })),
      charges: [],
      payments: []
    };

    const rawCharges = (house.monthly_charges as Record<string, unknown>[] | undefined) ?? [];
    detail.charges = rawCharges.map((charge) => ({
      id: String(charge.id),
      houseId: String(charge.house_id),
      title: String(charge.title),
      amount: Number(charge.amount),
      dueDate: String(charge.due_date),
      createdAt: String(charge.created_at)
    }));
    detail.payments = rawCharges.flatMap((charge) =>
      ((charge.payments as Record<string, unknown>[] | undefined) ?? []).map((payment) => ({
        id: String(payment.id),
        chargeId: String(payment.charge_id),
        userId: String(payment.user_id),
        amount: Number(payment.amount),
        status: payment.status as Payment['status'],
        paidAt: payment.paid_at ? String(payment.paid_at) : null,
        createdAt: String(payment.created_at),
        charge: detail.charges.find((item) => item.id === String(payment.charge_id)),
        profile: payment.profiles as Profile | undefined
      }))
    );

    return detail;
  }

  async createHouse(input: CreateHouseInput): Promise<HouseDetail> {
    const { data: house, error } = await this.client
      .from('houses')
      .insert({
        owner_id: input.ownerId,
        title: input.title,
        description: input.description,
        city: input.city,
        neighborhood: input.neighborhood,
        address: input.address,
        image_url: input.imageUrl,
        amenities: input.amenities
      })
      .select()
      .single();

    if (error || !house) {
      throw error ?? new Error('House insert failed');
    }

    const { error: memberError } = await this.client.from('house_members').insert({
      house_id: house.id,
      user_id: input.ownerId,
      role: 'admin',
      status: 'active'
    });

    if (memberError) {
      throw memberError;
    }

    if (input.rooms.length > 0) {
      const { error: roomError } = await this.client.from('rooms').insert(
        input.rooms.map((room) => ({
          house_id: house.id,
          title: room.title,
          price: room.price,
          available: room.available
        }))
      );

      if (roomError) {
        throw roomError;
      }
    }

    const created = await this.getHouseById(String(house.id));
    if (!created) {
      throw new Error('Unable to load created house');
    }

    return created;
  }

  async getApplicationById(applicationId: string): Promise<Application | null> {
    const { data, error } = await this.client
      .from('applications')
      .select('*, profiles(*)')
      .eq('id', applicationId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      id: String(data.id),
      houseId: String(data.house_id),
      roomId: data.room_id ? String(data.room_id) : null,
      userId: String(data.user_id),
      contactPhone: String(data.contact_phone ?? ''),
      contactInstagram: data.contact_instagram ? String(data.contact_instagram) : null,
      status: data.status as Application['status'],
      message: String(data.message ?? ''),
      createdAt: String(data.created_at),
      statusUpdatedAt: String(data.status_updated_at ?? data.created_at),
      profile: data.profiles as Profile | undefined
    };
  }

  async createApplication(input: CreateApplicationInput): Promise<Application> {
    const statusUpdatedAt = nowIso();
    const { data, error } = await this.client
      .from('applications')
      .insert({
        house_id: input.houseId,
        room_id: input.roomId,
        user_id: input.userId,
        contact_phone: input.contactPhone,
        contact_instagram: input.contactInstagram?.trim() || null,
        status: 'submitted',
        message: input.message,
        status_updated_at: statusUpdatedAt
      })
      .select('*, profiles(*)')
      .single();

    if (error || !data) {
      throw error ?? new Error('Application insert failed');
    }

    return {
      id: String(data.id),
      houseId: String(data.house_id),
      roomId: data.room_id ? String(data.room_id) : null,
      userId: String(data.user_id),
      contactPhone: String(data.contact_phone ?? ''),
      contactInstagram: data.contact_instagram ? String(data.contact_instagram) : null,
      status: data.status as Application['status'],
      message: String(data.message ?? ''),
      createdAt: String(data.created_at),
      statusUpdatedAt: String(data.status_updated_at ?? data.created_at),
      profile: data.profiles as Profile | undefined
    };
  }

  async listApplicationsByUser(userId: string): Promise<ApplicationListItem[]> {
    const { data, error } = await this.client
      .from('applications')
      .select('*, houses(title, neighborhood, city), rooms(title), profiles(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return ((data as Record<string, unknown>[] | null) ?? []).map((application) => ({
      id: String(application.id),
      houseId: String(application.house_id),
      roomId: application.room_id ? String(application.room_id) : null,
      userId: String(application.user_id),
      contactPhone: String(application.contact_phone ?? ''),
      contactInstagram: application.contact_instagram ? String(application.contact_instagram) : null,
      status: application.status as Application['status'],
      message: String(application.message ?? ''),
      createdAt: String(application.created_at),
      statusUpdatedAt: String(application.status_updated_at ?? application.created_at),
      profile: application.profiles as Profile | undefined,
      houseTitle: String((application.houses as Record<string, unknown> | null)?.title ?? 'Casa'),
      houseNeighborhood: String((application.houses as Record<string, unknown> | null)?.neighborhood ?? '-'),
      houseCity: String((application.houses as Record<string, unknown> | null)?.city ?? '-'),
      roomTitle: (application.rooms as Record<string, unknown> | null)?.title ? String((application.rooms as Record<string, unknown>).title) : null
    }));
  }

  async updateApplicationStatus(applicationId: string, status: ApplicationStatus): Promise<Application | null> {
    const { data, error } = await this.client
      .from('applications')
      .update({
        status,
        status_updated_at: nowIso()
      })
      .eq('id', applicationId)
      .select('*, profiles(*)')
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      id: String(data.id),
      houseId: String(data.house_id),
      roomId: data.room_id ? String(data.room_id) : null,
      userId: String(data.user_id),
      contactPhone: String(data.contact_phone ?? ''),
      contactInstagram: data.contact_instagram ? String(data.contact_instagram) : null,
      status: data.status as Application['status'],
      message: String(data.message ?? ''),
      createdAt: String(data.created_at),
      statusUpdatedAt: String(data.status_updated_at ?? data.created_at),
      profile: data.profiles as Profile | undefined
    };
  }

  async addMember(houseId: string, input: AddMemberInput): Promise<HouseMember> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const { data: profile, error: profileError } = await this.client
      .from('profiles')
      .select('id, name, email')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    if (!profile) {
      throw new Error('Profile not found');
    }

    const { data: existingMember, error: existingMemberError } = await this.client
      .from('house_members')
      .select('id')
      .eq('house_id', houseId)
      .eq('user_id', profile.id)
      .maybeSingle();

    if (existingMemberError) {
      throw existingMemberError;
    }

    if (existingMember) {
      throw new Error('Member already exists in house');
    }

    const { data, error } = await this.client
      .from('house_members')
      .insert({
        house_id: houseId,
        user_id: profile.id,
        role: input.role,
        status: 'active'
      })
      .select('*, profiles(*)')
      .single();

    if (error || !data) {
      throw error ?? new Error('Member insert failed');
    }

    return {
      id: String(data.id),
      houseId: String(data.house_id),
      userId: String(data.user_id),
      role: data.role === 'admin' ? 'admin' : 'member',
      status: (data.status as 'active' | 'invited' | undefined) ?? 'active',
      createdAt: String(data.created_at),
      profile: data.profiles as Profile | undefined
    };
  }

  async createCharge(input: CreateChargeInput): Promise<MonthlyCharge> {
    const { data, error } = await this.client
      .from('monthly_charges')
      .insert({
        house_id: input.houseId,
        title: input.title,
        amount: input.amount,
        due_date: input.dueDate
      })
      .select()
      .single();

    if (error || !data) {
      throw error ?? new Error('Charge insert failed');
    }

    return {
      id: String(data.id),
      houseId: String(data.house_id),
      title: String(data.title),
      amount: Number(data.amount),
      dueDate: String(data.due_date),
      createdAt: String(data.created_at)
    };
  }

  async getChargeById(chargeId: string): Promise<MonthlyCharge | null> {
    const { data, error } = await this.client.from('monthly_charges').select('*').eq('id', chargeId).maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      id: String(data.id),
      houseId: String(data.house_id),
      title: String(data.title),
      amount: Number(data.amount),
      dueDate: String(data.due_date),
      createdAt: String(data.created_at)
    };
  }

  async listPayments(houseId?: string): Promise<Array<Payment & { profile?: Profile; charge?: MonthlyCharge }>> {
    let query = this.client.from('payments').select('*, profiles(*), monthly_charges(*)').order('created_at', { ascending: false });
    if (houseId) {
      query = query.eq('monthly_charges.house_id', houseId);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    return ((data as Record<string, unknown>[] | null) ?? []).map((payment) => ({
      id: String(payment.id),
      chargeId: String(payment.charge_id),
      userId: String(payment.user_id),
      amount: Number(payment.amount),
      status: payment.status as Payment['status'],
      paidAt: payment.paid_at ? String(payment.paid_at) : null,
      createdAt: String(payment.created_at),
      profile: payment.profiles as Profile | undefined,
      charge: payment.monthly_charges
        ? {
            id: String((payment.monthly_charges as Record<string, unknown>).id),
            houseId: String((payment.monthly_charges as Record<string, unknown>).house_id),
            title: String((payment.monthly_charges as Record<string, unknown>).title),
            amount: Number((payment.monthly_charges as Record<string, unknown>).amount),
            dueDate: String((payment.monthly_charges as Record<string, unknown>).due_date),
            createdAt: String((payment.monthly_charges as Record<string, unknown>).created_at)
          }
        : undefined
    }));
  }

  async upsertPayment(input: UpsertPaymentInput): Promise<Payment> {
    const { data, error } = await this.client
      .from('payments')
      .upsert(
        {
          id: input.paymentId,
          charge_id: input.chargeId,
          user_id: input.userId,
          amount: input.amount,
          status: input.status,
          paid_at: input.paidAt ?? null
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error || !data) {
      throw error ?? new Error('Payment upsert failed');
    }

    return {
      id: String(data.id),
      chargeId: String(data.charge_id),
      userId: String(data.user_id),
      amount: Number(data.amount),
      status: data.status as Payment['status'],
      paidAt: data.paid_at ? String(data.paid_at) : null,
      createdAt: String(data.created_at)
    };
  }
}

export const createRepository = (env: RepositoryEnv): Repository => {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase repository is not configured.');
  }

  return new SupabaseRepository(
    createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    })
  );
};
