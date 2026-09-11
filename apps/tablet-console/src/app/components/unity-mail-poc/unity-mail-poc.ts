import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type TabName = 'Contact Requests' | 'Quarantine Queue' | 'Policy Configuration';
type Contact = { id: string; name: string; relationship: string; reason: string; status: 'pending' | 'approved' };
type MailItem = { id: string; from: string; to: string; subject: string; body: string; status: 'Delivered' | 'Quarantine' | 'Reviewed'; note: string };
type AuditEntry = { id: string; time: string; actor: string; action: string; outcome: string };

type PolicyConfig = {
  keywordDetection: boolean;
  sentimentAnalysis: boolean;
  imageVideoModeration: boolean;
  autoRelease: boolean;
};

@Component({
  selector: 'app-unity-mail-poc',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="unity-mail-poc">
      <div class="unity-mail-header">
        <div>
          <p class="eyebrow">UNITY MAIL / AI TRUST LAYER</p>
          <h2>Facility Portal + Message Flow Review</h2>
        </div>
        <div class="trust-badge">{{ trustLabel() }}</div>
      </div>

      <div class="unity-mail-body">
        <div class="portal-panel">
          <div class="tabs">
            <button
              *ngFor="let tab of tabs"
              type="button"
              class="tab-button"
              [class.active]="activeTab() === tab"
              (click)="activeTab.set(tab)"
            >
              {{ tab }}
              <span *ngIf="tab === 'Contact Requests'">({{ pendingRequests().length }})</span>
              <span *ngIf="tab === 'Quarantine Queue'">({{ quarantine().length }})</span>
            </button>
          </div>

          <div class="panel-content">
            <ng-container *ngIf="activeTab() === 'Contact Requests'">
              <div class="section-header">
                <h3>Pending Family & Friends</h3>
                <span>FE-02 approval required</span>
              </div>

              <div class="request-list">
                <article class="request-card" *ngFor="let contact of pendingRequests()">
                  <div>
                    <h4>{{ contact.name }}</h4>
                    <p>{{ contact.relationship }}</p>
                    <small>{{ contact.reason }}</small>
                  </div>
                  <button type="button" (click)="approveContact(contact.id)">Approve</button>
                </article>
              </div>

              <div class="approved-box">
                <h4>Approved Contacts</h4>
                <ul>
                  <li *ngFor="let contact of approvedContacts()">
                    <strong>{{ contact.name }}</strong>
                    <span>{{ contact.relationship }}</span>
                  </li>
                </ul>
              </div>
            </ng-container>

            <ng-container *ngIf="activeTab() === 'Quarantine Queue'">
              <div class="section-header">
                <h3>Facility Review Queue</h3>
                <span>FE-06 / NFE-04</span>
              </div>

              <div class="quarantine-list">
                <article class="quarantine-card" *ngFor="let item of quarantine()">
                  <div class="quarantine-top">
                    <strong>{{ item.from }}</strong>
                    <span>{{ item.status }}</span>
                  </div>
                  <p>{{ item.subject }}</p>
                  <small>{{ item.body }}</small>
                  <div class="risk-tags">
                    <span>{{ item.note }}</span>
                  </div>
                  <div class="quarantine-actions">
                    <button class="release" type="button" (click)="releaseMessage(item.id)">Release</button>
                    <button class="block" type="button" (click)="blockMessage(item.id)">Block</button>
                  </div>
                </article>
              </div>
            </ng-container>

            <ng-container *ngIf="activeTab() === 'Policy Configuration'">
              <div class="section-header">
                <h3>Policy Controls</h3>
                <span>Phased trust model</span>
              </div>

              <div class="policy-list">
                <label class="policy-row">
                  <span>Keyword detection</span>
                  <input type="checkbox" [ngModel]="policy().keywordDetection" (ngModelChange)="updatePolicy('keywordDetection', $event)" />
                </label>
                <label class="policy-row">
                  <span>Sentiment analysis</span>
                  <input type="checkbox" [ngModel]="policy().sentimentAnalysis" (ngModelChange)="updatePolicy('sentimentAnalysis', $event)" />
                </label>
                <label class="policy-row">
                  <span>Image / video moderation</span>
                  <input type="checkbox" [ngModel]="policy().imageVideoModeration" (ngModelChange)="updatePolicy('imageVideoModeration', $event)" />
                </label>
                <label class="policy-row">
                  <span>Auto-release</span>
                  <input type="checkbox" [ngModel]="policy().autoRelease" (ngModelChange)="updatePolicy('autoRelease', $event)" />
                </label>
              </div>

              <div class="policy-summary">
                <h4>Trust posture</h4>
                <p>
                  The system assumes a limited trust state until the approval gate and AI checks are satisfied.
                  Each toggle shifts how aggressively the mail layer intervenes before release.
                </p>
              </div>
            </ng-container>
          </div>
        </div>

        <aside class="mailbox-panel">
          <div class="mailbox-header">
            <h3>II Mailbox</h3>
            <span>Tablet view</span>
          </div>

          <div class="mailbox-controls">
            <label>
              <span>To</span>
              <select [ngModel]="recipient()" (ngModelChange)="recipient.set($event)">
                <option value="">Choose approved contact</option>
                <option *ngFor="let contact of approvedContacts()" [value]="contact.name">{{ contact.name }}</option>
              </select>
            </label>

            <label>
              <span>Subject</span>
              <input type="text" [ngModel]="subject()" (ngModelChange)="subject.set($event)" />
            </label>

            <label>
              <span>Message</span>
              <textarea rows="5" [ngModel]="body()" (ngModelChange)="body.set($event)"></textarea>
            </label>
          </div>

          <div class="mail-actions">
            <button type="button" class="primary" (click)="sendMessage()">Send to review</button>
            <button type="button" class="secondary" (click)="loadSafeDraft()">Safe draft</button>
            <button type="button" class="secondary" (click)="loadFlaggedDraft()">Flagged draft</button>
          </div>

          <div class="triage-box">
            <h4>AI triage</h4>
            <p>{{ lastTriage() }}</p>
          </div>

          <div class="mail-list">
            <h4>Recent mail</h4>
            <article class="mail-item" *ngFor="let item of mailboxMessages()">
              <div class="mail-row">
                <strong>{{ item.from }}</strong>
                <span class="status" [class.live]="item.status === 'Delivered'" [class.review]="item.status !== 'Delivered'">{{ item.status }}</span>
              </div>
              <small>{{ item.subject }}</small>
            </article>
          </div>
        </aside>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        margin-top: 24px;
      }

      * { box-sizing: border-box; }

      .unity-mail-poc {
        background: linear-gradient(180deg, #0e1628 0%, #121b2d 100%);
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 22px;
        padding: 28px;
        color: #e2e8f0;
        box-shadow: 0 20px 40px rgba(15, 23, 42, 0.35);
      }

      .unity-mail-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 22px;
      }

      .eyebrow {
        margin: 0 0 8px;
        font-size: 11px;
        letter-spacing: 0.18em;
        color: #7dd3fc;
      }

      h2 {
        margin: 0;
        font-size: clamp(24px, 2vw, 34px);
        line-height: 1.2;
      }

      .trust-badge {
        background: rgba(34, 197, 94, 0.14);
        border: 1px solid rgba(74, 222, 128, 0.4);
        color: #bbf7d0;
        border-radius: 999px;
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 700;
      }

      .unity-mail-body {
        display: grid;
        grid-template-columns: 1.4fr 1fr;
        gap: 22px;
      }

      .portal-panel,
      .mailbox-panel {
        background: rgba(15, 23, 42, 0.82);
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 18px;
        overflow: hidden;
      }

      .tabs {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        border-bottom: 1px solid rgba(148, 163, 184, 0.12);
      }

      .tab-button {
        border: none;
        background: transparent;
        color: #cbd5e1;
        padding: 16px 14px;
        font-weight: 700;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        transition: all 0.2s ease;
      }

      .tab-button.active {
        background: rgba(125, 211, 252, 0.12);
        color: #e0f2fe;
        border-bottom-color: #38bdf8;
      }

      .panel-content {
        padding: 20px;
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 16px;
      }

      .section-header h3,
      .mailbox-header h3,
      .triage-box h4,
      .mail-list h4,
      .approved-box h4,
      .policy-summary h4 {
        margin: 0;
      }

      .section-header span,
      .mailbox-header span,
      .approved-box li span,
      .mail-item small,
      .quarantine-card p,
      .request-card p,
      .request-card small,
      .policy-summary p,
      .triage-box p {
        color: #cbd5e1;
      }

      .request-list,
      .quarantine-list,
      .mail-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .request-card,
      .quarantine-card,
      .mail-item {
        background: rgba(15, 23, 42, 0.9);
        border: 1px solid rgba(148, 163, 184, 0.12);
        border-radius: 12px;
        padding: 14px;
      }

      .request-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .request-card h4, .quarantine-card strong, .mail-item strong {
        margin: 0 0 4px;
        font-size: 15px;
      }

      .request-card button,
      .mail-actions button,
      .quarantine-actions button,
      .mailbox-panel button {
        border: none;
        cursor: pointer;
        border-radius: 10px;
        padding: 10px 12px;
        font-weight: 700;
      }

      .request-card button,
      .mail-actions .primary,
      .quarantine-actions .release {
        background: linear-gradient(135deg, #22c55e, #16a34a);
        color: #ecfdf5;
      }

      .quarantine-actions .block,
      .mail-actions .secondary {
        background: rgba(239, 68, 68, 0.14);
        color: #fecaca;
        border: 1px solid rgba(248, 113, 113, 0.34);
      }

      .approved-box {
        margin-top: 22px;
        background: rgba(15, 23, 42, 0.9);
        border: 1px solid rgba(148, 163, 184, 0.14);
        border-radius: 12px;
        padding: 14px;
      }

      .approved-box ul {
        list-style: none;
        padding: 0;
        margin: 14px 0 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .approved-box li {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        border-bottom: 1px solid rgba(148, 163, 184, 0.14);
        padding-bottom: 8px;
      }

      .quarantine-top,
      .mail-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .risk-tags {
        margin: 12px 0;
      }

      .risk-tags span {
        display: inline-block;
        background: rgba(248, 113, 113, 0.12);
        color: #fecaca;
        border: 1px solid rgba(248, 113, 113, 0.3);
        border-radius: 999px;
        padding: 5px 8px;
        font-size: 11px;
      }

      .quarantine-actions,
      .mail-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .mailbox-panel {
        padding: 20px;
      }

      .mailbox-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 14px;
      }

      .mailbox-controls {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .mailbox-controls label {
        display: flex;
        flex-direction: column;
        gap: 8px;
        color: #dbeafe;
        font-size: 12px;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      input,
      select,
      textarea {
        width: 100%;
        border: 1px solid rgba(148, 163, 184, 0.2);
        background: rgba(15, 23, 42, 0.95);
        color: #f8fafc;
        border-radius: 10px;
        padding: 10px 12px;
      }

      textarea {
        resize: vertical;
      }

      .mail-actions {
        margin-top: 14px;
      }

      .triage-box,
      .policy-summary {
        margin-top: 18px;
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(148, 163, 184, 0.14);
        border-radius: 12px;
        padding: 14px;
      }

      .mail-list {
        margin-top: 20px;
      }

      .status {
        font-size: 10px;
        padding: 5px 8px;
        border-radius: 999px;
        font-weight: 700;
        text-transform: uppercase;
      }

      .status.live {
        background: rgba(34, 197, 94, 0.12);
        color: #bbf7d0;
      }

      .status.review {
        background: rgba(250, 204, 21, 0.12);
        color: #fef3c7;
      }

      .policy-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .policy-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(148, 163, 184, 0.12);
        border-radius: 12px;
        padding: 12px 14px;
      }

      .policy-row input {
        width: 18px;
        height: 18px;
      }

      @media (max-width: 980px) {
        .unity-mail-body {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class UnityMailPocComponent {
  protected readonly tabs: TabName[] = ['Contact Requests', 'Quarantine Queue', 'Policy Configuration'];
  protected readonly activeTab = signal<TabName>('Contact Requests');
  protected readonly policy = signal<PolicyConfig>({
    keywordDetection: true,
    sentimentAnalysis: true,
    imageVideoModeration: true,
    autoRelease: false
  });
  protected readonly pendingRequests = signal<Contact[]>([
    { id: 'REQ-104', name: 'Maria Lopez', relationship: 'Family Friend', reason: 'Weekend visit approval', status: 'pending' },
    { id: 'REQ-105', name: 'Theo Reed', relationship: 'Trusted Visitor', reason: 'Medical appointment escort', status: 'pending' },
    { id: 'REQ-106', name: 'Aisha Brown', relationship: 'Family Friend', reason: 'Family update contact', status: 'pending' }
  ]);
  protected readonly approvedContacts = signal<Contact[]>([
    { id: 'APP-100', name: 'Jordan Lee', relationship: 'Resident', reason: 'Primary account', status: 'approved' },
    { id: 'APP-101', name: 'Patricia Reed', relationship: 'Family Friend', reason: 'Approved for routine mail', status: 'approved' },
    { id: 'APP-102', name: 'Marcus Hill', relationship: 'Case Worker', reason: 'Facility support contact', status: 'approved' }
  ]);
  protected readonly quarantine = signal<MailItem[]>([
    {
      id: 'Q-221',
      from: 'Marcus Hill',
      to: 'Jordan Lee',
      subject: 'Urgent release request',
      body: 'Need the medication list sent today before the 2pm review. The message is urgent and time sensitive.',
      status: 'Quarantine',
      note: 'Sentiment + keyword trigger'
    },
    {
      id: 'Q-222',
      from: 'Patricia Reed',
      to: 'Jordan Lee',
      subject: 'Media attachment',
      body: 'Attached a video update from the family reunion with a few clips still in the queue.',
      status: 'Quarantine',
      note: 'Content moderation review'
    }
  ]);
  protected readonly mailboxMessages = signal<MailItem[]>([
    {
      id: 'M-301',
      from: 'Patricia Reed',
      to: 'Jordan Lee',
      subject: 'Morning update',
      body: 'All good here, family is doing well.',
      status: 'Delivered',
      note: 'Safe content'
    },
    {
      id: 'M-302',
      from: 'Marcus Hill',
      to: 'Jordan Lee',
      subject: 'Visit schedule',
      body: 'Confirmed the Friday visit at 4:15 pm.',
      status: 'Delivered',
      note: 'Safe content'
    }
  ]);
  protected readonly auditTrail = signal<AuditEntry[]>([
    { id: 'A-1', time: '09:12', actor: 'AI Triage', action: 'Safe delivery', outcome: 'Delivered to resident' },
    { id: 'A-2', time: '09:27', actor: 'Facility Staff', action: 'Quarantine review', outcome: 'Message released with note' }
  ]);
  protected readonly recipient = signal('');
  protected readonly subject = signal('Morning update');
  protected readonly body = signal('Hi Jordan, all is well here and we are looking forward to the next visit.');
  protected readonly lastTriage = signal('AI triage ready. Waiting on the next message.');

  protected trustLabel(): string {
    const cfg = this.policy();
    const enabledCount = Number(cfg.keywordDetection) + Number(cfg.sentimentAnalysis) + Number(cfg.imageVideoModeration) + Number(cfg.autoRelease);
    if (enabledCount >= 3) return 'Trust: Enhanced / monitored';
    if (enabledCount >= 1) return 'Trust: Phased / limited';
    return 'Trust: Basic / manual review';
  }

  protected updatePolicy(key: keyof PolicyConfig, value: boolean) {
    const current = this.policy();
    this.policy.set({ ...current, [key]: value });
    this.lastTriage.set(`Policy updated: ${key} is now ${value ? 'enabled' : 'disabled'}.`);
  }

  protected approveContact(contactId: string) {
    const pending = this.pendingRequests();
    const contact = pending.find((item) => item.id === contactId);
    if (!contact) return;

    this.pendingRequests.set(pending.filter((item) => item.id !== contactId));
    this.approvedContacts.set([
      ...this.approvedContacts(),
      { ...contact, status: 'approved' }
    ]);
    this.lastTriage.set(`Contact approved: ${contact.name} can now send and receive mail.`);
    this.auditTrail.set([
      {
        id: `A-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actor: 'Facility Portal',
        action: 'FE-02 approval',
        outcome: `${contact.name} added to approved contacts`
      },
      ...this.auditTrail()
    ]);
  }

  protected loadSafeDraft() {
    this.recipient.set('Patricia Reed');
    this.subject.set('Good morning');
    this.body.set('Hi Jordan, the family is doing well and we are looking forward to the weekend visit.');
    this.lastTriage.set('Draft loaded: clean language, standard family check-in.');
  }

  protected loadFlaggedDraft() {
    this.recipient.set('Marcus Hill');
    this.subject.set('Immediate action required');
    this.body.set('We need the passcode sent today before the visit because there is a serious issue and the plan must change immediately.');
    this.lastTriage.set('Draft loaded: high-risk keywords and urgency pattern detected.');
  }

  protected sendMessage() {
    const recipient = this.recipient();
    const subject = this.subject().trim();
    const body = this.body().trim();
    const approved = this.approvedContacts().some((contact) => contact.name === recipient);

    if (!recipient || !approved) {
      this.lastTriage.set('Blocked: only approved contacts can send mail through the II mailbox.');
      return;
    }

    const triage = this.runTriage(body, this.policy());
    const newMail: MailItem = {
      id: `M-${Date.now()}`,
      from: recipient,
      to: 'Jordan Lee',
      subject: subject || 'No subject',
      body,
      status: triage.safe ? 'Delivered' : 'Quarantine',
      note: triage.reason
    };

    if (triage.safe) {
      this.mailboxMessages.set([newMail, ...this.mailboxMessages()]);
      this.lastTriage.set(`Clean message delivered automatically. ${triage.reason}`);
      this.auditTrail.set([
        { id: `A-${Date.now()}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), actor: 'AI Triage', action: 'Auto-delivery', outcome: 'Message sent without escalation' },
        ...this.auditTrail()
      ]);
      return;
    }

    this.quarantine.set([newMail, ...this.quarantine()]);
    this.lastTriage.set(`Message quarantined. ${triage.reason}`);
    this.auditTrail.set([
      { id: `A-${Date.now()}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), actor: 'AI Triage', action: 'Quarantine', outcome: `Escalated for review: ${triage.reason}` },
      ...this.auditTrail()
    ]);
  }

  protected releaseMessage(id: string) {
    const message = this.quarantine().find((item) => item.id === id);
    if (!message) return;

    const released: MailItem = { ...message, status: 'Reviewed', note: 'Released by facility staff' };
    this.quarantine.set(this.quarantine().filter((item) => item.id !== id));
    this.mailboxMessages.set([released, ...this.mailboxMessages()]);
    this.lastTriage.set(`Quarantined message released for delivery by facility staff.`);
    this.auditTrail.set([
      { id: `A-${Date.now()}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), actor: 'Facility Staff', action: 'Release', outcome: `Message ${message.subject} approved` },
      ...this.auditTrail()
    ]);
  }

  protected blockMessage(id: string) {
    const message = this.quarantine().find((item) => item.id === id);
    if (!message) return;

    this.quarantine.set(this.quarantine().filter((item) => item.id !== id));
    this.lastTriage.set(`Quarantined message blocked and added to the audit record.`);
    this.auditTrail.set([
      { id: `A-${Date.now()}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), actor: 'Facility Staff', action: 'Block', outcome: `Message ${message.subject} rejected` },
      ...this.auditTrail()
    ]);
  }

  private runTriage(body: string, config: PolicyConfig) {
    const triggers: string[] = [];
    const keywordPattern = /drugs|contraband|weapon|escape|attack|blackmail|threat|urgent|passcode/i;
    const sentimentPattern = /urgent|immediately|serious|panic|danger|angry|must|now/i;
    const mediaPattern = /video|image|attachment|media|graphic/i;

    if (config.keywordDetection && keywordPattern.test(body)) triggers.push('keyword');
    if (config.sentimentAnalysis && sentimentPattern.test(body)) triggers.push('sentiment');
    if (config.imageVideoModeration && mediaPattern.test(body)) triggers.push('media');

    const safe = triggers.length === 0;
    const reason = safe
      ? 'No policy violations detected; message passed the AI trust checks.'
      : `Flagged for ${triggers.join(', ')} checks. Manual review is required.`;

    if (!safe && config.autoRelease && triggers.length === 1 && triggers[0] === 'sentiment') {
      return { safe: true, reason: 'Auto-release policy allowed a single low-risk sentiment exception.' };
    }

    return { safe, reason };
  }
}
