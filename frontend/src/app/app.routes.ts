import { Routes } from '@angular/router';
import { PlanListComponent } from './components/plan-list/plan-list.component';
import { PlanDetailComponent } from './components/plan-detail/plan-detail.component';
import { PersonnelListComponent } from './components/personnel-list/personnel-list.component';
import { ChemicalListComponent } from './components/chemical-list/chemical-list.component';
import { TestReportComponent } from './components/test-report/test-report.component';
import { OverdueMonitorComponent } from './components/overdue-monitor/overdue-monitor.component';
import { TankListComponent } from './components/tank-list/tank-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'plans', pathMatch: 'full' },
  { path: 'plans', component: PlanListComponent },
  { path: 'plans/:id', component: PlanDetailComponent },
  { path: 'tanks', component: TankListComponent },
  { path: 'personnel', component: PersonnelListComponent },
  { path: 'chemicals', component: ChemicalListComponent },
  { path: 'test-reports', component: TestReportComponent },
  { path: 'overdue', component: OverdueMonitorComponent },
];
