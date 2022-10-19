import {
	Loader, Mesh
} from '../../../build/three.module.js';

import { CustomMaterialLoader } from './CustomMaterialLoader.js';

class MaterialFileLoader extends Loader {

	constructor(manager) {
		super(manager);
	}

	loadFile(materialFile, object) {
		let extension = materialFile.name.split('.').pop();

		if (extension == "zip") {
			let zip = new JSZip();
			zip.loadAsync(materialFile).then((contents) => {
				let files = Object.entries(contents.files).map(entry => entry[1]);
				let matFiles = files.filter(file => !file.dir && file.name.split('.').pop() == "mat");

				if (matFiles.length == 1) {
					let matFile = matFiles[0];

					matFile.async('string').then((data)=> {
						let matData = JSON.parse(data);
						let imageFiles = files.filter(file => !file.dir && file.name.startsWith("images/"));

						let imagesBase64Promise = imageFiles.map((imageFile) => {
							return new Promise(resolve => {
								imageFile.async('base64').then(imageBase64 => {
									resolve({
										"name": imageFile.name.replace("images/", ""),
										"base64Url": this.getUrlPrefix(imageFile.name) + imageBase64
									});
								});
							});
						});

						Promise.all(imagesBase64Promise).then((imagesBase64) => {
							let json = CustomMaterialLoader.preprocessMaterialData(matData, imagesBase64);
							this.parse(json, object);
						});
					});
				}
				else if (matFiles.length > 1) {
					console.error("The material zip file should not contain more than 1 mat file");
				}
				else {
					console.error("The material zip doesn't contain a .mat file");
				}
			});
		}
		else {
			let fileReader = new FileReader();
			fileReader.addEventListener("load", () => {
				let json = JSON.parse(fileReader.result);
				this.parse(json, object);
			}, false);
			fileReader.readAsText(materialFile);
		}
	}
	
	getUrlPrefix(imageFileName) {
		let extension = imageFileName.split('.').pop();
		let mimeType = "image/";
		if (extension == "jpg") {
			mimeType += "jpeg";
		}
		else if (extension == "tif") {
			mimeType += "tiff";
		}
		else {
			mimeType += extension;
		}
		
		return "data:" + mimeType + ";base64,";
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
