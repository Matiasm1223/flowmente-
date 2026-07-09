import { NodeIO } from '@gltf-transform/core';
import { simplify, textureResize, dedup, prune } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';

async function optimize() {
  console.log('Starting optimization...');
  
  // Initialize Meshoptimizer
  await MeshoptSimplifier.ready;
  
  const io = new NodeIO();
  
  console.log('Reading GLB...');
  const document = await io.read('public/modelos-3d/logo-f.glb');
  
  console.log('Applying dedup and prune...');
  await document.transform(
    dedup(),
    prune()
  );
  
  console.log('Applying texture resize to 1024x1024...');
  await document.transform(
    textureResize({ size: [1024, 1024] })
  );
  
  console.log('Applying simplification (ratio: 0.1)...');
  await document.transform(
    simplify({ simplifier: MeshoptSimplifier, ratio: 0.1, error: 0.01 })
  );
  
  console.log('Writing optimized GLB...');
  await io.write('public/modelos-3d/logo-f-opt.glb', document);
  
  console.log('Done!');
}

optimize().catch(console.error);
