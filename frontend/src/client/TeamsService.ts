import { OpenAPI } from "@/client/core/OpenAPI"

export interface TeamMember {
  id: string
  name: string
  email: string
}

export interface TeamOwner {
  id: string
  full_name: string
  email: string
}

export interface TeamPublic {
  name: string
  description: string
  team_owner_id: string
  is_active: boolean
  id: string
  team_members: TeamMember[]
  team_owner: TeamOwner
  // Legacy fields (for backward compatibility)
  full_name?: string
  email?: string
}

export interface TeamCreate {
  name: string
  description: string
  team_owner_id: string
  is_active: boolean
}

export interface TeamUpdate {
  name: string
  description: string
  team_owner_id: string
  is_active: boolean
}

export interface TeamsResponse {
  data: TeamPublic[]
  count: number
}

export const TeamsService = {
  readTeams: async ({ skip, limit }: { skip?: number; limit?: number }): Promise<TeamsResponse> => {
    const params = new URLSearchParams()
    if (skip !== undefined) params.append("skip", skip.toString())
    if (limit !== undefined) params.append("limit", limit.toString())
    const baseUrl = OpenAPI.BASE || ""
    const token = localStorage.getItem("access_token") || ""
    const response = await fetch(`${baseUrl}/api/v1/teams/?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error("Failed to fetch teams")
    return response.json()
  },

  createTeam: async ({ requestBody }: { requestBody: TeamCreate }) => {
    const baseUrl = OpenAPI.BASE || ""
    const token = localStorage.getItem("access_token") || ""
    const response = await fetch(`${baseUrl}/api/v1/teams/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    })
    if (!response.ok) throw new Error("Failed to create team")
    return response.json()
  },

  updateTeam: async ({ id, requestBody }: { id: string; requestBody: TeamUpdate }) => {
    const baseUrl = OpenAPI.BASE || ""
    const token = localStorage.getItem("access_token") || ""
    const response = await fetch(`${baseUrl}/api/v1/teams/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    })
    if (!response.ok) throw new Error("Failed to update team")
    return response.json()
  },

  deleteTeam: async ({ teamId }: { teamId: string }) => {
    const baseUrl = OpenAPI.BASE || ""
    const token = localStorage.getItem("access_token") || ""
    const response = await fetch(`${baseUrl}/api/v1/teams/${teamId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error("Failed to delete team")
    return response.json()
  },

  getTeam: async ({ id }: { id: string }): Promise<TeamPublic> => {
    const baseUrl = OpenAPI.BASE || ""
    const token = localStorage.getItem("access_token") || ""
    const response = await fetch(`${baseUrl}/api/v1/teams/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error("Failed to fetch team")
    return response.json()
  },
}
