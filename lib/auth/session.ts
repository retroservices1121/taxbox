export type StaffSession = {
  kind: "staff";
  userId: string;
  firmId: string;
  role: "FIRM_ADMIN" | "PREPARER";
  ip?: string;
  userAgent?: string;
};

export type ClientSession = {
  kind: "client";
  firmId: string;
  workspaceId: string;
  inviteId: string;
  ip?: string;
  userAgent?: string;
};

export type Session = StaffSession | ClientSession;

export function mayReadWorkspace(session: Session, firmId: string, workspaceId: string): boolean {
  if (session.firmId !== firmId) return false;
  return session.kind === "staff" || session.workspaceId === workspaceId;
}
