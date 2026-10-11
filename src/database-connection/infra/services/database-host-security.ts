import { lookup as dnsLookup } from "node:dns/promises";
import { isIP, Socket } from "node:net";
import { checkServerIdentity, connect as tlsConnect, TLSSocket } from "node:tls";

export class UnsafeDatabaseHostError extends Error {
  constructor() {
    super("Database host is not allowed");
    this.name = "UnsafeDatabaseHostError";
  }
}

export class DatabaseConnectionTimeoutError extends Error {
  constructor() {
    super("Database connection test timed out");
    this.name = "DatabaseConnectionTimeoutError";
  }
}

export class MysqlTlsConfigurationError extends Error {
  constructor() {
    super("MySQL TLS is not configured for production");
    this.name = "MysqlTlsConfigurationError";
  }
}

export async function runWithConnectionTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  onTimeout: () => void,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      try {
        onTimeout();
      } catch {
        // The timeout remains the externally visible failure regardless of
        // best-effort resource cleanup.
      }
      reject(new DatabaseConnectionTimeoutError());
    }, timeoutMs);
  });
  try {
    return await Promise.race([operation(), timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export type DatabaseHostResolution = {
  hostname: string;
  addresses: string[];
};

export type DatabaseConnectionTestProbe = {
  run(): Promise<void>;
  cancel(): void;
};

type HostLookup = (hostname: string) => Promise<string[]>;

const metadataAddresses = new Set(["169.254.169.254", "fd00:ec2::254"]);

/** Resolves once and rejects the entire DNS answer if any result is unsafe. */
export async function resolveDatabaseHost(
  hostname: string,
  environment = process.env.NODE_ENV,
  lookup: HostLookup = async (host) =>
    (await dnsLookup(host, { all: true, verbatim: true })).map(({ address }) => address),
): Promise<DatabaseHostResolution> {
  const normalizedHost = hostname.trim().replace(/^\[|\]$/g, "");
  if (!normalizedHost) throw new UnsafeDatabaseHostError();

  let addresses: string[];
  if (isIP(normalizedHost)) {
    addresses = [normalizedHost];
  } else {
    try {
      addresses = await lookup(normalizedHost);
    } catch {
      throw new UnsafeDatabaseHostError();
    }
  }

  if (addresses.length === 0) throw new UnsafeDatabaseHostError();
  const isLocalEnvironment = environment === "development" || environment === "test";
  if (addresses.some((address) =>
    isMetadataAddress(address) ||
    (!isLocalEnvironment && !isPublicAddress(address)),
  )) {
    throw new UnsafeDatabaseHostError();
  }

  return { hostname: normalizedHost, addresses: [...addresses] };
}

export function isPublicAddress(address: string): boolean {
  const normalized = normalizeIp(address);
  const family = isIP(normalized);
  if (family === 4) return isPublicIpv4(normalized);
  if (family !== 6) return false;

  const mappedIpv4 = extractMappedIpv4(normalized);
  if (mappedIpv4) return isPublicIpv4(mappedIpv4);

  // Global unicast space is 2000::/3. Explicitly deny special-purpose
  // allocations and transition/documentation ranges within it.
  const words = expandIpv6(normalized);
  if ((words[0] & 0xe000) !== 0x2000) return false;
  const blocked = [
    (words[0] === 0x2001 && words[1] <= 0x01ff), // IETF protocol assignments
    (words[0] === 0x2001 && words[1] === 0x0db8), // documentation
    words[0] === 0x2002, // 6to4
    (words[0] === 0x3fff && words[1] <= 0x000f), // documentation
  ];
  return !blocked.some(Boolean);
}

export async function connectMysqlToValidatedAddress(
  address: string,
  port: number,
  timeoutMs?: number,
  socket = new Socket(),
): Promise<Socket> {
  await new Promise<void>((resolve, reject) => {
    const onError = (error: Error) => {
      socket.destroy();
      reject(error);
    };
    socket.once("error", onError);
    socket.once("connect", () => {
      socket.removeListener("error", onError);
      resolve();
    });
    if (timeoutMs) socket.setTimeout(timeoutMs, () => onError(new Error("timeout")));
    socket.connect({ host: address, port });
  });
  socket.setTimeout(0);
  return socket;
}

export async function secureMysqlStream(
  socket: Socket,
  hostname: string,
  environment = process.env.NODE_ENV,
  ca?: string,
): Promise<Socket | TLSSocket> {
  if (environment === "development" || environment === "test") {
    return socket;
  }
  if (!ca) {
    socket.destroy();
    throw new MysqlTlsConfigurationError();
  }

  return new Promise((resolve, reject) => {
    const secureSocket = tlsConnect({
      socket,
      servername: hostname,
      ca,
      rejectUnauthorized: true,
      checkServerIdentity: (serverName, certificate) =>
        checkServerIdentity(serverName, certificate),
    });
    const onError = (error: Error) => {
      secureSocket.destroy();
      reject(error);
    };
    secureSocket.once("secureConnect", () => {
      secureSocket.removeListener("error", onError);
      resolve(secureSocket);
    });
    secureSocket.once("error", onError);
  });
}

function isPublicIpv4(address: string): boolean {
  const octets = address.split(".").map(Number);
  if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  const [a, b, c] = octets;
  return !(
    a === 0 || a === 10 || a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0 && (c === 0 || c === 2)) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 88 && c === 99) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113) ||
    a >= 224
  );
}

function isMetadataAddress(address: string): boolean {
  const normalized = normalizeIp(address);
  if (metadataAddresses.has(normalized)) return true;
  const mappedIpv4 = isIP(normalized) === 6 ? extractMappedIpv4(normalized) : undefined;
  return mappedIpv4 === "169.254.169.254";
}

function normalizeIp(address: string): string {
  return address.toLowerCase().split("%")[0];
}

function expandIpv6(address: string): number[] {
  if (address.includes(".")) {
    const lastColon = address.lastIndexOf(":");
    const octets = address.slice(lastColon + 1).split(".").map(Number);
    if (octets.length === 4) {
      const high = ((octets[0] << 8) | octets[1]).toString(16);
      const low = ((octets[2] << 8) | octets[3]).toString(16);
      address = `${address.slice(0, lastColon + 1)}${high}:${low}`;
    }
  }
  const halves = address.split("::");
  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves[1] ? halves[1].split(":") : [];
  const missing = 8 - left.length - right.length;
  const parts = halves.length === 2 ? [...left, ...Array(missing).fill("0"), ...right] : left;
  return parts.map((part) => Number.parseInt(part || "0", 16));
}

function extractMappedIpv4(address: string): string | undefined {
  const words = expandIpv6(address);
  if (words.length !== 8 || words.slice(0, 5).some((word) => word !== 0) || words[5] !== 0xffff) return undefined;
  return `${words[6] >> 8}.${words[6] & 255}.${words[7] >> 8}.${words[7] & 255}`;
}
