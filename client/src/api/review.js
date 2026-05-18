import API from './index';

export const getReviews = (propertyId) => API.get(`/reviews/${propertyId}`);
export const addReview = (reviewData) => API.post('/reviews', reviewData);
export const deleteReview = (id) => API.delete(`/reviews/${id}`);
