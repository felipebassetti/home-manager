import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import type { HouseMember } from '../../models/domain.models';

@Component({
  selector: 'app-member-list',
  imports: [CommonModule],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.css'
})
export class MemberListComponent {
  @Input({ required: true }) members: HouseMember[] = [];
}
