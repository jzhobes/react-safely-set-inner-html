import React from 'react';
import renderer from 'react-test-renderer';
import ReactSafelySetInnerHTML from './index';

describe('ReactSafelySetInnerHTML', () => {
  it('renders simple text', () => {
    const component = renderer.create(
      <ReactSafelySetInnerHTML>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
        laborum.
      </ReactSafelySetInnerHTML>
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('converts HTML attributes to React props and allows for the default tags', () => {
    const component = renderer.create(
      <ReactSafelySetInnerHTML>
        {`Lorem ipsum dolor
          <div class="div-class" style="border: none; max-font-size: 12; max-width: 100px;">div</div>
          <span class="span-class">span</span>
          <p class="p-class">p</p>
          <a class="link" href="https://www.google.com" rel="noreferrer" target="_blank">anchor</a>
          <b>bold</b>
          <i>italic</i>
          <strong>strong</strong>
          <small>small</small>
          <table>
            <caption>caption</caption>
            <colgroup>
              <col span="2">col</col>
            </colgroup>
            <thead>
              <tr>
                <th>th</th>
                <th>th</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>td</td>
                <td>td</td>
              </tr>
            </tbody>
            <tfoot></tfoot>
          </thead>
          <video controls> 
            <source src="video.webm" type="video/webm"> 
            <source src="video.ogv" type="video/ogg"> 
            <source src="video.mp4" type="video/mp4">
            <source src="video.3gp" type="video/3gp">
            Fallback text for video.
          </video>
          <audio controls>
            <source src="audio.ogg" type="audio/ogg">
            <source src="audio.mp3" type="audio/mpeg">
            Fallback text for audio.
          </audio>
          <iframe src="https://www.google.com">
        `}
      </ReactSafelySetInnerHTML>
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('allows for all other tags if an excludedTags list is provided', () => {
    const component = renderer.create(
      <ReactSafelySetInnerHTML excludedTags={['form']}>
        {`
          <iframe allowfullscreen src="https://www.google.com"></iframe>
          <span class="span-class">span</span>
          <iframe allowfullscreen="false" src="https://www.microsoft.com"></iframe>
          <form target="target.php">
            <div>div</div>
            <button type="submit">submit</button>
          </form>
        `}
      </ReactSafelySetInnerHTML>
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('allows for children as an array of strings', () => {
    const component = renderer.create(
      <ReactSafelySetInnerHTML excludedTags={['form']}>
        Lorem ipsum
        {'<span>span</span>'}
        {'<div>div</div>'}
      </ReactSafelySetInnerHTML>
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('handles malformed HTML gracefully', () => {
    const component = renderer.create(
      <ReactSafelySetInnerHTML>
        Lorem ipsum
        {'<span   ><span><<<<asdf'}
        {'<span   ><s:::pan><<<<asdf'}
      </ReactSafelySetInnerHTML>
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});
