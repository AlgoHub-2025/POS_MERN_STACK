import { api } from './api'
import { Tenant } from '@/types'

class TenantService {
  async getTenants(): Promise<Tenant[]> {
    const response = await api.get<Tenant[]>('/tenants')
    return response.data
  }

  async getTenantById(tenantId: string): Promise<Tenant> {
    const response = await api.get<Tenant>(`/tenants/${tenantId}`)
    return response.data
  }

  async getTenantBySlug(slug: string): Promise<Tenant> {
    const response = await api.get<Tenant>(`/tenants/slug/${slug}`)
    return response.data
  }

  async createTenant(tenantData: Omit<Tenant, '_id' | 'createdAt' | 'updatedAt'>): Promise<Tenant> {
    const response = await api.post<Tenant>('/tenants', tenantData)
    return response.data
  }

  async updateTenant(tenantId: string, tenantData: Partial<Tenant>): Promise<Tenant> {
    const response = await api.put<Tenant>(`/tenants/${tenantId}`, tenantData)
    return response.data
  }

  async deleteTenant(tenantId: string): Promise<void> {
    await api.delete(`/tenants/${tenantId}`)
  }

  async activateTenant(tenantId: string): Promise<Tenant> {
    const response = await api.patch<Tenant>(`/tenants/${tenantId}/activate`)
    return response.data
  }

  async deactivateTenant(tenantId: string): Promise<Tenant> {
    const response = await api.patch<Tenant>(`/tenants/${tenantId}/deactivate`)
    return response.data
  }

  async getTenantStats(tenantId: string): Promise<{
    totalUsers: number
    totalProducts: number
    totalSales: number
    totalRevenue: number
  }> {
    const response = await api.get(`/tenants/${tenantId}/stats`)
    return response.data
  }

  async upgradeTenantPlan(tenantId: string, plan: 'basic' | 'pro' | 'enterprise'): Promise<Tenant> {
    const response = await api.patch<Tenant>(`/tenants/${tenantId}/upgrade`, { plan })
    return response.data
  }
}

export const tenantService = new TenantService()
