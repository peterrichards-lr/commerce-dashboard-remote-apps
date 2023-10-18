import { themeDisplay } from './themeDisplay';
import { oauth2 } from './oauth2';
import { oauth2Client } from './oauth2Client';
import  commerceContext  from './commerceContext';

export const Liferay = window.Liferay || {
	authToken: undefined,
	CommerceContext: commerceContext,
	OAuth2: oauth2,
	OAuth2Client: oauth2Client,
	ThemeDisplay: themeDisplay
}
