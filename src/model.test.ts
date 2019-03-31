// tslint:disable max-classes-per-file
import Joi from 'joi';
import SchematicJoiModel from './model';
import ValidationError from './validationError';

const imageSchema = Joi.object().keys({
  uuid: Joi.string().uuid().required(),
  path: Joi.string(),
});
interface ImageParams {
  uuid: string;
  path?: string;
}

export default class Image extends SchematicJoiModel {
  public static schema = imageSchema;
  constructor(params: ImageParams) {
    super(params);
  }
}

describe('SchematicJoiModel', () => {
  it('should not throw error for valid data', () => {
    new Image({ uuid: 'b4380823-917d-4e0c-bf9a-aa53fae6ff98' }); // tslint:disable-line no-unused-expression
  });
  it('should throw error for invalid data', () => {
    try {
      new Image({ uuid: 'not a uuid' }); // tslint:disable-line no-unused-expression
    } catch (error) {
      expect(error.constructor).toEqual(ValidationError);
    }
  });
  it('should pass model name to error object', () => {
    try {
      new Image({ uuid: 'not a uuid' }); // tslint:disable-line no-unused-expression
    } catch (error) {
      expect(error.model).toEqual('Image');
    }
  });
  it('should assign all schema attributes passed to the constructor as properties of the instance', () => {
    const image = new Image({ uuid: 'b4380823-917d-4e0c-bf9a-aa53fae6ff98' }); // tslint:disable-line no-unused-expression
    expect(image).toMatchObject({
      uuid: 'b4380823-917d-4e0c-bf9a-aa53fae6ff98',
      path: undefined,
    });
  });
});
