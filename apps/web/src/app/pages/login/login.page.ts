import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotlightCardDirective } from '../../directives/spotlight-card.directive';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, FormsModule, SpotlightCardDirective],
  templateUrl: './login.page.html',
  styleUrl: './login.page.css'
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected email = signal('');
  protected password = signal('123456');
  protected isSubmitting = signal(false);
  protected errorMessage = signal('');

  async submit() {
    this.errorMessage.set('');
    this.isSubmitting.set(true);

    const result = await this.auth.signInWithPassword(this.email().trim(), this.password());
    this.isSubmitting.set(false);

    if ('error' in result && result.error) {
      this.errorMessage.set(result.error.message);
      return;
    }

    const redirectUrl = this.route.snapshot.queryParamMap.get('redirect') || '/applications';
    await this.router.navigateByUrl(redirectUrl);
  }
}
