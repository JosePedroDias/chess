export function say(message, rate = 1) {
    return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = rate;
        speechSynthesis.speak(utterance);
        //console.log(`%c ${message}`, 'color: orange');

        const timer = setInterval(() => {
            if (!speechSynthesis.speaking && !speechSynthesis.pending) {
                clearInterval(timer);
                resolve();
            }
        }, 100);
    });
}
