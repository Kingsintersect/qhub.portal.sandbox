import axios from "axios"
import { API_BASE_URL } from "@/config/global.config"
import apiClient, { ApiRefreshHandler } from "../clients/apiClient"

export const refreshAccessToken: ApiRefreshHandler = async ({
  error,
  client,
}) => {
  try {
    // plain axios call — bypasses your ApiClient interceptors entirely
    const { data } = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true } // if refresh token lives in an httpOnly cookie
    )

    const newAccessToken = data?.access_token as string | undefined
    return newAccessToken ?? null
  } catch {
    // refresh itself failed — treat as full logout
    return null
  }
}
apiClient.setRefreshHandler(refreshAccessToken)
