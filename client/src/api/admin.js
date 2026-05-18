import API from './index';

export const getAdminStats = () => API.get('/admin/stats');
export const getPendingProperties = () => API.get('/admin/pending-properties');
export const approveProperty = (id, status) => API.patch(`/admin/properties/${id}/approve`, { status });
export const verifyProperty = (id, isVerified) => API.patch(`/admin/properties/${id}/verify`, { isVerified });
export const getAllReports = () => API.get('/admin/reports');
export const resolveReport = (id) => API.patch(`/admin/reports/${id}/resolve`);
