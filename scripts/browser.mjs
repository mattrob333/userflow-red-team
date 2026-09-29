#!/usr/bin/env node
// Step-by-step browser driver for UserFlow Red Team agents.
import fs from "node:fs";
import path from "node:path";
import { parseArgs, loadPlaywright, readJson, writeJson, appendLine, VIEWPORTS, safeName, die } from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const runDir = args.run && path.resolve(args.run);
if (!runDir || !fs.existsSync(path.join(runDir, "run.json"))) die("--run must point at a run directory created by preflight.mjs (it must contain run.json)");
if (!args.agent) die("--agent is required (your agent id, e.g. A1)");
const agent = safeName(args.agent);
const session = safeName(args.session || "default");
const viewportName = args.viewport || "desktop";
const viewport = VIEWPORTS[viewportName] || die(`unknown viewport ${viewportName}`);
const timeout = Number(args.timeout || 15000);

const run = readJson(path.join(runDir, "run.json"));
const agentDir = path.join(runDir, "agents", agent);
const profileDir = path.join(agentDir, "profiles", session);
const screensDir = path.join(agentDir, "screens");
const stateFile = path.join(profileDir, "state.json");
const lockFile = `${profileDir}.lock`;
fs.mkdirSync(screensDir, { recursive: true });

let steps;
if (args.steps) steps = JSON.parse(args.steps);
else if (args["steps-file"]) steps = JSON.parse(fs.readFileSync(args["steps-file"], "utf8"));
else {
  const [verb, a1, ...rest] = args._;
  if (!verb) die("give a verb (goto/look/click/fill/...) or --steps");
  const a2 = rest.join(" ");
  const map = {
    goto:{goto:a1}, look:{look:true}, click:{click:a1}, fill:{fill:a1,value:a2}, press:{press:a1},
    select:{select:a1,value:a2}, check:{check:a1}, hover:{hover:a1}, back:{back:true}, forward:{forward:true},
    reload:{reload:true}, wait:{wait:a1}, shot:{shot:a1||"shot"}, text:{text:a1},
    eval:{eval:[a1,...rest].join(" ")}, reset:{reset:true},
  };
  if (!map[verb]) die(`unknown verb ${verb}`);
  steps = [map[verb]];
}
if (!Array.isArray(steps)) steps = [steps];

fs.mkdirSync(path.dirname(profileDir), { recursive: true });
if (fs.existsSync(lockFile)) {
  const pid = Number(fs.readFileSync(lockFile, "utf8"));
  let alive = false;
  try { process.kill(pid, 0); alive = true; } catch {}
  if (alive) die(`session "${session}" for agent ${agent} is in use by pid ${pid}. Wait for it, or use a different --session.`);
}
fs.writeFileSync(lockFile, String(process.pid));
const unlock = () => { try { fs.rmSync(lockFile); } catch {} };
process.on("exit", unlock);
if (args.fresh || steps.some((s) => s.reset)) fs.rmSync(profileDir, { recursive: true, force: true });
fs.mkdirSync(profileDir, { recursive: true });

const { pw } = loadPlaywright(run.root || process.cwd());
if (!pw) die("playwright package not found; rerun preflight.mjs and read its browser check");
const exe = run.checks?.browser?.executablePath || undefined;

const ctx = await pw.chromium.launchPersistentContext(path.join(profileDir, "userdata"), {
  headless: true, executablePath: exe, args: ["--no-sandbox"],
  viewport: { width: viewport.width, height: viewport.height },
  isMobile: viewport.isMobile, hasTouch: viewport.hasTouch,
});
ctx.setDefaultTimeout(timeout);
const saved = readJson(stateFile, {});
if (saved.cookies?.length) await ctx.addCookies(saved.cookies).catch(() => {});
const page = ctx.pages()[0] || (await ctx.newPage());

