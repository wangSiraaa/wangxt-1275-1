package service

import (
	"time"

	"water-cleaning/internal/model"

	"gorm.io/gorm"
)

type ContractorService struct {
	db *gorm.DB
}

func NewContractorService(db *gorm.DB) *ContractorService {
	return &ContractorService{db: db}
}

func (s *ContractorService) List(page, pageSize int) ([]model.Contractor, int64, error) {
	var list []model.Contractor
	var total int64
	if err := s.db.Model(&model.Contractor{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	offset := (page - 1) * pageSize
	if err := s.db.Order("id").Offset(offset).Limit(pageSize).Find(&list).Error; err != nil {
		return nil, 0, err
	}
	return list, total, nil
}

func (s *ContractorService) Create(c *model.Contractor) error {
	return s.db.Create(c).Error
}

func (s *ContractorService) Update(c *model.Contractor) error {
	return s.db.Save(c).Error
}

type PersonnelService struct {
	db *gorm.DB
}

func NewPersonnelService(db *gorm.DB) *PersonnelService {
	return &PersonnelService{db: db}
}

func (s *PersonnelService) List(contractorID uint, page, pageSize int) ([]model.CleanPersonnel, int64, error) {
	var list []model.CleanPersonnel
	var total int64
	q := s.db.Model(&model.CleanPersonnel{})
	if contractorID > 0 {
		q = q.Where("contractor_id = ?", contractorID)
	}
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	offset := (page - 1) * pageSize
	if err := q.Preload("Contractor").Order("id").Offset(offset).Limit(pageSize).Find(&list).Error; err != nil {
		return nil, 0, err
	}
	return list, total, nil
}

func (s *PersonnelService) Create(p *model.CleanPersonnel) error {
	return s.db.Create(p).Error
}

func (s *PersonnelService) Update(p *model.CleanPersonnel) error {
	return s.db.Save(p).Error
}

func (s *PersonnelService) CheckHealthCert(id uint) (valid bool, expireDate *time.Time, err error) {
	var p model.CleanPersonnel
	if err := s.db.First(&p, id).Error; err != nil {
		return false, nil, err
	}
	now := time.Now()
	if p.HealthCertExpire != nil && p.HealthCertExpire.After(now) {
		return true, p.HealthCertExpire, nil
	}
	return false, p.HealthCertExpire, nil
}

type ChemicalService struct {
	db *gorm.DB
}

func NewChemicalService(db *gorm.DB) *ChemicalService {
	return &ChemicalService{db: db}
}

func (s *ChemicalService) List(contractorID uint, planID uint, page, pageSize int) ([]model.CleanChemical, int64, error) {
	var list []model.CleanChemical
	var total int64
	q := s.db.Model(&model.CleanChemical{})
	if contractorID > 0 {
		q = q.Where("contractor_id = ?", contractorID)
	}
	if planID > 0 {
		q = q.Where("plan_id = ?", planID)
	}
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	offset := (page - 1) * pageSize
	if err := q.Preload("Contractor").Order("id").Offset(offset).Limit(pageSize).Find(&list).Error; err != nil {
		return nil, 0, err
	}
	return list, total, nil
}

func (s *ChemicalService) Create(c *model.CleanChemical) error {
	c.RegisteredAt = time.Now()
	return s.db.Create(c).Error
}
