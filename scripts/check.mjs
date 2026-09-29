#!/usr/bin/env node
/** Local checks only; never launches an app, model, browser, or cloud service. */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { inspectDesign, ROOT } from "./inspect-design.mjs";
const errors = [], warnings = [];
const skip = new Set([".git","node_modules",".userflow-redteam",".userflow-evidence","dist","build","coverage"]);
function walk(dir) {
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e => {
    if(skip.has(e.name)) return [];
    const p=path.join(dir,e.name);
    if(e.isSymbolicLink()) {errors.push(`Unexpected symlink: ${path.relative(ROOT,p)}`);return [];}
    return e.isDirectory()?walk(p):[p];
  });
}
const paths=walk(ROOT);
for(const name of ["README.md","AGENTS.md","SECURITY.md",".gitignore",".env.example","package.json","SKILL.md","docs/START_HERE.md","docs/BUILD_PLAN.md","docs/BACKEND_RUNTIME.md","docs/DESIGN_INTEGRATION.md","contracts/domain.ts","contracts/run-event.schema.json","runtime/claude-runtime-profile.json"]) {
  if(!fs.existsSync(path.join(ROOT,name))) errors.push(`Missing ${name}`);
}
for(const p of paths.filter(p=>p.endsWith(".mjs"))) {
  const a=spawnSync(process.execPath,["--check",p],{encoding:"utf8"});
  if(a.status!==0) errors.push(`${path.relative(ROOT,p)}: ${a.stderr.trim()}`);
}
for(const p of paths.filter(p=>p.endsWith(".json"))) {
  try {JSON.parse(fs.readFileSync(p,"utf8"));}catch(e){errors.push(`${path.relative(ROOT,p)}: ${e.message}`);}
}
const temp=fs.mkdtempSync(path.join(os.tmpdir(),"ufr-dc-syntax-"));
try {
  const design=inspectDesign();
  for(const [i,f] of design.files.entries()) {
    if(!f.matchesOriginal) errors.push(`Original export hash mismatch: ${f.path}`);
    for(const dep of f.dependencies.filter(d=>!d.exists)) warnings.push(`${f.path}: missing ${dep.ref}`);
    for(const [j,body] of f.scriptBodies.entries()) {
      const p=path.join(temp,`export-${i}-${j}.mjs`);fs.writeFileSync(p,body);
      const a=spawnSync(process.execPath,["--check",p],{encoding:"utf8"});
      if(a.status!==0) errors.push(`Embedded JS in ${f.path}: ${a.stderr.trim()}`);
    }
  }
} catch(e) {errors.push(e.message);} finally {fs.rmSync(temp,{recursive:true,force:true});}
for(const p of paths.filter(p=>p.endsWith(".md")&&!p.includes(`${path.sep}archive${path.sep}`))) {
  const s=fs.readFileSync(p,"utf8");
  for(const m of s.matchAll(/\]\(([^\s)]+)\)/g)) {
    let target=m[1].split("#")[0];
    if(!target || /^(?:[a-z][\w+.-]*:|\/\/)/i.test(target)) continue;
    try {target=decodeURIComponent(target);}catch{errors.push(`Bad link encoding in ${p}`);continue;}
    if(!fs.existsSync(path.resolve(path.dirname(p),target))) errors.push(`Broken relative link ${path.relative(ROOT,p)} -> ${target}`);
  }
}
const signatures=[/sk-ant-[A-Za-z0-9_-]{20,}/g,/github_pat_[A-Za-z0-9_]{30,}/g,/gh[pousr]_[A-Za-z0-9]{30,}/g,/AKIA[0-9A-Z]{16}/g,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g];
let scanned=0;
for(const p of paths.filter(p=>/\.(?:md|mjs|js|ts|tsx|json|html|txt|example)$/.test(p))) {
  scanned++; const s=fs.readFileSync(p,"utf8");
  if(signatures.some(re=>{re.lastIndex=0;return re.test(s);})) errors.push(`Potential credential material in ${path.relative(ROOT,p)}; inspect privately, do not print the value`);
}
try {
  const p=JSON.parse(fs.readFileSync(path.join(ROOT,"runtime/claude-runtime-profile.json"),"utf8"));
  if(p.coordinatorModel!=="claude-opus-5-5"||p.subagentModel!=="claude-opus-5-5") errors.push("Unexpected model choice; obtain explicit owner approval before changing");
  if(p.allowSilentModelFallback!==false||p.defaultBranchWrites!==false) errors.push("Unsafe runtime policy change");
}catch(e){errors.push(e.message);}
console.log(`Checked ${paths.length} repository files; ${scanned} text files examined by the limited credential-pattern scan.`);
for(const w of warnings) console.log(`KNOWN DESIGN BLOCKER: ${w}`);
for(const e of errors) console.error(`ERROR: ${e}`);
if(errors.length) process.exitCode=1;
else if(process.argv.includes("--strict-design")&&warnings.length) {
  console.error("Strict design completeness failed: original dependencies are missing.");process.exitCode=2;
}else console.log("Repository checks passed. This does not certify the design preview, hosted app, or provider integration.");
