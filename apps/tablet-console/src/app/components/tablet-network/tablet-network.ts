import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tablet-network',
  standalone: true,
  imports: [FormsModule],
  template: `<section class="panel network"><div class="panel-title"><div><h2>Tablet network</h2><p>Live device status across your facilities</p></div><label class="search">Search <input [ngModel]="search()" (ngModelChange)="search.set($event)" placeholder="tablet, inmate or site"></label></div><div class="table-wrap"><table><thead><tr><th>DEVICE</th><th>TYPE</th><th>ASSIGNED TO</th><th>SITE</th><th>BATTERY</th><th>STATUS</th></tr></thead><tbody>@for (tablet of filteredTablets; track tablet.id) {<tr><td><b>{{ tablet.id }}</b><small>Last sync 2m ago</small></td><td>{{ tablet.type }}</td><td>{{ tablet.user }}</td><td>{{ tablet.site }}</td><td><div class="battery"><i [style.width.%]="tablet.battery"></i></div>{{ tablet.battery }}%</td><td><span class="state" [class]="tablet.tone"><i></i>{{ tablet.state }}</span></td></tr>}</tbody></table></div></section>`
})
export class TabletNetworkComponent {
  protected readonly search = signal('');
  protected readonly tablets = [
    { id: 'TAB-4821', type: 'Subscriber', user: 'Marcus T.', site: 'Central Jail', battery: 86, state: 'Active', tone: 'green' },
    { id: 'TAB-4818', type: 'Community', user: 'Shared pool', site: 'Central Jail', battery: 64, state: 'Active', tone: 'green' },
    { id: 'TAB-4790', type: 'Subscriber', user: 'D. Williams', site: 'North Annex', battery: 19, state: 'Low battery', tone: 'amber' },
    { id: 'TAB-4772', type: 'Officer', user: 'J. Reynolds', site: 'West Yard', battery: 100, state: 'Offline', tone: 'slate' }
  ];
  protected get filteredTablets() { const query = this.search().toLowerCase(); return this.tablets.filter((tablet) => [tablet.id, tablet.type, tablet.user, tablet.site].some((value) => value.toLowerCase().includes(query))); }
}
