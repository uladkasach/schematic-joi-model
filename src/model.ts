// tslint:disable max-classes-per-file
import Joi from 'joi';
import ValidationError from './validationError';

export default abstract class SchematicJoiModel<ConstructorTypes> {
  protected static schema: Joi.ObjectSchema;
  protected static dependencies: { [index: string]: new (props: any) => SchematicJoiModel<any> };

  // validation and assignment
  constructor(props: ConstructorTypes) {
    // grab the schema from constructor
    const schema = (this.constructor as typeof SchematicJoiModel).schema;

    // validate the params
    const result = (this.constructor as typeof SchematicJoiModel).schema.validate(props);
    const modelName = (this.constructor as typeof SchematicJoiModel).name;
    if (!!result.error) throw new ValidationError({ model: modelName, error: result.error, props });

    // map schema params to self
    const description = Joi.describe(schema);
    const children = description.children;
    const dependencies = (this.constructor as typeof SchematicJoiModel).dependencies;
    Object.keys(children).forEach((key) => {
      // derive value
      const rawValue = (props as any)[key];
      const keyHasDependency = !!dependencies && key in dependencies;
      const value = (keyHasDependency) ? new dependencies[key](rawValue) : rawValue;

      // append value as property of this instance
      (this as any)[key] = value;
    });
  }
}
