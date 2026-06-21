import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PlanService } from '../../services/plan.service';
import { CleanPlan } from '../../models/models';

const STATUS_MAP: Record<string, string> = {
  draft: '草稿',
  announced: '已公告',
  in_progress: '清洗中',
  testing: '检测中',
  completed: '已完成',
  cancelled: '已取消',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'basic',
  announced: 'accent',
  in_progress: 'warn',
  testing: 'warn',
  completed: 'primary',
  cancelled: 'basic',
};

@Component({
  selector: 'app-plan-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatChipsModule, MatIconModule, MatSelectModule,
    MatFormFieldModule, MatSnackBarModule,
  ],
  template: `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
      <h2>清洗计划管理</h2>
      <div style="display:flex;gap:12px;align-items:center;">
        <mat-form-field appearance="outline" style="width:160px;">
          <mat-label>状态筛选</mat-label>
          <mat-select [(ngModel)]="filterStatus" (selectionChange)="loadPlans()">
            <mat-option value="">全部</mat-option>
            <mat-option value="draft">草稿</mat-option>
            <mat-option value="announced">已公告</mat-option>
            <mat-option value="in_progress">清洗中</mat-option>
            <mat-option value="testing">检测中</mat-option>
            <mat-option value="completed">已完成</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </div>

    <table mat-table [dataSource]="plans" style="width:100%;">
      <ng-container matColumnDef="id">
        <th mat-header-cell *matHeaderCellDef>ID</th>
        <td mat-cell *matCellDef="let p">{{ p.id }}</td>
      </ng-container>
      <ng-container matColumnDef="community">
        <th mat-header-cell *matHeaderCellDef>小区/水箱</th>
        <td mat-cell *matCellDef="let p">{{ p.tank?.community_name }} - {{ p.tank?.tank_name }}</td>
      </ng-container>
      <ng-container matColumnDef="plan_date">
        <th mat-header-cell *matHeaderCellDef>计划日期</th>
        <td mat-cell *matCellDef="let p">{{ p.plan_date | date:'yyyy-MM-dd' }}</td>
      </ng-container>
      <ng-container matColumnDef="contractor">
        <th mat-header-cell *matHeaderCellDef>作业单位</th>
        <td mat-cell *matCellDef="let p">{{ p.contractor?.name || '-' }}</td>
      </ng-container>
      <ng-container matColumnDef="status">
        <th mat-header-cell *matHeaderCellDef>状态</th>
        <td mat-cell *matCellDef="let p">
          <mat-chip [color]="getStatusColor(p.status)" highlighted>
            {{ getStatusLabel(p.status) }}
          </mat-chip>
        </td>
      </ng-container>
      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>操作</th>
        <td mat-cell *matCellDef="let p">
          <a mat-raised-button color="primary" [routerLink]="['/plans', p.id]">详情</a>
        </td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>

    <mat-paginator [length]="total"
      [pageSize]="pageSize"
      [pageIndex]="page - 1"
      (page)="onPageChange($event)">
    </mat-paginator>
  `,
  styles: [`mat-chip { font-size: 12px; }`]
})
export class PlanListComponent implements OnInit {
  plans: CleanPlan[] = [];
  displayedColumns = ['id', 'community', 'plan_date', 'contractor', 'status', 'actions'];
  total = 0;
  page = 1;
  pageSize = 10;
  filterStatus = '';

  constructor(private planService: PlanService) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.planService.list({
      status: this.filterStatus || undefined,
      page: this.page,
      page_size: this.pageSize,
    }).subscribe(res => {
      this.plans = res.data;
      this.total = res.total;
    });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadPlans();
  }

  getStatusLabel(status: string): string {
    return STATUS_MAP[status] || status;
  }

  getStatusColor(status: string): string {
    return STATUS_COLORS[status] || 'basic';
  }
}
