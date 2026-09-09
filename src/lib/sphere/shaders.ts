// Organic Sphere v0.4 D2 shader. Perlin noise implementation by Stefan Gustavson.
export const vertexShader = `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec4 fade(vec4 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float perlin4d(vec4 P){
  vec4 Pi0 = floor(P);
  vec4 Pi1 = Pi0 + 1.0;
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec4 Pf0 = fract(P);
  vec4 Pf1 = Pf0 - 1.0;
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = vec4(Pi0.zzzz);
  vec4 iz1 = vec4(Pi1.zzzz);
  vec4 iw0 = vec4(Pi0.wwww);
  vec4 iw1 = vec4(Pi1.wwww);

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);
  vec4 ixy00 = permute(ixy0 + iw0);
  vec4 ixy01 = permute(ixy0 + iw1);
  vec4 ixy10 = permute(ixy1 + iw0);
  vec4 ixy11 = permute(ixy1 + iw1);

  vec4 gx00 = ixy00 / 7.0;
  vec4 gy00 = floor(gx00) / 7.0;
  vec4 gz00 = floor(gy00) / 6.0;
  gx00 = fract(gx00) - 0.5;
  gy00 = fract(gy00) - 0.5;
  gz00 = fract(gz00) - 0.5;
  vec4 gw00 = vec4(0.75) - abs(gx00) - abs(gy00) - abs(gz00);
  vec4 sw00 = step(gw00, vec4(0.0));
  gx00 -= sw00 * (step(0.0, gx00) - 0.5);
  gy00 -= sw00 * (step(0.0, gy00) - 0.5);

  vec4 gx01 = ixy01 / 7.0;
  vec4 gy01 = floor(gx01) / 7.0;
  vec4 gz01 = floor(gy01) / 6.0;
  gx01 = fract(gx01) - 0.5;
  gy01 = fract(gy01) - 0.5;
  gz01 = fract(gz01) - 0.5;
  vec4 gw01 = vec4(0.75) - abs(gx01) - abs(gy01) - abs(gz01);
  vec4 sw01 = step(gw01, vec4(0.0));
  gx01 -= sw01 * (step(0.0, gx01) - 0.5);
  gy01 -= sw01 * (step(0.0, gy01) - 0.5);

  vec4 gx10 = ixy10 / 7.0;
  vec4 gy10 = floor(gx10) / 7.0;
  vec4 gz10 = floor(gy10) / 6.0;
  gx10 = fract(gx10) - 0.5;
  gy10 = fract(gy10) - 0.5;
  gz10 = fract(gz10) - 0.5;
  vec4 gw10 = vec4(0.75) - abs(gx10) - abs(gy10) - abs(gz10);
  vec4 sw10 = step(gw10, vec4(0.0));
  gx10 -= sw10 * (step(0.0, gx10) - 0.5);
  gy10 -= sw10 * (step(0.0, gy10) - 0.5);

  vec4 gx11 = ixy11 / 7.0;
  vec4 gy11 = floor(gx11) / 7.0;
  vec4 gz11 = floor(gy11) / 6.0;
  gx11 = fract(gx11) - 0.5;
  gy11 = fract(gy11) - 0.5;
  gz11 = fract(gz11) - 0.5;
  vec4 gw11 = vec4(0.75) - abs(gx11) - abs(gy11) - abs(gz11);
  vec4 sw11 = step(gw11, vec4(0.0));
  gx11 -= sw11 * (step(0.0, gx11) - 0.5);
  gy11 -= sw11 * (step(0.0, gy11) - 0.5);

  vec4 g0000 = vec4(gx00.x,gy00.x,gz00.x,gw00.x);
  vec4 g1000 = vec4(gx00.y,gy00.y,gz00.y,gw00.y);
  vec4 g0100 = vec4(gx00.z,gy00.z,gz00.z,gw00.z);
  vec4 g1100 = vec4(gx00.w,gy00.w,gz00.w,gw00.w);
  vec4 g0010 = vec4(gx10.x,gy10.x,gz10.x,gw10.x);
  vec4 g1010 = vec4(gx10.y,gy10.y,gz10.y,gw10.y);
  vec4 g0110 = vec4(gx10.z,gy10.z,gz10.z,gw10.z);
  vec4 g1110 = vec4(gx10.w,gy10.w,gz10.w,gw10.w);
  vec4 g0001 = vec4(gx01.x,gy01.x,gz01.x,gw01.x);
  vec4 g1001 = vec4(gx01.y,gy01.y,gz01.y,gw01.y);
  vec4 g0101 = vec4(gx01.z,gy01.z,gz01.z,gw01.z);
  vec4 g1101 = vec4(gx01.w,gy01.w,gz01.w,gw01.w);
  vec4 g0011 = vec4(gx11.x,gy11.x,gz11.x,gw11.x);
  vec4 g1011 = vec4(gx11.y,gy11.y,gz11.y,gw11.y);
  vec4 g0111 = vec4(gx11.z,gy11.z,gz11.z,gw11.z);
  vec4 g1111 = vec4(gx11.w,gy11.w,gz11.w,gw11.w);

  vec4 norm00 = taylorInvSqrt(vec4(dot(g0000, g0000), dot(g0100, g0100), dot(g1000, g1000), dot(g1100, g1100)));
  g0000 *= norm00.x;
  g0100 *= norm00.y;
  g1000 *= norm00.z;
  g1100 *= norm00.w;

  vec4 norm01 = taylorInvSqrt(vec4(dot(g0001, g0001), dot(g0101, g0101), dot(g1001, g1001), dot(g1101, g1101)));
  g0001 *= norm01.x;
  g0101 *= norm01.y;
  g1001 *= norm01.z;
  g1101 *= norm01.w;

  vec4 norm10 = taylorInvSqrt(vec4(dot(g0010, g0010), dot(g0110, g0110), dot(g1010, g1010), dot(g1110, g1110)));
  g0010 *= norm10.x;
  g0110 *= norm10.y;
  g1010 *= norm10.z;
  g1110 *= norm10.w;

  vec4 norm11 = taylorInvSqrt(vec4(dot(g0011, g0011), dot(g0111, g0111), dot(g1011, g1011), dot(g1111, g1111)));
  g0011 *= norm11.x;
  g0111 *= norm11.y;
  g1011 *= norm11.z;
  g1111 *= norm11.w;

  float n0000 = dot(g0000, Pf0);
  float n1000 = dot(g1000, vec4(Pf1.x, Pf0.yzw));
  float n0100 = dot(g0100, vec4(Pf0.x, Pf1.y, Pf0.zw));
  float n1100 = dot(g1100, vec4(Pf1.xy, Pf0.zw));
  float n0010 = dot(g0010, vec4(Pf0.xy, Pf1.z, Pf0.w));
  float n1010 = dot(g1010, vec4(Pf1.x, Pf0.y, Pf1.z, Pf0.w));
  float n0110 = dot(g0110, vec4(Pf0.x, Pf1.yz, Pf0.w));
  float n1110 = dot(g1110, vec4(Pf1.xyz, Pf0.w));
  float n0001 = dot(g0001, vec4(Pf0.xyz, Pf1.w));
  float n1001 = dot(g1001, vec4(Pf1.x, Pf0.yz, Pf1.w));
  float n0101 = dot(g0101, vec4(Pf0.x, Pf1.y, Pf0.z, Pf1.w));
  float n1101 = dot(g1101, vec4(Pf1.xy, Pf0.z, Pf1.w));
  float n0011 = dot(g0011, vec4(Pf0.xy, Pf1.zw));
  float n1011 = dot(g1011, vec4(Pf1.x, Pf0.y, Pf1.zw));
  float n0111 = dot(g0111, vec4(Pf0.x, Pf1.yzw));
  float n1111 = dot(g1111, Pf1);

  vec4 fade_xyzw = fade(Pf0);
  vec4 n_0w = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade_xyzw.w);
  vec4 n_1w = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade_xyzw.w);
  vec4 n_zw = mix(n_0w, n_1w, fade_xyzw.z);
  vec2 n_yzw = mix(n_zw.xy, n_zw.zw, fade_xyzw.y);
  float n_xyzw = mix(n_yzw.x, n_yzw.y, fade_xyzw.x);
  return 2.2 * n_xyzw;
}

#define M_PI 3.1415926535897932384626433832795

uniform vec2 uSubdivision;
uniform vec3 uOffset;
uniform float uDistortionFrequency;
uniform float uDistortionStrength;
uniform float uDisplacementFrequency;
uniform float uDisplacementStrength;
uniform float uTime;
uniform float uMorphFrom;
uniform float uMorphTo;
uniform float uMorphProgress;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying float vIcon;

float distToSegment(vec2 p, vec2 a, vec2 b) {
  vec2 ba = b - a;
  vec2 pa = p - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

// 1. Checkbox: Smooth superellipse squircle pillow tile with embossed 3D checkmark
vec4 getCheckboxShape(vec3 p) {
  float rXY = length(p.xy);
  vec2 dirXY = p.xy / max(0.0001, rXY);
  vec2 squircleDir = sign(dirXY) * pow(abs(dirXY), vec2(0.48));
  vec2 tileXY = squircleDir * clamp(rXY * 1.15, 0.0, 0.95);

  float tileZ = sign(p.z) * pow(abs(p.z), 0.55) * 0.32;
  vec3 tile = vec3(tileXY, tileZ);
  float iconIntensity = 0.0;

  if (p.z > 0.05) {
    vec2 a = vec2(-0.40, 0.06);
    vec2 b = vec2(-0.12, -0.22);
    vec2 c = vec2(0.38, 0.40);
    float dist = min(distToSegment(tile.xy, a, b), distToSegment(tile.xy, b, c));
    float stroke = smoothstep(0.12, 0.03, dist);
    float ridgeBevel = smoothstep(0.04, 0.0, dist) * 0.06;
    tile.z += stroke * 0.22 + ridgeBevel;
    iconIntensity = stroke;
  }
  return vec4(tile, iconIntensity);
}

// 2. Fingerprint Tile: Concentric biometric fingerprint ridges representing unassisted human thinking
vec4 getFingerprintShape(vec3 p) {
  float rXY = length(p.xy);
  vec2 dirXY = p.xy / max(0.0001, rXY);
  vec2 squircleDir = sign(dirXY) * pow(abs(dirXY), vec2(0.48));
  vec2 tileXY = squircleDir * clamp(rXY * 1.15, 0.0, 0.95);

  float tileZ = sign(p.z) * pow(abs(p.z), 0.55) * 0.32;
  vec3 tile = vec3(tileXY, tileZ);
  float iconIntensity = 0.0;

  if (p.z > 0.05) {
    vec2 fp = tile.xy - vec2(0.0, -0.04);
    fp.y *= 0.82;
    float angle = atan(fp.y, fp.x);
    float dist = length(fp) + sin(angle * 2.0 + fp.x * 2.5) * 0.025;
    float mask = 1.0 - smoothstep(0.42, 0.58, length(tile.xy));
    float wave = cos(dist * 44.0);
    float ridges = smoothstep(-0.25, 0.75, wave) * mask;
    float sharpBevel = pow(max(0.0, wave), 3.0) * mask * 0.05;
    tile.z += ridges * 0.16 + sharpBevel;
    iconIntensity = ridges;
  }
  return vec4(tile, iconIntensity);
}

// 3. Socratink "S" Seal: Circular medallion with embossed split "S" crest and double-rim border
vec4 getSealShape(vec3 p) {
  float rXY = length(p.xy);
  vec2 circleXY = (p.xy / max(0.0001, rXY)) * clamp(rXY * 1.1, 0.0, 0.95);
  float circleZ = sign(p.z) * pow(abs(p.z), 0.60) * 0.30;
  vec3 medal = vec3(circleXY, circleZ);
  float iconIntensity = 0.0;

  if (p.z > 0.05) {
    vec2 c = medal.xy;
    float outerRim = smoothstep(0.08, 0.02, abs(length(c) - 0.74));
    float innerRim = smoothstep(0.06, 0.015, abs(length(c) - 0.62));

    float s1 = distToSegment(c, vec2(0.22, 0.38), vec2(-0.22, 0.38));
    float s2 = distToSegment(c, vec2(-0.22, 0.38), vec2(-0.22, 0.08));
    float s3 = distToSegment(c, vec2(-0.22, 0.08), vec2(0.22, -0.08));
    float s4 = distToSegment(c, vec2(0.22, -0.08), vec2(0.22, -0.38));
    float s5 = distToSegment(c, vec2(0.22, -0.38), vec2(-0.22, -0.38));
    float sDist = min(min(min(s1, s2), min(s3, s4)), s5);
    float sStroke = smoothstep(0.11, 0.03, sDist);
    float sBevel = smoothstep(0.04, 0.0, sDist) * 0.07;

    medal.z += outerRim * 0.16 + innerRim * 0.10 + sStroke * 0.22 + sBevel;
    iconIntensity = max(outerRim * 0.5, sStroke);
  }
  return vec4(medal, iconIntensity);
}

// 4. Code Brackets: Tactile tablet with embossed < and > code chevrons
vec4 getCodeBracketsShape(vec3 p) {
  float rXY = length(p.xy);
  vec2 dirXY = p.xy / max(0.0001, rXY);
  vec2 squircleDir = sign(dirXY) * pow(abs(dirXY), vec2(0.50));
  vec2 baseXY = squircleDir * vec2(1.15, 0.85) * clamp(rXY * 1.1, 0.0, 0.95);
  float baseZ = sign(p.z) * pow(abs(p.z), 0.55) * 0.30;
  vec3 tablet = vec3(baseXY, baseZ);
  float iconIntensity = 0.0;

  if (p.z > 0.05) {
    vec2 c = tablet.xy;
    float l1 = distToSegment(c, vec2(-0.18, 0.30), vec2(-0.46, 0.0));
    float l2 = distToSegment(c, vec2(-0.46, 0.0), vec2(-0.18, -0.30));
    float leftBracket = min(l1, l2);

    float r1 = distToSegment(c, vec2(0.18, 0.30), vec2(0.46, 0.0));
    float r2 = distToSegment(c, vec2(0.46, 0.0), vec2(0.18, -0.30));
    float rightBracket = min(r1, r2);

    float d = min(leftBracket, rightBracket);
    float stroke = smoothstep(0.10, 0.03, d);
    float bevel = smoothstep(0.035, 0.0, d) * 0.06;
    tablet.z += stroke * 0.22 + bevel;
    iconIntensity = stroke;
  }
  return vec4(tablet, iconIntensity);
}

// 5. Magnifying Glass: Circular scrutiny lens with angled 3D handle
vec4 getMagnifyingGlassShape(vec3 p) {
  float rXY = length(p.xy);
  vec2 dirXY = p.xy / max(0.0001, rXY);
  vec2 squircleDir = sign(dirXY) * pow(abs(dirXY), vec2(0.48));
  vec2 tileXY = squircleDir * clamp(rXY * 1.15, 0.0, 0.95);

  float tileZ = sign(p.z) * pow(abs(p.z), 0.55) * 0.32;
  vec3 tile = vec3(tileXY, tileZ);
  float iconIntensity = 0.0;

  if (p.z > 0.05) {
    vec2 c = tile.xy;
    vec2 lensCenter = vec2(-0.10, 0.10);
    float r = length(c - lensCenter);

    float rimDist = abs(r - 0.36);
    float rim = smoothstep(0.09, 0.02, rimDist);
    float rimBevel = smoothstep(0.03, 0.0, rimDist) * 0.06;

    float innerGlass = smoothstep(0.36, 0.0, r) * 0.10;

    float handleDist = distToSegment(c, vec2(0.16, -0.16), vec2(0.50, -0.50));
    float handle = smoothstep(0.11, 0.03, handleDist);
    float handleBevel = smoothstep(0.035, 0.0, handleDist) * 0.06;

    tile.z += rim * 0.22 + rimBevel + innerGlass + handle * 0.24 + handleBevel;
    iconIntensity = max(rim, handle);
  }
  return vec4(tile, iconIntensity);
}

vec4 getShapeByIndex(float idx, vec3 p) {
  if (idx < 0.5) return vec4(p, 0.0);              // 0: Sphere
  if (idx < 1.5) return getCheckboxShape(p);        // 1: Checkbox
  if (idx < 2.5) return getFingerprintShape(p);     // 2: Fingerprint
  if (idx < 3.5) return getSealShape(p);            // 3: S-Seal
  if (idx < 4.5) return getCodeBracketsShape(p);    // 4: Code Brackets
  return getMagnifyingGlassShape(p);                // 5: Magnifying Glass
}

vec4 getBaseShape(vec3 p) {
  if (uMorphFrom < 0.5 && uMorphTo < 0.5) {
    return vec4(p, 0.0);
  }

  vec4 pFrom = getShapeByIndex(uMorphFrom, p);
  vec4 pTo = getShapeByIndex(uMorphTo, p);

  // Smooth S-curve easing for organic liquid feel
  float t = clamp(uMorphProgress, 0.0, 1.0);
  float ease = t * t * (3.0 - 2.0 * t);
  return mix(pFrom, pTo, ease);
}

vec3 getDisplacedPosition(vec3 _position)
{
  vec4 base = getBaseShape(_position);
  vec3 distoredPosition = base.xyz;
  distoredPosition += perlin4d(vec4(distoredPosition * uDistortionFrequency + uOffset, uTime)) * uDistortionStrength;
  float perlinStrength = perlin4d(vec4(distoredPosition * uDisplacementFrequency + uOffset, uTime));
  vec3 displacedPosition = base.xyz;
  vec3 normalDir = normalize(_position);
  displacedPosition += normalDir * perlinStrength * uDisplacementStrength;
  return displacedPosition;
}

void main()
{
  vec4 base = getBaseShape(position);
  vIcon = base.w;

  vec3 displacedPosition = getDisplacedPosition(position);
  vec4 worldPosition = modelMatrix * vec4(displacedPosition, 1.0);
  vec4 viewPosition = viewMatrix * worldPosition;
  gl_Position = projectionMatrix * viewPosition;

  // Symmetric central differences for second-order accurate C1 finite normals
  float epsA = (M_PI * 1.0) / uSubdivision.x;
  float epsB = (M_PI * 0.5) / uSubdivision.x;
  vec3 biTangent = cross(normal, tangent.xyz);
  vec3 posA1 = position + tangent.xyz * epsA;
  vec3 posA2 = position - tangent.xyz * epsA;
  vec3 posB1 = position + biTangent.xyz * epsB;
  vec3 posB2 = position - biTangent.xyz * epsB;
  vec3 dPosA = getDisplacedPosition(posA1) - getDisplacedPosition(posA2);
  vec3 dPosB = getDisplacedPosition(posB1) - getDisplacedPosition(posB2);
  vec3 computedNormal = cross(dPosA, dPosB);
  vNormal = normalize(mat3(modelMatrix) * normalize(computedNormal));
  vWorldPosition = worldPosition.xyz;
}
`;

