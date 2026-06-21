package service

import (
	"time"

	"water-cleaning/internal/model"

	"gorm.io/gorm"
)

type WaterTankService struct {
	db *gorm.DB
}

func NewWaterTankService(db *gorm.DB) *WaterTankService {
	return &WaterTankService{db: db}
}

func (s *WaterTankService) List(page, pageSize int) ([]model.WaterTank, int64, error) {
	var tanks []model.WaterTank
	var total int64
	if err := s.db.Model(&model.WaterTank{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	offset := (page - 1) * pageSize
	if err := s.db.Order("id").Offset(offset).Limit(pageSize).Find(&tanks).Error; err != nil {
		return nil, 0, err
	}
	return tanks, total, nil
}

func (s *WaterTankService) Get(id uint) (*model.WaterTank, error) {
	var tank model.WaterTank
	if err := s.db.First(&tank, id).Error; err != nil {
		return nil, err
	}
	return &tank, nil
}

func (s *WaterTankService) Create(tank *model.WaterTank) error {
	return s.db.Create(tank).Error
}

func (s *WaterTankService) Update(tank *model.WaterTank) error {
	return s.db.Save(tank).Error
}

func (s *WaterTankService) Delete(id uint) error {
	return s.db.Delete(&model.WaterTank{}, id).Error
}

func (s *WaterTankService) ListOverdue(deadline time.Time) ([]model.WaterTank, error) {
	var tanks []model.WaterTank
	if err := s.db.Where("next_clean_deadline IS NOT NULL AND next_clean_deadline < ? AND status = 'normal'", deadline).Find(&tanks).Error; err != nil {
		return nil, err
	}
	return tanks, nil
}
