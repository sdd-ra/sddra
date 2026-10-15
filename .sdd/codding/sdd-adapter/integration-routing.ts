/**
 * Integration Routing — implements .sdd/runtime/integration-routing.sdd
 * [IR-01..10] (Agent-Reach channel model, MIT).
 *
 * Ordered backend lists per channel; active_backend set ONLY by real
 * probing; switches are reorders, logged with reason; unknown user
 * overrides are ignored, never fatal.
 */

export type ProbeStatus = "ok" | "missing" | "broken" | "timeout" | "error";

export interface Backend {
  name: string;
  /** Side-effect-free probe: version/status command semantics. [IR-05] */
  probe: () => Promise<ProbeStatus>;
}

export interface Channel<T extends Backend = Backend> {
  id: string;
  tier: 0 | 1 | 2; // zero-config | free key/login | complex setup [IR-08]
  backends: T[]; // ORDERED: [0] preferred, rest fallbacks [IR-01]
}

export interface SwitchEvent {
  channel: string;
  from_backend: string | null;
  to_backend: string | null;
  reason: string;
  ts: string;
}

export type HealthRow =
  | { channel: string; status: "healthy"; active_backend: string; tier: 0 | 1 | 2 }
  | {
      channel: string;
      status: "unprobed" | "unavailable";
      active_backend: null;
      tier: 0 | 1 | 2;
      note: string;
    };

/** Transient statuses may heal on retry; missing/broken never do. [IR-05] */
export function isTransient(status: ProbeStatus): boolean {
  return status === "timeout" || status === "error";
}

export class IntegrationRouter {
  private activeBackend = new Map<string, string | null>(); // channel -> backend name
  private switchLog: SwitchEvent[] = [];

  /**
   * Apply a user override: MOVE the named backend to the front ([IR-04]
   * note — override is a reorder). UNKNOWN overrides are ignored.
   */
  static applyOverride<T extends Backend>(channel: Channel<T>, override?: string): Channel<T> {
    if (!override) return channel;
    const found = channel.backends.find((b) => b.name === override);
    if (!found) return channel; // stale override never hides working backends
    return {
      ...channel,
      backends: [found, ...channel.backends.filter((b) => b.name !== override)],
    };
  }

  /**
   * Probe backends in order; the first healthy one becomes
   * active_backend ([IR-02]). A channel read failure routes to the NEXT
   * backend ([IR-09] — Layer2_fallback at integration level).
   */
  async probeChannel(channel: Channel): Promise<HealthRow> {
    // Health reports degrade per-channel; never crash the whole report. [IR-06]
    try {
      for (const backend of channel.backends) {
        const status = await this.probeWithRetry(backend);
        if (status === "ok") {
          const previous = this.activeBackend.get(channel.id) ?? null;
          this.activeBackend.set(channel.id, backend.name);
          if (previous !== backend.name) {
            this.switchLog.push({
              channel: channel.id,
              from_backend: previous,
              to_backend: backend.name,
              reason: previous === null ? "initial probe" : "probe failover [IR-03]",
              ts: new Date().toISOString(),
            });
          }
          return {
            channel: channel.id,
            status: "healthy",
            active_backend: backend.name,
            tier: channel.tier,
          };
        }
      }
      this.activeBackend.set(channel.id, null);
      return {
        channel: channel.id,
        status: "unavailable",
        active_backend: null,
        tier: channel.tier,
        note: "all backends failed probing",
      };
    } catch {
      this.activeBackend.set(channel.id, null);
      return {
        channel: channel.id,
        status: "unavailable",
        active_backend: null,
        tier: channel.tier,
        note: "probe error (degraded row [IR-06])",
      };
    }
  }

  /**
   * active_backend null can mean "deliberately not probed" OR
   * "unavailable" — health reports distinguish the two. ([IR-02])
   */
  healthReport(channels: Channel[]): Promise<HealthRow[]> {
    return Promise.all(
      channels.map(async (ch) => {
        if (ch.backends.length === 0) {
          return {
            channel: ch.id,
            status: "unprobed" as const,
            active_backend: null as null,
            tier: ch.tier,
            note: "no backends declared",
          };
        }
        return this.probeChannel(ch);
      })
    );
  }

  activeOf(channelId: string): string | null {
    return this.activeBackend.get(channelId) ?? null;
  }

  switches(): SwitchEvent[] {
    return [...this.switchLog];
  }

  private async probeWithRetry(backend: Backend, retries = 2): Promise<ProbeStatus> {
    let status = await backend.probe();
    let attempt = 0;
    while (isTransient(status) && attempt < retries) {
      status = await backend.probe();
      attempt++;
    }
    return status;
  }
}
