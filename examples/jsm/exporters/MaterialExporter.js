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
					output["meshes"][obj.name] = obj.material.name;
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

}

export { MaterialExporter };