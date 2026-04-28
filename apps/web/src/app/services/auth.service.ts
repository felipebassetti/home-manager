import { Injectable, computed, signal } from '@angular/core';
import { createClient, type User } from '@supabase/supabase-js';
import { appRuntimeConfig } from '../config/runtime-config';
import type { AccountType, ActiveProfile, SiteRole } from '../models/domain.models';

type PublicAccountType = Extract<AccountType, 'visitor' | 'house-admin'>;
type StoredProfile = Partial<ActiveProfile> & Pick<ActiveProfile, 'id' | 'name' | 'email'>;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'flatsharing-auth-profile';
  private readonly guestProfile: ActiveProfile = {
    id: 'guest-visitor',
    name: 'Visitante',
    email: '',
    accountType: 'visitor',
    siteRoles: [],
    managedHouseIds: [],
    memberHouseIds: []
  };
  private readyResolver: (() => void) | null = null;
  private readonly readyPromise = new Promise<void>((resolve) => {
    this.readyResolver = resolve;
  });

  readonly profiles: ActiveProfile[] = [];
  readonly isSupabaseConfigured = Boolean(appRuntimeConfig.supabaseUrl && appRuntimeConfig.supabaseAnonKey);
  readonly isReady = signal(!this.isSupabaseConfigured);
  readonly sessionProfile = signal<ActiveProfile | null>(this.readStoredProfile());
  readonly accessToken = signal<string | null>(null);
  readonly activeProfile = computed(() => this.sessionProfile() ?? this.guestProfile);
  readonly isAuthenticated = computed(() => this.sessionProfile() !== null);
  readonly accountLabel = computed(() => {
    if (!this.isAuthenticated()) {
      return 'Entrar para candidatar';
    }

    return this.profileRoleLabel(this.activeProfile().accountType);
  });

  readonly canAccessManagement = computed(() => {
    if (!this.isAuthenticated()) {
      return false;
    }

    const profile = this.activeProfile();
    return profile.siteRoles.length > 0 || profile.managedHouseIds.length > 0 || profile.accountType === 'house-admin';
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
      this.accessToken.set(session?.access_token ?? null);

      if (!session?.user) {
        this.sessionProfile.set(null);
        this.clearStoredProfile();
        this.markReady();
        return;
      }

      void this.setSessionProfileFromUser(session.user);
    });
  }

  async waitUntilReady() {
    await this.readyPromise;
  }

  hasSiteRole(role: SiteRole, profile: ActiveProfile = this.activeProfile()) {
    return profile.siteRoles.includes(role);
  }

  isSiteAdmin(profile: ActiveProfile = this.activeProfile()) {
    return this.hasSiteRole('site_admin', profile);
  }

  managesHouse(houseId: string, profile: ActiveProfile = this.activeProfile()) {
    return this.isSiteAdmin(profile) || profile.managedHouseIds.includes(houseId);
  }

  belongsToHouse(houseId: string, profile: ActiveProfile = this.activeProfile()) {
    return this.managesHouse(houseId, profile) || profile.memberHouseIds.includes(houseId);
  }

  async refreshAccess() {
    if (!this.supabase) {
      return;
    }

    const { data } = await this.supabase.auth.getUser();
    if (!data.user) {
      return;
    }

    await this.setSessionProfileFromUser(data.user);
  }

  setActiveProfile(profileId: string) {
    void profileId;
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
    const normalizedEmail = this.normalizeEmail(email);

    if (!this.supabase) {
      void password;
      void accountType;
      return {
        error: { message: 'Supabase auth nao esta configurado neste ambiente.' }
      };
    }

    const result = await this.supabase.auth.signInWithPassword({ email: normalizedEmail, password });

    if (!result.error && result.data.user) {
      await this.setSessionProfileFromUser(result.data.user, accountType ?? 'visitor');
    }

    return result;
  }

  async signUpProfile(name: string, email: string, password: string, accountType: PublicAccountType = 'visitor') {
    const normalizedEmail = this.normalizeEmail(email);

    if (!this.supabase) {
      void name;
      void password;
      void accountType;
      return {
        error: { message: 'Supabase auth nao esta configurado neste ambiente.' }
      };
    }

    const result = await this.supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { name, account_type: accountType }
      }
    });

    if (!result.error && result.data.user && result.data.session) {
      await this.setSessionProfileFromUser(result.data.user, accountType);
    }

    return result;
  }

  async signUpVisitor(name: string, email: string, password: string) {
    return this.signUpProfile(name, email, password, 'visitor');
  }

  async signOut() {
    if (!this.supabase) {
      this.sessionProfile.set(null);
      this.accessToken.set(null);
      this.clearStoredProfile();
      this.markReady();
      return;
    }

    await this.supabase.auth.signOut();
    this.sessionProfile.set(null);
    this.accessToken.set(null);
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
      return this.normalizeStoredProfile(JSON.parse(storedValue) as StoredProfile);
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
    this.accessToken.set(data.session?.access_token ?? null);

    if (data.session?.user) {
      await this.setSessionProfileFromUser(data.session.user);
      this.markReady();
      return;
    }

    this.sessionProfile.set(null);
    this.clearStoredProfile();
    this.markReady();
  }

  private async setSessionProfileFromUser(user: User, fallbackAccountType: PublicAccountType = 'visitor') {
    const profile = await this.loadSupabaseProfile(user, fallbackAccountType);
    this.sessionProfile.set(profile);
    this.storeProfile(profile);
    this.markReady();
    return profile;
  }

  private async loadSupabaseProfile(user: User, fallbackAccountType: PublicAccountType) {
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

    const fallbackProfile = this.baseProfileFromSupabaseUser(syncedUser);
    await this.syncProfileRecord(fallbackProfile);

    const [{ data: profileData, error: profileError }, { data: roleRows, error: rolesError }, { data: memberRows, error: membersError }] =
      await Promise.all([
        this.supabase.from('profiles').select('name, email').eq('id', syncedUser.id).maybeSingle(),
        this.supabase.from('user_roles').select('role').eq('user_id', syncedUser.id),
        this.supabase.from('house_members').select('house_id, role').eq('user_id', syncedUser.id).eq('status', 'active')
      ]);

    if (profileError) {
      console.error('Profile fetch failed', profileError);
    }

    if (rolesError) {
      console.error('User roles fetch failed', rolesError);
    }

    if (membersError) {
      console.error('House memberships fetch failed', membersError);
    }

    const siteRoles = Array.from(
      new Set(
        ((roleRows ?? []) as Array<{ role?: unknown }>)
          .map((item) => item.role)
          .filter((role): role is SiteRole => role === 'site_admin' || role === 'site_operator')
      )
    );
    const managedHouseIds = Array.from(
      new Set(
        ((memberRows ?? []) as Array<{ house_id?: unknown; role?: unknown }>)
          .filter((item) => item.role === 'admin')
          .map((item) => String(item.house_id))
      )
    );
    const memberHouseIds = Array.from(
      new Set(((memberRows ?? []) as Array<{ house_id?: unknown }>).map((item) => String(item.house_id)))
    );

    return {
      id: syncedUser.id,
      name: this.readProfileName(profileData?.name, fallbackProfile.name),
      email: this.normalizeEmail(profileData?.email ?? fallbackProfile.email),
      accountType: this.deriveAccountType(
        siteRoles,
        managedHouseIds,
        memberHouseIds,
        this.normalizeAccountType(
          syncedUser.user_metadata?.['account_type'] ?? syncedUser.user_metadata?.['accountType'] ?? syncedUser.user_metadata?.['role'],
          fallbackAccountType
        )
      ),
      siteRoles,
      managedHouseIds,
      memberHouseIds
    } satisfies ActiveProfile;
  }

  private async syncProfileRecord(profile: Pick<ActiveProfile, 'id' | 'name' | 'email'>) {
    if (!this.supabase) {
      return;
    }

    const { error } = await this.supabase.from('profiles').upsert(
      {
        id: profile.id,
        name: profile.name,
        email: this.normalizeEmail(profile.email)
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.error('Profile sync failed', error);
    }
  }

  private baseProfileFromSupabaseUser(user: User) {
    const metadata = user.user_metadata ?? {};
    const email = this.normalizeEmail(user.email ?? '');
    const name = this.readMetadataString(metadata['name']) || this.readMetadataString(metadata['full_name']) || this.nameFromEmail(email);

    return {
      id: user.id,
      name,
      email
    };
  }

  private normalizeStoredProfile(profile: StoredProfile): ActiveProfile {
    const siteRoles = Array.isArray(profile.siteRoles)
      ? profile.siteRoles.filter((role): role is SiteRole => role === 'site_admin' || role === 'site_operator')
      : [];
    const managedHouseIds = Array.isArray(profile.managedHouseIds) ? profile.managedHouseIds.map(String) : [];
    const memberHouseIds = Array.isArray(profile.memberHouseIds) ? profile.memberHouseIds.map(String) : [];
    const fallbackAccountType = this.normalizeAccountType(profile.accountType, 'visitor');

    return {
      id: profile.id,
      name: profile.name,
      email: this.normalizeEmail(profile.email),
      accountType: this.deriveAccountType(siteRoles, managedHouseIds, memberHouseIds, fallbackAccountType),
      siteRoles,
      managedHouseIds,
      memberHouseIds
    };
  }

  private deriveAccountType(
    siteRoles: SiteRole[],
    managedHouseIds: string[],
    memberHouseIds: string[],
    fallback: PublicAccountType | AccountType
  ): AccountType {
    if (siteRoles.includes('site_admin')) {
      return 'super-admin';
    }

    if (managedHouseIds.length > 0) {
      return 'house-admin';
    }

    if (memberHouseIds.length > 0) {
      return 'member';
    }

    return fallback === 'super-admin' || fallback === 'member' || fallback === 'house-admin' ? fallback : 'visitor';
  }

  private hasAccountTypeMetadata(user: User) {
    const metadata = user.user_metadata ?? {};
    return Boolean(metadata['account_type'] ?? metadata['accountType'] ?? metadata['role']);
  }

  private normalizeAccountType(value: unknown, fallback: PublicAccountType | AccountType): AccountType {
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

  private readProfileName(value: unknown, fallback: string) {
    const name = typeof value === 'string' ? value.trim() : '';
    return name || fallback;
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

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private markReady() {
    if (!this.isReady()) {
      this.isReady.set(true);
    }

    this.readyResolver?.();
    this.readyResolver = null;
  }
}
