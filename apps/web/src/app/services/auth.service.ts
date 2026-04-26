import { Injectable, computed, signal } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { mockProfiles } from '../data/mock-data';
import type { ActiveProfile } from '../models/domain.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly profiles = mockProfiles;
  readonly isSupabaseConfigured = Boolean(environment.supabaseUrl && environment.supabaseAnonKey);
  readonly activeProfile = signal<ActiveProfile>(mockProfiles[0]);
  readonly accountLabel = computed(() => {
    const type = this.activeProfile().accountType;
    if (type === 'admin') {
      return 'Admin da casa';
    }
    if (type === 'member') {
      return 'Morador';
    }
    return 'Visitante';
  });

  private readonly supabase = this.isSupabaseConfigured
    ? createClient(environment.supabaseUrl, environment.supabaseAnonKey)
    : null;

  setActiveProfile(profileId: string) {
    const profile = this.profiles.find((item) => item.id === profileId);
    if (profile) {
      this.activeProfile.set(profile);
    }
  }

  async signInWithPassword(email: string, password: string) {
    if (!this.supabase) {
      return { mock: true, email, passwordLength: password.length };
    }

    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    if (!this.supabase) {
      return;
    }

    await this.supabase.auth.signOut();
  }
}
