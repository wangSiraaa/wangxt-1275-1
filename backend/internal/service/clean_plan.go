package service

import (
	"errors"
	"fmt"
	"time"

	"water-cleaning/internal/model"

	"gorm.io/gorm"
)

type CleanPlanService struct {
	db *gorm.DB
}

func NewCleanPlanService(db *gorm.DB) *CleanPlanService {
	return &CleanPlanService{db: db}
}

var (
	ErrHealthCertExpired     = errors.New("清洗人员健康证已过期，不能上岗")
	ErrNoticeTimeInsufficient = errors.New("公告时间不足，不能执行清洗计划（公告须提前至少48小时发布）")
	ErrTestUnqualified       = errors.New("水质检测未合格，不能恢复供水")
	ErrPlanStatusInvalid     = errors.New("计划状态不允许此操作")
)

func (s *CleanPlanService) ListPlans(status string, tankID uint, page, pageSize int) ([]model.CleanPlan, int64, error) {
	var plans []model.CleanPlan
	var total int64
	q := s.db.Model(&model.CleanPlan{})
	if status != "" {
		q = q.Where("status = ?", status)
	}
	if tankID > 0 {
		q = q.Where("tank_id = ?", tankID)
	}
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	offset := (page - 1) * pageSize
	if err := q.Preload("Tank").Preload("PropertyCompany").Preload("Contractor").
		Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&plans).Error; err != nil {
		return nil, 0, err
	}
	return plans, total, nil
}

func (s *CleanPlanService) GetPlan(id uint) (*model.CleanPlan, error) {
	var plan model.CleanPlan
	if err := s.db.Preload("Tank").Preload("PropertyCompany").Preload("Contractor").
		Preload("Personnel.Personnel").Preload("Chemicals").Preload("TestReports.Institution").
		Preload("Notices").First(&plan, id).Error; err != nil {
		return nil, err
	}
	return &plan, nil
}

func (s *CleanPlanService) CreatePlan(plan *model.CleanPlan) error {
	plan.Status = model.PlanStatusDraft
	return s.db.Create(plan).Error
}

func (s *CleanPlanService) UpdatePlan(plan *model.CleanPlan) error {
	var existing model.CleanPlan
	if err := s.db.First(&existing, plan.ID).Error; err != nil {
		return err
	}
	if existing.Status != model.PlanStatusDraft {
		return fmt.Errorf("%w: 当前状态为 %s", ErrPlanStatusInvalid, existing.Status)
	}
	return s.db.Model(&existing).Updates(map[string]interface{}{
		"tank_id":             plan.TankID,
		"contractor_id":       plan.ContractorID,
		"plan_date":           plan.PlanDate,
		"remark":              plan.Remark,
	}).Error
}

func (s *CleanPlanService) PublishNotice(planID uint, notice *model.Notice) error {
	var plan model.CleanPlan
	if err := s.db.First(&plan, planID).Error; err != nil {
		return err
	}
	if plan.Status != model.PlanStatusDraft && plan.Status != model.PlanStatusAnnounced {
		return fmt.Errorf("%w: 只有草稿或已公告状态可发布公告", ErrPlanStatusInvalid)
	}

	now := time.Now()
	notice.PlanID = planID
	notice.ActualPublishedAt = &now

	hoursDiff := plan.PlanDate.Sub(notice.NoticeTime).Hours()
	notice.IsSufficient = hoursDiff >= 48

	if err := s.db.Create(notice).Error; err != nil {
		return err
	}

	plan.Status = model.PlanStatusAnnounced
	plan.AnnouncedAt = &now
	return s.db.Save(&plan).Error
}

