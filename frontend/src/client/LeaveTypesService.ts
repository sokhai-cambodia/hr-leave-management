import { OpenAPI } from "@/client/core/OpenAPI"

export interface LeaveTypePublic {
    code: string
    name: string
    entitlement: number
    description: string
    is_allow_plan: boolean
    is_active: boolean
    id: string
}

export interface LeaveTypeCreate {
    code: string
    name: string
    entitlement: number
    description: string
    is_allow_plan: boolean
    is_active: boolean
}

export interface LeaveTypeUpdate {
    code?: string
    name?: string
    entitlement?: number
    description?: string
    is_allow_plan?: boolean
    is_active?: boolean
}

export interface LeaveTypesResponse {
    data: LeaveTypePublic[]
    count: number
}

const LeaveTypesService = {
    readLeaveTypes: async ({ skip, limit }: { skip?: number; limit?: number }): Promise<LeaveTypesResponse> => {
        const params = new URLSearchParams()
        if (skip !== undefined) params.append("skip", skip.toString())
        if (limit !== undefined) params.append("limit", limit.toString())
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/leave-types?${params}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        if (!response.ok) throw new Error("Failed to fetch leave types")
        return response.json()
    },
    createLeaveType: async ({ requestBody }: { requestBody: LeaveTypeCreate }) => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/leave-types`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
        })
        if (!response.ok) throw new Error("Failed to create leave type")
        return response.json()
    },
    updateLeaveType: async ({ id, requestBody }: { id: string; requestBody: LeaveTypeUpdate }) => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/leave-types/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
        })
        if (!response.ok) throw new Error("Failed to update leave type")
        return response.json()
    },
    deleteLeaveType: async ({ leaveTypeId }: { leaveTypeId: string }) => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/leave-types/${leaveTypeId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        if (!response.ok) throw new Error("Failed to delete leave type")
        return response.json()
    },
}

export default LeaveTypesService
