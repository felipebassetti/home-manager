import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { guestOnlyGuard, requireAuthGuard, requireManagementGuard } from './auth.guards';

class AuthServiceStub {
  readonly isAuthenticated = signal(false);
  readonly canAccessManagement = signal(false);

  async waitUntilReady() {}
}

describe('auth guards', () => {
  let auth: AuthServiceStub;

  beforeEach(() => {
    auth = new AuthServiceStub();

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        {
          provide: Router,
          useValue: {
            createUrlTree: (commands: string[], options?: { queryParams?: Record<string, string> }) => ({
              commands,
              queryParams: options?.queryParams ?? {}
            })
          }
        }
      ]
    });
  });

  it('redireciona usuario anonimo para login em rota protegida', async () => {
    const result = await TestBed.runInInjectionContext(() =>
      requireAuthGuard({} as never, { url: '/my-houses' } as never)
    );

    expect(result).toEqual({
      commands: ['/login'],
      queryParams: { redirect: '/my-houses' }
    });
  });

  it('permite rota de gestao para usuario com acesso administrativo', async () => {
    auth.isAuthenticated.set(true);
    auth.canAccessManagement.set(true);

    const result = await TestBed.runInInjectionContext(() =>
      requireManagementGuard({} as never, { url: '/house-manage' } as never)
    );

    expect(result).toBe(true);
  });

  it('redireciona usuario autenticado para fora da tela de login', async () => {
    auth.isAuthenticated.set(true);
    auth.canAccessManagement.set(false);

    const result = await TestBed.runInInjectionContext(() => guestOnlyGuard({} as never, { url: '/login' } as never));

    expect(result).toEqual({
      commands: ['/applications'],
      queryParams: {}
    });
  });
});
