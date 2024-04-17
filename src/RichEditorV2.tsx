import { useEffect, useState } from 'react';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import classNames from 'classnames';

import Editor from './Editor';
import { SharedAutocompleteContext } from './context/SharedAutocompleteContext';
import { SharedHistoryContext } from './context/SharedHistoryContext';
import './index.css';
import PlaygroundNodes from './nodes/PlaygroundNodes';
import { TableContext } from './plugins/TablePlugin';
import CorvusTheme from './themes/CorvusTheme';
import { checkIsStringValidHtml } from './utils/isStringValidHtml';

export type RichEditorV2 = {
	onChange?: ({ editorState, htmlString }) => void;
	initValue?: string;
	placeholder?: string;
	showToolbar?: boolean;
	editable?: boolean;
	disableBeforeInput?: boolean;
	isAutocomplete?: boolean;
	isCharLimit?: boolean;
	isCharLimitUtf8?: boolean;
	isCollab?: boolean;
	isMaxLength?: boolean;
	measureTypingPerf?: boolean;
	shouldUseLexicalContextMenu?: boolean;
	showNestedEditorTreeView?: boolean;
	showTableOfContents?: boolean;
	tableCellBackgroundColor?: boolean;
	tableCellMerge?: boolean;
};

const RichEditorV2 = ({
	showToolbar = true,
	initValue,
	placeholder,
	editable = true,
	onChange,
	disableBeforeInput = false,
	isAutocomplete = false,
	isCharLimit = false,
	isCharLimitUtf8 = false,
	isCollab = false,
	isMaxLength = false,
	measureTypingPerf = false,
	shouldUseLexicalContextMenu = false,
	showNestedEditorTreeView = false,
	showTableOfContents = false,
	tableCellBackgroundColor = true,
	tableCellMerge = true,
}: RichEditorV2): JSX.Element => {
	const initialConfig = {
		namespace: 'Corvus Link',
		nodes: [...PlaygroundNodes],
		onError: (error: Error): void => {
			throw error;
		},
		theme: CorvusTheme,
	};

	const isStringValidHtml = checkIsStringValidHtml(initValue);
	return (
		<LexicalComposer
			initialConfig={{
				...initialConfig,
				editorState: isStringValidHtml ? undefined : initValue,
			}}
		>
			<SharedHistoryContext>
				<TableContext>
					<SharedAutocompleteContext>
						<div
							className={classNames('editor-shell', {
								['not-editable-editor-shell']: !showToolbar,
							})}
						>
							<Editor
								showToolbar={showToolbar}
								initValue={initValue}
								placeholder={placeholder}
								onChange={onChange}
								disableBeforeInput={disableBeforeInput}
								isAutocomplete={isAutocomplete}
								isCharLimit={isCharLimit}
								isCharLimitUtf8={isCharLimitUtf8}
								isCollab={isCollab}
								editable={editable}
								isMaxLength={isMaxLength}
								measureTypingPerf={measureTypingPerf}
								shouldUseLexicalContextMenu={shouldUseLexicalContextMenu}
								showNestedEditorTreeView={showNestedEditorTreeView}
								showTableOfContents={showTableOfContents}
								tableCellBackgroundColor={tableCellBackgroundColor}
								tableCellMerge={tableCellMerge}
							/>
						</div>
						{/* {measureTypingPerf ? <TypingPerfPlugin /> : null} */}
					</SharedAutocompleteContext>
				</TableContext>
			</SharedHistoryContext>
		</LexicalComposer>
	);
};

export default RichEditorV2;
