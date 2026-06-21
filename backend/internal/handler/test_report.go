package handler

import (
	"net/http"
	"strconv"

	"water-cleaning/internal/model"
	"water-cleaning/internal/service"

	"github.com/gin-gonic/gin"
)

type TestReportHandler struct {
	svc *service.TestReportService
}

func NewTestReportHandler(svc *service.TestReportService) *TestReportHandler {
	return &TestReportHandler{svc: svc}
}

func (h *TestReportHandler) List(c *gin.Context) {
	pid, _ := strconv.ParseUint(c.Query("plan_id"), 10, 64)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	list, total, err := h.svc.List(uint(pid), page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": list, "total": total, "page": page, "page_size": pageSize})
}

func (h *TestReportHandler) Get(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	r, err := h.svc.Get(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "报告不存在"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": r})
}

type UpdateTestResultReq struct {
	Result            string  `json:"result" binding:"required"`
	ResidualChlorine  float64 `json:"residual_chlorine"`
	Turbidity         float64 `json:"turbidity"`
	PHValue           float64 `json:"ph_value"`
}

func (h *TestReportHandler) UpdateResult(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var req UpdateTestResultReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.svc.UpdateResult(uint(id), req.Result, req.ResidualChlorine, req.Turbidity, req.PHValue); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "更新成功"})
}

type TestInstitutionHandler struct {
	svc *service.TestInstitutionService
}

func NewTestInstitutionHandler(svc *service.TestInstitutionService) *TestInstitutionHandler {
	return &TestInstitutionHandler{svc: svc}
}

func (h *TestInstitutionHandler) List(c *gin.Context) {
	list, err := h.svc.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": list})
}

func (h *TestInstitutionHandler) Create(c *gin.Context) {
	var m model.TestInstitution
	if err := c.ShouldBindJSON(&m); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.svc.Create(&m); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": m})
}
