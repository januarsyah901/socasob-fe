// lib/admin-api.ts
// Helper functions untuk memanggil Admin API endpoints

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://be-socasob.hallojanu.xyz';

async function adminFetch(path: string, token: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || json.message || `Request gagal: ${res.status}`);
  }
  return json;
}

// ============================================================
// Stats
// ============================================================

export async function fetchAdminStats(token: string) {
  return adminFetch('/api/admin/stats', token);
}

// ============================================================
// Users
// ============================================================

export async function fetchAdminUsers(token: string, page = 1, limit = 20) {
  return adminFetch(`/api/admin/users?page=${page}&limit=${limit}`, token);
}

export async function fetchAdminUser(token: string, id: string) {
  return adminFetch(`/api/admin/users/${id}`, token);
}

export async function updateAdminUser(token: string, id: string, data: Record<string, unknown>) {
  return adminFetch(`/api/admin/users/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function updateAdminUserRole(token: string, id: string, role: 'admin' | 'user') {
  return adminFetch(`/api/admin/users/${id}/role`, token, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
}

export async function deleteAdminUser(token: string, id: string) {
  return adminFetch(`/api/admin/users/${id}`, token, { method: 'DELETE' });
}

// ============================================================
// Robots
// ============================================================

export async function fetchAdminRobots(token: string) {
  return adminFetch('/api/admin/robots', token);
}

export interface CreateRobotPayload {
  robotId: string;
  name: string;
  serialNumber?: string;
  ipAddress?: string;
  description?: string;
  status?: 'active' | 'inactive';
}

export async function createAdminRobot(token: string, data: CreateRobotPayload) {
  return adminFetch('/api/admin/robots', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAdminRobot(
  token: string,
  robotId: string,
  data: Partial<CreateRobotPayload>
) {
  return adminFetch(`/api/admin/robots/${robotId}`, token, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAdminRobot(token: string, robotId: string) {
  return adminFetch(`/api/admin/robots/${robotId}`, token, { method: 'DELETE' });
}

export async function unpairAdminRobot(token: string, robotId: string) {
  return adminFetch(`/api/admin/robots/${robotId}/unpair`, token, { method: 'PUT' });
}

// ============================================================
// ML Config
// ============================================================

export async function fetchMlConfig(token: string) {
  return adminFetch('/api/admin/ml-config', token);
}

export async function updateMlConfig(token: string, data: Record<string, unknown>) {
  return adminFetch('/api/admin/ml-config', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
