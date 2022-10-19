export class CustomMaterialLoader {
  constructor() {}

  static preprocessMaterialData(data, imagesBase64) {
    for (let materialName in data.materials) {
      let material = data.materials[materialName];
      if (material["images"] != null) {
        for (let image of material["images"]) {
          if (image.url.startsWith("currentDirectory:")) {
            let fileName = image.url.replace("currentDirectory:", "");
            image.url = imagesBase64.find(entry => entry.name == fileName).base64Url;
          }
        }
      }
    }

    return data;
  }

  /*
      Code based on Three.js MaterialLoader
  */
  async applyProperties(mesh, materialProperties) {
    let material = mesh.material;
    let json = materialProperties;

    let objectLoader = new THREE.ObjectLoader();

    let textures = null;
    if (json.images != null && json.images.length > 0) {
      let images = await objectLoader.parseImagesAsync(json.images);
      textures = objectLoader.parseTextures(json.textures, images);
    }

    if (json.color != null && material.color != null) material.color.setHex(json.color);
    if (json.roughness != null) material.roughness = json.roughness;
    if (json.metalness != null) material.metalness = json.metalness;
    if (json.emissive != null && material.emissive != null) material.emissive.setHex(json.emissive);
    if (json.fog != null) material.fog = json.fog;
    if (json.flatShading != null) material.flatShading = json.flatShading;
    if (json.blending != null) material.blending = json.blending;
    if (json.side != null) material.side = json.side;
    if (json.shadowSide != null) material.shadowSide = json.shadowSide;
    if (json.opacity != null) material.opacity = json.opacity;

    if (json.transparent != null) material.transparent = json.transparent;
    else material.transparent = false;

    if (json.alphaTest != null) material.alphaTest = json.alphaTest;
    if (json.depthTest != null) material.depthTest = json.depthTest;
    if (json.depthWrite != null) material.depthWrite = json.depthWrite;
    if (json.colorWrite != null) material.colorWrite = json.colorWrite;

    if (json.stencilWrite != null) material.stencilWrite = json.stencilWrite;
    if (json.stencilWriteMask != null) material.stencilWriteMask = json.stencilWriteMask;
    if (json.stencilFunc != null) material.stencilFunc = json.stencilFunc;
    if (json.stencilRef != null) material.stencilRef = json.stencilRef;
    if (json.stencilFuncMask != null) material.stencilFuncMask = json.stencilFuncMask;
    if (json.stencilFail != null) material.stencilFail = json.stencilFail;
    if (json.stencilZFail != null) material.stencilZFail = json.stencilZFail;
    if (json.stencilZPass != null) material.stencilZPass = json.stencilZPass;

    if (json.wireframe != null) material.wireframe = json.wireframe;
    if (json.wireframeLinewidth != null) material.wireframeLinewidth = json.wireframeLinewidth;
    if (json.wireframeLinecap != null) material.wireframeLinecap = json.wireframeLinecap;
    if (json.wireframeLinejoin != null) material.wireframeLinejoin = json.wireframeLinejoin;

    if (json.polygonOffset != null) material.polygonOffset = json.polygonOffset;
    if (json.polygonOffsetFactor != null) material.polygonOffsetFactor = json.polygonOffsetFactor;
    if (json.polygonOffsetUnits != null) material.polygonOffsetUnits = json.polygonOffsetUnits;

    if (json.dithering != null) material.dithering = json.dithering;

    if (json.alphaToCoverage != null) material.alphaToCoverage = json.alphaToCoverage;
    if (json.premultipliedAlpha != null) material.premultipliedAlpha = json.premultipliedAlpha;

    if (json.visible != null) material.visible = json.visible;

    if (json.toneMapped != null) material.toneMapped = json.toneMapped;

    if (json.userData != null) material.userData = json.userData;

    if (json.vertexColors != null) {
      if (typeof json.vertexColors === "number") {
        material.vertexColors = json.vertexColors > 0 ? true : false;
      } else {
        material.vertexColors = json.vertexColors;
      }
    }

    // Deprecated
    if (json.shading != null) material.flatShading = json.shading === 1; // THREE.FlatShading

    if (json.map != null && json.textures != null && material.map != null) {
      let textureProperties = json.textures.find(t => t.uuid == json.map);
      if (textureProperties) {
        material.map.format = textureProperties.format;
        material.map.needsUpdate = true;
      }
    }

    if (json.alphaMap != null && textures != null) material.alphaMap = textures[json.alphaMap];

    if (json.bumpMap != null && textures != null) material.bumpMap = textures[json.bumpMap];
    if (json.bumpScale != null) material.bumpScale = json.bumpScale;

    if (json.normalMapType != null) material.normalMapType = json.normalMapType;
    if (json.normalScale != null) {
      let normalScale = json.normalScale;

      if (Array.isArray(normalScale) === false) {
        // Blender exporter used to export a scalar. See #7459
        normalScale = [normalScale, normalScale];
      }

      material.normalScale = new THREE.Vector2().fromArray(normalScale);
    }

    if (json.displacementMap != null && textures != null)
      material.displacementMap = textures[json.displacementMap];
    if (json.displacementScale != null) material.displacementScale = json.displacementScale;
    if (json.displacementBias != null) material.displacementBias = json.displacementBias;

    if (json.roughnessMap != null && textures != null)
      material.roughnessMap = textures[json.roughnessMap];
    if (json.metalnessMap != null && textures != null)
      material.metalnessMap = textures[json.metalnessMap];

    if (json.emissiveIntensity != null) material.emissiveIntensity = json.emissiveIntensity;

    if (json.envMap != null && textures != null) material.envMap = textures[json.envMap];
    if (json.envMapIntensity != null) material.envMapIntensity = json.envMapIntensity;
    if (json.refractionRatio != null) material.refractionRatio = json.refractionRatio;

    if (json.lightMap != null && textures != null) material.lightMap = textures[json.lightMap];
    if (json.lightMapIntensity != null) material.lightMapIntensity = json.lightMapIntensity;

    if (json.aoMapIntensity != null) material.aoMapIntensity = json.aoMapIntensity;

    if (material.alphaMap != null) material.alphaMap.needsUpdate = true;
    if (material.bumpMap != null) material.bumpMap.needsUpdate = true;
    if (material.displacementMap != null) material.displacementMap.needsUpdate = true;
    if (material.roughnessMap != null) material.roughnessMap.needsUpdate = true;
    if (material.metalnessMap != null) material.metalnessMap.needsUpdate = true;
    if (material.envMap != null) material.envMap.needsUpdate = true;
    if (material.lightMap != null) material.lightMap.needsUpdate = true;
    material.needsUpdate = true;
  }
}
