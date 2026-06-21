import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { TankService } from '../../services/data.service';
import { WaterTank } from '../../models/models';

@Component({
  selector: 'app-tank-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSnackBarModule,
  ],
  template: `
    <h2>小区水箱管理</h2>

    <button mat-raised-button color="primary" style="margin-bottom:16px;" (click)="showAddForm = !showAddForm">
      {{ showAddForm ? '收起' : '新增水箱' }}
    </button>

    <mat-card *ngIf="showAddForm" style="margin-bottom:16px;padding:16px;">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>小区名称</mat-label>
          <input matInput [(ngModel)]="newTank.community_name">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>水箱编号</mat-label>
          <input matInput [(ngModel)]="newTank.tank_code">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>水箱名称</mat-label>
          <input matInput [(ngModel)]="newTank.tank_name">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>地址</mat-label>
          <input matInput [(ngModel)]="newTank.address">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>容量(吨)</mat-label>
          <input matInput type="number" [(ngModel)]="newTank.capacity">
        </mat-form-field>
      </div>
      <button mat-raised-button color="primary" (click)="createTank()">保存</button>
    </mat-card>

    <table mat-table [dataSource]="tanks" style="width:100%;">
      <ng-container matColumnDef="tank_code">
        <th mat-header-cell *matHeaderCellDef>编号</th>
        <td mat-cell *matCellDef="let t">{{ t.tank_code }}</td>
      </ng-container>
      <ng-container matColumnDef="community_name">
        <th mat-header-cell *matHeaderCellDef>小区名称</th>
        <td mat-cell *matCellDef="let t">{{ t.community_name }}</td>
      </ng-container>
      <ng-container matColumnDef="tank_name">
        <th mat-header-cell *matHeaderCellDef>水箱名称</th>
        <td mat-cell *matCellDef="let t">{{ t.tank_name }}</td>
      </ng-container>
      <ng-container matColumnDef="capacity">
        <th mat-header-cell *matHeaderCellDef>容量(吨)</th>
        <td mat-cell *matCellDef="let t">{{ t.capacity }}</td>
      </ng-container>
      <ng-container matColumnDef="last_cleaned">
        <th mat-header-cell *matHeaderCellDef>上次清洗</th>
        <td mat-cell *matCellDef="let t">{{ t.last_cleaned_at | date:'yyyy-MM-dd' || '-' }}</td>
      </ng-container>
      <ng-container matColumnDef="status">
        <th mat-header-cell *matHeaderCellDef>状态</th>
        <td mat-cell *matCellDef="let t">{{ t.status === 'normal' ? '正常' : '清洗中' }}</td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>

    <mat-paginator [length]="total" [pageSize]="pageSize" [pageIndex]="page - 1"
      (page)="onPageChange($event)"></mat-paginator>
  `
})
export class TankListComponent implements OnInit {
  tanks: WaterTank[] = [];
  displayedColumns = ['tank_code', 'community_name', 'tank_name', 'capacity', 'last_cleaned', 'status'];
  total = 0;
  page = 1;
  pageSize = 10;
  showAddForm = false;
  newTank: any = { community_name: '', tank_code: '', tank_name: '', address: '', capacity: 50 };

  constructor(
    private tankService: TankService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadTanks();
  }

  loadTanks(): void {
    this.tankService.list({ page: this.page, page_size: this.pageSize }).subscribe(res => {
      this.tanks = res.data;
      this.total = res.total;
    });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadTanks();
  }

  createTank(): void {
    this.tankService.create(this.newTank).subscribe({
      next: () => {
        this.snackBar.open('水箱添加成功', '关闭', { duration: 3000 });
        this.showAddForm = false;
        this.newTank = { community_name: '', tank_code: '', tank_name: '', address: '', capacity: 50 };
        this.loadTanks();
      },
      error: (err) => {
        this.snackBar.open(err.error?.error || '添加失败', '关闭', { duration: 3000 });
      }
    });
  }
}
