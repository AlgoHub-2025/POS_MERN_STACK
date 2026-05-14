import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Tenant } from '@/types'
import { tenantService } from '@/services/tenantService'

interface TenantState {
  currentTenant: Tenant | null
  tenants: Tenant[]
  isLoading: boolean
  error: string | null
  selectedTenantId: string | null
}

const initialState: TenantState = {
  currentTenant: null,
  tenants: [],
  isLoading: false,
  error: null,
  selectedTenantId: null,
}

// Async thunks
export const fetchTenants = createAsyncThunk(
  'tenant/fetchTenants',
  async (_, { rejectWithValue }) => {
    try {
      const tenants = await tenantService.getTenants()
      return tenants
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tenants')
    }
  }
)

export const fetchTenantById = createAsyncThunk(
  'tenant/fetchTenantById',
  async (tenantId: string, { rejectWithValue }) => {
    try {
      const tenant = await tenantService.getTenantById(tenantId)
      return tenant
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tenant')
    }
  }
)

export const createTenant = createAsyncThunk(
  'tenant/createTenant',
  async (tenantData: Omit<Tenant, 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const tenant = await tenantService.createTenant(tenantData)
      return tenant
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create tenant')
    }
  }
)

export const updateTenant = createAsyncThunk(
  'tenant/updateTenant',
  async ({ tenantId, tenantData }: { tenantId: string; tenantData: Partial<Tenant> }, { rejectWithValue }) => {
    try {
      const tenant = await tenantService.updateTenant(tenantId, tenantData)
      return tenant
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update tenant')
    }
  }
)

export const deleteTenant = createAsyncThunk(
  'tenant/deleteTenant',
  async (tenantId: string, { rejectWithValue }) => {
    try {
      await tenantService.deleteTenant(tenantId)
      return tenantId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete tenant')
    }
  }
)

const tenantSlice = createSlice({
  name: 'tenant',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentTenant: (state, action: PayloadAction<Tenant>) => {
      state.currentTenant = action.payload
      state.selectedTenantId = action.payload.id
    },
    clearCurrentTenant: (state) => {
      state.currentTenant = null
      state.selectedTenantId = null
    },
    setSelectedTenantId: (state, action: PayloadAction<string>) => {
      state.selectedTenantId = action.payload
    },
    updateTenantInList: (state, action: PayloadAction<Tenant>) => {
      const index = state.tenants.findIndex(t => t.id === action.payload.id)
      if (index !== -1) {
        state.tenants[index] = action.payload
      }
      if (state.currentTenant?.id === action.payload.id) {
        state.currentTenant = action.payload
      }
    },
    removeTenantFromList: (state, action: PayloadAction<string>) => {
      state.tenants = state.tenants.filter(t => t.id !== action.payload)
      if (state.currentTenant?.id === action.payload) {
        state.currentTenant = null
        state.selectedTenantId = null
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Tenants
    builder
      .addCase(fetchTenants.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTenants.fulfilled, (state, action) => {
        state.isLoading = false
        state.tenants = action.payload
        state.error = null
      })
      .addCase(fetchTenants.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch Tenant by ID
    builder
      .addCase(fetchTenantById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTenantById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentTenant = action.payload
        state.selectedTenantId = action.payload.id
        state.error = null
      })
      .addCase(fetchTenantById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Create Tenant
    builder
      .addCase(createTenant.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createTenant.fulfilled, (state, action) => {
        state.isLoading = false
        state.tenants.push(action.payload)
        state.error = null
      })
      .addCase(createTenant.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Update Tenant
    builder
      .addCase(updateTenant.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateTenant.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.tenants.findIndex(t => t.id === action.payload.id)
        if (index !== -1) {
          state.tenants[index] = action.payload
        }
        if (state.currentTenant?.id === action.payload.id) {
          state.currentTenant = action.payload
        }
        state.error = null
      })
      .addCase(updateTenant.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Delete Tenant
    builder
      .addCase(deleteTenant.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteTenant.fulfilled, (state, action) => {
        state.isLoading = false
        state.tenants = state.tenants.filter(t => t.id !== action.payload)
        if (state.currentTenant?.id === action.payload) {
          state.currentTenant = null
          state.selectedTenantId = null
        }
        state.error = null
      })
      .addCase(deleteTenant.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const {
  clearError,
  setCurrentTenant,
  clearCurrentTenant,
  setSelectedTenantId,
  updateTenantInList,
  removeTenantFromList,
} = tenantSlice.actions

// Selectors
export const selectCurrentTenant = (state: { tenant: TenantState }) => state.tenant.currentTenant
export const selectTenants = (state: { tenant: TenantState }) => state.tenant.tenants
export const selectTenantLoading = (state: { tenant: TenantState }) => state.tenant.isLoading
export const selectTenantError = (state: { tenant: TenantState }) => state.tenant.error
export const selectSelectedTenantId = (state: { tenant: TenantState }) => state.tenant.selectedTenantId

export default tenantSlice.reducer
