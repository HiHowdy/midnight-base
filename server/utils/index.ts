export const Wait = (ms: number) => new Promise(res => setTimeout(res, ms));

export const isEmpty = (obj: []) => {
    for (const prop in obj) {
        if (obj.hasOwnProperty(prop)) return false;
        return true;
    }

    return true;
}