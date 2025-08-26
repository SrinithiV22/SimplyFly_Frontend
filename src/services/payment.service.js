import axios from 'axios';

const API_BASE_URL = 'http://localhost:5148/api/v1';

// Get all payments
export const getPaymentHistory = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/Payment`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get payment history error:', error);
    throw error;
  }
};

// Get payments with pagination
export const getPaymentsPaged = async (pageNumber = 1, pageSize = 10) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/Payment/paged`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: { pageNumber, pageSize }
    });
    return response.data;
  } catch (error) {
    console.error('Get payments paged error:', error);
    throw error;
  }
};

// Get all refunds
export const getRefundStatus = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/Refund`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get refund status error:', error);
    throw error;
  }
};

// Get refunds with pagination
export const getRefundsPaged = async (pageNumber = 1, pageSize = 10) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/Refund/paged`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: { pageNumber, pageSize }
    });
    return response.data;
  } catch (error) {
    console.error('Get refunds paged error:', error);
    throw error;
  }
};

// Get payment details by ID
export const getPaymentDetails = async (paymentId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/Payment/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get payment details error:', error);
    throw error;
  }
};

// Create new payment
export const createPayment = async (paymentData) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(`${API_BASE_URL}/Payment`, paymentData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Create payment error:', error);
    throw error;
  }
};

// Update payment
export const updatePayment = async (paymentId, paymentData) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.put(`${API_BASE_URL}/Payment/${paymentId}`, paymentData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Update payment error:', error);
    throw error;
  }
};

// Delete payment
export const deletePayment = async (paymentId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.delete(`${API_BASE_URL}/Payment/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Delete payment error:', error);
    throw error;
  }
};

// Download receipt
export const downloadReceipt = async (paymentId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/Payment/${paymentId}/receipt`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading receipt:', error);
    throw error;
  }
};

// Create refund request
export const requestRefund = async (refundData) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(`${API_BASE_URL}/Refund`, refundData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Request refund error:', error);
    throw error;
  }
};

// Get refund by ID
export const getRefundById = async (refundId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/Refund/${refundId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get refund by ID error:', error);
    throw error;
  }
};

// Delete refund
export const deleteRefund = async (refundId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.delete(`${API_BASE_URL}/Refund/${refundId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Delete refund error:', error);
    throw error;
  }
};
