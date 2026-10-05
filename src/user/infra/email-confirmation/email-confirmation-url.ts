export function buildEmailConfirmationUrl(
  publicWebUrl: string,
  token: string,
): string {
  return `${publicWebUrl.replace(/\/+$/, "")}/verify-email?token=${encodeURIComponent(token)}`;
}
