"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { createTorrent, extractMagnet, formatBytes, inspectTorrent, makeMagnet, MAX_TORRENT_BYTES, parseTrackers } from "../lib/torrent";
import { DEMO_TEXT, loadTorrentEngine, MAX_BROWSER_DOWNLOAD, MemoryChunkStore, type BrowserTorrent, type BrowserTorrentClient } from "../lib/browser-torrent";
import { torrentTools, type TorrentToolSlug } from "./tools";
import styles from "./Torrent.module.css";

interface Stats { peers: number; peakPeers: number; downloaded: number; speed: number; progress: number; seconds: number }
const emptyStats: Stats = { peers: 0, peakPeers: 0, downloaded: 0, speed: 0, progress: 0, seconds: 0 };
export default function BrowserTorrentTool({slug}:{slug:TorrentToolSlug}) {
  const config = torrentTools.find((tool)=>tool.slug===slug)!;
  const health = slug === "torrent-health-checker";
  const [source,setSource] = useState("magnet");
  const [magnet,setMagnet] = useState("");
  const [file,setFile] = useState<File|null>(null);
  const [trackers,setTrackers] = useState("wss://tracker.openwebtorrent.com");
  const [webSeed,setWebSeed] = useState("");
  const [status,setStatus] = useState("");
  const [warning,setWarning] = useState("");
  const [error,setError] = useState("");
  const [active,setActive] = useState(false);
  const [ready,setReady] = useState(false);
  const [stats,setStats] = useState<Stats>(emptyStats);
  const [torrentName,setTorrentName] = useState("");
  const [hash,setHash] = useState("");
  const [selected,setSelected] = useState<number[]>([]);
  const [filter,setFilter] = useState("all");
  const [saving,setSaving] = useState<number|null>(null);
  const [report,setReport] = useState("");
  const clientRef = useRef<BrowserTorrentClient|null>(null);
  const torrentRef = useRef<BrowserTorrent|null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const runRef = useRef(0);
  const selectedRef = useRef<number[]>([]);

  function dispose() {
    if(timerRef.current) clearInterval(timerRef.current);
    timerRef.current=null;
    const client=clientRef.current; clientRef.current=null; torrentRef.current=null;
    if(client&&!client.destroyed) client.destroy();
  }
  useEffect(()=>{
    const leave=()=>{runRef.current++;dispose();};
    window.addEventListener("pagehide",leave);
    return ()=>{window.removeEventListener("pagehide",leave);leave();};
  },[]);

  function stop() {
    runRef.current++; dispose(); setActive(false); setReady(false);setSaving(null);
    setStatus("Stopped. Connections closed and temporary download data cleared. Saved files remain on your device.");
  }
  function clear() {setError("");setWarning("");setStatus("");setReport("");setStats(emptyStats);setTorrentName("");setHash("");setSelected([]);selectedRef.current=[];setReady(false);}

  async function start(event?:FormEvent, demo=false) {
    event?.preventDefault(); dispose(); clear(); setActive(true);
    const run=++runRef.current;
    const current=()=>run===runRef.current;
    function fail(message:string) {if(!current())return;setError(message);setActive(false);setReady(false);dispose();}
    try {
      setStatus(demo?"Preparing a local sample…":"Loading the browser torrent engine…");
      let input:string|Uint8Array;
      let urls:string[]=[];
      let announce:string[]=[];
      if(demo) {
        const sample=await createTorrent([new File([DEMO_TEXT],"readme.txt")]); input=sample.bytes;
        urls=[`${window.location.origin}/torrent-demo/readme.txt`];
      } else {
        announce=parseTrackers(trackers).filter((url)=>url.startsWith("wss://"));
        if(parseTrackers(trackers).some((url)=>!url.startsWith("wss://"))) throw new Error("Browser discovery needs secure WebSocket trackers (wss://). UDP/HTTP trackers need a desktop client.");
        if(source==="file") {
          if(!file) throw new Error("Choose a .torrent file.");
          if(file.size>MAX_TORRENT_BYTES) throw new Error("Choose a torrent file up to 10 MiB.");
          const bytes=new Uint8Array(await file.arrayBuffer()); const summary=await inspectTorrent(bytes);
          if(summary.private) throw new Error("Use your desktop client and tracker’s instructions for private torrents. This browser tool supports public torrents only.");
          if(!health&&summary.totalSize>MAX_BROWSER_DOWNLOAD) throw new Error("This torrent exceeds the 256 MiB browser limit. Use a desktop client for larger torrents.");
          input=bytes;
        } else {
          const parsed=extractMagnet(magnet);
          input=makeMagnet(parsed.infoHash,parsed.name,parsed.trackers.filter((url)=>url.startsWith("wss://")));
        }
        if(!health&&webSeed.trim()) {
          const url=new URL(webSeed.trim());
          if(url.protocol!=="https:"&&!(url.protocol==="http:"&&url.origin===window.location.origin)) throw new Error("Use an HTTPS web seed URL (or this site’s local development origin).");
          if(url.username||url.password) throw new Error("Web seed URLs must not include login credentials.");
          urls=[url.href];
        }
      }
      const WebTorrent=await loadTorrentEngine(); if(!current())return;
      if(!WebTorrent.WEBRTC_SUPPORT&&!demo) throw new Error("WebRTC is unavailable in this browser. Try a current browser or a desktop torrent client.");
      const client=new WebTorrent({ dht:false, lsd:false, tracker:demo?false:{announce:[]}, webSeeds:!health, maxConns:20, uploadLimit:256 * 1024 });
      clientRef.current=client;
      client.on("error",(cause)=>fail(cause instanceof Error?cause.message:"The torrent engine could not start."));
      let peak=0;
      const started=Date.now();
      const torrent=client.add(input,{announce,urlList:urls,deselect:true,store:MemoryChunkStore,destroyStoreOnDestroy:true,storeCacheSlots:0},(loaded)=>{
        if(!current())return;
        if(loaded.private) {fail("Private torrents are not supported by this browser tool.");return;}
        if(!health&&loaded.length>MAX_BROWSER_DOWNLOAD) {fail("This torrent exceeds the 256 MiB browser limit. Use a desktop client for larger torrents.");return;}
        torrentRef.current=loaded;setReady(true);setTorrentName(loaded.name);setHash(loaded.infoHash);
        setStatus(health?"Metadata received. Observing browser-compatible peers for 30 seconds…":"Metadata ready. Select the files you want to download below.");
        if(demo&&!health) {loaded.files.forEach((entry)=>entry.select());selectedRef.current=loaded.files.map((_,index)=>index);setSelected([...selectedRef.current]);setStatus("Downloading the verified sample from this site…");}
      });
      torrentRef.current=torrent;
      torrent.on("error",(cause)=>fail(cause instanceof Error?cause.message:"The torrent could not be processed."));
      torrent.on("warning",()=>{if(current())setWarning("One or more trackers or peers could not be reached. A tracker warning alone does not establish torrent health.");});
      setStatus(health?"Checking browser-compatible peers…":"Connecting and retrieving torrent metadata…");
      timerRef.current=setInterval(()=>{
        if(!current()||torrent.destroyed)return;
        peak=Math.max(peak,torrent.numPeers||0);
        const seconds=Math.floor((Date.now()-started)/1000);
        const chosen=selectedRef.current.map((index)=>torrent.files?.[index]).filter(Boolean);
        const total=chosen.reduce((sum,entry)=>sum+entry.length,0);
        const downloaded=chosen.reduce((sum,entry)=>sum+entry.downloaded,0);
        const completed=chosen.length>0&&chosen.every((entry)=>entry.done||entry.length===0);
        setStats({peers:torrent.numPeers||0,peakPeers:peak,downloaded,speed:torrent.downloadSpeed||0,progress:completed?1:total?downloaded/total:0,seconds});
        if(completed&&!health) setStatus("Selected files are complete and verified. Save them below, then stop the session.");
        if(health&&seconds>=30) {
          setReport(peak>0?`Connected to up to ${peak} WebRTC peer${peak===1?"":"s"} during this 30-second check. This confirms browser connectivity, not a complete seed count, content safety, or future availability.`:"No WebRTC peers connected during this 30-second check. Result is inconclusive: the torrent may have TCP-only peers, unreachable trackers, or no browser seeders.");
          dispose();setActive(false);setReady(false);setStatus("Check complete. Connections closed.");
        } else if(!health&&!torrent.files?.length&&seconds>=60) {fail("No metadata received within 60 seconds. Try a .torrent file, a reachable wss:// tracker, or a desktop client. This does not prove the torrent is dead.");}
        else if(!health&&seconds>=30&&!completed&&torrent.numPeers===0&&torrent.downloadSpeed===0) setWarning("Waiting for compatible peers or a reachable web seed. Most desktop-only swarms cannot be downloaded in a browser.");
      },1000);
    } catch(cause) {if(current()){dispose();setActive(false);setError(cause instanceof Error?cause.message:"Unable to start this torrent.");}}
  }

  function toggle(index:number) {
    const torrent=torrentRef.current;if(!torrent)return;
    const next=selected.includes(index)?selected.filter((entry)=>entry!==index):[...selected,index];
    selectedRef.current=next;setSelected(next);
    // Rebuild selection: files can share a boundary piece, so deselecting one must not strand another.
    if(torrent.pieces.length) torrent.deselect(0,torrent.pieces.length-1,0);
    next.forEach((entry)=>torrent.files[entry].select());
    setStatus(next.length?"Downloading selected files. Keep this tab open.":"No files selected. Connections remain open until you stop.");
  }
  async function save(index:number) {
    const torrent=torrentRef.current; const entry=torrent?.files[index];if(!entry)return;
    const run=runRef.current;setSaving(index);
    try {
      if(!entry.done&&entry.length!==0) throw new Error("Wait for this file to finish before saving.");
      const blob=await entry.blob();if(run!==runRef.current)return;
      const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=entry.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);setStatus(`Save started for ${entry.name}. Check your browser’s downloads.`);
    } catch(cause) {if(run===runRef.current)setError(cause instanceof Error?cause.message:"Unable to save this file.");}
    finally {if(run===runRef.current)setSaving(null);}
  }
  const files=torrentRef.current?.files||[];
  return <>
    <header className={styles.header}><span className={styles.eyebrow}>TORRENT &amp; HASHING</span><h1>{config.name}</h1><p>{config.description}</p></header>
    <div className={styles.workspace}><div className={`${styles.panel} ph-no-capture ph-mask`}>
      <p className={styles.connectionNotice}>{health?"This check makes real peer connections and retrieves metadata, without selecting content for download.":"Works with WebRTC peers or accessible HTTP web seeds. Maximum torrent size: 256 MiB. While connected, verified pieces may be shared with peers (upload cap: 256 KiB/s)."} Starting shares your torrent identifier and connection information with trackers and peers.</p>
      <form onSubmit={(event)=>start(event)}><fieldset disabled={active} className={styles.fields}><legend className={styles.legend}>{health?"Check a public torrent":"Choose a public torrent"}</legend>
        <div className={styles.sourceToggle} role="group" aria-label="Input source"><button type="button" aria-pressed={source==="magnet"} onClick={()=>{setSource("magnet");clear();}}>Magnet link</button><button type="button" aria-pressed={source==="file"} onClick={()=>{setSource("file");clear();}}>.torrent file</button></div>
        {source==="magnet"?<label className={styles.field}>Magnet link<textarea rows={3} value={magnet} required maxLength={32768} spellCheck={false} onChange={(e)=>{setMagnet(e.target.value);clear();}} placeholder="magnet:?xt=urn:btih:…"/></label>:<label className={`${styles.field} ${styles.upload}`}>Torrent file<input required type="file" accept=".torrent,application/x-bittorrent" onChange={(e)=>{setFile(e.target.files?.[0]||null);clear();}}/><small>Metadata up to 10 MiB. Public v1 torrents only.</small></label>}
        <label className={styles.field}>Additional WebSocket trackers<textarea rows={2} value={trackers} maxLength={16384} onChange={(e)=>setTrackers(e.target.value)}/><small>One wss:// URL per line. The visible public tracker is contacted only after you start. You can remove or replace it.</small></label>
        {!health&&<label className={styles.field}>HTTP web seed (optional)<input type="url" value={webSeed} onChange={(e)=>setWebSeed(e.target.value)} placeholder="https://your-source.example/file.mp4"/><small>A trusted server hosting the original matching content, with CORS and byte-range support.</small></label>}
        <div className={styles.actions}><button className={styles.primary} type="submit">{health?"Check browser peers":"Connect to torrent"}</button>{!health&&<button className={styles.secondary} type="button" onClick={()=>start(undefined,true)}>Try a small sample</button>}</div>
      </fieldset></form>
      {active&&<div className={styles.actions}><button className={styles.secondary} onClick={stop}>Stop &amp; clear session</button></div>}
      <p role="status" className={styles.status}>{status}</p>{warning&&<p className={styles.hint}>{warning}</p>}{error&&<p role="alert" className={styles.error}>{error}</p>}
      {(active||report)&&<section className={styles.results} aria-label="Live torrent status"><h2>{torrentName||"Connection status"}</h2>{hash&&<p className={styles.hashText}>Info hash: {hash}</p>}
        <dl className={styles.metricGrid}><div><dt>Connected peers</dt><dd>{stats.peers}</dd></div><div><dt>{health?"Peak peers":"Download speed"}</dt><dd>{health?stats.peakPeers:`${formatBytes(stats.speed)}/s`}</dd></div><div><dt>Elapsed</dt><dd>{stats.seconds}s</dd></div>{!health&&<div><dt>Selected files downloaded</dt><dd>{formatBytes(stats.downloaded)}</dd></div>}</dl>
        {report&&<p className={styles.connectionNotice}>{report}</p>}
        {!health&&ready&&<><label className={styles.field}>Show files<select value={filter} onChange={(e)=>setFilter(e.target.value)}><option value="all">All files</option><option value="mp4">MP4 videos</option><option value="pdf">PDF documents</option></select></label>
          <progress aria-label="Selected download progress" max={1} value={stats.progress}/><p className={styles.hint}>{Math.round(stats.progress*100)}% of selected content</p>
          <div className={styles.downloadFiles}>{files.map((entry,index)=>filter!=="all"&&!entry.name.toLowerCase().endsWith(`.${filter}`)?null:<div key={entry.path}><label><input type="checkbox" checked={selected.includes(index)} onChange={()=>toggle(index)}/><span>{entry.name}<small>{formatBytes(entry.length)} · {entry.done?"Complete":`${Math.round(entry.progress*100)||0}%`}</small></span></label><button className={styles.secondary} disabled={(!entry.done&&entry.length!==0)||saving!==null} onClick={()=>save(index)}>{saving===index?"Preparing…":"Save file"}</button></div>)}</div>
          {filter!=="all"&&!files.some((entry)=>entry.name.toLowerCase().endsWith(`.${filter}`))&&<p className={styles.hint}>This torrent contains no {filter.toUpperCase()} files. A torrent file cannot be converted into that format; it describes the original content.</p>}
        </>}
      </section>}
    </div><aside className={styles.guide}><h2>How this works</h2><p>{config.help}</p><h3>Browser limits</h3><p>Most ordinary desktop peers use TCP/UDP and cannot connect here. A torrent can be active in a desktop client while having no browser peers.</p>{health ? <p>The check counts live connections during a 30-second window. It does not download the files, count all seeders, or scan the content for malware.</p> : <><p>Downloads use temporary memory and are cleared when you stop or leave. Save finished files before closing this page. No permanent direct URL is generated.</p><h3>Torrent file to MP4 or PDF?</h3><p>A .torrent contains metadata, not the video or document. This tool retrieves the actual files and can filter for MP4 or PDF. It does not transcode, rename formats, or bypass missing peers.</p></>}<h3>Other options</h3><nav><Link href="/torrent/torrent-file-to-magnet">Convert torrent to magnet →</Link><Link href="/torrent/torrent-download-time-calculator">Estimate download time →</Link></nav></aside></div>
  </>;
}
