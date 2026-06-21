package service

import (
	"water-cleaning/internal/model"

	"gorm.io/gorm"
)

type PropertyCompanyService struct {
	db *gorm.DB
}

func NewPropertyCompanyService(db *gorm.DB) *PropertyCompanyService {
	return &PropertyCompanyService{db: db}
}

func (s *PropertyCompanyService) List() ([]model.PropertyCompany, error) {
	var list []model.PropertyCompany
	if err := s.db.Order("id").Find(&list).Error; err != nil {
		return nil, err
	}
	return list, nil
}

func (s *PropertyCompanyService) Create(pc *model.PropertyCompany) error {
	return s.db.Create(pc).Error
}

type NoticeService struct {
	db *gorm.DB
}

func NewNoticeService(db *gorm.DB) *NoticeService {
	return &NoticeService{db: db}
}

func (s *NoticeService) List(planID uint) ([]model.Notice, error) {
	var list []model.Notice
	q := s.db.Model(&model.Notice{})
	if planID > 0 {
		q = q.Where("plan_id = ?", planID)
	}
	if err := q.Order("id").Find(&list).Error; err != nil {
		return nil, err
	}
	return list, nil
}
