import {
	Loader, Mesh
} from '../../../build/three.module.js';

import { CustomMaterialLoader } from './CustomMaterialLoader.js';

class MaterialFileLoader extends Loader {

	constructor(manager) {
		super(manager);
	}

	loadFile(materialFile, object) {
		let fileReader = new FileReader();
		fileReader.addEventListener("load", () => {
			let json = JSON.parse(fileReader.result);
			this.parse(json, object);
		}, false);
		fileReader.readAsText(materialFile);
	}

	parse(materialJson, object) {
		for (let [meshName, materialNameOrProperties] of Object.entries(materialJson.meshes)) {
			let mesh = object.getObjectByName(meshName);
			if (mesh != null && mesh instanceof Mesh) {
				let materialName = "";
				if (typeof materialNameOrProperties == "string") {
					materialName = materialNameOrProperties;
				} else {
					materialName = materialNameOrProperties["material"];
					let meshProperties = materialNameOrProperties;
					if (meshProperties["castShadow"] != null)
						mesh.castShadow = meshProperties["castShadow"];
					if (meshProperties["receiveShadow"] != null)
						mesh.receiveShadow = meshProperties["receiveShadow"];
					if (meshProperties["visible"] != null) mesh.visible = meshProperties["visible"];
					if (meshProperties["renderOrder"] != null)
						mesh.renderOrder = meshProperties["renderOrder"];
					if (meshProperties["castShadowHighPriority"] != null)
						mesh["castShadowHighPriority"] = meshProperties["castShadowHighPriority"];
					if (meshProperties["receiveShadowHighPriority"] != null)
						mesh["receiveShadowHighPriority"] = meshProperties["receiveShadowHighPriority"];
				}

				let materialProperties = materialJson.materials[materialName];
				if (materialProperties != null) {
					let materialLoader = new CustomMaterialLoader();
					materialLoader.applyProperties(mesh, materialProperties);
				}
				else {
					let message = "Error applying material: material " + materialName + " not found";
					console.warn(message);
				}
			}
			else {
				let message = "Error applying material: mesh " + meshName + " not found";
				console.warn(message);
			}
		}
	}
}

export { MaterialFileLoader };
