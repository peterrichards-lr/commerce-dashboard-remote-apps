export const themeDisplay = window.themeDisplay || {
  getCompanyGroupId: () => process.env.REACT_APP_LIFERAY_COMPANY_GROUP_ID,
  getScopeGroupId: () => process.env.REACT_APP_LIFERAY_SCOPE_GROUP_ID,
  getSiteGroupId: () => process.env.REACT_APP_LIFERAY_SITE_GROUP_ID,
  getUserId: () => process.env.REACT_APP_LIFERAY_USER_ID,
  getLanguageId: () => process.env.REACT_APP_LIFERAY_LANGUAGE_ID,
  isSignedIn: () => false,
};
