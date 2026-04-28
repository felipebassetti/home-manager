import { createRepository } from './repository';
import type { AddMemberInput, CreateApplicationInput, CreateChargeInput, CreateHouseInput, UpsertPaymentInput } from './types';

export interface Env {
  APP_ORIGIN?: string;
  USE_MOCK_DATA?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

const isValidDateOnly = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00`));
const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

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

const json = (data: unknown, init: ResponseInit = {}, origin = '*') =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': origin,
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'content-type,authorization',
      ...init.headers
    }
  });

const parseBody = async <T>(request: Request) => (await request.json()) as T;

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    const origin = env.APP_ORIGIN ?? '*';

    if (request.method === 'OPTIONS') {
      return json({ ok: true }, { status: 204 }, origin);
    }

    const repository = createRepository(env);
    const path = url.pathname.replace(/\/+$/, '') || '/';

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

        return json({ data }, { status: 200 }, origin);
      }

      if (request.method === 'POST' && path === '/houses') {
        const payload = await parseBody<CreateHouseInput>(request);
        const data = await repository.createHouse(payload);
        return json({ data }, { status: 201 }, origin);
      }

      if (request.method === 'POST' && path === '/applications') {
        const payload = await parseBody<CreateApplicationInput>(request);
        const data = await repository.createApplication(payload);
        return json({ data }, { status: 201 }, origin);
      }

      if (request.method === 'POST' && /^\/houses\/[^/]+\/members$/.test(path)) {
        const houseId = path.split('/')[2];
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
        const payload = await parseBody<CreateChargeInput>(request);
        const validationError = validateCreateChargeInput(payload);
        if (validationError) {
          return json({ error: validationError }, { status: 400 }, origin);
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
        const houseId = url.searchParams.get('houseId') ?? undefined;
        const data = await repository.listPayments(houseId);
        return json({ data }, { status: 200 }, origin);
      }

      if (request.method === 'POST' && path === '/payments') {
        const payload = await parseBody<UpsertPaymentInput>(request);
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
