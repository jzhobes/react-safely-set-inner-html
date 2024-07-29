import {parseDocument} from 'htmlparser2';
import PropTypes from 'prop-types';
import React, {useMemo} from 'react';

const attributeToPropEntries = Object.entries({
  acceptCharset: 's',
  accessKey: 's',
  allowFullScreen: 'b',
  allowTransparency: 'b',
  autoComplete: 'b',
  autoPlay: 'b',
  cellPadding: 'n',
  cellSpacing: 'n',
  charSet: 's',
  checked: 'b',
  'class:className': 's',
  cols: 'n',
  colSpan: 'n',
  controls: 'b',
  crossOrigin: 's',
  dateTime: 's',
  default: 'b',
  defer: 'b',
  disabled: 'b',
  encType: 's',
  'for:htmlFor': 's',
  formAction: 's',
  formEncType: 's',
  formMethod: 's',
  formNoValidate: 'b',
  formTarget: 's',
  frameBorder: 's',
  high: 'n',
  hrefLang: 's',
  httpEquiv: 's',
  keyParams: 's',
  keyType: 's',
  loop: 'b',
  low: 'n',
  marginHeight: 'n',
  marginWidth: 'n',
  maxLength: 'n',
  mediaGroup: 'n',
  minLength: 'n',
  multiple: 'b',
  muted: 'b',
  noValidate: 'b',
  open: 'b',
  optimum: 'n',
  playsInline: 'n',
  readOnly: 'b',
  required: 'b',
  reversed: 'b',
  rows: 'n',
  rowSpan: 'n',
  scoped: 'b',
  seamless: 'b',
  selected: 'b',
  size: 'n',
  span: 'n',
  srcDoc: 's',
  srcLang: 's',
  srcSet: 's',
  step: 's',
  style: 'style',
  useMap: 's',
});

const parseOptions = {
  normalizeWhitespace: true,
};

function _convertToReactStyleObject(string) {
  return string.split(';').reduce((map, element) => {
    const [property, value] = element.split(':');
    if (property && value) {
      const formattedProperty = property.trim().replace(/-([a-z])/g, (m, s) => s.toUpperCase());
      map[formattedProperty] = value.trim();
    }
    return map;
  }, {});
}

function _convertToBoolean(value) {
  return value?.toLowerCase() === 'true' || value === '';
}

function _convertToNumber(value) {
  return parseInt(value, 10);
}

/**
 * Finds the corresponding React prop from the attributeToPropEntries array.
 *
 * @param {string} attribute
 * @return {Object}
 * @private
 */
function _findReactProp(attribute) {
  for (let i = 0; i < attributeToPropEntries.length; i += 1) {
    const [key, conversionType] = attributeToPropEntries[i];
    const [attrOrProp, prop] = key.split(':');
    if (attribute.toLowerCase() === attrOrProp.toLowerCase()) {
      return {
        name: prop || attrOrProp,
        type: conversionType,
      };
    }
  }
  return undefined;
}

/**
 * Converts the HTML attributes to React props.
 *
 * @param {Object<string, string>}attribs
 * @param {string} key
 * @return {Object}
 * @private
 */
function _convertToReactProps(attribs, key) {
  const props = Object.entries(attribs || {}).reduce((map, [attribute, value]) => {
    const reactProp = _findReactProp(attribute);
    if (reactProp) {
      const {name, type} = reactProp;
      if (type === 'n') {
        map[name] = _convertToNumber(value);
      } else if (type === 'b') {
        map[name] = _convertToBoolean(value);
      } else if (type === 'style') {
        map[name] = _convertToReactStyleObject(value);
      } else {
        map[name] = value;
      }
    } else {
      map[attribute] = value;
    }
    return map;
  }, {});
  if (key) {
    props.key = key;
  }
  return props;
}

/**
 * The main conversion function.
 *
 * @param {Array<string>} allowedTags
 * @param {Array<string>} excludedTags
 * @param {Array<Object>} children
 * @param {number} keyLevel
 * @return {Array<JSX.Element>}
 * @private
 */
function _convertToReactComponentChildren(allowedTags, excludedTags, children, keyLevel = 0) {
  return children.map((child, i) => {
    const key = `component-${keyLevel}-${i}`;
    const {type, name, data, attribs} = child;
    if (type === 'text') {
      return data;
    } else if (type === 'tag') {
      const isAllowed = excludedTags ? !excludedTags.includes(name) : allowedTags.includes(name);
      if (isAllowed) {
        return React.createElement(
          name,
          _convertToReactProps(attribs, key),
          ..._convertToReactComponentChildren(allowedTags, excludedTags, child.children, i),
        );
      }
      console.info(`Excluding "${name}" tag.`);
      return undefined;
    }
    console.info(`Unknown type "${type}".`);
    return undefined;
  });
}



/**
 * Handles string substitutions prior to conversion.
 *
 * @param {string} childrenString
 * @param {Object.<string, string>} substitutionMap
 * @return {string}
 * @private
 */
function _handleSubstitutions(childrenString, substitutionMap) {
  childrenString?.match(/[^{}]+(?=})/g)?.forEach((key) => {
    if (substitutionMap?.[key]) {
      childrenString = childrenString.replace(`{${key}}`, substitutionMap[key]);
    }
  });
  return childrenString;
}

function ReactSafelySetInnerHTML({
  allowedTags = ['div', 'span', 'p', 'a', 'b', 'i', 'strong', 'small', 'table', 'thead', 'tbody', 'tfoot', 'th', 'td', 'tr', 'td', 'caption', 'colgroup', 'col', 'video', 'audio', 'source'],
  excludedTags,
  substitutionMap,
  children,
}) {
  try {
    const domChildren = useMemo(() => {
      if (Array.isArray(children)) {
        return children.reduce((arr, childrenString) => {
          arr = arr.concat(parseDocument(_handleSubstitutions(childrenString, substitutionMap), parseOptions).children);
          return arr;
        }, []);
      }
      return parseDocument(_handleSubstitutions(children, substitutionMap), parseOptions).children;
    }, [children]);
    return _convertToReactComponentChildren(allowedTags, excludedTags, domChildren);
  } catch (err) {
    console.error(err.message, err);
    return undefined;
  }
}

ReactSafelySetInnerHTML.propTypes = {
  allowedTags: PropTypes.arrayOf(PropTypes.string),
  excludedTags: PropTypes.arrayOf(PropTypes.string),
  substitutionMap: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string]).isRequired,
};

export default ReactSafelySetInnerHTML;
