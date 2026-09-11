import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-metrics',
  standalone: true,
  template: `<section class="metrics"><article><label>TABLETS ONLINE <b>+4.8%</b></label><strong>1,284</strong><small>of 1,306 deployed devices</small></article><article><label>ACTIVE SESSIONS <b>+12.2%</b></label><strong>846</strong><small>Across 3 facilities</small></article><article><label>OPEN ORDERS <b class="neutral">Today</b></label><strong>32</strong><small>8 require attention</small></article><article><label>CONTENT DELIVERY <b>+2.1%</b></label><strong>98.7<em>%</em></strong><small>Successful in the last 24 hours</small></article></section>`
})
export class DashboardMetricsComponent {}
