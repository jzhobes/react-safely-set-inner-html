# react-safely-set-inner-html

As the name suggests, this component is the opposite of React's ominous sounding dangerouslySetInnerHTML DOM attribute.
Under the hood, this component first uses [htmlparser2](https://github.com/fb55/htmlparser2) to parse the html input,
then traverses the object tree, transform the data to React props, and then finally call the top-level
API `React.createElement` function to safely render the output.

### Usage

```javascript
import ReactSafelySetInnerHTML from 'react-safely-set-inner-html';

const html = `<p class="text">
  HTML string to set within React using the <a class="link" href="https://github.com/jzhobes/react-safely-set-inner-html">ReactSafelySetInnerHTML</a> component.
</p>`;

return (
  <ReactSafelySetInnerHTML>
    {html}
  </ReactSafelySetInnerHTML>
);
```

By default, the following tags are allowed:

```javascript
[
  'div', 'span', 'a', 'b', 'i', 'strong', 'small', 'table', 'thead', 'tbody', 'tfoot',
  'th', 'td', 'tr', 'td', 'caption', 'colgroup', 'col', 'video', 'audio', 'source',
]
```

You can override the default tags by specifying a custom `allowedTags` prop:

```javascript
import ReactSafelySetInnerHTML from 'react-safely-set-inner-html';

return (
  <ReactSafelySetInnerHTML allowedTags={['div', 'span', 'p']}>
    {html}
  </ReactSafelySetInnerHTML>
);
```

Alternatively, the `excludedTags` prop blacklists tags, but all other tags not specified in the list will be allowed and
the `allowedTags` prop will be ignored.

```javascript
import ReactSafelySetInnerHTML from 'react-safely-set-inner-html';

return (
  <ReactSafelySetInnerHTML excludedTags={['iframe', 'form']}>
    {html}
  </ReactSafelySetInnerHTML>
);
```

String substitutions are supported via the `substitutionMap` prop with keys wrapped in curly braces. Keys without a
match will be ignored.

```javascript
import ReactSafelySetInnerHTML from 'react-safely-set-inner-html';

return (
  <ReactSafelySetInnerHTML substitutionMap={{name: 'Bob'}}>
    {`Hello, {name}`}
  </ReactSafelySetInnerHTML>
);
```
