import "server-only";

type UserLike = {
  email?: string | null;
};

function normalizeEmail(value: string | null | undefined) {
  const email = value?.trim().toLowerCase();
  return email || null;
}

export function isSelfHostedMode() {
  return process.env.CREED_SELF_HOSTED === "1";
}

export function getSelfHostedOwnerEmail() {
  return normalizeEmail(process.env.CREED_SELF_HOSTED_OWNER_EMAIL);
}

export function isSelfHostedOwnerEmail(email: string | null | undefined) {
  if (!isSelfHostedMode()) return true;

  const ownerEmail = getSelfHostedOwnerEmail();
  if (!ownerEmail) return true;

  return normalizeEmail(email) === ownerEmail;
}

export function isSelfHostedOwner(user: UserLike | null | undefined) {
  return isSelfHostedOwnerEmail(user?.email);
}
