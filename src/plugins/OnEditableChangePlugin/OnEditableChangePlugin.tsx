import { FC, useEffect } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

const OnEditableChangePlugin: FC<{ editable: boolean }> = ({ editable }): JSX.Element => {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		editor.setEditable(editable);
	}, [editable]);

	return null;
};

export default OnEditableChangePlugin;
