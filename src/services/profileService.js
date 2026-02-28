import apiClient from "./apiClient";

export const getAuthenticatedProfile = async () => {
  const response = await apiClient.get("/profile");
  return response.data?.profile || null;
};
