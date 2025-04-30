export const saveToLocalStorage = async (name, data) => {
    const stringified_data = JSON.stringify(data);
    localStorage.setItem(name, JSON.stringify(stringified_data));
};

export const getFromLocalStorage = async (name) => {
    const raw_data = localStorage.getItem(name);
    if (!raw_data) return null;

    const encrypted_data = JSON.parse(raw_data);
    const un_stringified_data = JSON.parse(encrypted_data);
    return un_stringified_data;
};

export const removeFromLocalStorage = (name) => {
    localStorage.removeItem(name);
};