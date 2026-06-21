import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { TestReport } from '../../models/models';

@Component({
  selector: 'app-test-report',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatChipsModule, MatSnackBarModule,
  ],
  template: `
    <h2>水质检测报告</h2>

    <mat-form-field appearance="outline" style="width:200px;margin-bottom:16px;">
      <mat-label>按计划ID筛选</mat-label>
      <input matInput type="number" [(ngModel)]="filterPlanId" (ngModelChange)="loadReports()">
    </mat-form-field>

    <table mat-table [dataSource]="reports" style="width:100%;">
      <ng-container matColumnDef="report_no">
        <th mat-header-cell *matHeaderCellDef>报告编号</th>
        <td mat-cell *matCellDef="let r">{{ r.report_no }}</td>
      </ng-container>
      <ng-container matColumnDef="plan_id">
        <th mat-header-cell *matHeaderCellDef>计划ID</th>
        <td mat-cell *matCellDef="let r">{{ r.plan_id }}</td>
      </ng-container>
      <ng-container matColumnDef="institution">
        <th mat-header-cell *matHeaderCellDef>检测机构</th>
        <td mat-cell *matCellDef="let r">{{ r.institution?.name }}</td>
      </ng-container>
      <ng-container matColumnDef="chlorine">
        <th mat-header-cell *matHeaderCellDef>余氯(mg/L)</th>
        <td mat-cell *matCellDef="let r">{{ r.residual_chlorine }}</td>
      </ng-container>
      <ng-container matColumnDef="turbidity">
        <th mat-header-cell *matHeaderCellDef>浊度(NTU)</th>
        <td mat-cell *matCellDef="let r">{{ r.turbidity }}</td>
      </ng-container>
      <ng-container matColumnDef="ph">
        <th mat-header-cell *matHeaderCellDef>pH值</th>
        <td mat-cell *matCellDef="let r">{{ r.ph_value }}</td>
      </ng-container>
      <ng-container matColumnDef="result">
        <th mat-header-cell *matHeaderCellDef>检测结果</th>
        <td mat-cell *matCellDef="let r">
          <mat-chip [color]="r.result === 'pass' ? 'primary' : 'warn'" highlighted>
            {{ r.result === 'pass' ? '合格' : '不合格' }}
          </mat-chip>
        </td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>

    <mat-paginator [length]="total" [pageSize]="pageSize" [pageIndex]="page - 1"
      (page)="onPageChange($event)"></mat-paginator>
  `
})
export class TestReportComponent implements OnInit {
  reports: TestReport[] = [];
  displayedColumns = ['report_no', 'plan_id', 'institution', 'chlorine', 'turbidity', 'ph', 'result'];
  total = 0;
  page = 1;
  pageSize = 10;
  filterPlanId: number | null = null;

  constructor(
    private api: ApiService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    const params: any = { page: this.page, page_size: this.pageSize };
    if (this.filterPlanId) {
      params.plan_id = this.filterPlanId;
    }
    this.api.get<any>('/test-reports', params).subscribe(res => {
      this.reports = res.data;
      this.total = res.total;
    });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadReports();
  }
}
