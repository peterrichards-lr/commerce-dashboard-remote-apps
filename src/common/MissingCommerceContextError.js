class MissingCommerceContextError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MissingCommerceContextError';
  }
}

export default MissingCommerceContextError;
