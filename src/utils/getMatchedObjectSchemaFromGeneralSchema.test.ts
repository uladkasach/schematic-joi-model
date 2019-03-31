import getMatchedObjectSchemaFromGeneralSchema from './getMatchedObjectSchemaFromGeneralSchema';
import Joi from 'joi';

describe('getMatchedObjectSchemaFromGeneralSchema', () => {
  it('should throw error if root schema not object or alternatives', () => {
    const schema = Joi.string() as any;
    try {
      getMatchedObjectSchemaFromGeneralSchema({ schema, props: {} });
      throw new Error('should not reach here');
    } catch (error) {
      expect(error.message).toEqual('schema must be of type Joi.object or Joi.alternatives');
    }
  });
  it('should be able to determine which schema validates against alternatives', () => {
    const trainSchema = Joi.object().keys({ method: Joi.string().valid(['train']), cars: Joi.number().required() });
    const planeSchema = Joi.object().keys({ method: Joi.string().valid(['plane']), wingspan: Joi.number().required() });
    const supportedTransportationSchema = Joi.alternatives().try([trainSchema, planeSchema]);
    const result = getMatchedObjectSchemaFromGeneralSchema({ schema: supportedTransportationSchema, props: { method: 'train', cars: 84 } });
    expect(result.describe()).toEqual(trainSchema.describe());
  });
});
