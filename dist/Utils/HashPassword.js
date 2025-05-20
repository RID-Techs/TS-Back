import * as argon2 from "argon2";
export async function hashPassword(password) {
    try {
        const hashedPassword = await argon2.hash(password);
        return hashedPassword;
    }
    catch (error) {
        console.log('Error hashing password:', error);
        throw new Error(`Hashing failed: ${error.message}`);
    }
}
export async function VerifyPassword(storedHash, password) {
    try {
        const isValidPass = await argon2.verify(storedHash, password);
        if (!isValidPass)
            throw new Error("Invalid Password !");
        return true;
    }
    catch (error) {
        console.log('Error verifying password:', error);
        throw new Error(`${error.message}`);
    }
}
