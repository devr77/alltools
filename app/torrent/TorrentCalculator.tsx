"use client";

import { useState, type FormEvent } from "react";
import { torrentTools, type TorrentToolSlug } from "./tools";
import { compareConnections, downloadEstimate, durationLabel, sizeUnits, speedEstimate, speedUnits, standardName, storageEstimate, videoEstimate } from "../lib/torrent-calculators";
import { formatBytes } from "../lib/torrent";
import styles from "./Torrent.module.css";


interface Field { key: string; label: string; value: string; options?: string[]; type?: "text" | "textarea"; min?: number; max?: number; step?: string; hint?: string }
const speedFields: Field[] = [
  {key:"speed",label:"Connection speed",value:"100",min:0.001},
  {key:"speedUnit",label:"Speed unit",value:"Mbps",options:Object.keys(speedUnits)},
  {key:"efficiency",label:"Usable bandwidth (%)",value:"85",min:0.1,max:100,hint:"An assumption for overhead and swarm conditions; not a measured speed."},
];
const fieldSets: Record<string, Field[]> = {
  "torrent-download-time-calculator": [{key:"size",label:"Total file size",value:"10",min:0.001},{key:"unit",label:"Size unit",value:"GB",options:Object.keys(sizeUnits)},...speedFields,{key:"completed",label:"Already downloaded (%)",value:"0",min:0,max:100}],
  "internet-to-torrent-speed-converter": speedFields,
  "video-file-size-reduction-estimator": [
    {key:"minutes",label:"Video duration (minutes)",value:"120",min:0.01},{key:"video",label:"Target video bitrate (Mbps)",value:"3",min:0.001},
    {key:"audio",label:"Total audio bitrate (Kbps)",value:"128",min:0,hint:"Sum the bitrates if keeping multiple audio tracks."},{key:"original",label:"Original file size (GB)",value:"8",min:0.001},
    {key:"overhead",label:"Container overhead (%)",value:"1",min:0,max:100},
  ],
  "storage-requirement-calculator": [
    {key:"size",label:"Original downloads (GB)",value:"100",min:0.001},{key:"expansion",label:"Additional extracted size (× originals)",value:"1",min:0,hint:"Use 0 when you do not need an extracted copy; 2 means extracted files take twice the original space."},
    {key:"copies",label:"Additional backup copies",value:"1",min:0,max:100,step:"1"},{key:"headroom",label:"Extra free-space allowance (%)",value:"20",min:0,max:100},
    {key:"price",label:"Monthly price per GB",value:"0.02",min:0},{key:"currency",label:"Price currency",value:"USD",options:["USD","INR","EUR","GBP"]},
  ],
  "isp-throttling-detector": [
    {key:"direct",label:"Torrent speeds without VPN (Mbps)",value:"20, 22, 18",type:"textarea"},
    {key:"vpn",label:"Same torrent with VPN (Mbps)",value:"40, 42, 38",type:"textarea"},
    {key:"reference",label:"Reference HTTPS download speeds (Mbps)",value:"90, 88, 92",type:"textarea",hint:"Enter 3–20 measurements per field. Use the same device, connection, torrent, and comparable times. Convert MB/s to Mbps by multiplying by 8."},
  ],
  "torrent-naming-standard-generator": [
    {key:"title",label:"Title",value:"My Creative Project",type:"text"},{key:"year",label:"Year (optional)",value:"2026",type:"text"},
    {key:"type",label:"Content type",value:"movie",options:["movie","tv","general"]},{key:"season",label:"Season (TV only)",value:"1",min:0,max:999,step:"1"},{key:"episode",label:"Episode (TV only)",value:"1",min:0,max:999,step:"1"},
    {key:"resolution",label:"Resolution (optional)",value:"1080p",options:["","480p","720p","1080p","2160p"]},{key:"source",label:"Source (optional)",value:"WEB",options:["","WEB","BluRay","HDTV","Original"]},
    {key:"codec",label:"Codec (optional)",value:"H264",options:["","H264","H265","AV1","VP9"]},{key:"group",label:"Release group (optional)",value:"",type:"text"},
  ],
};
interface Result { metrics: [string,string][]; note?: string; text?: string }
export default function TorrentCalculator({slug}:{slug:TorrentToolSlug}) {
  const config = torrentTools.find((tool)=>tool.slug===slug)!;
  const fields = fieldSets[slug];
  const defaults = Object.fromEntries(fields.map((field)=>[field.key,field.value]));
  const [values,setValues] = useState<Record<string,string>>(defaults);
  const [result,setResult] = useState<Result|null>(null);
  const [error,setError] = useState("");
  const [status,setStatus] = useState("");
  function calculate(event:FormEvent) {
    event.preventDefault(); setError(""); setStatus(""); setResult(null);
    const n=(key:string)=>Number(values[key]);
    try {
      let output:Result;
      if(slug==="torrent-download-time-calculator") {
        const estimate=downloadEstimate(n("size"),values.unit as keyof typeof sizeUnits,n("speed"),values.speedUnit as keyof typeof speedUnits,n("efficiency"),n("completed"));
        output={metrics:[["Estimated remaining time",durationLabel(estimate.seconds)],["Remaining data",formatBytes(estimate.remainingBytes)],["Usable speed",`${formatBytes(estimate.bytesPerSecond)}/s`]],note:"Assumes a sustained download rate. Peer availability, congestion, and disk speed may increase the time."};
      } else if(slug==="internet-to-torrent-speed-converter") {
        const estimate=speedEstimate(n("speed"),values.speedUnit as keyof typeof speedUnits,n("efficiency"));
        output={metrics:[["Decimal download rate",`${estimate.megabytes.toFixed(2)} MB/s`],["Binary download rate",`${estimate.mebibytes.toFixed(2)} MiB/s`],["Data per hour",`${estimate.gigabytesPerHour.toFixed(2)} GB`]],note:"Mbps ÷ 8 = MB/s before applying your efficiency factor. MB is decimal; MiB is binary."};
      } else if(slug==="video-file-size-reduction-estimator") {
        const estimate=videoEstimate(n("minutes"),n("video"),n("audio"),n("original"),n("overhead"));
        output={metrics:[["Estimated output",formatBytes(estimate.bytes)],[estimate.savedBytes>=0?"Estimated saving":"Estimated increase",formatBytes(Math.abs(estimate.savedBytes))],["Size change",`${Math.abs(estimate.reductionPercent).toFixed(1)}% ${estimate.reductionPercent>=0?"smaller":"larger"}`]],note:"Estimate = duration × total bitrate ÷ 8, plus container overhead. Quality and variable-bitrate output depend on the encoder and content."};
      } else if(slug==="storage-requirement-calculator") {
        const estimate=storageEstimate(n("size"),n("expansion"),n("copies"),n("headroom"),n("price"));
        output={metrics:[["Originals + extracted files",`${estimate.originalAndExtractedGB.toFixed(2)} GB`],["Backups",`${estimate.backupGB.toFixed(2)} GB`],["Recommended capacity",`${estimate.totalGB.toFixed(2)} GB`],["Monthly storage estimate",new Intl.NumberFormat("en-US",{style:"currency",currency:values.currency}).format(estimate.monthlyCost)]],note:"Backups include originals and extracted copies. Headroom is an additional allowance, not a target free-space percentage. Pricing uses your entered rate; egress, requests, taxes, and minimum charges are excluded."};
      } else if(slug==="isp-throttling-detector") {
        const estimate=compareConnections(values.direct,values.vpn,values.reference);
        output={metrics:[["Direct median",`${estimate.directMbps.toFixed(2)} Mbps`],["VPN median",`${estimate.vpnMbps.toFixed(2)} Mbps`],["Reference median",`${estimate.referenceMbps.toFixed(2)} Mbps`],["VPN difference",`${estimate.improvement>=0?"+":""}${estimate.improvement.toFixed(1)}%`]],note:estimate.interpretation};
      } else if(slug==="torrent-naming-standard-generator") {
        output={metrics:[],text:standardName(values.title,values.year,values.type,n("season"),n("episode"),values.resolution,values.source,values.codec,values.group),note:"Use only accurate labels. Keep the real file extension when renaming a file; changing its name does not change its format."};
      } else {
        throw new Error("Unknown calculator.");
      }
      setResult(output); setStatus("Result ready.");
    } catch(cause) {setError(cause instanceof Error?cause.message:"Check your inputs.");}
  }
  const outputText=result ? [config.name,...result.metrics.map(([key,value])=>`${key}: ${value}`),result.text||"",result.note||""].filter(Boolean).join("\n") : "";
  async function copy() {try{await navigator.clipboard.writeText(outputText);setStatus("Result copied.");}catch{setStatus("Clipboard unavailable. Select and copy the output manually.");}}
  function download() {const url=URL.createObjectURL(new Blob([outputText],{type:"text/plain"}));const a=document.createElement("a");a.href=url;a.download=`${slug}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  return <>
    <header className={styles.header}><span className={styles.eyebrow}>TORRENT &amp; HASHING</span><h1>{config.name}</h1><p>{config.description}</p></header>
    <div className={styles.workspace}><div className={`${styles.panel} ph-no-capture ph-mask`}>
      <form onSubmit={calculate}><div className={styles.calculatorFields}>
        {fields.map((field)=><label key={field.key} className={styles.field}>{field.label}
          {field.options ? <select value={values[field.key]} onChange={(e)=>{setValues({...values,[field.key]:e.target.value});setResult(null);setStatus("");}}>{field.options.map((option)=><option key={option} value={option}>{option||"None"}</option>)}</select> : field.type==="textarea" ? <textarea required rows={3} value={values[field.key]} onChange={(e)=>{setValues({...values,[field.key]:e.target.value});setResult(null);setStatus("");}}/> : <input type={field.type||"number"} required={!field.label.includes("optional")} min={field.min} max={field.max} step={field.step||"any"} value={values[field.key]} maxLength={field.type==="text"?220:undefined} onChange={(e)=>{setValues({...values,[field.key]:e.target.value});setResult(null);setStatus("");}}/>}
          {field.hint&&<small>{field.hint}</small>}
        </label>)}
      </div><div className={styles.actions}><button type="submit" className={styles.primary}>{slug.includes("generator")?"Generate":"Calculate"}</button><button type="button" className={styles.secondary} onClick={()=>{setValues(defaults);setResult(null);setError("");setStatus("");}}>Reset</button></div></form>
      {error&&<p className={styles.error} role="alert">{error}</p>}<p className={styles.status} role="status">{status}</p>
      {result&&<section className={styles.results} aria-label="Calculation result"><h2>Your result</h2>
        {result.metrics.length>0&&<dl className={styles.metricGrid}>{result.metrics.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
        {result.text&&<label className={styles.resultField}>Generated name<textarea readOnly rows={3} value={result.text}/></label>}
        {result.note&&<p className={styles.hint}>{result.note}</p>}<div className={styles.actions}><button className={styles.secondary} onClick={copy}>Copy result</button><button className={styles.secondary} onClick={download}>Download text</button></div>
      </section>}
    </div><aside className={styles.guide}><h2>How it works</h2><p>{config.help}</p><h3>Calculated on your device</h3><p>These calculations use your inputs only. No file uploads or peer connections are required.</p><h3>Explore more</h3><nav aria-label="Related torrent tools">{torrentTools.filter((tool)=>tool.slug!==slug).slice(0,5).map((tool)=><a key={tool.slug} href={`/torrent/${tool.slug}`}>{tool.name} →</a>)}</nav></aside></div>
  </>;
}
