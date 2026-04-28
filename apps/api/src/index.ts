import { createClient, type User } from '@supabase/supabase-js';
import { createRepository } from './repository';
import type {
  AccountType,
  AddMemberInput,
  ApplicationStatus,
  CreateApplicationInput,
  CreateChargeInput,
  CreateHouseInput,
  HouseDetail,
  UpsertPaymentInput
} from './types';

export interface Env {
  APP_ORIGIN?: string;
  USE_MOCK_DATA?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

type AuthContext = {
  id: string;
  email: string;
  accountType: AccountType;
};

const isValidDateOnly = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00`));
const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const normalizeAccountType = (value: unknown): AccountType => {
  if (value === 'house-admin' || value === 'gestor' || value === 'manager') {
    return 'house-admin';
  }

  if (value === 'super-admin') {
    return 'super-admin';
  }

  if (value === 'member' || value === 'morador') {
    return 'member';
  }

  return 'visitor';
};

const getAccountType = (user: User) => {
  const metadata = user.user_metadata ?? {};
  return normalizeAccountType(metadata['account_type'] ?? metadata['accountType'] ?? metadata['role']);
};

const getBearerToken = (request: Request) => {
  const authorization = request.headers.get('authorization') ?? '';
  const [scheme, token] = authorization.split(' ');
  return scheme?.toLowerCase() === 'bearer' && token ? token : null;
};

const getRequestUser = async (request: Request, env: Env): Promise<AuthContext | null> => {
  if (env.USE_MOCK_DATA === 'true' || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  const token = getBearerToken(request);
  if (!token) {
    return null;
  }

  const client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) {
    return null;
  }

  return {
    id: data.user.id,
    email: data.user.email ?? '',
    accountType: getAccountType(data.user)
  };
};

const validateCreateChargeInput = (input: CreateChargeInput) => {
  if (!input.houseId?.trim()) {
    return 'houseId is required';
  }

  if (!input.title?.trim()) {
    return 'title is required';
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return 'amount must be greater than zero';
  }

  if (!isValidDateOnly(input.dueDate?.trim() ?? '')) {
    return 'dueDate must use YYYY-MM-DD';
  }

  return null;
};

const validateAddMemberInput = (input: AddMemberInput) => {
  if (!input.email?.trim()) {
    return 'email is required';
  }

  if (!isValidEmail(input.email.trim())) {
    return 'email must be valid';
  }

  if (input.role !== 'admin' && input.role !== 'member') {
    return 'role must be admin or member';
  }

  return null;
};

const validateCreateApplicationInput = (input: CreateApplicationInput) => {
  if (!input.houseId?.trim()) {
    return 'houseId is required';
  }

  if (!input.contactPhone?.trim()) {
    return 'contactPhone is required';
  }

  if (!input.message?.trim() || input.message.trim().length < 12) {
    return 'message must have at least 12 characters';
  }

  return null;
};

const isApplicationStatus = (value: unknown): value is ApplicationStatus =>
  value === 'submitted' || value === 'in_review' || value === 'contact_soon' || value === 'rejected';

const json = (data: unknown, init: ResponseInit = {}, origin = '*') =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': origin,
      'access-control-allow-methods': 'GET,POST,PATCH,OPTIONS',
      'access-control-allow-headers': 'content-type,authorization',
      ...init.headers
    }
  });

const parseBody = async <T>(request: Request) => (await request.json()) as T;

const isHouseManager = (user: AuthContext, house: HouseDetail) =>
  user.accountType === 'super-admin' ||
  house.ownerId === user.id ||
  house.members.some((member) => member.userId === user.id && member.role === 'admin');

const isHouseMember = (user: AuthContext, house: HouseDetail) => house.members.some((member) => member.userId === user.id);

const sanitizeHouseDetail = (house: HouseDetail, user: AuthContext | null): HouseDetail => {
  const canManage = user ? isHouseManager(user, house) : false;
  const canSeeMembers = user ? canManage || isHouseMember(user, house) : false;
  const canSeeFinancials = canSeeMembers;

  return {
    ...house,
    members: canSeeMembers ? house.members : [],
    applications: canManage ? house.applications : [],
    charges: canSeeFinancials ? house.charges : [],
    payments: canManage
      ? house.payments
      : canSeeFinancials && user
        ? house.payments.filter((payment) => payment.userId === user.id)
        : []
  };
};

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    const origin = env.APP_ORIGIN ?? '*';

    if (request.method === 'OPTIONS') {
      return json({ ok: true }, { status: 204 }, origin);
    }

    const repository = createRepository(env);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const auth = await getRequestUser(request, env);

    try {
      if (request.method === 'GET' && path === '/health') {
        return json(
          {
            ok: true,
            mode: env.USE_MOCK_DATA === 'true' ? 'mock' : 'supabase',
            date: new Date().toISOString()
          },
          { status: 200 },
          origin
        );
      }

      if (request.method === 'GET' && path === '/houses') {
        const data = await repository.listHouses(url.searchParams);
        return json({ data }, { status: 200 }, origin);
      }

      if (request.method === 'GET' && path.startsWith('/houses/')) {
        const houseId = path.split('/')[2];
        const data = await repository.getHouseById(houseId);

        if (!data) {
          return json({ error: 'House not found' }, { status: 404 }, origin);
        }

        return json({ data: sanitizeHouseDetail(data, auth) }, { status: 200 }, origin);
      }

      if (request.method === 'POST' && path === '/houses') {
        if (!auth || (auth.accountType !== 'house-admin' && auth.accountType !== 'super-admin')) {
          return json({ error: 'Unauthorized' }, { status: 401 }, origin);
        }

        const payload = await parseBody<CreateHouseInput>(request);
        const data = await repository.createHouse({
          ...payload,
          ownerId: auth.id
        });
        return json({ data }, { status: 201 }, origin);
      }

      if (request.method === 'GET' && path === '/applications') {
        if (!auth) {
          return json({ error: 'Unauthorized' }, { status: 401 }, origin);
        }

        const data = await repository.listApplicationsByUser(auth.id);
        return json({ data }, { status: 200 }, origin);
      }

      if (request.method === 'POST' && path === '/applications') {
        if (!auth) {
          return json({ error: 'Unauthorized' }, { status: 401 }, origin);
        }

        const payload = await parseBody<CreateApplicationInput>(request);
        const validationError = validateCreateApplicationInput(payload);
        if (validationError) {
          return json({ error: validationError }, { status: 400 }, origin);
        }

        const data = await repository.createApplication({
          ...payload,
          houseId: payload.houseId.trim(),
          userId: auth.id,
          message: payload.message.trim(),
          contactPhone: payload.contactPhone.trim(),
          contactInstagram: payload.contactInstagram?.trim() || null
        });
        return json({ data }, { status: 201 }, origin);
      }

      if (request.method === 'PATCH' && /^\/applications\/[^/]+$/.test(path)) {
        if (!auth) {
          return json({ error: 'Unauthorized' }, { status: 401 }, origin);
        }

        const applicationId = path.split('/')[2];
        const existingApplication = await repository.getApplicationById(applicationId);
        if (!existingApplication) {
          return json({ error: 'Application not found' }, { status: 404 }, origin);
        }

        const house = await repository.getHouseById(existingApplication.houseId);
        if (!house) {
          return json({ error: 'House not found' }, { status: 404 }, origin);
        }

        if (!isHouseManager(auth, house)) {
          return json({ error: 'Forbidden' }, { status: 403 }, origin);
        }

        const payload = await parseBody<{ status?: unknown }>(request);
        if (!isApplicationStatus(payload.status)) {
          return json({ error: 'status is invalid' }, { status: 400 }, origin);
        }

        const data = await repository.updateApplicationStatus(applicationId, payload.status);
        return json({ data }, { status: 200 }, origin);
      }

      if (request.method === 'POST' && /^\/houses\/[^/]+\/members$/.test(path)) {
        if (!auth) {
          return json({ error: 'Unauthorized' }, { status: 401 }, origin);
        }

        const houseId = path.split('/')[2];
        const house = await repository.getHouseById(houseId);
        if (!house) {
          return json({ error: 'House not found' }, { status: 404 }, origin);
        }

        if (!isHouseManager(auth, house)) {
          return json({ error: 'Forbidden' }, { status: 403 }, origin);
        }

        const payload = await parseBody<AddMemberInput>(request);
        const validationError = validateAddMemberInput(payload);
        if (validationError) {
          return json({ error: validationError }, { status: 400 }, origin);
        }

        const data = await repository.addMember(houseId, {
          email: payload.email.trim(),
          role: payload.role
        });
        return json({ data }, { status: 201 }, origin);
      }

      if (request.method === 'POST' && path === '/charges') {
        if (!auth) {
          return json({ error: 'Unauthorized' }, { status: 401 }, origin);
        }

        const payload = await parseBody<CreateChargeInput>(request);
        const validationError = validateCreateChargeInput(payload);
        if (validationError) {
          return json({ error: validationError }, { status: 400 }, origin);
        }

        const house = await repository.getHouseById(payload.houseId.trim());
        if (!house) {
          return json({ error: 'House not found' }, { status: 404 }, origin);
        }

        if (!isHouseManager(auth, house)) {
          return json({ error: 'Forbidden' }, { status: 403 }, origin);
        }

        const data = await repository.createCharge({
          ...payload,
          houseId: payload.houseId.trim(),
          title: payload.title.trim(),
          dueDate: payload.dueDate.trim()
        });
        return json({ data }, { status: 201 }, origin);
      }

      if (request.method === 'GET' && path === '/payments') {
        if (!auth) {
          return json({ error: 'Unauthorized' }, { status: 401 }, origin);
        }

        const houseId = url.searchParams.get('houseId') ?? undefined;
        if (houseId) {
          const house = await repository.getHouseById(houseId);
          if (!house) {
            return json({ error: 'House not found' }, { status: 404 }, origin);
          }

          if (!isHouseManager(auth, house)) {
            return json({ error: 'Forbidden' }, { status: 403 }, origin);
          }

          const data = await repository.listPayments(houseId);
          return json({ data }, { status: 200 }, origin);
        }

        const houses = await repository.listHouses(new URLSearchParams());
        const managedHouseIds =
          auth.accountType === 'super-admin'
            ? houses.map((house) => house.id)
            : (
                await Promise.all(
                  houses.map(async (house) => {
                    const detail = await repository.getHouseById(house.id);
                    return detail && isHouseManager(auth, detail) ? house.id : null;
                  })
                )
              ).filter((houseId): houseId is string => Boolean(houseId));

        const payments = await Promise.all(managedHouseIds.map((managedHouseId) => repository.listPayments(managedHouseId)));
        return json({ data: payments.flat() }, { status: 200 }, origin);
      }

      if (request.method === 'POST' && path === '/payments') {
        if (!auth) {
          return json({ error: 'Unauthorized' }, { status: 401 }, origin);
        }

        const payload = await parseBody<UpsertPaymentInput>(request);
        const charge = await repository.getChargeById(payload.chargeId);
        if (!charge) {
          return json({ error: 'Charge not found' }, { status: 404 }, origin);
        }

        const house = await repository.getHouseById(charge.houseId);
        if (!house) {
          return json({ error: 'House not found' }, { status: 404 }, origin);
        }

        if (!isHouseManager(auth, house)) {
          return json({ error: 'Forbidden' }, { status: 403 }, origin);
        }

        const data = await repository.upsertPayment(payload);
        return json({ data }, { status: 201 }, origin);
      }

      return json({ error: 'Not found' }, { status: 404 }, origin);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return json({ error: message }, { status: 500 }, origin);
    }
  }
} satisfies ExportedHandler<Env>;
