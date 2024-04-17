export const checkIsStringValidHtml = (
	html: string,
	// mimeType: DOMParserSupportedType = 'text/html',
) => {
	try {
		JSON.parse(html);
		return false;
	} catch (error) {
		return true;
	}
};