function loc(sel) {
  const m = /^(label|placeholder|testid|alt|title)=(.*)$/s.exec(String(sel));
  if (!m) return page.locator(sel).first();
  const v = m[2].replace(/^["']|["']$/g, "");
  const f = { label:"getByLabel", placeholder:"getByPlaceholder", testid:"getByTestId", alt:"getByAltText", title:"getByTitle" }[m[1]];
  return page[f](v).first();
}

const events = [];
page.on("console", (m) => { if (["error","warning"].includes(m.type())) events.push({ kind:`console.${m.type()}`, text:m.text().slice(0,500) }); });
page.on("pageerror", (e) => events.push({ kind:"pageerror", text:String(e.message).slice(0,500) }));
page.on("requestfailed", (r) => events.push({ kind:"requestfailed", text:`${r.method()} ${r.url()} ${r.failure()?.errorText || ""}` }));
page.on("response", (r) => { if (r.status() >= 400) events.push({ kind:`http.${r.status()}`, text:`${r.request().method()} ${r.url()}` }); });
page.on("dialog", async (d) => { events.push({ kind:"dialog", text:`${d.type()}: ${d.message()}` }); await d.dismiss().catch(() => {}); });

const state = saved;
const baseUrl = run.url || state.url || "";
const resolveUrl = (u) => /^[a-z]+:/i.test(u) ? u : new URL(u, baseUrl || "http://localhost/").toString();
const first = steps[0] || {};
if (!first.goto && !first.reset && state.url && page.url() === "about:blank") {
  await page.goto(state.url, { waitUntil:"domcontentloaded" }).catch((e) => events.push({ kind:"resume", text:e.message.split("\n")[0] }));
}

const seqFile = path.join(agentDir, "actions.jsonl");
const seq = fs.existsSync(seqFile) ? fs.readFileSync(seqFile,"utf8").split("\n").filter(Boolean).length + 1 : 1;
const tag = `${String(seq).padStart(3,"0")}-${session}-${viewportName}${args.label ? "-" + safeName(args.label) : ""}`;
const outputs = [];
let failure = null;

async function settle() {
  await page.waitForLoadState("domcontentloaded").catch(() => {});
  await page.waitForLoadState("networkidle", { timeout:3000 }).catch(() => {});
}

for (const [i,s] of steps.entries()) {
  try {
    if (s.goto) await page.goto(resolveUrl(s.goto), { waitUntil:"domcontentloaded" });
    else if (s.click) await loc(s.click).click();
    else if (s.fill) await loc(s.fill).fill(String(s.value ?? ""));
    else if (s.press) await page.keyboard.press(s.press);
    else if (s.select) await loc(s.select).selectOption(String(s.value));
    else if (s.check) await loc(s.check).check();
    else if (s.hover) await loc(s.hover).hover();
    else if ((s.back || s.forward) && i === 0) throw new Error('back/forward has no history at the start of a call. Put it in the same --steps batch as the navigation it undoes, e.g. [{"click":"..."},{"back":true}]');
    else if (s.back) await page.goBack();
    else if (s.forward) await page.goForward();
    else if (s.reload) await page.reload();
    else if (s.wait) { if (/^\d+$/.test(String(s.wait))) await page.waitForTimeout(Number(s.wait)); else await loc(s.wait).waitFor(); }
    else if (s.text) outputs.push(`text(${s.text}): ${(await loc(s.text).innerText()).slice(0,2000)}`);
    else if (s.eval) outputs.push(`eval: ${JSON.stringify(await page.evaluate(s.eval)).slice(0,2000)}`);
    else if (s.shot) { const f=path.join(screensDir,`${tag}-${safeName(s.shot)}.png`); await page.screenshot({path:f,fullPage:!!args.full}); outputs.push(`screenshot: ${f}`); }
    if (!s.look && !s.shot && !s.text && !s.eval && !s.wait) await settle();
  } catch (e) { failure = { step:i, action:s, error:e.message.split("\n")[0] }; break; }
}

let snapshotFile=null, shotFile=null, aria="";
if (!args["no-look"] || failure) {
  shotFile=path.join(screensDir,`${tag}${failure ? "-FAILED" : ""}.png`);
  await page.screenshot({path:shotFile,fullPage:!!args.full}).catch(()=>{shotFile=null;});
  try { aria=await page.locator("body").ariaSnapshot(); }
  catch { aria=(await page.locator("body").innerText().catch(()=>"")).slice(0,20000); }
  snapshotFile=path.join(screensDir,`${tag}.aria.yml`);
  fs.writeFileSync(snapshotFile,aria);
}

const url=page.url();
const cookies=await ctx.cookies().catch(()=>[]);
const sig=(e)=>`${e.kind}|${e.text.replace(/\d+/g,"#")}`;
const seenBefore=new Set(saved.seenEvents||[]);
for(const e of events)e.repeat=seenBefore.has(sig(e));
const seenEvents=[...new Set([...seenBefore,...events.map(sig)])].slice(-200);
writeJson(stateFile,{url,cookies,seenEvents,updatedAt:new Date().toISOString()});
const title=await page.title().catch(()=>"");
appendLine(seqFile,{seq,at:new Date().toISOString(),session,viewport:viewportName,steps,url,title,screenshot:shotFile,snapshot:snapshotFile,events,failure});
await ctx.close();

console.log(`[${tag}] ${failure ? "STEP FAILED" : "ok"}  url=${url}  title=${JSON.stringify(title)}`);
if(failure)console.log(`failed step ${failure.step}: ${JSON.stringify(failure.action)} -> ${failure.error}`);
for(const o of outputs)console.log(o);
if(events.length){
  const fresh=events.filter((e)=>!e.repeat);
  console.log(`events (${fresh.length} new, ${events.length-fresh.length} seen in earlier calls):`);
  for(const e of [...fresh,...events.filter((e)=>e.repeat)].slice(0,20))console.log(`  ${e.repeat ? "(repeat) " : ""}${e.kind}: ${e.text}`);
}
if(shotFile)console.log(`screenshot: ${shotFile}   <- open it with your image-reading tool for visual judgment`);
if(snapshotFile){
  const lines=aria.split("\n");
  const max=Number(args["max-lines"]||120);
  console.log(`accessibility snapshot (${lines.length} lines, full: ${snapshotFile}):`);
  console.log(lines.slice(0,max).join("\n"));
  if(lines.length>max)console.log(`... ${lines.length-max} more lines in ${snapshotFile}`);
}
process.exit(failure ? 3 : 0);
