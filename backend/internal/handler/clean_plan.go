package handler

import (
	"net/http"
	"strconv"
	"time"

	"water-cleaning/internal/model"
	"water-cleaning/internal/service"

	"github.com/gin-gonic/gin"
)

type CleanPlanHandler struct {
	svc *service.CleanPlanService
}

func NewCleanPlanHandler(svc *service.CleanPlanService) *CleanPlanHandler {
	return &CleanPlanHandler{svc: svc}
}

func (h *CleanPlanHandler) List(c *gin.Context) {
	status := c.Query("status")
	tankID, _ := strconv.ParseUint(c.Query("tank_id"), 10, 64)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	plans, total, err := h.svc.ListPlans(status, uint(tankID), page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": plans, "total": total, "page": page, "page_size": pageSize})
}

func (h *CleanPlanHandler) Get(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	plan, err := h.svc.GetPlan(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "计划不存在"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": plan})
}

func (h *CleanPlanHandler) Create(c *gin.Context) {
	var plan model.CleanPlan
	if err := c.ShouldBindJSON(&plan); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.svc.CreatePlan(&plan); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": plan})
}

func (h *CleanPlanHandler) Update(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var plan model.CleanPlan
	if err := c.ShouldBindJSON(&plan); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	plan.ID = uint(id)
	if err := h.svc.UpdatePlan(&plan); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "更新成功"})
}

type PublishNoticeReq struct {
	NoticeTime   string `json:"notice_time" binding:"required"`
	PlannedStart string `json:"planned_start" binding:"required"`
	PlannedEnd   string `json:"planned_end" binding:"required"`
	Content      string `json:"content"`
}

func (h *CleanPlanHandler) PublishNotice(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var req PublishNoticeReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	noticeTime, err := parseDate(req.NoticeTime)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "公告日期格式错误"})
		return
	}
	plannedStart, err := parseDate(req.PlannedStart)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "计划开始日期格式错误"})
		return
	}
	plannedEnd, err := parseDate(req.PlannedEnd)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "计划结束日期格式错误"})
		return
	}

	notice := &model.Notice{
		PlanID:       uint(id),
		NoticeTime:   noticeTime,
		PlannedStart: plannedStart,
		PlannedEnd:   plannedEnd,
		Content:      req.Content,
	}
	if err := h.svc.PublishNotice(uint(id), notice); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": notice})
}

type StartCleaningReq struct {
	PersonnelIDs []uint `json:"personnel_ids" binding:"required"`
}

func (h *CleanPlanHandler) StartCleaning(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var req StartCleaningReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.svc.StartCleaning(uint(id), req.PersonnelIDs); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "清洗已开始"})
}

func (h *CleanPlanHandler) SubmitTestReport(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var report model.TestReport
	if err := c.ShouldBindJSON(&report); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.svc.SubmitTestReport(uint(id), &report); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": report})
}

func (h *CleanPlanHandler) ResumeWater(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if err := h.svc.ResumeWater(uint(id)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "供水已恢复"})
}

func (h *CleanPlanHandler) Cancel(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if err := h.svc.CancelPlan(uint(id)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "计划已取消"})
}

func (h *CleanPlanHandler) ListOverdue(c *gin.Context) {
	street := c.Query("street")
	plans, err := h.svc.ListOverduePlans(street)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": plans})
}

func parseDate(s string) (time.Time, error) {
	if s == "" {
		return time.Time{}, nil
	}
	return time.Parse("2006-01-02", s)
}
