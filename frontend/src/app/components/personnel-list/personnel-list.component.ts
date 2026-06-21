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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { PersonnelService, ContractorService } from '../../services/data.service';
import { CleanPersonnel, Contractor } from '../../models/models';

@Component({
  selector: 'app-personnel-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule, MatChipsModule, MatSnackBarModule,
    MatDialogModule,
  ],
  template: `
    <h2>作业人员管理</h2>

    <mat-form-field appearance="outline" style="width:200px;margin-bottom:16px;">
      <mat-label>筛选作业单位</mat-label>
      <mat-select [(ngModel)]="filterContractorId" (selectionChange)="loadPersonnel()">
        <mat-option value="">全部</mat-option>
        <mat-option *ngFor="let c of contractors" [value]="c.id">{{ c.name }}</mat-option>
      </mat-select>
    </mat-form-field>

    <button mat-raised-button color="primary" style="margin-left:16px;" (click)="showAddForm = !showAddForm">
      {{ showAddForm ? '收起' : '新增人员' }}
    </button>

    <mat-card *ngIf="showAddForm" style="margin-bottom:16px;padding:16px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>所属单位</mat-label>
          <mat-select [(ngModel)]="newPersonnel.contractor_id">
            <mat-option *ngFor="let c of contractors" [value]="c.id">{{ c.name }}</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>姓名</mat-label>
          <input matInput [(ngModel)]="newPersonnel.name">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>身份证号</mat-label>
          <input matInput [(ngModel)]="newPersonnel.id_card">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>健康证号</mat-label>
          <input matInput [(ngModel)]="newPersonnel.health_cert_no">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>健康证到期日</mat-label>
          <input matInput [matDatepicker]="expirePicker" [(ngModel)]="newPersonnel.health_cert_expire">
          <mat-datepicker-toggle matSuffix [for]="expirePicker"></mat-datepicker-toggle>
          <mat-datepicker #expirePicker></mat-datepicker>
        </mat-form-field>
      </div>
      <button mat-raised-button color="primary" (click)="createPersonnel()">保存</button>
    </mat-card>

    <table mat-table [dataSource]="personnel" style="width:100%;">
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>姓名</th>
        <td mat-cell *matCellDef="let p">{{ p.name }}</td>
      </ng-container>
      <ng-container matColumnDef="contractor">
        <th mat-header-cell *matHeaderCellDef>所属单位</th>
        <td mat-cell *matCellDef="let p">{{ p.contractor?.name }}</td>
      </ng-container>
      <ng-container matColumnDef="id_card">
        <th mat-header-cell *matHeaderCellDef>身份证号</th>
        <td mat-cell *matCellDef="let p">{{ p.id_card }}</td>
      </ng-container>
      <ng-container matColumnDef="health_cert">
        <th mat-header-cell *matHeaderCellDef>健康证号</th>
        <td mat-cell *matCellDef="let p">{{ p.health_cert_no }}</td>
      </ng-container>
      <ng-container matColumnDef="cert_expire">
        <th mat-header-cell *matHeaderCellDef>健康证到期</th>
        <td mat-cell *matCellDef="let p" [style.color]="isExpired(p) ? '#f44336' : ''">
          {{ p.health_cert_expire | date:'yyyy-MM-dd' }}
          <mat-chip *ngIf="isExpired(p)" color="warn" highlighted style="font-size:10px;">已过期</mat-chip>
        </td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>

    <mat-paginator [length]="total" [pageSize]="pageSize" [pageIndex]="page - 1"
      (page)="onPageChange($event)"></mat-paginator>
  `
})
export class PersonnelListComponent implements OnInit {
  personnel: CleanPersonnel[] = [];
  contractors: Contractor[] = [];
  displayedColumns = ['name', 'contractor', 'id_card', 'health_cert', 'cert_expire'];
  total = 0;
  page = 1;
  pageSize = 10;
  filterContractorId: number | string = '';
  showAddForm = false;
  newPersonnel: any = { contractor_id: null, name: '', id_card: '', health_cert_no: '', health_cert_expire: null };

  constructor(
    private personnelService: PersonnelService,
    private contractorService: ContractorService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadPersonnel();
    this.contractorService.list({ page: 1, page_size: 100 }).subscribe(res => {
      this.contractors = res.data;
    });
  }

  loadPersonnel(): void {
    this.personnelService.list({
      contractor_id: this.filterContractorId ? Number(this.filterContractorId) : undefined,
      page: this.page,
      page_size: this.pageSize,
    }).subscribe(res => {
      this.personnel = res.data;
      this.total = res.total;
    });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadPersonnel();
  }

  isExpired(p: CleanPersonnel): boolean {
    if (!p.health_cert_expire) return true;
    return new Date(p.health_cert_expire) < new Date();
  }

  createPersonnel(): void {
    this.personnelService.create({
      contractor_id: Number(this.newPersonnel.contractor_id),
      name: this.newPersonnel.name,
      id_card: this.newPersonnel.id_card,
      health_cert_no: this.newPersonnel.health_cert_no,
      health_cert_expire: this.newPersonnel.health_cert_expire ? this.formatDate(this.newPersonnel.health_cert_expire) : null,
    }).subscribe({
      next: () => {
        this.snackBar.open('人员添加成功', '关闭', { duration: 3000 });
        this.showAddForm = false;
        this.newPersonnel = { contractor_id: null, name: '', id_card: '', health_cert_no: '', health_cert_expire: null };
        this.loadPersonnel();
      },
      error: (err) => {
        this.snackBar.open(err.error?.error || '添加失败', '关闭', { duration: 3000 });
      }
    });
  }

  private formatDate(d: any): string {
    if (!d) return '';
    if (d instanceof Date) return d.toISOString().split('T')[0];
    return String(d);
  }
}
