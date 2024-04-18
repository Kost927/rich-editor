/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { $isExcalidrawNode } from '.';
import { AppState, BinaryFiles } from '@excalidraw/excalidraw/types/types';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import useLexicalEditable from '@lexical/react/useLexicalEditable';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import type { NodeKey } from 'lexical';
import {
	$getNodeByKey,
	$getSelection,
	$isNodeSelection,
	CLICK_COMMAND,
	COMMAND_PRIORITY_LOW,
	KEY_BACKSPACE_COMMAND,
	KEY_DELETE_COMMAND,
} from 'lexical';

import ImageResizer from '../../ui/ImageResizer';

import ExcalidrawImage from './ExcalidrawImage';
import type { ExcalidrawInitialElements } from './ExcalidrawModal';
import ExcalidrawModal from './ExcalidrawModal';

export default function ExcalidrawComponent({
	nodeKey,
	data,
}: {
	data: string;
	nodeKey: NodeKey;
}): JSX.Element {
	const isEditable = useLexicalEditable();
	const [editor] = useLexicalComposerContext();
	const [isModalOpen, setModalOpen] = useState<boolean>(data === '[]' && isEditable);
	const imageContainerRef = useRef<HTMLImageElement | null>(null);
	const buttonRef = useRef<HTMLButtonElement | null>(null);
	const captionButtonRef = useRef<HTMLButtonElement | null>(null);
	const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
	const [isResizing, setIsResizing] = useState<boolean>(false);

	useEffect(() => {
		const observer = new MutationObserver((mutationsList) => {
			//eslint-disable-next-line
			for (let mutation of mutationsList) {
				if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
					const addedNode = mutation.addedNodes[0] as Element;
					const targetElement = mutation.target as Element;
					if (
						addedNode.nodeType === Node.ELEMENT_NODE &&
						targetElement?.classList.contains('excalidraw')
					) {
						addedNode.setAttribute('data-skip-click-outside', 'true');
					}
				}
			}
		});

		observer.observe(document.body, { childList: true, subtree: true });

		return () => {
			observer.disconnect();
		};
	}, []);

	const onDelete = useCallback(
		(event: KeyboardEvent) => {
			if (isSelected && $isNodeSelection($getSelection())) {
				event.preventDefault();
				editor.update(() => {
					const node = $getNodeByKey(nodeKey);
					if ($isExcalidrawNode(node)) {
						node.remove();
						return true;
					}
				});
			}
			return false;
		},
		[editor, isSelected, nodeKey],
	);

	// Set editor to readOnly if excalidraw is open to prevent unwanted changes
	// useEffect(() => {
	// 	if (isModalOpen) {
	// 		editor.setEditable(false);
	// 	} else {
	// 		editor.setEditable(true);
	// 	}
	// }, [isModalOpen, editor]);

	useEffect(() => {
		return mergeRegister(
			editor.registerCommand(
				CLICK_COMMAND,
				(event: MouseEvent) => {
					if (!isEditable) return false;

					const buttonElem = buttonRef.current;
					const eventTarget = event.target;

					if (isResizing) {
						return true;
					}

					if (buttonElem !== null && buttonElem.contains(eventTarget as Node)) {
						if (!event.shiftKey) {
							clearSelection();
						}
						setSelected(!isSelected);
						if (event.detail > 1) {
							setModalOpen(true);
						}
						return true;
					}

					return false;
				},
				COMMAND_PRIORITY_LOW,
			),
			editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
			editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
		);
	}, [clearSelection, editor, isSelected, isResizing, onDelete, setSelected, isEditable]);

	const deleteNode = useCallback(() => {
		setModalOpen(false);
		return editor.update(() => {
			const node = $getNodeByKey(nodeKey);
			if ($isExcalidrawNode(node)) {
				node.remove();
			}
		});
	}, [editor, nodeKey]);

	const setData = (els: ExcalidrawInitialElements, aps: Partial<AppState>, fls: BinaryFiles) => {
		if (!isEditable) {
			return;
		}
		return editor.update(() => {
			const node = $getNodeByKey(nodeKey);
			if ($isExcalidrawNode(node)) {
				if ((els && els.length > 0) || Object.keys(fls).length > 0) {
					node.setData(
						JSON.stringify({
							appState: aps,
							elements: els,
							files: fls,
						}),
					);
				} else {
					node.remove();
				}
			}
		});
	};

	const onResizeStart = () => {
		setIsResizing(true);
	};

	const onResizeEnd = (nextWidth: 'inherit' | number, nextHeight: 'inherit' | number) => {
		// Delay hiding the resize bars for click case
		setTimeout(() => {
			setIsResizing(false);
		}, 200);

		editor.update(() => {
			const node = $getNodeByKey(nodeKey);

			if ($isExcalidrawNode(node)) {
				node.setWidth(nextWidth);
				node.setHeight(nextHeight);
			}
		});
	};

	const openModal = useCallback(() => {
		setModalOpen(true);
	}, []);

	const { elements = [], files = {}, appState = {} } = useMemo(() => JSON.parse(data), [data]);

	return (
		<>
			<ExcalidrawModal
				initialElements={elements}
				initialFiles={files}
				initialAppState={appState}
				isShown={isModalOpen}
				onDelete={deleteNode}
				onClose={() => setModalOpen(false)}
				onSave={(els, aps, fls) => {
					// editor.setEditable(true);
					setData(els, aps, fls);
					setModalOpen(false);
				}}
				closeOnClickOutside={false}
			/>
			{elements.length > 0 && (
				<button ref={buttonRef} className={`excalidraw-button ${isSelected ? 'selected' : ''}`}>
					<ExcalidrawImage
						imageContainerRef={imageContainerRef}
						className="image"
						elements={elements}
						files={files}
						appState={appState}
					/>
					{isSelected && isEditable && (
						<div
							className="image-edit-button"
							role="button"
							tabIndex={0}
							onMouseDown={(event) => event.preventDefault()}
							onClick={openModal}
						/>
					)}
					{(isSelected || isResizing) && (
						<ImageResizer
							buttonRef={captionButtonRef}
							showCaption={true}
							setShowCaption={() => null}
							imageRef={imageContainerRef}
							editor={editor}
							onResizeStart={onResizeStart}
							onResizeEnd={onResizeEnd}
							captionsEnabled={true}
						/>
					)}
				</button>
			)}
		</>
	);
}
