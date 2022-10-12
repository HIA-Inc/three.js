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

					delete output["materials"][obj.material.name]["images"];

					for (let texture of output["materials"][obj.material.name]["textures"] ?? []) {
						texture["image"] = null;
					}
				}
			}
		});

		return output;
	}

}

export { MaterialExporter };