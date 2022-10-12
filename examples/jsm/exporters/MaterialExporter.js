import {
	Scene, Mesh,
} from '../../../build/three.module.js';

class MaterialExporter {

	constructor() {

	}

	/**
	 * Parse scenes and generate Material output
	 * @param  {Scene or [THREE.Scenes]} input   Scene or Array of THREE.Scenes
	 */
	parse(input) {
		let output = {};
		output["meshes"] = {};
		output["materials"] = {};

		input.traverse(obj => {
			if (obj instanceof Mesh) {
				if (obj.material != null) {
					output["meshes"][obj.name] = {
						"material": obj.material.name,
						"castShadow": obj.castShadow,
						"castShadowHighPriority": obj.castShadowHighPriority,
						"receiveShadow": obj.receiveShadow,
						"receiveShadowHighPriority": obj.receiveShadowHighPriority,
						"visible": obj.visible,
						"frustumCulled": obj.frustumCulled,
						"renderOrder": obj.renderOrder
					}
					output["materials"][obj.material.name] = obj.material.toJSON();

					let outputMaterial = output["materials"][obj.material.name];

					let textureIdBaseColor = outputMaterial["map"];
					let imageIdBaseColor = outputMaterial["textures"]?.find(value => value["uuid"] == textureIdBaseColor)?.image;

					let textureIdEmissive = outputMaterial["emissiveMap"];
					let imageIdEmissive = outputMaterial["textures"]?.find(value => value["uuid"] == textureIdEmissive)?.image;

					let textureIdNormal = outputMaterial["normalMap"];
					let imageIdNormal = outputMaterial["textures"]?.find(value => value["uuid"] == textureIdNormal)?.image;

					let textureIdOcclusion = outputMaterial["aoMap"];
					let imageIdOcclusion = outputMaterial["textures"]?.find(value => value["uuid"] == textureIdOcclusion)?.image;

					if (outputMaterial["images"]) {
						outputMaterial["images"] = outputMaterial["images"].filter(value => {
							return (
								value["uuid"] != imageIdBaseColor &&
								value["uuid"] != imageIdEmissive &&
								value["uuid"] != imageIdNormal &&
								value["uuid"] != imageIdOcclusion
							);
						});
					}

					for (let texture of outputMaterial["textures"] ?? []) {
						if (
							texture["uuid"] == textureIdBaseColor ||
							texture["uuid"] == textureIdEmissive ||
							texture["uuid"] == textureIdNormal ||
							texture["uuid"] == textureIdOcclusion
						) {
							texture["image"] = null;
						}
					}

					if (outputMaterial["opacity"] == null) {
						outputMaterial["opacity"] = 1.0;
					}
				}
			}
		});

		return output;
	}

	convertToZip(materialContents, materialFileName) {
		return new Promise((resolve, reject) => {
			let zip = new JSZip();
			let imgFolder = zip.folder("images");
	
			let imageCounter = 1;
			let materialNames = Object.keys(materialContents.materials).sort();
			for (let materialName of materialNames) {
				let material = materialContents.materials[materialName];
				for (let image of material["images"]) {
					let imageUrlElements = image.url.split(",");
					if (imageUrlElements.length == 2) {
						let imageElements = image.url.split(",");

						let imageFileName = "image" + imageCounter;
						let imageInfoElements = imageElements[0].split(";");
						if (imageInfoElements[0].startsWith("data:image/")) {
							let extension = imageInfoElements[0].substring(11, imageInfoElements[0].length);
							imageFileName += "." + extension;
						}
						
						imgFolder.file(imageFileName, imageElements[1], { base64: true });

						image.url = "currentDirectory:" + imageFileName;
						imageCounter++;
					}
				}
			}
	
			zip.file(materialFileName, JSON.stringify(materialContents, null, 2));
	
			zip.generateAsync({type:"blob"})
			.then(function(content) {
				resolve(content);
			});
		});
	}

}

export { MaterialExporter };