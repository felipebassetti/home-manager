import { Injectable, computed, signal } from '@angular/core';
import { createClient, type User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { findMockProfileByEmail, mockProfiles, registerMockProfile } from '../data/mock-data';
import type { AccountType, ActiveProfile } from '../models/domain.models';

type PublicAccountType = Extract<AccountType, 'visitor' | 'house-admin'>;

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
    return 'Candidato';
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

  constructor() {
    if (!this.supabase) {
      return;
    }

    void this.restoreSupabaseSession();
    this.supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        this.sessionProfile.set(null);
        this.clearStoredProfile();
        return;
      }

      const profile = this.profileFromSupabaseUser(session.user);
      this.sessionProfile.set(profile);
      this.storeProfile(profile);
    });
  }

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

    return 'Candidato';
  }

  async signInWithPassword(email: string, password: string, accountType: PublicAccountType = 'visitor') {
    if (!this.supabase) {
      if (password !== '123456') {
        return {
          mock: true,
          error: { message: 'Use a senha padrao 123456 no modo local.' }
        };
      }

      const existingProfile = findMockProfileByEmail(email);
      const profile = existingProfile ?? registerMockProfile(email, undefined, accountType);
      this.sessionProfile.set(profile);
      this.storeProfile(profile);

      return { mock: true, user: profile };
    }

    const result = await this.supabase.auth.signInWithPassword({ email, password });

    if (!result.error && result.data.user) {
      await this.syncSupabaseProfile(result.data.user, accountType);
    }

    return result;
  }

  async signUpProfile(name: string, email: string, password: string, accountType: PublicAccountType = 'visitor') {
    if (!this.supabase) {
      if (password.length < 6) {
        return {
          mock: true,
          error: { message: 'Use uma senha com pelo menos 6 caracteres.' }
        };
      }

      const profile = registerMockProfile(email, name, accountType);
      this.sessionProfile.set(profile);
      this.storeProfile(profile);

      return { mock: true, user: profile };
    }

    const result = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, account_type: accountType }
      }
    });

    if (!result.error && result.data.user) {
      await this.syncSupabaseProfile(result.data.user, accountType);
    }

    return result;
  }

  async signUpVisitor(name: string, email: string, password: string) {
    return this.signUpProfile(name, email, password, 'visitor');
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

  private async restoreSupabaseSession() {
    if (!this.supabase) {
      return;
    }

    const { data } = await this.supabase.auth.getSession();
    if (data.session?.user) {
      const profile = this.profileFromSupabaseUser(data.session.user);
      this.sessionProfile.set(profile);
      this.storeProfile(profile);
      return;
    }

    this.sessionProfile.set(null);
    this.clearStoredProfile();
  }

  private async syncSupabaseProfile(user: User, fallbackAccountType: PublicAccountType) {
    if (!this.supabase) {
      return;
    }

    let syncedUser = user;
    if (!this.hasAccountTypeMetadata(user)) {
      const { data } = await this.supabase.auth.updateUser({
        data: {
          ...(user.user_metadata ?? {}),
          account_type: fallbackAccountType
        }
      });

      syncedUser = data.user ?? user;
    }

    const profile = this.profileFromSupabaseUser(syncedUser, fallbackAccountType);
    this.sessionProfile.set(profile);
    this.storeProfile(profile);
  }

  private profileFromSupabaseUser(user: User, fallbackAccountType: AccountType = 'visitor'): ActiveProfile {
    const metadata = user.user_metadata ?? {};
    const email = user.email ?? '';
    const name = this.readMetadataString(metadata['name']) || this.readMetadataString(metadata['full_name']) || this.nameFromEmail(email);

    return {
      id: user.id,
      name,
      email,
      accountType: this.normalizeAccountType(metadata['account_type'] ?? metadata['accountType'] ?? metadata['role'], fallbackAccountType)
    };
  }

  private hasAccountTypeMetadata(user: User) {
    const metadata = user.user_metadata ?? {};
    return Boolean(metadata['account_type'] ?? metadata['accountType'] ?? metadata['role']);
  }

  private normalizeAccountType(value: unknown, fallback: AccountType): AccountType {
    if (value === 'house-admin' || value === 'gestor' || value === 'manager') {
      return 'house-admin';
    }

    if (value === 'super-admin') {
      return 'super-admin';
    }

    if (value === 'member' || value === 'morador') {
      return 'member';
    }

    if (value === 'visitor' || value === 'candidate' || value === 'candidato') {
      return 'visitor';
    }

    return fallback;
  }

  private readMetadataString(value: unknown) {
    return typeof value === 'string' ? value.trim() : '';
  }

  private nameFromEmail(email: string) {
    return (
      email
        .split('@')[0]
        .split(/[._-]/)
        .filter(Boolean)
        .map((part) => part[0]?.toUpperCase() + part.slice(1))
        .join(' ') || 'Usuario'
    );
  }
}
