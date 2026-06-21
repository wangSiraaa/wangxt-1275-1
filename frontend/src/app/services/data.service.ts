import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { WaterTank, PaginatedResponse, Contractor, CleanPersonnel, CleanChemical, PropertyCompany, TestInstitution } from '../models/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TankService {
  constructor(private api: ApiService) {}
  list(params?: { page?: number; page_size?: number }): Observable<PaginatedResponse<WaterTank>> {
    return this.api.get('/tanks', params);
  }
  get(id: number): Observable<{ data: WaterTank }> {
    return this.api.get(`/tanks/${id}`);
  }
  create(tank: Partial<WaterTank>): Observable<{ data: WaterTank }> {
    return this.api.post('/tanks', tank);
  }
  update(id: number, tank: Partial<WaterTank>): Observable<{ message: string }> {
    return this.api.put(`/tanks/${id}`, tank);
  }
  delete(id: number): Observable<{ message: string }> {
    return this.api.delete(`/tanks/${id}`);
  }
  listOverdue(): Observable<{ data: WaterTank[] }> {
    return this.api.get('/tanks/overdue');
  }
}

@Injectable({ providedIn: 'root' })
export class ContractorService {
  constructor(private api: ApiService) {}
  list(params?: { page?: number; page_size?: number }): Observable<PaginatedResponse<Contractor>> {
    return this.api.get('/contractors', params);
  }
  create(c: Partial<Contractor>): Observable<{ data: Contractor }> {
    return this.api.post('/contractors', c);
  }
  update(id: number, c: Partial<Contractor>): Observable<{ message: string }> {
    return this.api.put(`/contractors/${id}`, c);
  }
}

@Injectable({ providedIn: 'root' })
export class PersonnelService {
  constructor(private api: ApiService) {}
  list(params?: { contractor_id?: number; page?: number; page_size?: number }): Observable<PaginatedResponse<CleanPersonnel>> {
    return this.api.get('/personnel', params);
  }
  create(p: Partial<CleanPersonnel>): Observable<{ data: CleanPersonnel }> {
    return this.api.post('/personnel', p);
  }
  update(id: number, p: Partial<CleanPersonnel>): Observable<{ message: string }> {
    return this.api.put(`/personnel/${id}`, p);
  }
  checkHealthCert(id: number): Observable<{ valid: boolean; expire_date: string | null }> {
    return this.api.get(`/personnel/${id}/health-cert`);
  }
}

@Injectable({ providedIn: 'root' })
export class ChemicalService {
  constructor(private api: ApiService) {}
  list(params?: { contractor_id?: number; plan_id?: number; page?: number; page_size?: number }): Observable<PaginatedResponse<CleanChemical>> {
    return this.api.get('/chemicals', params);
  }
  create(c: Partial<CleanChemical>): Observable<{ data: CleanChemical }> {
    return this.api.post('/chemicals', c);
  }
}

@Injectable({ providedIn: 'root' })
export class PropertyCompanyService {
  constructor(private api: ApiService) {}
  list(): Observable<{ data: PropertyCompany[] }> {
    return this.api.get('/property-companies');
  }
  create(pc: Partial<PropertyCompany>): Observable<{ data: PropertyCompany }> {
    return this.api.post('/property-companies', pc);
  }
}

@Injectable({ providedIn: 'root' })
export class TestInstitutionService {
  constructor(private api: ApiService) {}
  list(): Observable<{ data: TestInstitution[] }> {
    return this.api.get('/test-institutions');
  }
  create(ti: Partial<TestInstitution>): Observable<{ data: TestInstitution }> {
    return this.api.post('/test-institutions', ti);
  }
}
