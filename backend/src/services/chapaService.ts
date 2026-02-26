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
    const config = {
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
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
        title: 'Abel Accessories Payment',
        description: 'Payment for order'
      }
    };

    const response = await axios.post(`${process.env.CHAPA_BASE_URL}/transaction/initialize`, data, config);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response ? error.response.data.message : error.message);
  }
};

export const verifyPayment = async (tx_ref: string) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`
      }
    };

    const response = await axios.get(`${process.env.CHAPA_BASE_URL}/transaction/verify/${tx_ref}`, config);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response ? error.response.data.message : error.message);
  }
};
