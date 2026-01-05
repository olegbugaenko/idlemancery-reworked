

export const formatValue = (number, numDigits = 2, withSign = false) => {
    if(number == null) {
        number = 0;
    }

    if(window?.notation === 'scientific') {
        return Math.abs(number) > 999 ? number.toExponential(numDigits) : number.toFixed(numDigits);
    }
    const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc', 'Vg'];
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
    const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc', 'Vg'];
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
    // Перевіряємо на NaN, null, undefined
    if (seconds == null || isNaN(seconds) || seconds === undefined) {
        return 'Unknown';
    }
    
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

export const dateToString = (d) => {
    const date = new Date(d); // або new Date()

    const parts = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',    // Mon
        month: 'long',       // April
        day: 'numeric',      // 27
        year: 'numeric',     // 2025
        hour: '2-digit',     // 02
        minute: '2-digit',   // 35
        second: '2-digit',   // 07
        hour12: false        // 24-годинний формат
    }).formatToParts(date);


    const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
    const formatted = `${map.weekday} ${map.month} ${map.day}, ${map.year} ${map.hour}:${map.minute}:${map.second}`;
    return formatted;
}