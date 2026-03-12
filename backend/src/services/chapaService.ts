import axios from 'axios';

export const initializePayment = async (
  amount: number,
  currency: string,
  email: string,
  firstName: string,
  lastName: string,
  tx_ref: string,
  callbackUrl: string,
  returnUrl: string
) => {
  try {
    const baseUrl = (process.env.CHAPA_BASE_URL || 'https://api.chapa.co/v1').trim();
    const secretKey = (process.env.CHAPA_SECRET_KEY || '').trim();
    if (!baseUrl) {
      throw new Error('CHAPA_BASE_URL is not configured');
    }
    if (!secretKey) {
      throw new Error('CHAPA_SECRET_KEY is not configured');
    }
    const config = {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    };

    const data = {
      amount,
      currency,
      email,
      first_name: firstName,
      last_name: lastName,
      tx_ref,
      callback_url: callbackUrl,
      return_url: returnUrl,
      customization: {
        title: 'Abel Accessories',
        description: 'Order payment'
      }
    };

    const response = await axios.post(`${baseUrl}/transaction/initialize`, data, config);
    return response.data;
  } catch (error: any) {
    const responseData = error?.response?.data;
    if (responseData) {
      if (typeof responseData === 'string') {
        throw new Error(responseData);
      }
      if (typeof responseData?.message === 'string') {
        throw new Error(responseData.message);
      }
      throw new Error(JSON.stringify(responseData));
    }
    throw new Error(error?.message || 'Chapa initialize failed');
  }
};

export const verifyPayment = async (tx_ref: string) => {
  try {
    const baseUrl = (process.env.CHAPA_BASE_URL || 'https://api.chapa.co/v1').trim();
    const secretKey = (process.env.CHAPA_SECRET_KEY || '').trim();
    if (!baseUrl) {
      throw new Error('CHAPA_BASE_URL is not configured');
    }
    if (!secretKey) {
      throw new Error('CHAPA_SECRET_KEY is not configured');
    }
    const config = {
      headers: {
        Authorization: `Bearer ${secretKey}`
      }
    };

    const response = await axios.get(`${baseUrl}/transaction/verify/${tx_ref}`, config);
    return response.data;
  } catch (error: any) {
    const responseData = error?.response?.data;
    if (responseData) {
      if (typeof responseData === 'string') {
        throw new Error(responseData);
      }
      if (typeof responseData?.message === 'string') {
        throw new Error(responseData.message);
      }
      throw new Error(JSON.stringify(responseData));
    }
    throw new Error(error?.message || 'Chapa verification failed');
  }
};