func (s *CleanPlanService) StartCleaning(planID uint, personnelIDs []uint) error {
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var plan model.CleanPlan
	if err := tx.Preload("Notices").First(&plan, planID).Error; err != nil {
		tx.Rollback()
		return err
	}

	if plan.Status != model.PlanStatusAnnounced {
		tx.Rollback()
		return fmt.Errorf("%w: 只有已公告状态可开始清洗", ErrPlanStatusInvalid)
	}

	for _, n := range plan.Notices {
		if !n.IsSufficient {
			tx.Rollback()
			return ErrNoticeTimeInsufficient
		}
	}

	var personnel []model.CleanPersonnel
	if err := tx.Where("id IN ?", personnelIDs).Find(&personnel).Error; err != nil {
		tx.Rollback()
		return err
	}
	now := time.Now()
	for _, p := range personnel {
		if p.HealthCertExpire != nil && p.HealthCertExpire.Before(now) {
			tx.Rollback()
			return fmt.Errorf("%w: 人员 %s 的健康证已于 %s 过期",
				ErrHealthCertExpired, p.Name, p.HealthCertExpire.Format("2006-01-02"))
		}
	}

	for _, pid := range personnelIDs {
		pp := model.CleanPlanPersonnel{PlanID: planID, PersonnelID: pid}
		if err := tx.Create(&pp).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	plan.Status = model.PlanStatusInProgress
	plan.StartedAt = &now
	if err := tx.Save(&plan).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

func (s *CleanPlanService) SubmitTestReport(planID uint, report *model.TestReport) error {
	var plan model.CleanPlan
	if err := s.db.First(&plan, planID).Error; err != nil {
		return err
	}

	if plan.Status != model.PlanStatusInProgress && plan.Status != model.PlanStatusTesting {
		return fmt.Errorf("%w: 只有进行中或检测中状态可提交检测报告", ErrPlanStatusInvalid)
	}

	report.PlanID = planID
	if err := s.db.Create(report).Error; err != nil {
		return err
	}

	plan.Status = model.PlanStatusTesting
	return s.db.Save(&plan).Error
}

func (s *CleanPlanService) ResumeWater(planID uint) error {
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var plan model.CleanPlan
	if err := tx.Preload("TestReports").First(&plan, planID).Error; err != nil {
		tx.Rollback()
		return err
	}

	if plan.Status != model.PlanStatusTesting {
		tx.Rollback()
		return fmt.Errorf("%w: 只有检测中状态可恢复供水", ErrPlanStatusInvalid)
	}

	for _, r := range plan.TestReports {
		if r.Result != "pass" {
			tx.Rollback()
			return fmt.Errorf("%w: 报告 %s 检测结果为不合格", ErrTestUnqualified, r.ReportNo)
		}
	}

	now := time.Now()
	plan.Status = model.PlanStatusCompleted
	plan.WaterResumedAt = &now
	plan.CompletedAt = &now
	if err := tx.Save(&plan).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Model(&model.WaterTank{}).Where("id = ?", plan.TankID).
		Updates(map[string]interface{}{"last_cleaned_at": now, "status": "normal"}).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

func (s *CleanPlanService) CancelPlan(planID uint) error {
	var plan model.CleanPlan
	if err := s.db.First(&plan, planID).Error; err != nil {
		return err
	}
	if plan.Status == model.PlanStatusCompleted || plan.Status == model.PlanStatusCancelled {
		return fmt.Errorf("%w: 已完成或已取消的计划不能取消", ErrPlanStatusInvalid)
	}
	plan.Status = model.PlanStatusCancelled
	return s.db.Save(&plan).Error
}

type OverduePlan struct {
	PlanID           uint      `json:"plan_id"`
	CommunityName    string    `json:"community_name"`
	TankName         string    `json:"tank_name"`
	PlanDate         time.Time `json:"plan_date"`
	Status           string    `json:"status"`
	OverdueDays      int       `json:"overdue_days"`
	PropertyCompany  string    `json:"property_company"`
}

func (s *CleanPlanService) ListOverduePlans(street string) ([]OverduePlan, error) {
	var results []OverduePlan
	now := time.Now()
	err := s.db.Model(&model.CleanPlan{}).
		Select("clean_plans.id as plan_id, water_tanks.community_name, water_tanks.tank_name, clean_plans.plan_date, clean_plans.status, EXTRACT(DAY FROM ? - clean_plans.plan_date)::int as overdue_days, property_companies.name as property_company", now).
		Joins("JOIN water_tanks ON water_tanks.id = clean_plans.tank_id").
		Joins("JOIN property_companies ON property_companies.id = clean_plans.property_company_id").
		Where("clean_plans.plan_date < ? AND clean_plans.status NOT IN ?", now, []string{model.PlanStatusCompleted, model.PlanStatusCancelled}).
		Scan(&results).Error
	return results, err
}
