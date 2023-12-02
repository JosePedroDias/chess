// my friendlier alternative to window.prompt

// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog
export function promptDialog(question, alternatives, defaultAlt) {
    return new Promise((resolve, reject) => {
        const dialogEl = document.createElement('dialog');
        dialogEl.setAttribute('open', '');

        const pEl = document.createElement('p');
        pEl.appendChild( document.createTextNode(question) );
        dialogEl.appendChild(pEl);

        const formEl = document.createElement('form');
        formEl.setAttribute('method', 'dialog');
        dialogEl.appendChild(formEl);

        const onEnd = () => {
            window.removeEventListener('keydown', onKeyDown);
            dialogEl.close();
            dialogEl.parentNode?.removeChild(dialogEl);
        }

        let firstButton;

        alternatives.forEach((alt, i) => {
            const buttonEl = document.createElement('button');
            buttonEl.type = 'button';
            if (i === 0) firstButton = buttonEl;
            buttonEl.appendChild(document.createTextNode(alt));
            buttonEl.addEventListener('click', () => {
                onEnd();
                resolve(alt);
            });
            formEl.appendChild(buttonEl);
        });

        const onKeyDown = (ev) => {
            const key = ev.key;

            if (key === 'Escape') {
                onEnd();
                if (defaultAlt !== undefined) {
                    resolve(defaultAlt);
                } else {
                    reject();
                }
            }
        };

        window.addEventListener('keydown', onKeyDown);

        document.body.appendChild(dialogEl);

        firstButton?.focus();
    });
}
