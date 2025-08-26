// Importamos la función que queremos probar
import { validateRegistration } from '../js/validations.js';

// Describe es como un grupo de pruebas relacionadas
describe('validateRegistration', () => {

    // Cada 'test' (o 'it') es una prueba unitaria específica
    test('debería retornar valido para credenciales correctas', () => {
        const email = 'test@example.com';
        const password = 'Password123!';
        const confirmPassword = 'Password123!';
        const result = validateRegistration(email, password, confirmPassword);

        // expect es lo que Jest usa para hacer "afirmaciones" sobre el resultado
        expect(result.isValid).toBe(true); // Esperamos que isValid sea true
        expect(result.errorMessage).toBe(''); // Esperamos que no haya mensaje de error
    });

    test('debería retornar invalido si el email no es valido', () => {
        const email = 'invalid-email'; // Email inválido
        const password = 'Password123!';
        const confirmPassword = 'Password123!';
        const result = validateRegistration(email, password, confirmPassword);

        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toContain('Por favor, introduce un correo electrónico válido.');
    });

    test('debería retornar invalido si la contraseña está vacía', () => {
        const email = 'test@example.com';
        const password = ''; // Contraseña vacía
        const confirmPassword = '';
        const result = validateRegistration(email, password, confirmPassword);

        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toContain('La contraseña no puede estar vacía.');
    });

    test('debería retornar invalido si las contraseñas no coinciden', () => {
        const email = 'test@example.com';
        const password = 'Password123!';
        const confirmPassword = 'DifferentPassword!'; // No coinciden
        const result = validateRegistration(email, password, confirmPassword);

        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toContain('Las contraseñas no coinciden.');
    });

    test('debería retornar invalido si todos los campos son invalidos', () => {
        const email = 'wrong';
        const password = '';
        const confirmPassword = 'no';
        const result = validateRegistration(email, password, confirmPassword);

        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toContain('correo electrónico válido');
        expect(result.errorMessage).toContain('contraseña no puede estar vacía');
        expect(result.errorMessage).toContain('Las contraseñas no coinciden');
    });
});