// tslint:disable max-classes-per-file
import SchematicJoiModel from './model';
import ValidationError from './validationError';
import Joi from 'joi';

describe('SchematicJoiModel', () => {
  /*
    basic use case for the SchematicJoiModel:
      1. validate constructor arguments
      2. throw a helpful error if arguments are invalid
      3. assign args to instance properties, if args are valid
  */
  describe('basics', () => {
    const imageSchema = Joi.object().keys({
      uuid: Joi.string().uuid().required(),
      path: Joi.string(),
    });
    interface ImageConstructorParams {
      uuid: string;
      path?: string;
    }
    class Image extends SchematicJoiModel<ImageConstructorParams> {
      public static schema = imageSchema;
    }
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

  /**
    composition use case for SchematicJoiModel
    - note: we only support dependencies one layer deep
  */
  describe('composition', () => {
    // create the image object
    const imageSchema = Joi.object().keys({
      uuid: Joi.string().uuid().required(),
      path: Joi.string(),
    });
    interface ImageConstructorParams {
      uuid: string;
      path?: string;
    }
    class Image extends SchematicJoiModel<ImageConstructorParams> {
      public static schema = imageSchema;
    }

    // create a user object that users the image object
    const userSchema = Joi.object().keys({
      uuid: Joi.string().uuid().required(),
      name: Joi.string(),
      age: Joi.number().integer(),
      avatar: Image.schema,
    });
    interface UserConstructorParams {
      uuid: string;
      name: string;
      age: number;
      avatar: Image;
    }
    class User extends SchematicJoiModel<UserConstructorParams> {
      // properties: TODO: extract types from Joi schema (?)
      public uuid!: string;
      public name!: string;
      public age!: number;
      public avatar!: Image;

      // for validation and property assignment
      public static schema = userSchema;
      public static dependencies = {
        avatar: Image,
      };
    }
    it('should cast the avatar property into an Image instance automatically', () => {
      const user = new User({
        uuid: '4e4cb5f9-5949-4b47-af77-d1eec4ab8fb5',
        name: 'bessy',
        age: 21,
        avatar: {
          uuid: 'b4380823-917d-4e0c-bf9a-aa53fae6ff98',
        },
      });
      expect(user.avatar.constructor).toEqual(Image);
    });
  });
});
