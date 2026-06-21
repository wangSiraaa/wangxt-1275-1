import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PlanService } from '../../services/plan.service';
import { OverduePlan } from '../../models/models';

@Component({
  selector: 'app-overdue-monitor',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatChipsModule, MatIconModule,
    MatButtonModule, MatCardModule, MatSnackBarModule,
  ],
  template: `
    <h2>逾期监管</h2>
    <p style="color:#666;">以下清洗计划已超过计划日期但尚未完成，街道监管可查看逾期情况并督促物业尽快完成。</p>

    <mat-card style="margin-bottom:16px;" *ngIf="overduePlans.length === 0">
      <mat-card-content style="text-align:center;padding:32px;">
        <mat-icon style="font-size:48px;color:#4caf50;">check_circle</mat-icon>
        <p>暂无逾期计划</p>
      </mat-card-content>
    </mat-card>

    <table *ngIf="overduePlans.length > 0" mat-table [dataSource]="overduePlans" style="width:100%;">
      <ng-container matColumnDef="community">
        <th mat-header-cell *matHeaderCellDef>小区</th>
        <td mat-cell *matCellDef="let p">{{ p.community_name }}</td>
      </ng-container>
      <ng-container matColumnDef="tank">
        <th mat-header-cell *matHeaderCellDef>水箱</th>
        <td mat-cell *matCellDef="let p">{{ p.tank_name }}</td>
      </ng-container>
      <ng-container matColumnDef="plan_date">
        <th mat-header-cell *matHeaderCellDef>计划日期</th>
        <td mat-cell *matCellDef="let p">{{ p.plan_date | date:'yyyy-MM-dd' }}</td>
      </ng-container>
      <ng-container matColumnDef="overdue_days">
        <th mat-header-cell *matHeaderCellDef>逾期天数</th>
        <td mat-cell *matCellDef="let p">
          <mat-chip [color]="p.overdue_days > 7 ? 'warn' : 'accent'" highlighted>
            {{ p.overdue_days }} 天
          </mat-chip>
        </td>
      </ng-container>
      <ng-container matColumnDef="status">
        <th mat-header-cell *matHeaderCellDef>当前状态</th>
        <td mat-cell *matCellDef="let p">{{ getStatusLabel(p.status) }}</td>
      </ng-container>
      <ng-container matColumnDef="property_company">
        <th mat-header-cell *matHeaderCellDef>物业公司</th>
        <td mat-cell *matCellDef="let p">{{ p.property_company }}</td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
  `
})
export class OverdueMonitorComponent implements OnInit {
  overduePlans: OverduePlan[] = [];
  displayedColumns = ['community', 'tank', 'plan_date', 'overdue_days', 'status', 'property_company'];

  constructor(private planService: PlanService) {}

  ngOnInit(): void {
    this.planService.listOverdue().subscribe(res => {
      this.overduePlans = res.data;
    });
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      draft: '草稿', announced: '已公告', in_progress: '清洗中', testing: '检测中',
    };
    return map[status] || status;
  }
}
