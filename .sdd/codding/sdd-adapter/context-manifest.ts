import { ContextManifest } from "./types";

export class ContextManifestStore {
  private manifests: Map<string, ContextManifest> = new Map();

  save(manifest: ContextManifest): string {
    this.manifests.set(manifest.id, manifest);
    return manifest.id;
  }

  load(id: string): ContextManifest | null {
    return this.manifests.get(id) || null;
  }

  invalidate(id: string, reason: string): void {
    const manifest = this.manifests.get(id);
    if (manifest) {
      manifest.invalidatedBy.push(reason);
      manifest.version = `v${parseInt(manifest.version.replace("v", "")) + 1}`;
    }
  }

  list(): ContextManifest[] {
    return Array.from(this.manifests.values());
  }
}
