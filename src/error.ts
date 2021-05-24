export class BaseError extends Error {
  public type: string = "error";
  public data: any;

  constructor(message: string, data?: any) {
    super(message);
    this.data = data;
  }
}
export class ParserError extends BaseError {
  constructor(message: string, data?: any) {
    super(message, data);
    this.type += ".parser";
  }
}
export class UnknownLanguageError extends ParserError {
  constructor(message: string, data?: any) {
    super(message, data);
    this.type += ".unknownLanguage";
  }
}
