#!/usr/bin/env node
/** Explicit local publisher. Defaults private; never force-pushes or reuses an existing repo. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
const root=fileURLToPath(new URL("../",import.meta.url));
const argv=process.argv.slice(2), args={owner:"mattrob333",name:"userflow-red-team"};
function stop(message){console.error(message);process.exit(1);}
for(let i=0;i<argv.length;i++){
  if(argv[i]==="--private")continue;
  if(argv[i]==="--help"){
    console.log("Usage: node scripts/publish-github.mjs --owner mattrob333 --name userflow-red-team --private\nCreates a PRIVATE new repo only, after checks. Requires GitHub CLI authentication and local Git author identity.");process.exit(0);
  }
  if(["--owner","--name"].includes(argv[i])&&argv[i+1])args[argv[i].slice(2)]=argv[++i];
  else stop(`Unsupported argument: ${argv[i]}`);
}
if(!/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(args.owner)||!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(args.name))stop("Invalid owner or repository name");
function command(program,values,inherit=false){
  const out=spawnSync(program,values,{cwd:root,encoding:"utf8",stdio:inherit?"inherit":"pipe",shell:false});
  if(out.error)stop(`${program} is unavailable. Install it locally and retry. ${out.error.code || ""}`);
  return out;
}
function must(program,values,inherit=false){const out=command(program,values,inherit);if(out.status!==0)stop(`${program} failed (${out.status}). ${inherit?"See output above.":out.stderr?.trim()||""}`);return out.stdout?.trim();}
must("git",["--version"]);must("gh",["--version"]);
const login=must("gh",["api","user","--jq",".login"]);
if(login.toLowerCase()!==args.owner.toLowerCase())stop(`Authenticated as ${login}, not ${args.owner}. Switch accounts locally first.`);
const name=`${args.owner}/${args.name}`;
const current=command("git",["rev-parse","--show-toplevel"]);
if(current.status===0&&path.resolve(current.stdout.trim())!==path.resolve(root))stop("This package is nested inside another Git worktree. Move it to a standalone directory first.");
const isRepo=current.status===0;
if(isRepo){
  const remotes=must("git",["remote"]);
  if(remotes)stop("This checkout already has a remote. Inspect it before publishing. No remote was changed.");
  const branch=must("git",["branch","--show-current"]);
  if(branch!=="main")stop(`Current branch is ${branch||"detached"}. Review and select main before publishing.`);
  if(must("git",["status","--porcelain"]))stop("Working tree has uncommitted files. Review/commit them locally before publishing.");
}
const existing=command("gh",["repo","view",name,"--json","nameWithOwner"]);
if(existing.status===0)stop(`${name} already exists. Fetch and integrate on a branch; do not overwrite it.`);
if(!/(?:404|Could not resolve to a Repository|not found)/i.test(existing.stderr||""))stop(`Cannot verify destination. Resolve authentication/network permissions first: ${existing.stderr?.trim()||"unknown error"}`);
must(process.execPath,["scripts/check.mjs"],true);
const tests=fs.readdirSync(path.join(root,"tests")).filter(x=>x.endsWith(".test.mjs")).map(x=>`tests/${x}`);
must(process.execPath,["--test",...tests],true);
if(!isRepo){
  for(const key of ["user.name","user.email"]){
    const out=command("git",["config","--get",key]);
    if(out.status!==0||!out.stdout.trim())stop(`Configure your own Git ${key} before publishing. No author identity was invented.`);
  }
  must("git",["init","-b","main"],true);must("git",["add","."],true);
  must("git",["commit","-m","Consolidate UserFlow design and Claude backend build foundation"],true);
}
console.log(`Creating private repository ${name} and pushing this reviewed main branch.`);
must("gh",["repo","create",name,"--private","--source=.","--remote=origin","--push"],true);
must("gh",["repo","view",name,"--json","nameWithOwner,url,isPrivate,defaultBranchRef"],true);
console.log("GitHub CLI reported creation/push success. Review the repository URL and remote files before sharing.");
