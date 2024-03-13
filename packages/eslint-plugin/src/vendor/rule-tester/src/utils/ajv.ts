import Ajv from "ajv";
import metaSchema from "ajv/lib/refs/json-schema-draft-06.json";

export function ajvBuilder(additionalOptions = {}) {
	const ajv = new Ajv({
		meta: false,
		useDefaults: true,
		validateSchema: false,
		verbose: true,
		...additionalOptions,
	});

	ajv.addMetaSchema(metaSchema);

	ajv.opts.defaultMeta = metaSchema.$id;

	return ajv;
}
