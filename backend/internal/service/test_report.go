package service

import (
	"water-cleaning/internal/model"

	"gorm.io/gorm"
)

type TestReportService struct {
	db *gorm.DB
}

func NewTestReportService(db *gorm.DB) *TestReportService {
	return &TestReportService{db: db}
}

func (s *TestReportService) List(planID uint, page, pageSize int) ([]model.TestReport, int64, error) {
	var list []model.TestReport
	var total int64
	q := s.db.Model(&model.TestReport{})
	if planID > 0 {
		q = q.Where("plan_id = ?", planID)
	}
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	offset := (page - 1) * pageSize
	if err := q.Preload("Institution").Order("id").Offset(offset).Limit(pageSize).Find(&list).Error; err != nil {
		return nil, 0, err
	}
	return list, total, nil
}

func (s *TestReportService) Get(id uint) (*model.TestReport, error) {
	var r model.TestReport
	if err := s.db.Preload("Institution").First(&r, id).Error; err != nil {
		return nil, err
	}
	return &r, nil
}

func (s *TestReportService) UpdateResult(id uint, result string, residualChlorine, turbidity, phValue float64) error {
	return s.db.Model(&model.TestReport{}).Where("id = ?", id).
		Updates(map[string]interface{}{
			"result":             result,
			"residual_chlorine":  residualChlorine,
			"turbidity":          turbidity,
			"ph_value":           phValue,
		}).Error
}

type TestInstitutionService struct {
	db *gorm.DB
}

func NewTestInstitutionService(db *gorm.DB) *TestInstitutionService {
	return &TestInstitutionService{db: db}
}

func (s *TestInstitutionService) List() ([]model.TestInstitution, error) {
	var list []model.TestInstitution
	if err := s.db.Order("id").Find(&list).Error; err != nil {
		return nil, err
	}
	return list, nil
}

func (s *TestInstitutionService) Create(inst *model.TestInstitution) error {
	return s.db.Create(inst).Error
}
