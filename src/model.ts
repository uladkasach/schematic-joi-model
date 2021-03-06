// tslint:disable max-classes-per-file
import Joi from 'joi';
import ValidationError from './validationError';
import getMatchedObjectSchemaFromGeneralSchema from './utils/getMatchedObjectSchemaFromGeneralSchema';

export default abstract class SchematicJoiModel<ConstructorTypes> {
  protected static schema: Joi.ObjectSchema | Joi.AlternativesSchema;
  protected static dependencies: { [index: string]: new (props: any) => SchematicJoiModel<any> };

  // validation and assignment
  constructor(props: ConstructorTypes) {
    // grab the schema from constructor
    const schema = (this.constructor as typeof SchematicJoiModel).schema;

    // validate the params
    const result = (this.constructor as typeof SchematicJoiModel).schema.validate(props);
    const modelName = (this.constructor as typeof SchematicJoiModel).name;
    if (!!result.error) throw new ValidationError({ model: modelName, error: result.error, props });

    // determine which Joi.object schema we used (e.g., if the root schema was a Joi.alternatives)
    const matchedSchema = getMatchedObjectSchemaFromGeneralSchema({ schema, props });

    // map schema params to self
    const description = Joi.describe(matchedSchema);
    const children = description.children;
    const dependencies = (this.constructor as typeof SchematicJoiModel).dependencies;
    Object.keys(children).forEach((key) => {
      // define the raw value
      const rawValue = (props as any)[key];

      // define facts relevant for value derivation
      const keyHasDependency = !!dependencies && key in dependencies;
      const keyIsForArray = Array.isArray(rawValue);
      const valueIsTruthy = !!rawValue; // we only cast values to models if they are truthy
      const castingMethod = (keyHasDependency && valueIsTruthy) ? (value: any) => new dependencies[key](value) : (value: any) => value;

      // derive the value
      const valueArray = (keyIsForArray) ? rawValue : [rawValue]; // cast raw value into array, if not already
      const castedValueArray = valueArray.map(castingMethod); // cast the values w/ method defined
      const value = (keyIsForArray) ? castedValueArray : castedValueArray[0];

      // append value as property of this instance
      (this as any)[key] = value;
    });
  }
}
