import Joi from 'joi';

interface ValidationErrorDetail {
  message: string;
  path: string;
  type: string;
}
export default class ValidationError extends Error {
  public details: ValidationErrorDetail[];
  public props: any;
  public model: string;

  constructor({ error, props, model }: {error: Joi.ValidationError, props: any, model: string }) {
    const details = error.details.map(detail => ({ message: detail.message, path: detail.path.join('.'), type: detail.type }));

    const message = `
Errors on ${Object.keys(details).length} properties were found while validating properties for model ${model}.:
${JSON.stringify(details, null, 2)}

Props Provided:
${JSON.stringify(props, null, 2)}
    `.trim();
    super(message);

    this.details = details;
    this.props = props;
    this.model = model;
  }
}
