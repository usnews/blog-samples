import React from 'react';
import ReactDOM from 'react-dom';

// contexts store
const contexts = [];

export const declareContext = Context => {
    contexts.push(Context);
};

export default (load, {
    wrapperStyle,
    trigger = 'view',
} = {}) => {
    const triggers = {};
    if (trigger && trigger.split) {
        trigger.split(',').map(type => triggers[type] = true);
    }

    class Hydrator extends React.Component {

        shouldComponentUpdate() {
            return false;
        }

        hydrate = async (cb) => {
            const mod = await load();
            const Child = mod && mod.default || mod;

            let ContextWrapper = props => (
                <Child {...props} />
            );

            // Loop through declared context Providers and apply them.
            contexts.map(({ Provider }) => {
                const WrappedContent = ContextWrapper;
                ContextWrapper = props => (
                    <Provider>
                        <WrappedContent {...props} />
                    </Provider>
                );
            });

            ReactDOM.hydrate(<ContextWrapper {...this.props} />, this.root, cb);
        };

        componentDidMount() {
            if (trigger) {
                if (triggers.view) {
                    new IntersectionObserver(async ([entry], obs) => {
                        if (!entry.isIntersecting) return;
                        obs.unobserve(this.root);
                        
                        this.hydrate();
                    }).observe(this.root);
                }
                if (triggers.interaction) {
                    // The idea here is that we want to trigger hydration when the user interacts
                    // with the page in some way.
                    // First attempt is listening for a scroll.
                    const scrollHandler = () => {
                        window.removeEventListener('scroll', scrollHandler);
                        if (!this.loaded) {
                            this.loaded = true;
                            this.hydrate();
                        }
                    };
                    window.addEventListener('scroll', scrollHandler);
                }
                if (trigger.then) {
                    trigger.then(this.hydrate);
                }
            }
        }

        handleClick = e => {
            if (!this.loaded) {
                this.loaded = true;
                let target = e.target;
                while (target && !(target instanceof HTMLElement)) {
                    target = target.parentElement;
                }
                this.hydrate(() => target.click());
            }
        };

        handleFocus = e => {
            if (!this.loaded) {
                this.loaded = true;
                let target = e.target;
                while (target && !(target instanceof HTMLElement)) {
                    target = target.parentElement;
                }
                this.hydrate(() => target.focus());
            }
        };

        handleHover = () => {
            if (!this.loaded) {
                this.loaded = true;
                this.hydrate();
            }
        };

        render() {
            return (
                <div
                    trigger={trigger}
                    style={wrapperStyle}
                    ref={c => this.root = c}
                    onClick={triggers.click ? this.handleClick : undefined}
                    onFocus={triggers.focus ? this.handleFocus : undefined}
                    onMouseOver={triggers.hover ? this.handleHover : undefined}
                    dangerouslySetInnerHTML={{ __html: '' }}
                    suppressHydrationWarning
                />
            );
        }
    }

    return Hydrator;
};
