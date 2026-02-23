import apiClient from "./apiClient";

function extractErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.msg || error?.response?.data?.message || fallbackMessage;
}

export const loginAPI = async (data) => {
  try {
    const response = await apiClient.post("/auth/login", data);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Login failed"));
  }
};

export const signupAPI = async (data) => {
  try {
    const response = await apiClient.post("/auth/signup", data);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Signup failed"));
  }
};
