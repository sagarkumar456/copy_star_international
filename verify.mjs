import assert from 'node:assert/strict';
import {buildCopier,poseParts,explosionAt} from './dist/model.js';
import * as T from './dist/vendor/three.module.js';
const {root,parts}=buildCopier();
assert(parts.length>=18,'Expected independently animated machine components');
let meshes=0,triangles=0;
root.traverse(o=>{if(o.isMesh){meshes++;const a=o.geometry.attributes.position.array;assert([...a].every(Number.isFinite),o.name+' geometry must be finite');triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3}});
const initial=parts.map(p=>p.g.position.clone());
for(let step=0;step<=100;step++){const p=step/100;const amount=poseParts(parts,p,1,true);assert(amount>=0&&amount<=1);root.updateMatrixWorld(true);for(const q of parts)assert(q.g.matrixWorld.elements.every(Number.isFinite));}
for(let i=0;i<parts.length;i++)assert(parts[i].g.position.distanceTo(initial[i])<1e-9,'Final pose must exactly reassemble');
assert.equal(explosionAt(0),0);assert.equal(explosionAt(.5),1);assert.equal(explosionAt(1),0);
poseParts(parts,.5,0,false);const bounds=new T.Box3().setFromObject(root);assert(bounds.max.x-bounds.min.x<10);assert(bounds.max.y-bounds.min.y<8);
poseParts(parts,0,0,false);for(let i=0;i<parts.length;i++)assert(parts[i].g.position.distanceTo(initial[i])<1e-9,'Reverse scroll must reassemble');
console.log(JSON.stringify({parts:parts.length,meshes,triangles,fullScrollCycle:'passed',reverseReassembly:'passed',explodedBounds:bounds.getSize(new T.Vector3()).toArray()}));
