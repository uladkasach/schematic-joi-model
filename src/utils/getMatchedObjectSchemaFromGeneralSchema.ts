import Joi from 'joi';
/*
  Context:
    when a Joi.alternatives schema is used for validation,
    we don't know which of the schema options was used.
    however, we must figure this out in order to assign the schema properties to the model instance

  extractChildrenFromAlternatives:
    this method takes a description of an alternatives schema and the props and determines which of them to use
*/
const getMatchedObjectSchemaFromGeneralSchema = ({ schema, props }: { schema: Joi.ObjectSchema | Joi.AlternativesSchema, props: any }): Joi.ObjectSchema => {
  // get root description
  const rootDescription = schema.describe();

  // validate the root schema
  if (!['object', 'alternatives'].includes(rootDescription.type!)) throw new Error('schema must be of type Joi.object or Joi.alternatives');

  // if object, we're already at root - resolve immediately
  if (rootDescription.type === 'object') return schema as Joi.ObjectSchema;

  // now that we know its an 'alternatives', we must figure out which of the alternatives this props validates against
  const options = (schema as any)._inner.matches.map(({ schema }: { schema: Joi.ObjectSchema }) => schema);
  for (const option of options) {
    const { type } = option.describe();
    if (type !== 'object') continue; // skip if schema is not object
    const { error } = option.validate(props);
    if (!error) return option;
  }

  // if we reach here, then for whatever reason we were not able to extract the ObjectSchema from the General Schema
  throw new Error('Could not extract ObjectSchema from General Schema. Schema may be unsupported yet.');
};

export default getMatchedObjectSchemaFromGeneralSchema;
