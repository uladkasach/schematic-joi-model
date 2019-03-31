// tslint:disable max-classes-per-file
import Joi from 'joi';
import ValidationError from './validationError';

export default abstract class SchematicJoiModel {
  protected static schema: Joi.ObjectSchema;

  // validation and assignment
  constructor(params: any) {
    // grab the schema from constructor
    const schema = (this.constructor as typeof SchematicJoiModel).schema;

    // validate the params
    const result = (this.constructor as typeof SchematicJoiModel).schema.validate(params);
    const modelName = (this.constructor as typeof SchematicJoiModel).name;
    if (!!result.error) throw new ValidationError({ model: modelName, error: result.error, props: params });

    // map schema params to self
    const description = Joi.describe(schema);
    const children = description.children;
    Object.keys(children).forEach(key => (this as any)[key] = (params as any)[key]); // map each param from schema keys to object
  }
}
