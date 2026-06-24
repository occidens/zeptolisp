function createCharset(chars: string) {
    const set = new Set<number>();
    for (let i = 0; i < chars.length; i += 1) {
        const c = chars.codePointAt(i)!;
        set.add(c);
    }
    return set;
}

export { createCharset }