import { Injectable, computed, signal } from '@angular/core';
import { createClient, type User } from '@supabase/supabase-js';
import { appRuntimeConfig } from '../config/runtime-config';
import { findMockProfileByEmail, mockProfiles, registerMockProfile } from '../data/mock-data';
import type { AccountType, ActiveProfile } from '../models/domain.models';

type PublicAccountType = Extract<AccountType, 'visitor' | 'house-admin'>;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'flatsharing-auth-profile';
  private readonly guestProfile: ActiveProfile = {
    id: 'guest-visitor',
    name: 'Visitante',
    email: '',
    accountType: 'visitor'
  };
  private readyResolver: (() => void) | null = null;
  private readonly readyPromise = new Promise<void>((resolve) => {
    this.readyResolver = resolve;
  });

  readonly profiles = mockProfiles;
  readonly isSupabaseConfigured = Boolean(appRuntimeConfig.supabaseUrl && appRuntimeConfig.supabaseAnonKey);
  readonly isReady = signal(!this.isSupabaseConfigured);
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
    ? createClient(appRuntimeConfig.supabaseUrl, appRuntimeConfig.supabaseAnonKey)
    : null;

  constructor() {
    if (!this.supabase) {
      this.markReady();
      return;
    }

    void this.restoreSupabaseSession();
    this.supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        this.sessionProfile.set(null);
        this.clearStoredProfile();
        this.markReady();
        return;
      }

      const profile = this.profileFromSupabaseUser(session.user);
      this.sessionProfile.set(profile);
      this.storeProfile(profile);
      void this.syncProfileRecord(profile);
      this.markReady();
    });
  }

  async waitUntilReady() {
    await this.readyPromise;
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

  async signInWithPassword(email: string, password: string, accountType?: PublicAccountType) {
    if (!this.supabase) {
      if (password !== '123456') {
        return {
          mock: true,
          error: { message: 'Use a senha padrao 123456 no modo local.' }
        };
      }

      const existingProfile = findMockProfileByEmail(email);
      const profile = existingProfile ?? registerMockProfile(email, undefined, accountType ?? 'visitor');
      this.sessionProfile.set(profile);
      this.storeProfile(profile);
      this.markReady();

      return { mock: true, user: profile };
    }

    const result = await this.supabase.auth.signInWithPassword({ email, password });

    if (!result.error && result.data.user) {
      await this.syncSupabaseProfile(result.data.user, accountType ?? 'visitor');
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
      this.markReady();

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
      this.markReady();
      return;
    }

    await this.supabase.auth.signOut();
    this.sessionProfile.set(null);
    this.clearStoredProfile();
    this.markReady();
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
      this.markReady();
      return;
    }

    const { data } = await this.supabase.auth.getSession();
    if (data.session?.user) {
      const profile = await this.syncSupabaseProfile(data.session.user);
      this.sessionProfile.set(profile);
      this.storeProfile(profile);
      this.markReady();
      return;
    }

    this.sessionProfile.set(null);
    this.clearStoredProfile();
    this.markReady();
  }

  private async syncSupabaseProfile(user: User, fallbackAccountType: PublicAccountType = 'visitor') {
    if (!this.supabase) {
      return this.guestProfile;
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
    await this.syncProfileRecord(profile);
    this.sessionProfile.set(profile);
    this.storeProfile(profile);
    return profile;
  }

  private async syncProfileRecord(profile: ActiveProfile) {
    if (!this.supabase) {
      return;
    }

    const { error } = await this.supabase.from('profiles').upsert(
      {
        id: profile.id,
        name: profile.name,
        email: profile.email
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.error('Profile sync failed', error);
    }
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

  private markReady() {
    if (!this.isReady()) {
      this.isReady.set(true);
    }

    this.readyResolver?.();
    this.readyResolver = null;
  }
}
