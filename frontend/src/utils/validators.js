export const isEmail = (value) => /\S+@\S+\.\S+/.test(value);

export const minLength = (value, length) => value?.trim().length >= length;
