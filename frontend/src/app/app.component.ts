import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, MatSidenavModule, MatListModule, MatToolbarModule, MatIconModule],
  template: `
    <mat-sidenav-container style="height: 100vh;">
      <mat-sidenav #sidenav mode="over" style="width: 260px;">
        <mat-toolbar color="primary">
          <span>二次供水清洗消毒</span>
        </mat-toolbar>
        <mat-nav-list>
          <a mat-list-item routerLink="/plans" (click)="sidenav.close()">
            <mat-icon matListItemIcon>cleaning_services</mat-icon>
            <span matListItemTitle>清洗计划</span>
          </a>
          <a mat-list-item routerLink="/tanks" (click)="sidenav.close()">
            <mat-icon matListItemIcon>water_drop</mat-icon>
            <span matListItemTitle>小区水箱</span>
          </a>
          <a mat-list-item routerLink="/personnel" (click)="sidenav.close()">
            <mat-icon matListItemIcon>badge</mat-icon>
            <span matListItemTitle>作业人员</span>
          </a>
          <a mat-list-item routerLink="/chemicals" (click)="sidenav.close()">
            <mat-icon matListItemIcon>science</mat-icon>
            <span matListItemTitle>药剂登记</span>
          </a>
          <a mat-list-item routerLink="/test-reports" (click)="sidenav.close()">
            <mat-icon matListItemIcon>biotech</mat-icon>
            <span matListItemTitle>水质检测</span>
          </a>
          <a mat-list-item routerLink="/overdue" (click)="sidenav.close()">
            <mat-icon matListItemIcon>warning</mat-icon>
            <span matListItemTitle>逾期监管</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span>二次供水设施清洗消毒管理系统</span>
        </mat-toolbar>
        <div style="padding: 16px; overflow-y: auto; height: calc(100vh - 64px);">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `
})
export class AppComponent {}
