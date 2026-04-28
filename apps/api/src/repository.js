import { createClient } from '@supabase/supabase-js';
import { applications, charges, houses, members, payments, profiles, rooms } from './mock-data';
const nowIso = () => new Date().toISOString();
const withSummary = (house) => {
    const houseRooms = rooms.filter((room) => room.houseId === house.id);
    return {
        ...house,
        rooms: houseRooms,
        availableRooms: houseRooms.filter((room) => room.available).length,
        lowestPrice: houseRooms.reduce((lowest, room) => Math.min(lowest, room.price), Number.POSITIVE_INFINITY)
    };
};
const withDetails = (house) => {
    const summary = withSummary(house);
    const houseMembers = members
        .filter((member) => member.houseId === house.id)
        .map((member) => ({
        ...member,
        profile: profiles.find((profile) => profile.id === member.userId)
    }));
    const houseCharges = charges.filter((charge) => charge.houseId === house.id);
    const housePayments = payments
        .filter((payment) => houseCharges.some((charge) => charge.id === payment.chargeId))
        .map((payment) => ({
        ...payment,
        profile: profiles.find((profile) => profile.id === payment.userId),
        charge: houseCharges.find((charge) => charge.id === payment.chargeId)
    }));
    return {
        ...summary,
        members: houseMembers,
        applications: applications.filter((application) => application.houseId === house.id),
        charges: houseCharges,
        payments: housePayments
    };
};
const filterHouses = (houseList, filters) => {
    const city = filters.get('city')?.toLowerCase();
    const neighborhood = filters.get('neighborhood')?.toLowerCase();
    const maxPrice = Number(filters.get('maxPrice') ?? 0);
    return houseList.filter((house) => {
        const matchesCity = city ? house.city.toLowerCase().includes(city) : true;
        const matchesNeighborhood = neighborhood ? house.neighborhood.toLowerCase().includes(neighborhood) : true;
        const matchesPrice = maxPrice > 0 ? house.lowestPrice <= maxPrice : true;
        return matchesCity && matchesNeighborhood && matchesPrice;
    });
};
class MockRepository {
    async listHouses(filters) {
        return filterHouses(houses.map(withSummary), filters);
    }
    async getHouseById(houseId) {
        const house = houses.find((item) => item.id === houseId);
        return house ? withDetails(house) : null;
    }
    async createHouse(input) {
        const createdHouse = {
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
        houses.unshift(createdHouse);
        members.unshift({
            id: crypto.randomUUID(),
            houseId: createdHouse.id,
            userId: input.ownerId,
            role: 'admin',
            status: 'active',
            createdAt: nowIso()
        });
        input.rooms.forEach((room) => {
            rooms.push({
                id: crypto.randomUUID(),
                houseId: createdHouse.id,
                title: room.title,
                price: room.price,
                available: room.available
            });
        });
        return withDetails(createdHouse);
    }
    async createApplication(input) {
        const created = {
            id: crypto.randomUUID(),
            houseId: input.houseId,
            roomId: input.roomId,
            userId: input.userId,
            status: 'pending',
            message: input.message,
            createdAt: nowIso()
        };
        applications.unshift(created);
        return created;
    }
    async addMember(houseId, input) {
        const normalizedEmail = input.email.trim().toLowerCase();
        const profile = profiles.find((item) => item.email.toLowerCase() === normalizedEmail);
        if (!profile) {
            throw new Error('Profile not found');
        }
        const existingMember = members.find((member) => member.houseId === houseId && member.userId === profile.id);
        if (existingMember) {
            throw new Error('Member already exists in house');
        }
        const created = {
            id: crypto.randomUUID(),
            houseId,
            userId: profile.id,
            role: input.role,
            status: 'active',
            createdAt: nowIso()
        };
        members.unshift(created);
        return created;
    }
    async createCharge(input) {
        const created = {
            id: crypto.randomUUID(),
            houseId: input.houseId,
            title: input.title,
            amount: input.amount,
            dueDate: input.dueDate,
            createdAt: nowIso()
        };
        charges.unshift(created);
        return created;
    }
    async listPayments(houseId) {
        const houseCharges = houseId ? charges.filter((charge) => charge.houseId === houseId) : charges;
        return payments
            .filter((payment) => houseCharges.some((charge) => charge.id === payment.chargeId))
            .map((payment) => ({
            ...payment,
            profile: profiles.find((profile) => profile.id === payment.userId),
            charge: charges.find((charge) => charge.id === payment.chargeId)
        }));
    }
    async upsertPayment(input) {
        const existing = input.paymentId ? payments.find((payment) => payment.id === input.paymentId) : undefined;
        if (existing) {
            existing.amount = input.amount;
            existing.status = input.status;
            existing.paidAt = input.paidAt ?? existing.paidAt;
            return existing;
        }
        const created = {
            id: crypto.randomUUID(),
            chargeId: input.chargeId,
            userId: input.userId,
            amount: input.amount,
            status: input.status,
            paidAt: input.paidAt ?? null,
            createdAt: nowIso()
        };
        payments.unshift(created);
        return created;
    }
}
class SupabaseRepository {
    client;
    constructor(client) {
        this.client = client;
    }
    async listHouses(filters) {
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
            .map((house) => {
            const houseRooms = house.rooms ?? [];
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
                amenities: house.amenities ?? [],
                createdAt: String(house.created_at),
                rooms: houseRooms.map((room) => ({
                    id: String(room.id),
                    houseId: String(room.houseId ?? room.house_id),
                    title: String(room.title),
                    price: Number(room.price),
                    available: Boolean(room.available)
                })),
                availableRooms: houseRooms.filter((room) => room.available).length,
                lowestPrice
            };
        })
            .filter((house) => (maxPrice ? house.lowestPrice <= Number(maxPrice) : true));
    }
    async getHouseById(houseId) {
        const { data: house, error } = await this.client
            .from('houses')
            .select('*, rooms(*), house_members(*, profiles(*)), applications(*), monthly_charges(*, payments(*, profiles(*)))')
            .eq('id', houseId)
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            throw error;
        }
        const houseRooms = (house.rooms ?? []).map((room) => ({
            id: String(room.id),
            houseId: String(room.house_id),
            title: String(room.title),
            price: Number(room.price),
            available: Boolean(room.available)
        }));
        const detail = {
            id: String(house.id),
            ownerId: String(house.owner_id),
            title: String(house.title),
            description: String(house.description),
            city: String(house.city),
            neighborhood: String(house.neighborhood),
            address: String(house.address),
            imageUrl: String(house.image_url ?? ''),
            amenities: house.amenities ?? [],
            createdAt: String(house.created_at),
            rooms: houseRooms,
            availableRooms: houseRooms.filter((room) => room.available).length,
            lowestPrice: houseRooms.reduce((lowest, room) => Math.min(lowest, room.price), Number.POSITIVE_INFINITY),
            members: (house.house_members ?? []).map((member) => ({
                id: String(member.id),
                houseId: String(member.house_id),
                userId: String(member.user_id),
                role: member.role === 'admin' ? 'admin' : 'member',
                status: member.status ?? 'active',
                createdAt: String(member.created_at),
                profile: member.profiles
            })),
            applications: (house.applications ?? []).map((application) => ({
                id: String(application.id),
                houseId: String(application.house_id),
                roomId: application.room_id ? String(application.room_id) : null,
                userId: String(application.user_id),
                status: application.status,
                message: String(application.message ?? ''),
                createdAt: String(application.created_at)
            })),
            charges: [],
            payments: []
        };
        const rawCharges = house.monthly_charges ?? [];
        detail.charges = rawCharges.map((charge) => ({
            id: String(charge.id),
            houseId: String(charge.house_id),
            title: String(charge.title),
            amount: Number(charge.amount),
            dueDate: String(charge.due_date),
            createdAt: String(charge.created_at)
        }));
        detail.payments = rawCharges.flatMap((charge) => (charge.payments ?? []).map((payment) => ({
            id: String(payment.id),
            chargeId: String(payment.charge_id),
            userId: String(payment.user_id),
            amount: Number(payment.amount),
            status: payment.status,
            paidAt: payment.paid_at ? String(payment.paid_at) : null,
            createdAt: String(payment.created_at),
            charge: detail.charges.find((item) => item.id === String(payment.charge_id)),
            profile: payment.profiles
        })));
        return detail;
    }
    async createHouse(input) {
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
            const { error: roomError } = await this.client.from('rooms').insert(input.rooms.map((room) => ({
                house_id: house.id,
                title: room.title,
                price: room.price,
                available: room.available
            })));
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
    async createApplication(input) {
        const { data, error } = await this.client
            .from('applications')
            .insert({
            house_id: input.houseId,
            room_id: input.roomId,
            user_id: input.userId,
            status: 'pending',
            message: input.message
        })
            .select()
            .single();
        if (error || !data) {
            throw error ?? new Error('Application insert failed');
        }
        return {
            id: String(data.id),
            houseId: String(data.house_id),
            roomId: data.room_id ? String(data.room_id) : null,
            userId: String(data.user_id),
            status: data.status,
            message: String(data.message ?? ''),
            createdAt: String(data.created_at)
        };
    }
    async addMember(houseId, input) {
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
            status: data.status ?? 'active',
            createdAt: String(data.created_at),
            profile: data.profiles
        };
    }
    async createCharge(input) {
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
    async listPayments(houseId) {
        let query = this.client.from('payments').select('*, profiles(*), monthly_charges(*)').order('created_at', { ascending: false });
        if (houseId) {
            query = query.eq('monthly_charges.house_id', houseId);
        }
        const { data, error } = await query;
        if (error) {
            throw error;
        }
        return (data ?? []).map((payment) => ({
            id: String(payment.id),
            chargeId: String(payment.charge_id),
            userId: String(payment.user_id),
            amount: Number(payment.amount),
            status: payment.status,
            paidAt: payment.paid_at ? String(payment.paid_at) : null,
            createdAt: String(payment.created_at),
            profile: payment.profiles,
            charge: payment.monthly_charges
                ? {
                    id: String(payment.monthly_charges.id),
                    houseId: String(payment.monthly_charges.house_id),
                    title: String(payment.monthly_charges.title),
                    amount: Number(payment.monthly_charges.amount),
                    dueDate: String(payment.monthly_charges.due_date),
                    createdAt: String(payment.monthly_charges.created_at)
                }
                : undefined
        }));
    }
    async upsertPayment(input) {
        const { data, error } = await this.client
            .from('payments')
            .upsert({
            id: input.paymentId,
            charge_id: input.chargeId,
            user_id: input.userId,
            amount: input.amount,
            status: input.status,
            paid_at: input.paidAt ?? null
        }, { onConflict: 'id' })
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
            status: data.status,
            paidAt: data.paid_at ? String(data.paid_at) : null,
            createdAt: String(data.created_at)
        };
    }
}
export const createRepository = (env) => {
    if (env.USE_MOCK_DATA === 'true' ||
        !env.SUPABASE_URL ||
        !env.SUPABASE_SERVICE_ROLE_KEY) {
        return new MockRepository();
    }
    return new SupabaseRepository(createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false }
    }));
};
