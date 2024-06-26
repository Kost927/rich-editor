import type { EditorThemeClasses } from 'lexical';

import baseTheme from './CorvusTheme';
import './StickyEditorTheme.css';

const theme: EditorThemeClasses = {
	...baseTheme,
	paragraph: 'StickyEditorTheme__paragraph',
};

export default theme;
