package handler

import (
	"net/http"
	"strconv"
	"time"

	"water-cleaning/internal/model"
	"water-cleaning/internal/service"

	"github.com/gin-gonic/gin"
)

type WaterTankHandler struct {
	svc *service.WaterTankService
}

func NewWaterTankHandler(svc *service.WaterTankService) *WaterTankHandler {
	return &WaterTankHandler{svc: svc}
}

func (h *WaterTankHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	tanks, total, err := h.svc.List(page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": tanks, "total": total, "page": page, "page_size": pageSize})
}

func (h *WaterTankHandler) Get(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	tank, err := h.svc.Get(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "水箱不存在"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": tank})
}

func (h *WaterTankHandler) Create(c *gin.Context) {
	var tank model.WaterTank
	if err := c.ShouldBindJSON(&tank); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.svc.Create(&tank); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": tank})
}

func (h *WaterTankHandler) Update(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var tank model.WaterTank
	if err := c.ShouldBindJSON(&tank); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	tank.ID = uint(id)
	if err := h.svc.Update(&tank); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "更新成功"})
}

func (h *WaterTankHandler) Delete(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if err := h.svc.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

func (h *WaterTankHandler) ListOverdue(c *gin.Context) {
	tanks, err := h.svc.ListOverdue(time.Now())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": tanks})
}
