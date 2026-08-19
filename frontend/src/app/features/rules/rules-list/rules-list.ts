import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Rule } from '../../../core/models/rule.model';
import { RuleService } from '../../../core/services/rule.service';

@Component({
  selector: 'app-rules-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rules-list.html',
})
export class RulesList {
  private readonly ruleService = inject(RuleService);

  readonly rules = signal<Rule[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);

  constructor() {
    this.fetchRules();
  }

  fetchRules(): void {
    this.loading.set(true);
    this.ruleService.list().subscribe({
      next: (rules) => {
        this.rules.set(rules);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('Impossible de charger le règlement pour le moment.');
        this.loading.set(false);
      },
    });
  }
}