export const capitalize = (str: string) => {
    return str
        .trim()
        .split(' ')
        .map((word) => {
            if (word.length > 0 && word[0]) {
                return word[0].toUpperCase() + word.slice(1);
            } else {
                return word;
            }
        })
        .join(' ');
};
