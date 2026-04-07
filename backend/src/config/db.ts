import mongoose from 'mongoose';

type DnsAnswer = {
  data?: string;
};

type DnsResponse = {
  Status?: number;
  Answer?: DnsAnswer[];
};

const DNS_RESOLVERS = [
  {
    name: 'Cloudflare',
    url: 'https://cloudflare-dns.com/dns-query',
    headers: { accept: 'application/dns-json' }
  }
];

const stripQuotes = (value: string) => value.replace(/^"(.*)"$/, '$1');

const isDnsLookupError = (error: any) => {
  const message = error?.message ?? String(error);
  return /querySrv|ENOTFOUND|EAI_AGAIN|ECONNREFUSED/i.test(message);
};

const resolveDnsRecords = async (
  name: string,
  type: 'SRV' | 'TXT'
): Promise<string[]> => {
  const errors: string[] = [];

  for (const resolver of DNS_RESOLVERS) {
    try {
      const response = await fetch(
        `${resolver.url}?name=${encodeURIComponent(name)}&type=${type}`,
        { headers: resolver.headers }
      );

      if (!response.ok) {
        throw new Error(`${resolver.name} DNS resolver returned ${response.status}`);
      }

      const payload = (await response.json()) as DnsResponse;
      if (payload.Status !== 0 || !Array.isArray(payload.Answer)) {
        return [];
      }

      return payload.Answer
        .map((answer) => answer.data?.trim())
        .filter((record): record is string => Boolean(record));
    } catch (error: any) {
      errors.push(`${resolver.name}: ${error?.message ?? String(error)}`);
    }
  }

  throw new Error(
    `Unable to resolve ${name} (${type}) through DNS-over-HTTPS: ${errors.join(' | ')}`
  );
};

const buildAtlasUri = async (srvUri: string) => {
  const parsed = new URL(srvUri);
  const hostname = parsed.hostname;
  const database = parsed.pathname.replace(/^\//, '');
  const username = decodeURIComponent(parsed.username);
  const password = decodeURIComponent(parsed.password);
  const searchParams = new URLSearchParams(parsed.searchParams);

  const [srvRecords, txtRecords] = await Promise.all([
    resolveDnsRecords(`_mongodb._tcp.${hostname}`, 'SRV'),
    resolveDnsRecords(hostname, 'TXT')
  ]);

  if (!srvRecords.length) {
    throw new Error(`No SRV records were returned for ${hostname}`);
  }

  const hosts = srvRecords.map((record) => {
    const parts = record.trim().split(/\s+/);
    const port = parts[2];
    const target = parts.slice(3).join(' ').replace(/\.$/, '');
    return `${target}:${port}`;
  });

  for (const record of txtRecords) {
    const clean = stripQuotes(record);
    for (const pair of clean.split('&')) {
      const [key, value] = pair.split('=');
      if (key && value && !searchParams.has(key)) {
        searchParams.set(key, value);
      }
    }
  }

  if (!searchParams.has('tls') && !searchParams.has('ssl')) {
    searchParams.set('tls', 'true');
  }

  if (!searchParams.has('authSource')) {
    searchParams.set('authSource', 'admin');
  }

  if (!searchParams.has('retryWrites')) {
    searchParams.set('retryWrites', 'true');
  }

  if (!searchParams.has('w')) {
    searchParams.set('w', 'majority');
  }

  const credentials =
    username.length > 0
      ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`
      : '';
  const query = searchParams.toString();

  return `mongodb://${credentials}${hosts.join(',')}/${database}${
    query ? `?${query}` : ''
  }`;
};

const buildDirectAtlasUris = (srvUri: string) => {
  const parsed = new URL(srvUri);
  const hostname = parsed.hostname;
  const database = parsed.pathname.replace(/^\//, '');
  const username = decodeURIComponent(parsed.username);
  const password = decodeURIComponent(parsed.password);
  const searchParams = new URLSearchParams(parsed.searchParams);

  const domainParts = hostname.split('.');
  const clusterName = domainParts.shift() ?? hostname;
  const domain = domainParts.join('.');
  const seeds = [0, 1, 2].map(
    (index) => `${clusterName}-shard-00-0${index}.${domain}:27017`
  );

  if (!searchParams.has('tls') && !searchParams.has('ssl')) {
    searchParams.set('tls', 'true');
  }

  if (!searchParams.has('authSource')) {
    searchParams.set('authSource', 'admin');
  }

  if (!searchParams.has('retryWrites')) {
    searchParams.set('retryWrites', 'true');
  }

  if (!searchParams.has('w')) {
    searchParams.set('w', 'majority');
  }

  const credentials =
    username.length > 0
      ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`
      : '';
  const query = searchParams.toString();

  return [
    `mongodb://${credentials}${seeds.join(',')}/${database}${query ? `?${query}` : ''}`
  ];
};

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI?.trim();

  if (!primaryUri) {
    throw new Error('MONGO_URI is not set. Add it to backend/.env before starting the server.');
  }

  try {
    const conn = await mongoose.connect(primaryUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return;
  } catch (error: any) {
    if (primaryUri.startsWith('mongodb+srv://') && isDnsLookupError(error)) {
      try {
        const fallbackUri = await buildAtlasUri(primaryUri);
        const conn = await mongoose.connect(fallbackUri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return;
      } catch (dnsFallbackError: any) {
        const directUris = buildDirectAtlasUris(primaryUri);
        const directUri = directUris[0];
        const conn = await mongoose.connect(directUri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return;
      }
    }

    throw error;
  }
};

export default connectDB;
