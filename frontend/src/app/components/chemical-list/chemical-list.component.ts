import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ChemicalService, ContractorService } from '../../services/data.service';
import { CleanChemical, Contractor } from '../../models/models';

@Component({
  selector: 'app-chemical-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSnackBarModule,
  ],
  template: `
    <h2>药剂登记管理</h2>

    <button mat-raised-button color="primary" style="margin-bottom:16px;" (click)="showAddForm = !showAddForm">
      {{ showAddForm ? '收起' : '登记药剂' }}
    </button>

    <mat-card *ngIf="showAddForm" style="margin-bottom:16px;padding:16px;">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>作业单位</mat-label>
          <mat-select [(ngModel)]="newChemical.contractor_id">
            <mat-option *ngFor="let c of contractors" [value]="c.id">{{ c.name }}</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>药剂名称</mat-label>
          <input matInput [(ngModel)]="newChemical.chemical_name">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>批次号</mat-label>
          <input matInput [(ngModel)]="newChemical.batch_no">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>用量</mat-label>
          <input matInput type="number" [(ngModel)]="newChemical.dosage">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>单位</mat-label>
          <mat-select [(ngModel)]="newChemical.unit">
            <mat-option value="mg/L">mg/L</mat-option>
            <mat-option value="kg">kg</mat-option>
            <mat-option value="L">L</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      <button mat-raised-button color="primary" (click)="createChemical()">保存</button>
    </mat-card>

    <table mat-table [dataSource]="chemicals" style="width:100%;">
      <ng-container matColumnDef="chemical_name">
        <th mat-header-cell *matHeaderCellDef>药剂名称</th>
        <td mat-cell *matCellDef="let c">{{ c.chemical_name }}</td>
      </ng-container>
      <ng-container matColumnDef="contractor">
        <th mat-header-cell *matHeaderCellDef>作业单位</th>
        <td mat-cell *matCellDef="let c">{{ c.contractor?.name }}</td>
      </ng-container>
      <ng-container matColumnDef="batch_no">
        <th mat-header-cell *matHeaderCellDef>批次号</th>
        <td mat-cell *matCellDef="let c">{{ c.batch_no }}</td>
      </ng-container>
      <ng-container matColumnDef="dosage">
        <th mat-header-cell *matHeaderCellDef>用量</th>
        <td mat-cell *matCellDef="let c">{{ c.dosage }} {{ c.unit }}</td>
      </ng-container>
      <ng-container matColumnDef="registered_at">
        <th mat-header-cell *matHeaderCellDef>登记时间</th>
        <td mat-cell *matCellDef="let c">{{ c.registered_at | date:'yyyy-MM-dd HH:mm' }}</td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>

    <mat-paginator [length]="total" [pageSize]="pageSize" [pageIndex]="page - 1"
      (page)="onPageChange($event)"></mat-paginator>
  `
})
export class ChemicalListComponent implements OnInit {
  chemicals: CleanChemical[] = [];
  contractors: Contractor[] = [];
  displayedColumns = ['chemical_name', 'contractor', 'batch_no', 'dosage', 'registered_at'];
  total = 0;
  page = 1;
  pageSize = 10;
  showAddForm = false;
  newChemical: any = { contractor_id: null, chemical_name: '', batch_no: '', dosage: 0, unit: 'mg/L' };

  constructor(
    private chemicalService: ChemicalService,
    private contractorService: ContractorService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadChemicals();
    this.contractorService.list({ page: 1, page_size: 100 }).subscribe(res => {
      this.contractors = res.data;
    });
  }

  loadChemicals(): void {
    this.chemicalService.list({ page: this.page, page_size: this.pageSize }).subscribe(res => {
      this.chemicals = res.data;
      this.total = res.total;
    });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadChemicals();
  }

  createChemical(): void {
    this.chemicalService.create({
      contractor_id: Number(this.newChemical.contractor_id),
      chemical_name: this.newChemical.chemical_name,
      batch_no: this.newChemical.batch_no,
      dosage: Number(this.newChemical.dosage),
      unit: this.newChemical.unit,
    }).subscribe({
      next: () => {
        this.snackBar.open('药剂登记成功', '关闭', { duration: 3000 });
        this.showAddForm = false;
        this.newChemical = { contractor_id: null, chemical_name: '', batch_no: '', dosage: 0, unit: 'mg/L' };
        this.loadChemicals();
      },
      error: (err) => {
        this.snackBar.open(err.error?.error || '登记失败', '关闭', { duration: 3000 });
      }
    });
  }
}
