import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { PlanService } from '../../services/plan.service';
import { TankService, ContractorService, PersonnelService, ChemicalService, PropertyCompanyService, TestInstitutionService } from '../../services/data.service';
import { CleanPlan, CleanPersonnel, WaterTank, Contractor, PropertyCompany, TestInstitution } from '../../models/models';

@Component({
  selector: 'app-plan-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    MatCardModule, MatButtonModule, MatStepperModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatChipsModule, MatTableModule, MatCheckboxModule, MatSnackBarModule, MatDialogModule,
  ],
  template: `
    <div *ngIf="plan; else loading">
      <h2>清洗计划详情 - {{ plan.tank?.community_name }}</h2>

      <mat-stepper [selectedIndex]="stepIndex" linear style="margin-top:16px;">
        <mat-step label="发起计划" [completed]="plan.status !== 'draft'">
          <mat-card style="margin-bottom:16px;">
            <mat-card-header><mat-card-title>基本信息</mat-card-title></mat-card-header>
            <mat-card-content>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <p><strong>小区：</strong>{{ plan.tank?.community_name }}</p>
                <p><strong>水箱：</strong>{{ plan.tank?.tank_name }}</p>
                <p><strong>计划日期：</strong>{{ plan.plan_date | date:'yyyy-MM-dd' }}</p>
                <p><strong>作业单位：</strong>{{ plan.contractor?.name || '待分配' }}</p>
                <p><strong>物业：</strong>{{ plan.property_company?.name }}</p>
                <p><strong>备注：</strong>{{ plan.remark || '-' }}</p>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-step>

        <mat-step label="发布公告" [completed]="plan.status !== 'draft'">
          <mat-card style="margin-bottom:16px;" *ngIf="plan.status === 'draft' || plan.notices?.length">
            <mat-card-header><mat-card-title>居民公告</mat-card-title></mat-card-header>
            <mat-card-content>
              <div *ngIf="plan.status === 'draft'" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>公告日期</mat-label>
                  <input matInput [matDatepicker]="noticePicker" [(ngModel)]="notice.notice_time">
                  <mat-datepicker-toggle matSuffix [for]="noticePicker"></mat-datepicker-toggle>
                  <mat-datepicker #noticePicker></mat-datepicker>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>计划开始</mat-label>
                  <input matInput [matDatepicker]="startPicker" [(ngModel)]="notice.planned_start">
                  <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                  <mat-datepicker #startPicker></mat-datepicker>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>计划结束</mat-label>
                  <input matInput [matDatepicker]="endPicker" [(ngModel)]="notice.planned_end">
                  <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                  <mat-datepicker #endPicker></mat-datepicker>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>公告内容</mat-label>
                  <textarea matInput [(ngModel)]="notice.content" rows="3"></textarea>
                </mat-form-field>
              </div>
              <button *ngIf="plan.status === 'draft'" mat-raised-button color="primary" (click)="publishNotice()">
                发布公告
              </button>

              <table *ngIf="plan.notices?.length" mat-table [dataSource]="plan.notices || []" style="width:100%;margin-top:16px;">
                <ng-container matColumnDef="notice_time">
                  <th mat-header-cell *matHeaderCellDef>公告日期</th>
                  <td mat-cell *matCellDef="let n">{{ n.notice_time | date:'yyyy-MM-dd' }}</td>
                </ng-container>
                <ng-container matColumnDef="planned_start">
                  <th mat-header-cell *matHeaderCellDef>计划开始</th>
                  <td mat-cell *matCellDef="let n">{{ n.planned_start | date:'yyyy-MM-dd' }}</td>
                </ng-container>
                <ng-container matColumnDef="planned_end">
                  <th mat-header-cell *matHeaderCellDef>计划结束</th>
                  <td mat-cell *matCellDef="let n">{{ n.planned_end | date:'yyyy-MM-dd' }}</td>
                </ng-container>
                <ng-container matColumnDef="sufficient">
                  <th mat-header-cell *matHeaderCellDef>时间是否充足</th>
                  <td mat-cell *matCellDef="let n">
                    <mat-chip [color]="n.is_sufficient ? 'primary' : 'warn'" highlighted>
                      {{ n.is_sufficient ? '充足' : '不足(未满48h)' }}
                    </mat-chip>
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="noticeColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: noticeColumns;"></tr>
              </table>
            </mat-card-content>
          </mat-card>
        </mat-step>

        <mat-step label="清洗作业" [completed]="plan.status === 'testing' || plan.status === 'completed'">
          <mat-card style="margin-bottom:16px;" *ngIf="plan.status === 'announced'">
            <mat-card-header><mat-card-title>选择清洗人员</mat-card-title></mat-card-header>
            <mat-card-content>
              <p style="color:#f44336;" *ngIf="healthCertWarning">
                <strong>{{ healthCertWarning }}</strong>
              </p>
              <table mat-table [dataSource]="personnelList" style="width:100%;">
                <ng-container matColumnDef="select">
                  <th mat-header-cell *matHeaderCellDef>选择</th>
                  <td mat-cell *matCellDef="let p">
                    <mat-checkbox [disabled]="isHealthCertExpired(p)"
                      (change)="togglePersonnel(p.id, $event.checked)"
                      [checked]="selectedPersonnelIds.includes(p.id)">
                    </mat-checkbox>
                  </td>
                </ng-container>
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>姓名</th>
                  <td mat-cell *matCellDef="let p">{{ p.name }}</td>
                </ng-container>
                <ng-container matColumnDef="cert_no">
                  <th mat-header-cell *matHeaderCellDef>健康证号</th>
                  <td mat-cell *matCellDef="let p">{{ p.health_cert_no }}</td>
                </ng-container>
                <ng-container matColumnDef="cert_expire">
                  <th mat-header-cell *matHeaderCellDef>健康证到期</th>
                  <td mat-cell *matCellDef="let p" [style.color]="isHealthCertExpired(p) ? '#f44336' : ''">
                    {{ p.health_cert_expire | date:'yyyy-MM-dd' }}
                    <span *ngIf="isHealthCertExpired(p)"> (已过期)</span>
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="personnelColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: personnelColumns;"></tr>
              </table>
              <button mat-raised-button color="primary" (click)="startCleaning()"
                [disabled]="selectedPersonnelIds.length === 0" style="margin-top:16px;">
                开始清洗
              </button>
            </mat-card-content>
          </mat-card>

          <mat-card *ngIf="plan.personnel?.length">
            <mat-card-header><mat-card-title>已分配人员</mat-card-title></mat-card-header>
            <mat-card-content>
              <mat-chip-listbox>
                <mat-chip *ngFor="let pp of plan.personnel">{{ pp.personnel?.name }}</mat-chip>
              </mat-chip-listbox>
            </mat-card-content>
          </mat-card>
        </mat-step>

        <mat-step label="水质检测" [completed]="plan.status === 'completed'">
          <mat-card style="margin-bottom:16px;" *ngIf="plan.status === 'testing' || plan.test_reports?.length">
            <mat-card-header><mat-card-title>检测报告</mat-card-title></mat-card-header>
            <mat-card-content>
              <div *ngIf="plan.status === 'testing'" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>检测机构</mat-label>
                  <mat-select [(ngModel)]="testReport.institution_id">
                    <mat-option *ngFor="let inst of institutions" [value]="inst.id">{{ inst.name }}</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>报告编号</mat-label>
                  <input matInput [(ngModel)]="testReport.report_no">
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>余氯(mg/L)</mat-label>
                  <input matInput type="number" [(ngModel)]="testReport.residual_chlorine">
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>浊度(NTU)</mat-label>
                  <input matInput type="number" [(ngModel)]="testReport.turbidity">
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>pH值</mat-label>
                  <input matInput type="number" [(ngModel)]="testReport.ph_value">
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>检测结果</mat-label>
                  <mat-select [(ngModel)]="testReport.result">
                    <mat-option value="pass">合格</mat-option>
                    <mat-option value="fail">不合格</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
              <button *ngIf="plan.status === 'testing'" mat-raised-button color="primary" (click)="submitTestReport()">
                提交检测报告
              </button>

              <table *ngIf="plan.test_reports?.length" mat-table [dataSource]="plan.test_reports || []" style="width:100%;margin-top:16px;">
                <ng-container matColumnDef="report_no">
                  <th mat-header-cell *matHeaderCellDef>报告编号</th>
                  <td mat-cell *matCellDef="let r">{{ r.report_no }}</td>
                </ng-container>
                <ng-container matColumnDef="institution">
                  <th mat-header-cell *matHeaderCellDef>检测机构</th>
                  <td mat-cell *matCellDef="let r">{{ r.institution?.name }}</td>
                </ng-container>
                <ng-container matColumnDef="chlorine">
                  <th mat-header-cell *matHeaderCellDef>余氯</th>
                  <td mat-cell *matCellDef="let r">{{ r.residual_chlorine }} mg/L</td>
                </ng-container>
                <ng-container matColumnDef="turbidity">
                  <th mat-header-cell *matHeaderCellDef>浊度</th>
                  <td mat-cell *matCellDef="let r">{{ r.turbidity }} NTU</td>
                </ng-container>
                <ng-container matColumnDef="result">
                  <th mat-header-cell *matHeaderCellDef>结果</th>
                  <td mat-cell *matCellDef="let r">
                    <mat-chip [color]="r.result === 'pass' ? 'primary' : 'warn'" highlighted>
                      {{ r.result === 'pass' ? '合格' : '不合格' }}
                    </mat-chip>
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="reportColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: reportColumns;"></tr>
              </table>
            </mat-card-content>
          </mat-card>

          <mat-card *ngIf="plan.status === 'testing'">
            <button mat-raised-button color="accent" (click)="resumeWater()" style="margin:16px;">
              恢复供水
            </button>
            <p style="color:#f44336;margin:0 16px;" *ngIf="resumeWaterError">
              {{ resumeWaterError }}
            </p>
          </mat-card>
        </mat-step>
      </mat-stepper>

      <button mat-button [routerLink]="['/plans']" style="margin-top:16px;">返回列表</button>
    </div>
    <ng-template #loading>加载中...</ng-template>
  `,
  styles: [``]
})
export class PlanDetailComponent implements OnInit {
  plan!: CleanPlan;
  stepIndex = 0;

