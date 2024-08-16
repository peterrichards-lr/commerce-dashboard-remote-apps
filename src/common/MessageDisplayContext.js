class MessageDisplayContext {
  constructor(cssClass, message) {
    this.cssClass = cssClass || 'alert-info';
    this.message = message || '';
  }
}

export default MessageDisplayContext;
