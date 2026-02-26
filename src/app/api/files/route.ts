import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const SEARCH_DIRS = ['public', 'src'];
const ALLOWED_EXT = ['.md', '.pdf', '.txt', '.docx', '.doc', '.pptx', '.ppt'];

async function walkDir(dir: string, relBase = ''): Promise<Array<{ path: string; name: string }>> {
  let results: Array<{ path: string; name: string }> = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      const rel = path.join(relBase, entry.name);
      if (entry.isDirectory()) {
        // limit depth by not recursing into node_modules or .next
        if (['node_modules', '.next', '.git', '.venv'].includes(entry.name)) continue;
        const nested = await walkDir(full, rel);
        results = results.concat(nested);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (ALLOWED_EXT.includes(ext)) {
          results.push({ path: `/${rel.replaceAll('\\\\', '/')}`, name: entry.name });
        }
      }
    }
  } catch (e) {
    // ignore
  }
  return results;
}

export async function GET() {
  const files: Array<{ path: string; name: string }> = [];
  for (const d of SEARCH_DIRS) {
    const target = path.join(ROOT, d);
    try {
      const stat = await fs.stat(target);
      if (stat.isDirectory()) {
        const found = await walkDir(target, d);
        files.push(...found);
      }
    } catch (e) {
      // skip missing dirs
    }
  }

  // limit count
  const unique = files.slice(0, 300);
  return NextResponse.json({ files: unique });
}

export const runtime = 'nodejs';