  notice: any = { notice_time: null, planned_start: null, planned_end: null, content: '' };
  testReport: any = { institution_id: null, report_no: '', residual_chlorine: 0, turbidity: 0, ph_value: 7, result: 'pass' };

  personnelList: CleanPersonnel[] = [];
  selectedPersonnelIds: number[] = [];
  institutions: TestInstitution[] = [];

  healthCertWarning = '';
  resumeWaterError = '';

  noticeColumns = ['notice_time', 'planned_start', 'planned_end', 'sufficient'];
  personnelColumns = ['select', 'name', 'cert_no', 'cert_expire'];
  reportColumns = ['report_no', 'institution', 'chlorine', 'turbidity', 'result'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private planService: PlanService,
    private personnelService: PersonnelService,
    private testInstService: TestInstitutionService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPlan(id);
    this.loadPersonnel();
    this.loadInstitutions();
  }

  loadPlan(id: number): void {
    this.planService.get(id).subscribe(res => {
      this.plan = res.data;
      this.stepIndex = this.getStepIndex(this.plan.status);
    });
  }

  getStepIndex(status: string): number {
    switch (status) {
      case 'draft': return 0;
      case 'announced': return 1;
      case 'in_progress': return 2;
      case 'testing': return 3;
      case 'completed': return 3;
      default: return 0;
    }
  }