export const fragmentShader = `
uniform vec3 uLightAColor;
uniform vec3 uLightAPosition;
uniform float uLightAIntensity;
uniform vec3 uLightBColor;
uniform vec3 uLightBPosition;
uniform float uLightBIntensity;
uniform float uFresnelOffset;
uniform float uFresnelMultiplier;
uniform float uFresnelPower;
uniform float uBlackCore;
uniform float uHotRim;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying float vIcon;

void main()
{
  vec3 normal = normalize(vNormal);
  vec3 viewDirection = normalize(vWorldPosition - cameraPosition);
  float fresnel = uFresnelOffset + (1.0 + dot(viewDirection, normal)) * uFresnelMultiplier;
  fresnel = pow(max(0.0, fresnel), uFresnelPower);

  float lightAIntensity = max(0.0, -dot(normal, normalize(-uLightAPosition))) * uLightAIntensity;
  float lightBIntensity = max(0.0, -dot(normal, normalize(-uLightBPosition))) * uLightBIntensity;
  vec3 inkColor = vec3(0.0);
  inkColor = mix(inkColor, uLightAColor, lightAIntensity * fresnel);
  inkColor = mix(inkColor, uLightBColor, lightBIntensity * fresnel);
  inkColor = mix(inkColor, vec3(1.0), clamp(pow(max(0.0, fresnel - 0.8), 3.0), 0.0, 1.0) * uHotRim);
  float coreKeep = mix(1.0, clamp(fresnel, 0.0, 1.0), uBlackCore);
  vec3 bodyColor = inkColor * coreKeep;

  // Surfaced embossed icon in radiant white / warm porcelain
  // Pops cleanly off the deep black ink body with 3D diffuse & specular lighting
  float iconMask = clamp(vIcon, 0.0, 1.0);
  if (iconMask > 0.001) {
    vec3 lightDir = normalize(-uLightBPosition);
    float NdotL = max(0.0, dot(normal, lightDir));
    // Soft ambient wrap + direct illumination
    float diffuse = 0.60 + 0.40 * NdotL;
    
    // Crisp specular glint on the icon surface
    vec3 halfVec = normalize(lightDir - viewDirection);
    float spec = pow(max(0.0, dot(normal, halfVec)), 24.0) * 0.5;

    // Luminous warm-white porcelain tone matching Socratink branding
    vec3 iconBase = vec3(0.97, 0.96, 0.94);
    vec3 iconShaded = iconBase * diffuse + vec3(1.0) * spec;

    // Blend onto the ink body smoothly
    bodyColor = mix(bodyColor, iconShaded, iconMask * 0.95);
  }

  gl_FragColor = vec4(bodyColor, 1.0);
}
`;
