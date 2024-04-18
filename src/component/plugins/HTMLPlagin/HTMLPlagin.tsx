import { useEffect, useRef, useState } from 'react';

import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $getRoot, $insertNodes, EditorState, LexicalEditor, LexicalNode } from 'lexical';

import { checkIsStringValidHtml } from '../../utils/isStringValidHtml';

interface THtmlPluginProps {
	initialHtml?: string;
	onHtmlChanged: (html: string, editorState: EditorState) => void;
}

const HtmlPlugin = ({ initialHtml, onHtmlChanged }: THtmlPluginProps): JSX.Element => {
	const [editor] = useLexicalComposerContext();

	const updateHTML = (editor: LexicalEditor, value: string, clear: boolean): void => {
		const root = $getRoot();
		const parser = new DOMParser();
		const dom = parser.parseFromString(value, 'text/html');
		const nodes = $generateNodesFromDOM(editor, dom);

		if (clear) root.clear();
		root.append(...nodes);
	};

	useEffect(() => {
		const isStringValidHtml = checkIsStringValidHtml(initialHtml);
		if (!isStringValidHtml) return;

		if (editor && initialHtml) {
			editor.update(() => {
				updateHTML(editor, initialHtml, true);
			});
		}
	}, [initialHtml, editor]);

	return (
		<OnChangePlugin
			onChange={(editorState): void => {
				editorState.read((): void => {
					onHtmlChanged($generateHtmlFromNodes(editor), editorState);
				});
			}}
		/>
	);
};

export default HtmlPlugin;
