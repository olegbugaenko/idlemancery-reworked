

export const formatValue = (number, numDigits = 2, withSign = false) => {
    if(number == null) {
        number = 0;
    }

    if(window?.notation === 'scientific') {
        return Math.abs(number) > 999 ? number.toExponential(numDigits) : number.toFixed(numDigits);
    }
    const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc'];
    let sign = '';

    if(withSign && number > 0) {
        sign = '+';
    }

    if (number < 0) {
        sign = '-';
        number = Math.abs(number);
    }

    let suffixIndex = 0;

    while (number >= 1000 && suffixIndex < suffixes.length - 1) {
        number /= 1000;
        suffixIndex++;
    }

    return `${sign}${number.toFixed(numDigits)}${suffixes[suffixIndex]}`;
};

export const formatInt = (number, numDigits = 2) => {
    if(number == null) {
        number = 0;
    }

    if(window?.notation === 'scientific') {
        return Math.abs(Math.round(number)) > 999 ? Math.round(number).toExponential(numDigits) : Math.round(number);
    }
    const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
    let sign = '';

    if (number < 0) {
        sign = '-';
        number = Math.abs(number);
    }

    number = Math.round(number)

    let suffixIndex = 0;

    while (number >= 1000 && suffixIndex < suffixes.length - 1) {
        number /= 1000;
        suffixIndex++;
    }

    if(suffixIndex === 0) {
        numDigits = 0;
    }

    return `${sign}${number.toFixed(numDigits)}${suffixes[suffixIndex]}`;
};

export function secondsToString(seconds) {
    if(seconds > 1.e+12) {
        return 'Never';
    }
    if(seconds < 0) {
        seconds = 0;
    }
    const days = Math.floor(seconds / (24 * 3600));
    seconds %= 24 * 3600;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    let result = "";
    if (days > 0) {
        result += `${days}d `;
    }
    result += `${String(hours).padStart(2, '0')}:`;
    result += `${String(minutes).padStart(2, '0')}:`;
    result += `${String(Math.floor(seconds)).padStart(2, '0')}`;

    return result;
}