package main

import (
	"log"

	"water-cleaning/internal/config"
	"water-cleaning/internal/handler"
	"water-cleaning/internal/middleware"
	"water-cleaning/internal/model"
	"water-cleaning/internal/service"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	cfg := config.Load()

	db, err := gorm.Open(postgres.Open(cfg.DSN()), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	if err := db.AutoMigrate(model.AllModels()...); err != nil {
		log.Fatalf("failed to migrate: %v", err)
	}

	seedBasicData(db)

	tankSvc := service.NewWaterTankService(db)
	planSvc := service.NewCleanPlanService(db)
	contractorSvc := service.NewContractorService(db)
	personnelSvc := service.NewPersonnelService(db)
	chemicalSvc := service.NewChemicalService(db)
	testReportSvc := service.NewTestReportService(db)
	testInstSvc := service.NewTestInstitutionService(db)
	propertySvc := service.NewPropertyCompanyService(db)
	noticeSvc := service.NewNoticeService(db)

	tankH := handler.NewWaterTankHandler(tankSvc)
	planH := handler.NewCleanPlanHandler(planSvc)
	contractorH := handler.NewContractorHandler(contractorSvc)
	personnelH := handler.NewPersonnelHandler(personnelSvc)
	chemicalH := handler.NewChemicalHandler(chemicalSvc)
	testReportH := handler.NewTestReportHandler(testReportSvc)
	testInstH := handler.NewTestInstitutionHandler(testInstSvc)
	propertyH := handler.NewPropertyCompanyHandler(propertySvc)
	noticeH := handler.NewNoticeHandler(noticeSvc)

	r := gin.Default()
	r.Use(middleware.CORS())

	api := r.Group("/api/v1")
	{
		tanks := api.Group("/tanks")
		{
			tanks.GET("", tankH.List)
			tanks.GET("/:id", tankH.Get)
			tanks.POST("", tankH.Create)
			tanks.PUT("/:id", tankH.Update)
			tanks.DELETE("/:id", tankH.Delete)
			tanks.GET("/overdue", tankH.ListOverdue)
		}

		plans := api.Group("/plans")
		{
			plans.GET("", planH.List)
			plans.GET("/:id", planH.Get)
			plans.POST("", planH.Create)
			plans.PUT("/:id", planH.Update)
			plans.POST("/:id/notice", planH.PublishNotice)
			plans.POST("/:id/start", planH.StartCleaning)
			plans.POST("/:id/test-report", planH.SubmitTestReport)
			plans.POST("/:id/resume-water", planH.ResumeWater)
			plans.POST("/:id/cancel", planH.Cancel)
			plans.GET("/overdue", planH.ListOverdue)
		}

		contractors := api.Group("/contractors")
		{
			contractors.GET("", contractorH.List)
			contractors.POST("", contractorH.Create)
			contractors.PUT("/:id", contractorH.Update)
		}

		personnel := api.Group("/personnel")
		{
			personnel.GET("", personnelH.List)
			personnel.POST("", personnelH.Create)
			personnel.PUT("/:id", personnelH.Update)
			personnel.GET("/:id/health-cert", personnelH.CheckHealthCert)
		}

		chemicals := api.Group("/chemicals")
		{
			chemicals.GET("", chemicalH.List)
			chemicals.POST("", chemicalH.Create)
		}

		testReports := api.Group("/test-reports")
		{
			testReports.GET("", testReportH.List)
			testReports.GET("/:id", testReportH.Get)
			testReports.PUT("/:id/result", testReportH.UpdateResult)
		}

		testInstitutions := api.Group("/test-institutions")
		{
			testInstitutions.GET("", testInstH.List)
			testInstitutions.POST("", testInstH.Create)
		}

		propertyCompanies := api.Group("/property-companies")
		{
			propertyCompanies.GET("", propertyH.List)
			propertyCompanies.POST("", propertyH.Create)
		}

		notices := api.Group("/notices")
		{
			notices.GET("", noticeH.List)
		}
	}

	log.Printf("Server starting on :%s", cfg.ServerPort)
	if err := r.Run(":" + cfg.ServerPort); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}

func seedBasicData(db *gorm.DB) {
	var count int64
	db.Model(&model.PropertyCompany{}).Count(&count)
	if count > 0 {
		return
	}

	pc1 := model.PropertyCompany{Name: "万科物业", ContactPerson: "张伟", ContactPhone: "13800138001"}
	pc2 := model.PropertyCompany{Name: "保利物业", ContactPerson: "李明", ContactPhone: "13800138002"}
	db.Create(&pc1)
	db.Create(&pc2)

	c1 := model.Contractor{Name: "洁净清洗公司", LicenseNo: "CL-2024-001", ContactPerson: "王强", ContactPhone: "13900139001", Status: "active"}
	c2 := model.Contractor{Name: "清水消毒服务", LicenseNo: "CL-2024-002", ContactPerson: "赵磊", ContactPhone: "13900139002", Status: "active"}
	db.Create(&c1)
	db.Create(&c2)

	ti1 := model.TestInstitution{Name: "城市水质检测中心", QualificationNo: "QI-2024-001", ContactPerson: "陈静", ContactPhone: "13700137001"}
	ti2 := model.TestInstitution{Name: "卫生检测研究院", QualificationNo: "QI-2024-002", ContactPerson: "刘芳", ContactPhone: "13700137002"}
	db.Create(&ti1)
	db.Create(&ti2)

	t1 := model.WaterTank{CommunityName: "阳光花园", TankCode: "TK-001", TankName: "1号楼顶水箱", Address: "阳光花园1号楼顶", Capacity: 50, Status: "normal"}
	t2 := model.WaterTank{CommunityName: "碧水湾", TankCode: "TK-002", TankName: "地下车库水箱", Address: "碧水湾B1层", Capacity: 80, Status: "normal"}
	t3 := model.WaterTank{CommunityName: "翠湖山庄", TankCode: "TK-003", TankName: "3号楼顶水箱", Address: "翠湖山庄3号楼顶", Capacity: 60, Status: "normal"}
	db.Create(&t1)
	db.Create(&t2)
	db.Create(&t3)
}
