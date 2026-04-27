import { Injectable, computed, signal } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { findMockProfileByEmail, mockProfiles, registerMockVisitorProfile } from '../data/mock-data';
import type { AccountType, ActiveProfile } from '../models/domain.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'republic-house-auth-profile';
  private readonly guestProfile: ActiveProfile = {
    id: 'guest-visitor',
    name: 'Visitante',
    email: '',
    accountType: 'visitor'
  };

  readonly profiles = mockProfiles;
  readonly isSupabaseConfigured = Boolean(environment.supabaseUrl && environment.supabaseAnonKey);
  readonly sessionProfile = signal<ActiveProfile | null>(this.readStoredProfile());
  readonly activeProfile = computed(() => this.sessionProfile() ?? this.guestProfile);
  readonly isAuthenticated = computed(() => this.sessionProfile() !== null);
  readonly accountLabel = computed(() => {
    if (!this.isAuthenticated()) {
      return 'Entrar para candidatar';
    }

    const type = this.activeProfile().accountType;
    if (type === 'house-admin') {
      return 'Gestor da casa';
    }
    if (type === 'super-admin') {
      return 'Super admin';
    }
    if (type === 'member') {
      return 'Morador';
    }
    return 'Visitante';
  });

  readonly canAccessManagement = computed(() => {
    if (!this.isAuthenticated()) {
      return false;
    }

    const type = this.activeProfile().accountType;
    return type === 'house-admin' || type === 'super-admin';
  });

  readonly canTrackApplications = computed(() => this.isAuthenticated() && !this.canAccessManagement());

  private readonly supabase = this.isSupabaseConfigured
    ? createClient(environment.supabaseUrl, environment.supabaseAnonKey)
    : null;

  setActiveProfile(profileId: string) {
    if (!this.isAuthenticated()) {
      return;
    }

    const profile = this.profiles.find((item) => item.id === profileId);
    if (profile) {
      this.sessionProfile.set(profile);
      this.storeProfile(profile);
    }
  }

  profileRoleLabel(accountType: AccountType) {
    if (accountType === 'house-admin') {
      return 'Gestor da casa';
    }

    if (accountType === 'super-admin') {
      return 'Super admin';
    }

    if (accountType === 'member') {
      return 'Morador';
    }

    return 'Visitante';
  }

  async signInWithPassword(email: string, password: string) {
    if (!this.supabase) {
      if (password !== '123456') {
        return {
          mock: true,
          error: { message: 'Use a senha padrao 123456 no modo local.' }
        };
      }

      const existingProfile = findMockProfileByEmail(email);
      const profile = existingProfile ?? registerMockVisitorProfile(email);
      this.sessionProfile.set(profile);
      this.storeProfile(profile);

      return { mock: true, user: profile };
    }

    const result = await this.supabase.auth.signInWithPassword({ email, password });

    if (!result.error && result.data.user) {
      const existingProfile = findMockProfileByEmail(result.data.user.email ?? '');
      const profile = existingProfile ?? registerMockVisitorProfile(result.data.user.email ?? '');
      this.sessionProfile.set(profile);
      this.storeProfile(profile);
    }

    return result;
  }

  async signOut() {
    if (!this.supabase) {
      this.sessionProfile.set(null);
      this.clearStoredProfile();
      return;
    }

    await this.supabase.auth.signOut();
    this.sessionProfile.set(null);
    this.clearStoredProfile();
  }

  private readStoredProfile() {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const storedValue = localStorage.getItem(this.storageKey);
    if (!storedValue) {
      return null;
    }

    try {
      return JSON.parse(storedValue) as ActiveProfile;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }

  private storeProfile(profile: ActiveProfile) {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(profile));
  }

  private clearStoredProfile() {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.removeItem(this.storageKey);
  }
}
