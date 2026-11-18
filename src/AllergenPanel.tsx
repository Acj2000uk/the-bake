import {useEffect,useState} from 'react';
import {TriangleAlert} from 'lucide-react';
import type {Recipe} from './types';
import {api} from './api';

function historicalWarning(source:string) {
 const field=source.split('ALLERGENS:')[1]?.split('INGREDIENTS')[0];
 if(!field)return '';
 const [first,...rest]=field.split('\n');
 return [first,...rest.filter(line=>/\s{8,}[A-Z]/.test(line)).map(line=>line.split(/\s{8,}/).at(-1)||'')].join(' ').trim();
}
export function AllergenPanel({recipe}:{recipe:Recipe}){
 const [archive,setArchive]=useState('');
 useEffect(()=>{let current=true;setArchive('');if(!recipe.active&&!recipe.allergen)api('source?id='+recipe.id).then((s:string)=>{if(current)setArchive(historicalWarning(s))}).catch(()=>{});return()=>{current=false}},[recipe.id,recipe.active,recipe.allergen]);
 const groups=recipe.allergen.trim().split(/\n\s*\n/).filter(Boolean);
 return <section className="allergenPanel" aria-label="Recipe allergen information"><small><TriangleAlert/>Recipe allergen information</small>
 {groups.length?groups.map((group,n)=><div className="declaration" key={n}>{group.split('\n').map((line,i)=>{
 const match=line.match(/^(Contains|Precautionary \/ pending):\s*(.*)$/i);
 if(!match)return <p key={i} className={i===0?'variant':'evidence'}>{line}</p>;
 return <div key={i} className="allergenRow"><b>{match[1]}</b><div className="allergenTags">{match[2].split(';').filter(v=>v.trim()).map((v,j)=><span key={j}>{v.trim()}</span>)}</div></div>;
 })}</div>):<><p className="variant">{recipe.active?'Current declaration unavailable':'Archive declaration only'}</p>{archive&&<div className="allergenTags">{archive.split(',').filter(v=>v.trim()).map((v,i)=><span key={i}>{v.trim()}</span>)}</div>}<p>Check the current declaration with the responsible chef before service.</p></>}
 </section>
}
