import SchematicJoiModel, { ValidationError } from './index';
import SchematicJoiModelFromSource from './model';
import ValidationErrorFromSource from './validationError';

describe('package exports', () => {
  it('should export SchematicJoiModel as default', () => {
    expect(SchematicJoiModel).toEqual(SchematicJoiModelFromSource);
  });
  it('should export the ValidationError', () => {
    expect(ValidationError).toEqual(ValidationErrorFromSource);
  });
});
