import type { MarkerState } from './bright-marker.mjs';
export type MarkerPath = {start:number;fps:number;samples:{point:{x:number;y:number};confidence:number;misses:number}[]};
export function sampleMarkerPath(path:MarkerPath|null,time:number): (MarkerPath['samples'][number] & {trail:{x:number;y:number}[]})|null;
export function prepareMarkerPath(options:{src:string;width:number;height:number;start:number;duration:number;seed:MarkerState;signal:AbortSignal;progress:(value:number)=>void}):Promise<MarkerPath>;
