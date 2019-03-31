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

    it('should cast the avatar property of User into an Image instance', () => {
      // create a user object that uses the image object
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
    it('should cast the photos property of PhotoAlbum into an array of Image instances', () => {
      // create a user object that users the image object
      const photoAlbumSchema = Joi.object().keys({
        uuid: Joi.string().uuid().required(),
        title: Joi.string(),
        photos: Joi.array().items(Image.schema),
      });
      interface PhotoAlbumConstructorParams {
        uuid: string;
        title: string;
        photos: Image[];
      }
      class PhotoAlbum extends SchematicJoiModel<PhotoAlbumConstructorParams> {
        // properties: TODO: extract types from Joi schema (?)
        public uuid!: string;
        public title!: string;
        public photos!: Image[];

        // for validation and property assignment
        public static schema = photoAlbumSchema;
        public static dependencies = {
          photos: Image,
        };
      }
      const album = new PhotoAlbum({
        uuid: '4e4cb5f9-5949-4b47-af77-d1eec4ab8fb5',
        title: 'favorite vacation',
        photos: [
          { uuid: 'b4380823-917d-4e0c-bf9a-aa53fae6ff98' },
          { uuid: 'c4380823-919d-4e0c-bf9a-aa53fae6ff98' },
        ],
      });
      expect(album.photos.length).toEqual(2);
      album.photos.forEach(photo => expect(photo.constructor).toEqual(Image));
    });
  });
});
