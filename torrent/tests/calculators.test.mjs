import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import * as calc from "../assets/js/lib/calculators.js";
import { MemoryChunkStore, DEMO_TEXT } from "../assets/js/lib/browser-torrent.js";
test("connection comparisons use medians and do not assert throttling",()=>{
  const result=calc.compareConnections("10, 1000, 12","24, 20, 22","100, 90, 95");
  assert.equal(result.directMbps,12);assert.equal(result.vpnMbps,22);assert.equal(result.referenceMbps,95);
  assert.match(result.interpretation,/does not prove throttling/);
  assert.throws(()=>calc.parseMeasurements("1, 2"));
  assert.throws(()=>calc.parseMeasurements("1, -2, 3"));
});
test("naming generator sanitizes paths and applies TV season/episode formatting",()=>{
  assert.equal(calc.standardName("My / Show","2026","tv",1,3,"1080p","WEB","H264","Team"),"My.Show.2026.S01E03.1080p.WEB.H264-Team");
  assert.throws(()=>calc.standardName("/../","","general",0,0,"","","",""));
  assert.throws(()=>calc.standardName("Film","22","movie",1,1,"","","",""));
});
test("chunk store reads full and partial binary pieces without mutating input",async()=>{
  const store=new MemoryChunkStore(4);const input=new Uint8Array([0,255,2,3]);
  await new Promise((resolve,reject)=>store.put(0,input,(error)=>error?reject(error):resolve()));input[0]=99;
  const get=(options)=>new Promise((resolve,reject)=>store.get(0,options,(error,data)=>error?reject(error):resolve(data)));
  assert.deepEqual(await get({}),new Uint8Array([0,255,2,3]));assert.deepEqual(await get({offset:1,length:2}),new Uint8Array([255,2]));
  await new Promise((resolve)=>store.destroy(resolve));await assert.rejects(get({}));
});
test("chunk store reports missing pieces and closed writes",async()=>{
  const store=new MemoryChunkStore(4);
  await assert.rejects(new Promise((resolve,reject)=>store.get(1,(error,data)=>error?reject(error):resolve(data))));
  await new Promise((resolve)=>store.close(resolve));
  await assert.rejects(new Promise((resolve,reject)=>store.put(0,new Uint8Array(4),(error)=>error?reject(error):resolve())));
});
test("download sample content matches the actual public web seed bytes",()=>{
  assert.equal(readFileSync(new URL("../assets/demo/readme.txt",import.meta.url),"utf8"),DEMO_TEXT);
});
