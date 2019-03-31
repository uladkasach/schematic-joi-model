# schematic-joi-model

## Overview
This extendable class does two specific things:
1. makes it easy to create and manage objects that conform to a specific schema
    1. schema is used to validate arguments passed to the constructor
    2. schema validation errors are thrown after being casted to a helpful representation
    3. all properties of arguments that match keys of the model schema are assigned to the object during construction
2. makes it easy to compose models
    1. by simply defining the dependencies of each key, the model automatically casts the properties into those models

## Installation
```
npm install --save schematic-joi-model
```

## Usage Examples
For more thorough documentation and examples, please see the `src/*.test.ts` files.

#### Basic Model
```js
// model definition:
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

// model usage:
new Image({ uuid: 'ff8b3da2-aba8-43f5-b1fc-5609d23c684f' }); // returns: Image { uuid: 'ff8b3da2-aba8-43f5-b1fc-5609d23c684f', path: undefined }
new Image({ uuid: 'not a uuid' }); // throws validation error
```


#### Composed Model
Building on the above example with the `Image` model:

```js
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
  // properties
  public uuid!: string;
  public name!: string;
  public age!: number;
  public avatar!: Image;

  // metadata for validation and property assignment
  public static schema = userSchema;
  public static dependencies = {
    avatar: Image,
  };
}


new User({
  uuid: '4e4cb5f9-5949-4b47-af77-d1eec4ab8fb5',
  name: 'bessy',
  age: 21,
  avatar: {
    uuid: 'b4380823-917d-4e0c-bf9a-aa53fae6ff98',
  },
});
/*
returns:
  User {
    uuid: '4e4cb5f9-5949-4b47-af77-d1eec4ab8fb5',
    name: 'bessy',
    age: 21,
    avatar: Image {
     uuid: 'b4380823-917d-4e0c-bf9a-aa53fae6ff98',
     path: undefined
    }
  }
*/
```
Notice that the avatar property of the instance of the instantiated `User` model is an instance of the `Image` model

## To Do
#### deduplication of type definitions
It is clear to see that we are duplicating the logic defining the types of the properties of the model objects between the Joi Schemas and Typescript Typedefs. It would be ideal if we could assign the Typescript model properties' typedefs directly from the Joi schema.

#### automatic dependency definitions
It would be convinient to eliminate the 'dependencies' property alltogether by somehow manipulating the `Model.schema` property to pass meta-data that we could then retrieve to determine:
1. that this property should be casted into a model instance
2. which model instance to cast it into
Perhaps Joi has a way to add metadata to schema objects that we could then retrieve from the `Joi.describe()` method?
