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
    it('should not throw an error if the model property is nullable and is null', () => {
      // create a user object that uses the image object
      const userSchema = Joi.object().keys({
        uuid: Joi.string().uuid().required(),
        name: Joi.string(),
        age: Joi.number().integer(),
        avatar: Image.schema.allow(null),
      });
      interface UserConstructorParams {
        uuid: string;
        name: string;
        age: number;
        avatar: Image | null;
      }
      class User extends SchematicJoiModel<UserConstructorParams> {
        // properties: TODO: extract types from Joi schema (?)
        public uuid!: string;
        public name!: string;
        public age!: number;
        public avatar!: Image | null;

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
        avatar: null,
      });
      expect(user.avatar).toEqual(null);
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

  /**
    Joi.alternatives schema use cases
    - specify two different schemas to validate against: uuid only OR full data definition
      - say the model can retrieve the rest of its information, but the user does not want to allow partial information
    - specify a model that can be of one of two shapes
      - e.g., transportation method: train or plane
  */
  describe('schema.alternatives', () => {
    describe('uuid only or full data definition options', () => {
      const fullDataSchema = Joi.object().keys({
        uuid: Joi.string().uuid().required(),
        make: Joi.string().valid(['ford', 'gmc', 'honda', 'toyota']).required(),
        model: Joi.string().required(),
      });
      const rootDataOnlySchema = Joi.object().keys({
        make: Joi.string().valid(['ford', 'gmc', 'honda', 'toyota']).required(),
        model: Joi.string().required(),
      });
      const uuidOnlySchema = Joi.object().keys({
        uuid: Joi.string().uuid().required(),
      });
      const fullSchema = Joi.alternatives().try([fullDataSchema, rootDataOnlySchema, uuidOnlySchema]);
      interface FullDataCarConstructorParams {
        uuid: string;
        make: string;
        model: string;
      }
      interface RootDataCarConstructorParams {
        make: string;
        model: string;
      }
      interface UuidOnlyCarConstructorParams {
        uuid: string;
      }
      type CarConstructorParams = FullDataCarConstructorParams | RootDataCarConstructorParams | UuidOnlyCarConstructorParams;
      class Car extends SchematicJoiModel<CarConstructorParams> {
        public uuid?: string;
        public make?: string;
        public model?: string;
        public static schema = fullSchema;
      }
      it('should be able to validate with only uuid', () => {
        const car = new Car({ uuid: '88d0a45a-e374-4e30-83de-6840c2ab8cc3' });
        expect(car).toMatchObject({ uuid: '88d0a45a-e374-4e30-83de-6840c2ab8cc3' });
      });
      it('should be able to validate with only root data', () => {
        const car = new Car({ make: 'honda', model: 'odessy' });
        expect(car).toMatchObject({ make: 'honda', model: 'odessy' });
      });
      it('should be able to validate with full data', () => {
        const car = new Car({ uuid: '88d0a45a-e374-4e30-83de-6840c2ab8cc3', make: 'honda', model: 'odessy' });
        expect(car).toMatchObject({ uuid: '88d0a45a-e374-4e30-83de-6840c2ab8cc3', make: 'honda', model: 'odessy' });
      });
      it('should fail able to validate with partial data', () => {
        try {
          new Car({ uuid: '88d0a45a-e374-4e30-83de-6840c2ab8cc3', model: 'odessy' }); // tslint:disable-line no-unused-expression
          throw new Error('should not reach here');
        } catch (error) {
          expect(error.constructor).toEqual(ValidationError);
        }
      });
    });
    describe('model that can take one of multiple shapes', () => {
      it('should be able to append properties for an "interface" class', () => {
        // create a user object that uses the image object
        const trainSchema = Joi.object().keys({ type: Joi.string().valid(['train']), cars: Joi.number().required() });
        const planeSchema = Joi.object().keys({ type: Joi.string().valid(['plane']), wingspan: Joi.number().required() });
        const supportedTransportationSchema = Joi.alternatives().try([trainSchema, planeSchema]);
        interface SupportedTransportationConstructorParams {
          type: 'plane' | 'train';
          [index: string]: any;
        }
        class SupportedTransportation extends SchematicJoiModel<SupportedTransportationConstructorParams> {
          [index: string]: any;
          public static schema = supportedTransportationSchema;
        }
        const train = new SupportedTransportation({
          type: 'train',
          cars: 84,
        });
        expect(train.cars).toEqual(84);
        const plane = new SupportedTransportation({
          type: 'plane',
          wingspan: 21,
        });
        expect(plane.wingspan).toEqual(21);
      });
    });
  });
});
