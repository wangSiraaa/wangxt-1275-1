package handler

import (
	"net/http"
	"strconv"

	"water-cleaning/internal/model"
	"water-cleaning/internal/service"

	"github.com/gin-gonic/gin"
)

type ContractorHandler struct {
	svc *service.ContractorService
}

func NewContractorHandler(svc *service.ContractorService) *ContractorHandler {
	return &ContractorHandler{svc: svc}
}

func (h *ContractorHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	list, total, err := h.svc.List(page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": list, "total": total, "page": page, "page_size": pageSize})
}

func (h *ContractorHandler) Create(c *gin.Context) {
	var m model.Contractor
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

func (h *ContractorHandler) Update(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var m model.Contractor
	if err := c.ShouldBindJSON(&m); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	m.ID = uint(id)
	if err := h.svc.Update(&m); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "更新成功"})
}

type PersonnelHandler struct {
	svc *service.PersonnelService
}

func NewPersonnelHandler(svc *service.PersonnelService) *PersonnelHandler {
	return &PersonnelHandler{svc: svc}
}

func (h *PersonnelHandler) List(c *gin.Context) {
	cid, _ := strconv.ParseUint(c.Query("contractor_id"), 10, 64)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	list, total, err := h.svc.List(uint(cid), page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": list, "total": total, "page": page, "page_size": pageSize})
}

func (h *PersonnelHandler) Create(c *gin.Context) {
	var m model.CleanPersonnel
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

func (h *PersonnelHandler) Update(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var m model.CleanPersonnel
	if err := c.ShouldBindJSON(&m); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	m.ID = uint(id)
	if err := h.svc.Update(&m); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "更新成功"})
}

func (h *PersonnelHandler) CheckHealthCert(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	valid, expireDate, err := h.svc.CheckHealthCert(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "人员不存在"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"valid": valid, "expire_date": expireDate})
}

type ChemicalHandler struct {
	svc *service.ChemicalService
}

func NewChemicalHandler(svc *service.ChemicalService) *ChemicalHandler {
	return &ChemicalHandler{svc: svc}
}

func (h *ChemicalHandler) List(c *gin.Context) {
	cid, _ := strconv.ParseUint(c.Query("contractor_id"), 10, 64)
	pid, _ := strconv.ParseUint(c.Query("plan_id"), 10, 64)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	list, total, err := h.svc.List(uint(cid), uint(pid), page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": list, "total": total, "page": page, "page_size": pageSize})
}

func (h *ChemicalHandler) Create(c *gin.Context) {
	var m model.CleanChemical
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
