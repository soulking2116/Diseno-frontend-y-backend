export function validateRegistration(email, password, confirmPassword) {
    let isValid = true;
    let errorMessage = "";

    // Validación de email
    if (!email || !/\S+@\S+\.\S+/.test(email.trim())) {
        isValid = false;
        errorMessage += "Por favor, introduce un correo electrónico válido.\n";
    }

    // Validación de contraseña no vacía
    if (!password || password.trim() === "") {
        isValid = false;
        errorMessage += "La contraseña no puede estar vacía.\n";
    }

    // Validación de coincidencia de contraseñas
    if (password !== confirmPassword) {
        isValid = false;
        errorMessage += "Las contraseñas no coinciden.\n";
    }

    return { isValid, errorMessage: errorMessage.trim() }; // trim() para quitar el salto de línea final si no hay más mensajes
}