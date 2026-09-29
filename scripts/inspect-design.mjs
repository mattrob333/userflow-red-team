#!/usr/bin/env node
/** Inspect supplied export source without executing its code or fetching assets. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
export const ROOT = fileURLToPath(new URL("../", import.meta.url));
export function inspectDesign(root = ROOT) {
  const base = path.join(root, "design", "claude-design");
  const manifest = JSON.parse(fs.readFileSync(path.join(base, "manifest.json"), "utf8"));
  const files = manifest.inputs.map(item => {
    const absolute = path.join(root, item.path);
    const exists = fs.existsSync(absolute);
    const data = exists ? fs.readFileSync(absolute) : Buffer.alloc(0);
    const text = data.toString("utf8");
    const dependencies = [...new Set([
      ...[...text.matchAll(/<script\b[^>]*\bsrc=["'](\.\/[^"']+)["']/g)].map(m => m[1]),
      ...[...text.matchAll(/\bimport\(["'](\.\/[^"']+)["']\)/g)].map(m => m[1]),
    ])].map(ref => ({ref, exists: fs.existsSync(path.resolve(path.dirname(absolute), ref))}));
    return {path:item.path, exists, bytes:data.length,
      sha256:createHash("sha256").update(data).digest("hex"),
      matchesOriginal:exists && createHash("sha256").update(data).digest("hex") === item.sha256,
      dependencies,
      dataExports:[...new Set([...text.matchAll(/\bD\.([A-Za-z_$][\w$]*)/g)].map(m => m[1]))].sort(),
      dcImports:[...new Set([...text.matchAll(/<dc-import\b[^>]*name=["']([^"']+)["']/g)].map(m => m[1]))],
      scriptBodies:[...text.matchAll(/<script\b[^>]*type=["']text\/x-dc["'][^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]),
    };
  });
  return {status:files.some(f => f.dependencies.some(d => !d.exists)) ? "incomplete-original-design-export" : "dependencies-present-runtime-unverified",files};
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = inspectDesign();
  console.log(JSON.stringify({...report, files:report.files.map(({scriptBodies,...f})=>({...f,scriptCount:scriptBodies.length}))},null,2));
}
