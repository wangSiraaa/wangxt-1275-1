package handler

import (
	"net/http"
	"strconv"

	"water-cleaning/internal/model"
	"water-cleaning/internal/service"

	"github.com/gin-gonic/gin"
)

type PropertyCompanyHandler struct {
	svc *service.PropertyCompanyService
}

func NewPropertyCompanyHandler(svc *service.PropertyCompanyService) *PropertyCompanyHandler {
	return &PropertyCompanyHandler{svc: svc}
}

func (h *PropertyCompanyHandler) List(c *gin.Context) {
	list, err := h.svc.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": list})
}

func (h *PropertyCompanyHandler) Create(c *gin.Context) {
	var m model.PropertyCompany
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

type NoticeHandler struct {
	svc *service.NoticeService
}

func NewNoticeHandler(svc *service.NoticeService) *NoticeHandler {
	return &NoticeHandler{svc: svc}
}

func (h *NoticeHandler) List(c *gin.Context) {
	pid, _ := strconv.ParseUint(c.Query("plan_id"), 10, 64)
	list, err := h.svc.List(uint(pid))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": list})
}
