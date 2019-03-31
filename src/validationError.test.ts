import Joi from 'joi';
import ValidationError from './validationError';

describe('validationError', () => {
  it('should create a helpful error message from a Joi validation error', () => {
    const schema = Joi.object().keys({
      uuid: Joi.string().uuid().required(),
      path: Joi.string(),
    });
    const props = { uuid: 'true' };
    const { error } = schema.validate(props);
    const betterError = new ValidationError({ model: 'RaceCar', error, props });
    expect(betterError.message.trim()).toEqual(`
Errors on 1 properties were found while validating properties for model RaceCar.:
[
  {
    "message": "\\"uuid\\" must be a valid GUID",
    "path": "uuid",
    "type": "string.guid"
  }
]

Props Provided:
{
  "uuid": "true"
}
    `.trim());
    expect(betterError.details).toMatchObject([{
      message: '"uuid" must be a valid GUID',
      path: 'uuid',
      type: 'string.guid',
    }]);
    expect(betterError.props).toEqual(props);
    expect(betterError.model).toEqual('RaceCar');
  });
});
