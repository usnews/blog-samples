import React from 'react';

const resolveModule = (universal) => {
    if (universal && universal.resolve) {
        const id = universal.resolve();
        try {
            return __webpack_require__(id);
        } catch (err) {
            // DO NOTHING
        }
    }
    return universal;
};

export default (load, { wrapperStyle, trigger = 'view' } = {}) => {
    const ServerHydrator = props => {
        const universal = load();
        const mod = resolveModule(universal);
        const Child = mod && mod.default || mod;
        if (!Child) {
            return null;
        }
        return (
            <div
                trigger={trigger}
                style={wrapperStyle}
            >
                <Child {...props} />
            </div>
        );
    };

    return ServerHydrator;
};
