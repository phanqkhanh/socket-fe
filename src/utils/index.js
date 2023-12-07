
export const getFullNameUser = (user) => {
    return user.firstName
    //  + user.middleName + user.lastName
}

export function isObjectEmpty(obj) {
    return Object.keys(obj).length === 0
}