import { useEffect, useState } from 'react';

import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
// import { CharacterLimitPlugin } from '@lexical/react/LexicalCharacterLimitPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import LexicalClickableLinkPlugin from '@lexical/react/LexicalClickableLinkPlugin';
import { CollaborationPlugin } from '@lexical/react/LexicalCollaborationPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import useLexicalEditable from '@lexical/react/useLexicalEditable';
import classNames from 'classnames';
import { EditorState } from 'lexical';

import { createWebsocketProvider } from './collaboration';
import { useSharedHistoryContext } from './context/SharedHistoryContext';
// import ActionsPlugin from './plugins/ActionsPlugin';
import AutoEmbedPlugin from './plugins/AutoEmbedPlugin';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import AutocompletePlugin from './plugins/AutocompletePlugin';
import CodeActionMenuPlugin from './plugins/CodeActionMenuPlugin';
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin';
import CollapsiblePlugin from './plugins/CollapsiblePlugin';
// import CommentPlugin from './plugins/CommentPlugin';
import ComponentPickerPlugin from './plugins/ComponentPickerPlugin';
import ContextMenuPlugin from './plugins/ContextMenuPlugin';
import DragDropPaste from './plugins/DragDropPastePlugin';
// import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import EmojiPickerPlugin from './plugins/EmojiPickerPlugin';
import EmojisPlugin from './plugins/EmojisPlugin';
import EquationsPlugin from './plugins/EquationsPlugin';
import ExcalidrawPlugin from './plugins/ExcalidrawPlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import FloatingTextFormatToolbarPlugin from './plugins/FloatingTextFormatToolbarPlugin';
import HtmlPlugin from './plugins/HTMLPlagin';
import ImagesPlugin from './plugins/ImagesPlugin';
import InlineImagePlugin from './plugins/InlineImagePlugin';
import KeywordsPlugin from './plugins/KeywordsPlugin';
import { LayoutPlugin } from './plugins/LayoutPlugin/LayoutPlugin';
import LinkPlugin from './plugins/LinkPlugin';
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin';
import MarkdownShortcutPlugin from './plugins/MarkdownShortcutPlugin';
import { MaxLengthPlugin } from './plugins/MaxLengthPlugin';
// import MentionsPlugin from './plugins/MentionsPlugin';
import OnEditableChangePlugin from './plugins/OnEditableChangePlugin';
import PageBreakPlugin from './plugins/PageBreakPlugin';
// import PollPlugin from './plugins/PollPlugin';
import SpeechToTextPlugin from './plugins/SpeechToTextPlugin';
import TabFocusPlugin from './plugins/TabFocusPlugin';
import TableCellActionMenuPlugin from './plugins/TableActionMenuPlugin';
import TableCellResizer from './plugins/TableCellResizer';
import TableOfContentsPlugin from './plugins/TableOfContentsPlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import ContentEditable from './ui/ContentEditable';
import Placeholder from './ui/Placeholder';
import { CAN_USE_DOM } from './utils/canUseDOM';

export type RichEditorV2 = {
	onChange?: ({ editorState, htmlString }) => void;
	initValue?: string;
	placeholder?: string;
	showToolbar?: boolean;
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
	editable: boolean;
};

const skipCollaborationInit =
	// @ts-expect-error
	window.parent != null && window.parent.frames.right === window;

