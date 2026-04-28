import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

const redirectTree = (router: Router, path: string, redirect?: string) => {
  return redirect
    ? router.createUrlTree([path], { queryParams: { redirect } })
    : router.createUrlTree([path]);
};

export const requireAuthGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.waitUntilReady();

  return auth.isAuthenticated() ? true : redirectTree(router, '/login', state.url);
};

export const requireManagementGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.waitUntilReady();

  if (!auth.isAuthenticated()) {
    return redirectTree(router, '/login', state.url);
  }

  return auth.canAccessManagement() ? true : redirectTree(router, '/');
};

export const guestOnlyGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.waitUntilReady();

  if (!auth.isAuthenticated()) {
    return true;
  }

  return redirectTree(router, auth.canAccessManagement() ? '/my-houses' : '/applications');
};
