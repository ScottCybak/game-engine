export const createDiv = (id?: string) => {
    const div = document.createElement('div');
    if (id) div.id = id;
    return div;
}