export default function Editor({
	showToolbar,
	initValue,
	placeholder,
	onChange,
	editable,
	isAutocomplete = false,
	isCharLimit = false,
	isCharLimitUtf8 = false,
	isCollab = false,
	isMaxLength = false,
	shouldUseLexicalContextMenu = false,
	showTableOfContents = false,
	tableCellBackgroundColor = true,
	tableCellMerge = true,
}: RichEditorV2): JSX.Element {
	const { historyState } = useSharedHistoryContext();

	const isEditable = useLexicalEditable();
	const text = 'Enter Text';
	const placeholderText = <Placeholder>{placeholder || text}</Placeholder>;
	const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);
	const [isSmallWidthViewport, setIsSmallWidthViewport] = useState<boolean>(false);
	const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

	const onRef = (_floatingAnchorElem: HTMLDivElement): void => {
		if (_floatingAnchorElem !== null) {
			setFloatingAnchorElem(_floatingAnchorElem);
		}
	};

	const onHtmlChanged = (html: string, editorState: EditorState): void => {
		const editorStateJSON = editorState.toJSON();

		onChange && onChange({ editorState: JSON.stringify(editorStateJSON), htmlString: html });
	};

	useEffect(() => {
		const updateViewPortWidth = (): void => {
			const isNextSmallWidthViewport =
				CAN_USE_DOM && window.matchMedia('(max-width: 450px)').matches;

			if (isNextSmallWidthViewport !== isSmallWidthViewport) {
				setIsSmallWidthViewport(isNextSmallWidthViewport);
			}
		};
		updateViewPortWidth();
		window.addEventListener('resize', updateViewPortWidth);

		return () => {
			window.removeEventListener('resize', updateViewPortWidth);
		};
	}, [isSmallWidthViewport]);

	return (
		<>
			{showToolbar && <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />}
			<div className={'editor-container'}>
				{isMaxLength && <MaxLengthPlugin maxLength={30} />}
				<HtmlPlugin onHtmlChanged={onHtmlChanged} initialHtml={initValue} />
				<OnEditableChangePlugin editable={editable} />
				<DragDropPaste />
				<AutoFocusPlugin />
				<ClearEditorPlugin />
				<ComponentPickerPlugin />
				<EmojiPickerPlugin />
				<AutoEmbedPlugin />
				{/* TODO: have to redo for corvus app */}
				{/* <MentionsPlugin /> */}
				<EmojisPlugin />
				<HashtagPlugin />
				<KeywordsPlugin />
				<SpeechToTextPlugin />
				<AutoLinkPlugin />
				{/* <CommentPlugin providerFactory={isCollab ? createWebsocketProvider : undefined} /> */}

				{isCollab ? (
					<CollaborationPlugin
						id="main"
						providerFactory={createWebsocketProvider}
						shouldBootstrap={!skipCollaborationInit}
					/>
				) : (
					<HistoryPlugin externalHistoryState={historyState} />
				)}
				<RichTextPlugin
					contentEditable={
						<div className="editor-scroller">
							<div className="editor" ref={onRef}>
								<ContentEditable
									className={classNames('ContentEditable__root', {
										['ContentNotEditable__root']: !showToolbar,
									})}
								/>
							</div>
						</div>
					}
					placeholder={placeholderText}
					ErrorBoundary={LexicalErrorBoundary}
				/>
				<MarkdownShortcutPlugin />
				<CodeHighlightPlugin />
				<ListPlugin />
				<CheckListPlugin />
				<ListMaxIndentLevelPlugin maxDepth={7} />
				<TablePlugin
					hasCellMerge={tableCellMerge}
					hasCellBackgroundColor={tableCellBackgroundColor}
				/>
				<TableCellResizer />
				<ImagesPlugin />
				<InlineImagePlugin />
				<LinkPlugin />
				{/* <PollPlugin /> */}
				<LexicalClickableLinkPlugin disabled={isEditable} />
				<HorizontalRulePlugin />
				<EquationsPlugin />
				<ExcalidrawPlugin />
				<TabFocusPlugin />
				<TabIndentationPlugin />
				<CollapsiblePlugin />
				<PageBreakPlugin />
				<LayoutPlugin />
				{floatingAnchorElem && !isSmallWidthViewport && (
					<>
						{/* <DraggableBlockPlugin anchorElem={floatingAnchorElem} /> */}
						<CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
						<FloatingLinkEditorPlugin
							anchorElem={floatingAnchorElem}
							isLinkEditMode={isLinkEditMode}
							setIsLinkEditMode={setIsLinkEditMode}
						/>
						<TableCellActionMenuPlugin anchorElem={floatingAnchorElem} cellMerge={true} />
						<FloatingTextFormatToolbarPlugin
							anchorElem={floatingAnchorElem}
							setIsLinkEditMode={setIsLinkEditMode}
						/>
					</>
				)}
				{/* {(isCharLimit || isCharLimitUtf8) && (
					<CharacterLimitPlugin charset={isCharLimit ? 'UTF-16' : 'UTF-8'} maxLength={5} />
				)} */}
				{isAutocomplete && <AutocompletePlugin />}
				<div>{showTableOfContents && <TableOfContentsPlugin />}</div>
				{shouldUseLexicalContextMenu && <ContextMenuPlugin />}
				{/* <ActionsPlugin isRichText={isRichText} /> */}
			</div>
		</>
	);
}
