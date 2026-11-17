export const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
export const API_BASE_URL = `${API_ORIGIN}/api`;

export async function getProjects() {
  const response = await fetch(`${API_BASE_URL}/projects`);

  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }

  const result = await response.json();
  return result.data;
}

export async function sendContactMessage(payload) {
  const response = await fetch(`${API_BASE_URL}/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to send message.");
  }

  return result;
}

export async function getExperience() {
  const response = await fetch(`${API_BASE_URL}/experience`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch experience");
  }

  return result.data;
}

export async function getCertificates() {
  const response = await fetch(`${API_BASE_URL}/documents/certificates`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch certificates");
  }

  return result.data;
}


export async function getResume() {
  const response = await fetch(`${API_BASE_URL}/documents/resume`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch resume");
  }

  return result.data;
}
export const getFileUrl = (filePath) =>
  filePath
    ? (filePath.startsWith("http") ? filePath : `${API_ORIGIN}${filePath}`)
    : "";

