import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import {
  CleanPlan, PaginatedResponse, OverduePlan,
  TestReport, Notice
} from '../models/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PlanService {
  constructor(private api: ApiService) {}

  list(params: { status?: string; tank_id?: number; page?: number; page_size?: number }): Observable<PaginatedResponse<CleanPlan>> {
    return this.api.get('/plans', params);
  }

  get(id: number): Observable<{ data: CleanPlan }> {
    return this.api.get(`/plans/${id}`);
  }

  create(plan: Partial<CleanPlan>): Observable<{ data: CleanPlan }> {
    return this.api.post('/plans', plan);
  }

  update(id: number, plan: Partial<CleanPlan>): Observable<{ message: string }> {
    return this.api.put(`/plans/${id}`, plan);
  }

  publishNotice(id: number, notice: Partial<Notice>): Observable<{ data: Notice }> {
    return this.api.post(`/plans/${id}/notice`, notice);
  }

  startCleaning(id: number, personnelIds: number[]): Observable<{ message: string }> {
    return this.api.post(`/plans/${id}/start`, { personnel_ids: personnelIds });
  }

  submitTestReport(id: number, report: Partial<TestReport>): Observable<{ data: TestReport }> {
    return this.api.post(`/plans/${id}/test-report`, report);
  }

  resumeWater(id: number): Observable<{ message: string }> {
    return this.api.post(`/plans/${id}/resume-water`, {});
  }

  cancel(id: number): Observable<{ message: string }> {
    return this.api.post(`/plans/${id}/cancel`, {});
  }

  listOverdue(): Observable<{ data: OverduePlan[] }> {
    return this.api.get('/plans/overdue');
  }
}
