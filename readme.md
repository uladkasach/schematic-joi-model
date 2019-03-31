# schematic-joi-model

## Overview

This extendable class does three specific things:
1. makes it easy to create and manage objects that conform to a specific schema
  1. schema is used to validate arguments passed to the constructor
  2. schema validation errors are thrown after being casted to a helpful representation
  3. all properties of arguments that match keys of the model schema are assigned to the object durring construction
2. makes it easy to compose models
3. extracts and appends typescript typedefs from the Joi schema to the model
    - i.e., you no longer need to duplicate your schema definition in both a Joi object and TypeScript's typedefs/interfaces; the Typescript typedefs are extracted from the Joi schema


## Example
