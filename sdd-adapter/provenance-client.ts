import { ProvenanceReport, ProvenanceCapabilities, ProvenanceClientOptions } from "./types";

function base64(content: string): string {
  return Buffer.from(content, "utf-8").toString("base64");
}

export class ProvenanceClient {
  private serviceUrl: string;
  private apiKey?: string;
  private timeoutMs: number;

  constructor(options: ProvenanceClientOptions) {
    this.serviceUrl = options.serviceUrl.replace(/\/$/, "");
    this.apiKey = options.apiKey;
    this.timeoutMs = options.timeoutMs ?? 5000;
  }

  private async request<T>(
    path: string,
    body: Record<string, unknown>,
  ): Promise<{ ok: boolean; data?: T; error?: string }> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (this.apiKey) {
        headers["Authorization"] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${this.serviceUrl}${path}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        return { ok: false, error: `HTTP ${response.status}` };
      }

      const data = (await response.json()) as T;
      return { ok: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, error: message };
    } finally {
      clearTimeout(timeout);
    }
  }

  async health(): Promise<ProvenanceCapabilities> {
    try {
      const response = await fetch(`${this.serviceUrl}/health`, {
        method: "GET",
        headers: { Authorization: this.apiKey ? `Bearer ${this.apiKey}` : "" },
      });

      if (!response.ok) {
        return { ok: false, available: false, error: `HTTP ${response.status}` };
      }

      const data = (await response.json()) as Record<string, unknown>;
      return {
        ok: true,
        version: typeof data.version === "string" ? data.version : undefined,
        available: true,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, available: false, error: message };
    }
  }

  async capabilities(): Promise<ProvenanceCapabilities> {
    try {
      const response = await fetch(`${this.serviceUrl}/capabilities`, {
        method: "GET",
        headers: { Authorization: this.apiKey ? `Bearer ${this.apiKey}` : "" },
      });

      if (!response.ok) {
        return { ok: false, available: false, error: `HTTP ${response.status}` };
      }

      const data = (await response.json()) as Record<string, unknown>;
      return {
        ok: true,
        version: typeof data.version === "string" ? data.version : undefined,
        tools: (data.tools as Record<string, boolean>) || {},
        detectors: (data.detectors as Record<string, boolean>) || {},
        available: true,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, available: false, error: message };
    }
  }

  async inspect(fileName: string, content: string, detect = false): Promise<ProvenanceReport> {
    const result = await this.request<ProvenanceReport>("/inspect", {
      file: base64(content),
      name: fileName,
      detect,
    });

    if (!result.ok || !result.data) {
      return {
        ok: false,
        kind: "unknown",
        suspicious: false,
        report: [],
        available: false,
        error: result.error,
      };
    }

    return { ...result.data, available: true };
  }

  async detect(fileName: string, content: string): Promise<ProvenanceReport> {
    const result = await this.request<ProvenanceReport>("/detect", {
      file: base64(content),
      name: fileName,
    });

    if (!result.ok || !result.data) {
      return {
        ok: false,
        kind: "unknown",
        suspicious: false,
        report: [],
        available: false,
        error: result.error,
      };
    }

    return { ...result.data, available: true };
  }

  async clean(fileName: string, content: string, options: Record<string, unknown> = {}): Promise<ProvenanceReport> {
    const result = await this.request<ProvenanceReport>("/clean", {
      file: base64(content),
      name: fileName,
      options,
    });

    if (!result.ok || !result.data) {
      return {
        ok: false,
        kind: "unknown",
        suspicious: false,
        report: [],
        available: false,
        error: result.error,
      };
    }

    return { ...result.data, available: true };
  }
}
