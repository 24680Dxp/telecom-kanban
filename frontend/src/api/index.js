import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// 项目
export const getProjects = () => api.get('/projects').then(r => r.data)
export const getProject = (id) => api.get(`/projects/${id}`).then(r => r.data)
export const createProject = (data) => api.post('/projects', data).then(r => r.data)
export const updateProject = (id, data) => api.put(`/projects/${id}`, data).then(r => r.data)
export const deleteProject = (id) => api.delete(`/projects/${id}`).then(r => r.data)

// 阶段
export const getStages = (projectId) => api.get(`/projects/${projectId}/stages`).then(r => r.data)
export const createStage = (projectId, data) => api.post(`/projects/${projectId}/stages`, data).then(r => r.data)
export const updateStage = (id, data) => api.put(`/stages/${id}`, data).then(r => r.data)
export const deleteStage = (id) => api.delete(`/stages/${id}`).then(r => r.data)
export const reorderStages = (projectId, stages) => api.put(`/projects/${projectId}/stages/reorder`, { stages }).then(r => r.data)

// 接入点
export const getAccessPoints = (projectId, stageId) => {
  const params = stageId !== undefined ? { stage_id: stageId } : {}
  return api.get(`/projects/${projectId}/access-points`, { params }).then(r => r.data)
}
export const createAccessPoint = (data) => api.post('/access-points', data).then(r => r.data)
export const updateAccessPoint = (id, data) => api.put(`/access-points/${id}`, data).then(r => r.data)
export const deleteAccessPoint = (id) => api.delete(`/access-points/${id}`).then(r => r.data)
export const moveAccessPoint = (id, data) => api.put(`/access-points/${id}/move`, data).then(r => r.data)
export const uploadAccessPoints = (projectId, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post(`/projects/${projectId}/access-points/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  }).then(r => r.data)
}
export const parseTextReport = (projectId, text) =>
  api.post(`/projects/${projectId}/access-points/parse-text`, { text }).then(r => r.data)
