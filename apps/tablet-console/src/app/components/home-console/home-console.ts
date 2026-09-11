import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardMetricsComponent } from '../dashboard-metrics/dashboard-metrics';
import { SecureCallComponent } from '../secure-call/secure-call';

@Component({
  selector: 'app-home-console',
  standalone: true,
  imports: [RouterLink, DashboardMetricsComponent, SecureCallComponent],
  template: `
    <main class="dashboard">
      <header class="header">
        <div class="brand">
          <span class="brand-mark">A</span>
          <div>
            <b>aventiv</b>
            <small>UNITY PLATFORM</small>
          </div>
        </div>
        <div class="system-status"><span></span>All systems operational</div>
      </header>

      <section class="intro">
        <div>
          <p class="eyebrow">THURSDAY, SEPTEMBER 03, 2026</p>
          <h1>Good morning, Jordan<span>.</span></h1>
          <p class="subhead">Here is the latest activity across your tablet network.</p>
        </div>
      </section>

      <div class="unity-mail-launch-row">
        <button type="button" class="unity-mail-launch" [routerLink]="'/unity-mail'">UNITY MAIL / AI TRUST LAYER</button>
      </div>

      <app-dashboard-metrics />
      <app-secure-call />
    </main>
  `,
  styles: [
    `
      .dashboard {
        display: block;
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 22px 0 18px;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .brand-mark {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border-radius: 10px;
        background: linear-gradient(135deg, #38bdf8, #2563eb);
        color: #eff6ff;
        font-weight: 800;
      }

      .brand b,
      .brand small,
      .system-status,
      .eyebrow,
      .subhead,
      h1 {
        color: #e2e8f0;
      }

      .brand small {
        display: block;
        font-size: 10px;
        letter-spacing: 0.16em;
      }

      .system-status {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 9px 12px;
        border-radius: 18px;
        background: rgba(34, 197, 94, 0.1);
        border: 1px solid rgba(34, 197, 94, 0.25);
        font-size: 12px;
      }

      .system-status span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #34d399;
        display: inline-block;
      }

      .intro {
        margin-bottom: 18px;
      }

      .eyebrow {
        margin: 0 0 10px;
        font-size: 12px;
        letter-spacing: 0.16em;
      }

      h1 {
        margin: 0;
        font-size: clamp(28px, 3vw, 44px);
      }

      h1 span {
        color: #38bdf8;
      }

      .subhead {
        margin: 10px 0 0;
        color: #cbd5e1;
        max-width: 640px;
      }

      .unity-mail-launch-row {
        display: flex;
        justify-content: flex-start;
        margin: 18px 0 8px;
      }

      .unity-mail-launch {
        border: none;
        border-radius: 12px;
        padding: 14px 18px;
        background: linear-gradient(135deg, #38bdf8, #2563eb);
        color: #eff6ff;
        font-weight: 800;
        letter-spacing: 0.08em;
        cursor: pointer;
        box-shadow: 0 14px 28px rgba(37, 99, 235, 0.28);
      }

      .unity-mail-launch:hover {
        filter: brightness(1.06);
      }
    `
  ]
})
export class HomeConsoleComponent {}
