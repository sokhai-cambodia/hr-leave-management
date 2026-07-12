import { useQuery } from "@tanstack/react-query"
import { TeamsService, type TeamPublic } from "@/client/TeamsService"

export const useTeams = () => {
    return useQuery({
        queryKey: ["teams", "all"],
        queryFn: async () => {
            // Fetch all teams without pagination for dropdown
            const response = await TeamsService.readTeams({ limit: 1000 })
            return response.data
        },
        select: (teams: TeamPublic[]) =>
            teams
                .filter(team => team.is_active) // Only active teams
                .map(team => ({
                    id: team.id,
                    name: team.name,
                })),
    })
}
