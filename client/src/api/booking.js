import API from './index';

export const scheduleVisit = async (data) => {
  const response = await API.post('/bookings', data);
  return response.data;
};

export const getMyBookings = async () => {
  const response = await API.get('/bookings');
  return response.data;
};

export const updateBookingStatus = async (id, status) => {
  const response = await API.put(`/bookings/${id}/status`, { status });
  return response.data;
};

export const downloadAgreement = async (id) => {
  const response = await API.get(`/bookings/${id}/agreement`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Agreement_${id}.pdf`);
  document.body.appendChild(link);
  link.click();
};
