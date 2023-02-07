import { htmlAttributesToJson, propsStrToObj } from '../utility';

const configurationHelper = (configElement, defaultConfig) => {
  if (
    configElement &&
    configElement instanceof HTMLElement &&
    configElement.nodeName === 'CONFIG'
  ) {
    const attributes = htmlAttributesToJson(configElement.attributes);
    var config = propsStrToObj(attributes);
    for (const propName in defaultConfig) {
      if (config.hasOwnProperty(propName) === false) {
        config[propName] = defaultConfig[propName];
      }
    }
    return config;
  }
  console.debug(
    'The config element was not a HTMLElement or was not named <config>. Returning the default config'
  );
  return defaultConfig;
};

export default configurationHelper;
