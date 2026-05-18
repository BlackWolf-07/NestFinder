import API from './index';

export const reportProperty = (reportData) => API.post('/reports', reportData);
