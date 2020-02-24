# Progressive Hydration

Progressive Hydration is a performance optimization technique on top of a server-rendered React app.
The default SSR behavior for a React app is that the fully rendered HTML is served to the client, then
the entire bundle of JavaScript necessary to recreate the entire app is downloaded, executed, and
invoked to hydrate the entire page. However, many parts of the page may not require interactivity
until certain user interactions (such as scrolling to that section or clicking on a button) or may not
require interactivity at all (like a footer of plain links). Hydrating these sections at initial page
load is costly and unnecessary. Progressive hydration allows the browser to defer fetching and
executing the code necessary to hydrate these sections until triggered by that user interaction.

To implement Progressive Hydration, divide up your page into logical sections, called "hydration
zones". Each hydration zone should reside in a separate file that is imported by your main wrapping
page component. Next, consider when that section's behavior is necessary. Should it become
interactive when it is scrolled into view? When it is clicked on? Never? This will become your zone's
"trigger". Finally, replace your normal `import` statement with a call to `deferHydration`, then use
the component in your JSX as you normall would.

For example, a call to
```
import Header from 'containers/organisms/Header';
```
would become
```
const Header = deferHydration(() => import('containers/organisms/Header'), {
    trigger: 'click',
});
```
and the Header would be placeable in your JSX (with ordinary props, etc.) like normal.

## Parameters

- Import function. This should be an arrow function with no parameters that returns an `import`
    statement pointing at the desired component. react-universal will automatically convert this
    into a conditional import that Webpack understands.
- Options object. There is currently only one option key.
    - `trigger`: The type of user interaction that should trigger hydration. Values:
        - `'view'` [default]: The section will hydrate when it is scrolled into view.
        - `'click'`: The section will hydrate when it is clicked on. This click event will then be
            fired again so the hydrated React components can respond to it.
        - `'hover'`: The section will hydrate when it is hovered over. This hover event will then be
            fired again so the hydrated React components can respond to it.
        - `'focus'`: The section will hydrate when an element within it is focused. This focus event will then be
            fired again so the hydrated React components can respond to it.
        - `'interaction'`: The section will hydrate when the user interacts with the page in some way. Current
            implementation waits for a scroll.
        - `false`: The section will never hydrate.
        - [Promise]: The section will hydrate when the Promise resolves.

## Dependencies

For this code to work as intended, your project must use https://github.com/faceyspacey/babel-plugin-universal-import
to transform import statements into universal imports that work as expected on both the client and server.
