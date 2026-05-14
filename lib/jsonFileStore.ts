import { promises as fs } from "fs";
import os from "os";
import path from "path";

const NS = "egitim-ussu";

function candidatePaths(filename: string): string[] {
  const envDir = process.env.SERVER_DATA_DIR?.trim();
  if (envDir) return [path.join(envDir, filename)];
  return [
    path.join(process.cwd(), "data", filename),
    path.join(os.tmpdir(), NS, filename),
  ];
}

/**
 * Sunucuda yazılabilir JSON dosyası (Vercel vb. salt okunur FS'de otomatik olarak os.tmpdir()'e düşer).
 */
export function createJsonFileStore(filename: string) {
  let resolved: string | null = null;

  async function resolvePath(): Promise<string> {
    if (resolved) return resolved;
    const errors: string[] = [];
    for (const p of candidatePaths(filename)) {
      try {
        const dir = path.dirname(p);
        await fs.mkdir(dir, { recursive: true });
        const probe = path.join(dir, `.write-probe-${process.pid}`);
        await fs.writeFile(probe, "ok", "utf-8");
        await fs.unlink(probe).catch(() => {});
        resolved = p;
        return p;
      } catch (e) {
        errors.push(`${(e as Error).message}`);
      }
    }
    throw new Error(
      `Veri dosyası için yazılabilir konum bulunamadı (${filename}). ${errors.join(" | ")}`
    );
  }

  return {
    resolvePath,
    async read<T>(fallback: T): Promise<T> {
      const p = await resolvePath();
      try {
        const raw = (await fs.readFile(p, "utf-8")).trim();
        if (!raw) return fallback;
        const parsed = JSON.parse(raw) as unknown;
        return parsed as T;
      } catch {
        return fallback;
      }
    },
    async write(data: unknown): Promise<void> {
      const p = await resolvePath();
      await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8");
    },
  };
}
