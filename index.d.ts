import * as React from 'react';

interface Props {
  allowedTags?: string[],
  excludedTags?: string[];
  substitutionMap?: { [key: string]: string }
  children: string[] | string;
}

declare class ReactSafelySetInnerHTML extends React.Component<Props> {}

export default ReactSafelySetInnerHTML;
