import path from "path";

export interface OwnershipGuardOptions {
  owner: string;
  sddRoot: string;
}

export interface OwnershipCheck {
  allowed: boolean;
  owner: string;
  action: string;
  target: string;
  reason?: string;
}

export class OwnershipGuard {
  private owner: string;
  private sddRoot: string;

  constructor(options: OwnershipGuardOptions) {
    this.owner = options.owner;
    this.sddRoot = options.sddRoot;
  }

  canEdit(targetPath: string, action: string = "write"): OwnershipCheck {
    const resolved = path.resolve(targetPath);
    const sddResolved = path.resolve(this.sddRoot);
    const isSddFile = resolved.startsWith(sddResolved + path.sep) ||
      resolved === sddResolved ||
      resolved.startsWith(sddResolved + "/");

    if (!isSddFile) {
      return { allowed: true, owner: this.owner, action, target: targetPath };
    }

    const currentUser = process.env.SDD_OWNER || process.env.USER || process.env.USERNAME || "";
    if (currentUser === "") {
      return { allowed: true, owner: this.owner, action, target: targetPath };
    }
    if (currentUser !== this.owner) {
      return {
        allowed: false,
        owner: this.owner,
        action,
        target: targetPath,
        reason: `Ownership violation: ${currentUser} cannot ${action} .sdd/ files (owner: ${this.owner}, [R113])`,
      };
    }

    return { allowed: true, owner: this.owner, action, target: targetPath };
  }

  enforceWrite(targetPath: string): OwnershipCheck {
    const check = this.canEdit(targetPath, "write");
    if (!check.allowed) {
      throw new OwnershipViolationError(check.reason || "Write blocked by OwnershipGuard");
    }
    return check;
  }

  getOwner(): string {
    return this.owner;
  }
}

export class OwnershipViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OwnershipViolationError";
  }
}
