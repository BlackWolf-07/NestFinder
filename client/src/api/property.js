import API from './index';

export const getProperties = async (filters) => {
  const response = await API.get('/properties', { params: filters });
  return response.data;
};

export const getFeaturedProperties = async () => {
  const response = await API.get('/properties/featured');
  return response.data;
};

export const getMyProperties = async () => {
  const response = await API.get('/properties/my');
  return response.data;
};

export const getPropertyDetails = async (id) => {
  const response = await API.get(`/properties/${id}`);
  return response.data;
};

export const createProperty = async (formData) => {
  const response = await API.post('/properties/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateProperty = async (id, data) => {
  const response = await API.put(`/properties/${id}`, data);
  return response.data;
};

export const deleteProperty = async (id) => {
  const response = await API.delete(`/properties/${id}`);
  return response.data;
};

export const downloadAgreement = async (id) => {
  const response = await API.get(`/properties/${id}/agreement`, {
    responseType: 'blob'
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Rental_Agreement_${id}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