  loadPersonnel(): void {
    this.personnelService.list({ page: 1, page_size: 100 }).subscribe(res => {
      this.personnelList = res.data;
    });
  }

  loadInstitutions(): void {
    this.testInstService.list().subscribe(res => {
      this.institutions = res.data;
    });
  }

  isHealthCertExpired(p: CleanPersonnel): boolean {
    if (!p.health_cert_expire) return true;
    return new Date(p.health_cert_expire) < new Date();
  }

  togglePersonnel(id: number, checked: boolean): void {
    this.healthCertWarning = '';
    if (checked) {
      const p = this.personnelList.find(x => x.id === id);
      if (p && this.isHealthCertExpired(p)) {
        this.healthCertWarning = `人员 ${p.name} 的健康证已过期，不能上岗！`;
        return;
      }
      if (!this.selectedPersonnelIds.includes(id)) {
        this.selectedPersonnelIds.push(id);
      }
    } else {
      this.selectedPersonnelIds = this.selectedPersonnelIds.filter(x => x !== id);
    }
  }

  publishNotice(): void {
    const id = this.plan.id;
    this.planService.publishNotice(id, {
      notice_time: this.formatDate(this.notice.notice_time),
      planned_start: this.formatDate(this.notice.planned_start),
      planned_end: this.formatDate(this.notice.planned_end),
      content: this.notice.content,
    }).subscribe({
      next: () => {
        this.snackBar.open('公告发布成功', '关闭', { duration: 3000 });
        this.loadPlan(id);
      },
      error: (err) => {
        this.snackBar.open(err.error?.error || '发布公告失败', '关闭', { duration: 5000 });
      }
    });
  }

  startCleaning(): void {
    const id = this.plan.id;
    this.planService.startCleaning(id, this.selectedPersonnelIds).subscribe({
      next: () => {
        this.snackBar.open('清洗已开始', '关闭', { duration: 3000 });
        this.loadPlan(id);
      },
      error: (err) => {
        this.snackBar.open(err.error?.error || '开始清洗失败', '关闭', { duration: 5000 });
      }
    });
  }

  submitTestReport(): void {
    const id = this.plan.id;
    this.planService.submitTestReport(id, {
      institution_id: this.testReport.institution_id,
      report_no: this.testReport.report_no,
      residual_chlorine: Number(this.testReport.residual_chlorine),
      turbidity: Number(this.testReport.turbidity),
      ph_value: Number(this.testReport.ph_value),
      result: this.testReport.result,
      test_time: new Date().toISOString(),
    }).subscribe({
      next: () => {
        this.snackBar.open('检测报告已提交', '关闭', { duration: 3000 });
        this.loadPlan(id);
      },
      error: (err) => {
        this.snackBar.open(err.error?.error || '提交检测报告失败', '关闭', { duration: 5000 });
      }
    });
  }

  resumeWater(): void {
    this.resumeWaterError = '';
    const id = this.plan.id;
    this.planService.resumeWater(id).subscribe({
      next: () => {
        this.snackBar.open('供水已恢复', '关闭', { duration: 3000 });
        this.loadPlan(id);
      },
      error: (err) => {
        this.resumeWaterError = err.error?.error || '恢复供水失败';
      }
    });
  }

  private formatDate(d: any): string {
    if (!d) return '';
    if (d instanceof Date) {
      return d.toISOString().split('T')[0];
    }
    return String(d);
  }
}
