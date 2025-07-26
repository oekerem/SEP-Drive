export function sortByKey(array, key, direction = 'asc') {
    return [...array].sort((a, b) => {
        const valA = a[key];
        const valB = b[key];

        if (valA == null) return 1;
        if (valB == null) return -1;

        const result =
            typeof valA === 'string'
                ? valA.localeCompare(valB)
                : valA - valB;

        return direction === 'asc' ? result : -result;
    });
}
