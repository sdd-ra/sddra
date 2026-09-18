import path from "path";

export interface ScopeGuardOptions {
  projectName: string;
  sddRoot: string;
  projectRoot: string;
}

export interface ScopeCheck {
  allowed: boolean;
  target: string;
  reason?: string;
}

export class ScopeGuard {
  private projectName: string;
  private sddRoot: string;
  private projectRoot: string;

  constructor(options: ScopeGuardOptions) {
    this.projectName = options.projectName;
    this.sddRoot = options.sddRoot;
    this.projectRoot = options.projectRoot;
  }

  validateWrite(targetPath: string): ScopeCheck {
    const resolved = path.resolve(this.projectRoot, targetPath);
    const sddResolved = path.resolve(this.projectRoot, this.sddRoot);

    if (resolved.startsWith(sddResolved + path.sep) || resolved === sddResolved) {
      return {
        allowed: false,
        target: targetPath,
        reason: `Scope violation: .sdd/ writes are forbidden — writes MUST target projects/${this.projectName}/ only ([R114])`,
      };
    }

    const projectScope = path.resolve(this.projectRoot, "projects", this.projectName);
    if (!resolved.startsWith(projectScope + path.sep) && resolved !== projectScope) {
      return {
        allowed: false,
        target: targetPath,
        reason: `Scope violation: write target outside projects/${this.projectName}/ — got ${targetPath} ([R114])`,
      };
    }

    return { allowed: true, target: targetPath };
  }

  enforceWrite(targetPath: string): ScopeCheck {
    const check = this.validateWrite(targetPath);
    if (!check.allowed) {
      throw new ScopeViolationError(check.reason || "Write blocked by ScopeGuard");
    }
    return check;
  }

  getProjectScope(): string {
    return path.join("projects", this.projectName);
  }
}

export class ScopeViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScopeViolationError";
  }
}
