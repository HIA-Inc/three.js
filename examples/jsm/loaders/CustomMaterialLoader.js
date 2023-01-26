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

  async applyProperties(mesh, materialProperties) {
    let material = mesh.material;
    let json = materialProperties;

    let objectLoader = new THREE.ObjectLoader();

    let textures = {};
    if (json.images != null && json.images.length > 0) {
      let images = await objectLoader.parseImagesAsync(json.images);
      textures = objectLoader.parseTextures(json.textures, images);
    }

    let materialLoader = new THREE.MaterialLoader();
    materialLoader.setTextures(textures);
    let mat = materialLoader.parse(materialProperties);

    let isMapValid = (map) => {
      return map != null && map.image != null;
    };

    if (isMapValid(mesh.material.map) && !isMapValid(mat.map)) {
      mat.map = mesh.material.map;

      let textureProperties = json.textures.find(t => t.uuid == json.map);
      if (textureProperties) {
        material.map.format = textureProperties.format;
        material.map.needsUpdate = true;
      }
    }
    if (isMapValid(mesh.material.emissiveMap) && !isMapValid(mat.emissiveMap)) {
      mat.emissiveMap = mesh.material.emissiveMap;
    }
    if (isMapValid(mesh.material.normalMap) && !isMapValid(mat.normalMap)) {
     mat.normalMap = mesh.material.normalMap;
    }
    if (isMapValid(mesh.material.aoMap) && !isMapValid(mat.aoMap)) {
      mat.aoMap = mesh.material.aoMap;
    }

    mesh.material = mat;
    mesh.material.needsUpdate = true;
  }
}
