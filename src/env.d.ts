/// <reference types="astro/client" />

// Declaraciones de módulos para importar shaders GLSL como strings
// Esto le dice a TypeScript que importar *.glsl (con o sin ?raw) produce un string.
declare module '*.glsl' {
  const value: string;
  export default value;
}

declare module '*.vert' {
  const value: string;
  export default value;
}

declare module '*.frag' {
  const value: string;
  export default value;
}

declare module '*.vert.glsl' {
  const value: string;
  export default value;
}

declare module '*.frag.glsl' {
  const value: string;
  export default value;
}
