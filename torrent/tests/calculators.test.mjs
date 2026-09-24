import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import * as calc from "../assets/js/lib/calculators.js";
import { MemoryChunkStore, DEMO_TEXT } from "../assets/js/lib/browser-torrent.js";

test("download estimates convert bits to bytes and account for completion and efficiency",()=>{
  assert.equal(calc.downloadEstimate(1,"GB",100,"Mbps",100).seconds,80);
  assert.equal(calc.downloadEstimate(1,"GB",100,"Mbps",50,50).seconds,80);
  assert.equal(calc.downloadEstimate(1,"GiB",1,"MiB/s",100).seconds,1024);
  assert.equal(calc.downloadEstimate(1,"GB",100,"Mbps",100,100).seconds,0);
});
test("invalid or impossible calculator inputs are rejected",()=>{
  for(const speed of [0,-1,NaN,Infinity]) assert.throws(()=>calc.downloadEstimate(1,"GB",speed,"Mbps",100));
  assert.throws(()=>calc.downloadEstimate(1,"GB",1,"Mbps",101));
  assert.throws(()=>calc.downloadEstimate(1,"GB",1,"Mbps",50,101));
  assert.throws(()=>calc.videoEstimate(1,0,128,1,1));
  assert.throws(()=>calc.storageEstimate(1,1,1.5,10,0.02));
});
test("decimal and binary speed results remain distinct",()=>{
  const result=calc.speedEstimate(100,"Mbps",100);
  assert.equal(result.megabytes,12.5);
  assert.equal(result.mebibytes,12.5e6/(1024**2));
  assert.equal(result.gigabytesPerHour,45);
});
test("video estimate sums bitrates and reports output growth honestly",()=>{
  const result=calc.videoEstimate(1,8,0,1,0);
  assert.equal(result.bytes,60e6);
  assert.equal(result.reductionPercent,94);
  assert.ok(calc.videoEstimate(120,100,320,1,1).reductionPercent<0);
});
test("storage includes originals, extracted data, backups, and additive headroom",()=>{
  assert.deepEqual(calc.storageEstimate(100,1,1,20,0.02),{originalAndExtractedGB:200,backupGB:200,totalGB:480,monthlyCost:9.6});
  assert.equal(calc.storageEstimate(100,0,0,0,0).totalGB,100);
});
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
test("duration labels handle exact boundaries",()=>{
  assert.equal(calc.durationLabel(0),"Complete");assert.equal(calc.durationLabel(.2),"Less than a second");
  assert.equal(calc.durationLabel(86461),"1d 1m 1s");assert.throws(()=>calc.durationLabel(Infinity));
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

test("overflowing calculation results are rejected rather than displaying Infinity",()=>{
  assert.throws(()=>calc.downloadEstimate(1e308,"TB",1,"Mbps",100),/number range/);
  assert.throws(()=>calc.speedEstimate(1e308,"Gbps",100),/number range/);
});
