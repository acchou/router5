import { h, div, h4, input, textarea, p } from '@cycle/dom';
import Rx from 'rx';

function Compose(sources) {
    const initialState = { title: '', message: '' };

    const title$ = sources.DOM.select('input')
        .events('input')
        .map(evt => evt.target.value);

    const message$ = sources.DOM.select('textarea')
        .events('input')
        .map(evt => evt.target.value);


    const messageAndTitle$ = Rx.Observable.combineLatest(
            title$.startWith(''),
            message$.startWith(''),
            (title, message) => ({ title, message })
        );

    const compose$ = Rx.Observable.combineLatest(
            messageAndTitle$,
            sources.router.error$,
            ({ title, message }, routerError) => div({ className: 'compose' }, [
                h4('Compose a new message'),
                input({ name: 'title', value: title }),
                textarea({ name: 'message', value: message }),
                routerError ? p('Clear inputs before continuing') : null
            ])
        );

    return {
        DOM: compose$,
        router: messageAndTitle$
            .map(({ message, title }) => [ 'canDeactivate', 'compose', !message && !title ])
            .distinctUntilChanged(_ => _[2])
    };
};

export default Compose;
