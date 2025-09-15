export const capitalizeFirstLetter = (string: string) => {
    if (!string) return "";
    const newString = humanizeRoleName(string.replace("-kp", " KP").replace("-ta", " TA").replace(" pa", " PA").replace(" kp", " KP").replace("murojaah", "Muroja'ah"));
    const words = newString.split(" ").map((word) => word.trim());
    for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].substring(1);
    }
    return words.join(" ");
};

export const humanizeRoleName = (role: string) =>
	role.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());