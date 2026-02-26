import axios from 'axios';

export type GeoLocation = {
  country?: string;
  city?: string;
  region?: string;
  isp?: string;
  lat?: number;
  lon?: number;
};

const resolveDefaultProvider = (ip: string) => `https://ipapi.co/${ip}/json/`;

export const lookupGeo = async (ip: string): Promise<GeoLocation | null> => {
  if (!ip || ip === '::1' || ip === '127.0.0.1') return null;
  try {
    const customUrl = process.env.GEOIP_API_URL;
    const apiKey = process.env.GEOIP_API_KEY;
    let url = customUrl ? customUrl.replace('{ip}', ip) : resolveDefaultProvider(ip);
    if (apiKey && url && !url.includes('apiKey')) {
      const joiner = url.includes('?') ? '&' : '?';
      url = `${url}${joiner}apiKey=${apiKey}`;
    }

    const response = await axios.get(url, { timeout: 5000 });
    const data = response.data || {};

    return {
      country: data.country_name || data.country || data.countryCode,
      city: data.city,
      region: data.region || data.regionName,
      isp: data.org || data.isp,
      lat: data.latitude || data.lat,
      lon: data.longitude || data.lon
    };
  } catch (error) {
    return null;
  }
};
