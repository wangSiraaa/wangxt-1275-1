package model

import "time"

type WaterTank struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	CommunityName    string    `gorm:"size:200;not null" json:"community_name"`
	TankCode         string    `gorm:"size:50;unique;not null" json:"tank_code"`
	TankName         string    `gorm:"size:200;not null" json:"tank_name"`
	Address          string    `gorm:"size:500" json:"address"`
	Capacity         float64   `json:"capacity"`
	LastCleanedAt    *time.Time `json:"last_cleaned_at"`
	NextCleanDeadline *time.Time `json:"next_clean_deadline"`
	Status           string    `gorm:"size:20;default:normal" json:"status"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

type PropertyCompany struct {
	ID           uint   `gorm:"primaryKey" json:"id"`
	Name         string `gorm:"size:200;not null" json:"name"`
	ContactPerson string `gorm:"size:50" json:"contact_person"`
	ContactPhone string `gorm:"size:20" json:"contact_phone"`
	CreatedAt    time.Time `json:"created_at"`
}

type Contractor struct {
	ID           uint   `gorm:"primaryKey" json:"id"`
	Name         string `gorm:"size:200;not null" json:"name"`
	LicenseNo    string `gorm:"size:100" json:"license_no"`
	ContactPerson string `gorm:"size:50" json:"contact_person"`
	ContactPhone string `gorm:"size:20" json:"contact_phone"`
	Status       string `gorm:"size:20;default:active" json:"status"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type CleanPersonnel struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	ContractorID     uint      `gorm:"not null;index" json:"contractor_id"`
	Name             string    `gorm:"size:50;not null" json:"name"`
	IDCard           string    `gorm:"size:18;not null" json:"id_card"`
	HealthCertNo     string    `gorm:"size:100" json:"health_cert_no"`
	HealthCertExpire *time.Time `json:"health_cert_expire"`
	Status           string    `gorm:"size:20;default:active" json:"status"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
	Contractor       Contractor `gorm:"foreignKey:ContractorID" json:"contractor,omitempty"`
}

type CleanChemical struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	ContractorID  uint      `gorm:"not null;index" json:"contractor_id"`
	PlanID        *uint     `gorm:"index" json:"plan_id"`
	ChemicalName  string    `gorm:"size:200;not null" json:"chemical_name"`
	BatchNo       string    `gorm:"size:100" json:"batch_no"`
	Dosage        float64   `json:"dosage"`
	Unit          string    `gorm:"size:20" json:"unit"`
	RegisteredAt  time.Time `json:"registered_at"`
	Contractor    Contractor `gorm:"foreignKey:ContractorID" json:"contractor,omitempty"`
}

type TestInstitution struct {
	ID             uint   `gorm:"primaryKey" json:"id"`
	Name           string `gorm:"size:200;not null" json:"name"`
	QualificationNo string `gorm:"size:100" json:"qualification_no"`
	ContactPerson  string `gorm:"size:50" json:"contact_person"`
	ContactPhone   string `gorm:"size:20" json:"contact_phone"`
	CreatedAt      time.Time `json:"created_at"`
}

const (
	PlanStatusDraft     = "draft"
	PlanStatusAnnounced = "announced"
	PlanStatusInProgress = "in_progress"
	PlanStatusTesting   = "testing"
	PlanStatusCompleted = "completed"
	PlanStatusCancelled = "cancelled"
)

type CleanPlan struct {
	ID                uint       `gorm:"primaryKey" json:"id"`
	TankID            uint       `gorm:"not null;index" json:"tank_id"`
	PropertyCompanyID uint       `gorm:"not null;index" json:"property_company_id"`
	ContractorID      *uint      `gorm:"index" json:"contractor_id"`
	PlanDate          time.Time  `gorm:"type:date;not null" json:"plan_date"`
	Status            string     `gorm:"size:20;default:draft;not null" json:"status"`
	AnnouncedAt       *time.Time `json:"announced_at"`
	StartedAt         *time.Time `json:"started_at"`
	CompletedAt       *time.Time `json:"completed_at"`
	WaterResumedAt    *time.Time `json:"water_resumed_at"`
	Remark            string     `gorm:"size:500" json:"remark"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
	Tank              WaterTank       `gorm:"foreignKey:TankID" json:"tank,omitempty"`
	PropertyCompany   PropertyCompany `gorm:"foreignKey:PropertyCompanyID" json:"property_company,omitempty"`
	Contractor        *Contractor     `gorm:"foreignKey:ContractorID" json:"contractor,omitempty"`
	Personnel         []CleanPlanPersonnel `gorm:"foreignKey:PlanID" json:"personnel,omitempty"`
	Chemicals         []CleanChemical      `gorm:"foreignKey:PlanID" json:"chemicals,omitempty"`
	TestReports       []TestReport        `gorm:"foreignKey:PlanID" json:"test_reports,omitempty"`
	Notices           []Notice            `gorm:"foreignKey:PlanID" json:"notices,omitempty"`
}

type CleanPlanPersonnel struct {
	ID           uint   `gorm:"primaryKey" json:"id"`
	PlanID       uint   `gorm:"not null;index" json:"plan_id"`
	PersonnelID  uint   `gorm:"not null;index" json:"personnel_id"`
	Role         string `gorm:"size:50" json:"role"`
	Personnel    CleanPersonnel `gorm:"foreignKey:PersonnelID" json:"personnel,omitempty"`
}

type TestReport struct {
	ID               uint       `gorm:"primaryKey" json:"id"`
	PlanID           uint       `gorm:"not null;index" json:"plan_id"`
	InstitutionID    uint       `gorm:"not null;index" json:"institution_id"`
	ResidualChlorine float64    `json:"residual_chlorine"`
	Turbidity        float64    `json:"turbidity"`
	PHValue          float64    `json:"ph_value"`
	TestTime         time.Time  `json:"test_time"`
	Result           string     `gorm:"size:20;not null" json:"result"`
	ReportNo         string     `gorm:"size:100" json:"report_no"`
	CreatedAt        time.Time  `json:"created_at"`
	Institution      TestInstitution `gorm:"foreignKey:InstitutionID" json:"institution,omitempty"`
}

type Notice struct {
	ID                uint       `gorm:"primaryKey" json:"id"`
	PlanID            uint       `gorm:"not null;index" json:"plan_id"`
	NoticeTime        time.Time  `gorm:"type:date;not null" json:"notice_time"`
	PlannedStart      time.Time  `gorm:"type:date;not null" json:"planned_start"`
	PlannedEnd        time.Time  `gorm:"type:date;not null" json:"planned_end"`
	ActualPublishedAt *time.Time `json:"actual_published_at"`
	IsSufficient      bool       `gorm:"default:false" json:"is_sufficient"`
	Content           string     `gorm:"type:text" json:"content"`
	CreatedAt         time.Time  `json:"created_at"`
}

func AllModels() []interface{} {
	return []interface{}{
		&WaterTank{},
		&PropertyCompany{},
		&Contractor{},
		&CleanPersonnel{},
		&CleanChemical{},
		&TestInstitution{},
		&CleanPlan{},
		&CleanPlanPersonnel{},
		&TestReport{},
		&Notice{},
	}
}
