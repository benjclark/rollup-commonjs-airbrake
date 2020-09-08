import { Notifier } from '@airbrake/browser';

const ignoreList = {
    messages: [
        // https://github.com/getsentry/sentry/commit/7da5defd0bf5ca227aedaca5f48f1b00b18c1b1a
        'null is not an object (evaluating \'elt.parentNode\')',
        // DealPly is spyware
        'DealPly is not defined',
        // These are always moatads related
        'Object doesn\'t support property or method \'engn\'',
        // Suspect these are ad related due to mention of campaign and also have a high volume of errors
        'Cannot read property \'campaign\' of undefined',
        // Hard to diagnose as seems to generic network issue in browser
        'network error',
        'NetworkError',
        // Browser extension related
        'Extension context invalidated',
        // All from a single IP
        'Failed to execute'
    ],
    urls: [
        'C:/',
        'D:/',
        'E:/',
        'F:/',
        'G:/',
        'H:/',
        'I:/',
        'W:/',
        'U:/',
        'Y:/',
        'Z:/',
        '/Users/',
        '/Desktop/',
        '/Documents/',
        'https://link.springer.xilesou.top',
        'chrome-extension'
    ],
    backtraces: [
        'chrome-extension'
    ]
};

const getEnvironment = () => {
    const dl = window.dataLayer[0];

    if (!dl) {
        return;
    }

    let env = 'Production';

    if (dl.page && dl.page.attributes && dl.page.attributes) {
        const dlEnv = dl.page.attributes.environment;

        if (dlEnv && dlEnv !== 'live') {
            env = 'Test';
        }
    }

    return env;
};

const isInFilterList = (list, value) => {
    return list.some(item => value.indexOf(item) > -1);
};

const shouldFilterNotice = notice => {
    let shouldFilter = false;

    const listedUrl = ignoreList.urls.some(url => notice.context.url.indexOf(url) > -1);

    if (listedUrl) {
        shouldFilter = true;
    }

    if (!shouldFilter) {
        notice.errors.forEach(error => {
            const listedMessage = isInFilterList(ignoreList.messages, error.message);
            let listedBacktrace = false;

            error.backtrace.forEach(backtrace => {
                const isListed = isInFilterList(ignoreList.backtraces, backtrace.file);

                if (isListed) {
                    listedBacktrace = true;
                }
            });

            if (listedMessage || listedBacktrace) {
                shouldFilter = true;
            }
        });
    }

    return shouldFilter === true;
};

const airbrake = () => {
    const notifier = new Notifier({
        projectId: 00000,
        projectKey: 'somekey',
        environment: getEnvironment()
    });

    notifier.addFilter(notice => {
        if (shouldFilterNotice(notice)) {
            return null;
        }
        notice.context.rev = 'js/airbrake-es6-bundle.js';
        notice.context.buildDateTime = '__buildDate__'; // rollup replaces the value with today's date and time
        return notice;
    });

    return notifier;
};


export {airbrake};
