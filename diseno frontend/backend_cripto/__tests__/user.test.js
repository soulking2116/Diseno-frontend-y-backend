// backend_cripto/__tests__/user.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index'); // Importa tu aplicación Express principal
const User = require('../models/User'); // Importa el modelo de usuario

// Antes de todas las pruebas, conecta a una base de datos de prueba (o la principal)
// y limpia la colección de usuarios para un estado limpio.
beforeAll(async () => {
  // Asegúrate de que tu MONGODB_URI en .env apunte a una base de datos de prueba
  // o que estés de acuerdo con limpiar la base de datos de desarrollo para las pruebas.
  // Para un entorno de producción, SIEMPRE usa una base de datos de prueba separada.
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany({}); // Limpia la colección de usuarios antes de cada ejecución de prueba
});

// Después de todas las pruebas, desconecta de la base de datos
afterAll(async () => {
  await mongoose.connection.close();
});

// Describe el conjunto de pruebas para las rutas de usuario
describe('User API', () => {
  // Prueba para el registro de un nuevo usuario
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    
    expect(res.statusCode).toEqual(201); // Espera un código de estado 201 (Created)
    expect(res.body.msg).toEqual('Usuario registrado exitosamente'); // Verifica el mensaje de éxito
    expect(res.body.user).toHaveProperty('id'); // Verifica que se devuelva un ID de usuario
    expect(res.body).toHaveProperty('token'); // Verifica que se devuelva un token
  });

  // Prueba para intentar registrar un usuario con un email ya existente
  it('should not register a user with an existing email', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        username: 'anotheruser',
        email: 'test@example.com', // Mismo email que el usuario anterior
        password: 'password456',
      });
    
    expect(res.statusCode).toEqual(400); // Espera un código de estado 400 (Bad Request)
    expect(res.body.msg).toEqual('El usuario ya existe'); // Verifica el mensaje de error
  });

  // Prueba para el inicio de sesión de un usuario existente
  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(200); // Espera un código de estado 200 (OK)
    expect(res.body.msg).toEqual('Inicio de sesión exitoso');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body).toHaveProperty('token');
  });

  // Prueba para el inicio de sesión con credenciales inválidas
  it('should not login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword', // Contraseña incorrecta
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.msg).toEqual('Credenciales inválidas');
  });

  // Prueba para obtener el perfil del usuario (requiere autenticación)
  it('should get user profile with a valid token', async () => {
    // Primero, inicia sesión para obtener un token válido
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });
    
    const token = loginRes.body.token;

    // Ahora, usa ese token para acceder a la ruta protegida
    const profileRes = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`); // Establece la cabecera de autorización

    expect(profileRes.statusCode).toEqual(200);
    expect(profileRes.body).toHaveProperty('email', 'test@example.com');
    expect(profileRes.body).toHaveProperty('balance', 0); // Balance inicial por defecto
  });

  // Prueba para no obtener el perfil del usuario sin token
  it('should not get user profile without a token', async () => {
    const res = await request(app)
      .get('/api/users/profile'); // Sin cabecera de autorización

    expect(res.statusCode).toEqual(401);
    expect(res.body.msg).toEqual('No autorizado, no hay token');
  });

  // Prueba para depositar fondos
  it('should allow a user to deposit funds', async () => {
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({ email: 'test@example.com', password: 'password123' });
    const token = loginRes.body.token;

    const depositRes = await request(app)
      .post('/api/users/deposit')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 100 }); // Depositar 100

    expect(depositRes.statusCode).toEqual(200);
    expect(depositRes.body.msg).toEqual('Depósito realizado con éxito.');
    expect(depositRes.body.user.balance).toEqual(100); // El balance debe ser 100
  });

  // Prueba para eliminar la cuenta del usuario
  it('should allow a user to delete their account', async () => {
    // Primero, registra un nuevo usuario para eliminarlo
    await request(app)
      .post('/api/users/register')
      .send({
        username: 'userToDelete',
        email: 'delete@example.com',
        password: 'deletepassword',
      });

    // Inicia sesión con ese usuario para obtener su token
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({
        email: 'delete@example.com',
        password: 'deletepassword',
      });
    const token = loginRes.body.token;

    // Ahora, intenta eliminar la cuenta con el token
    const deleteRes = await request(app)
      .delete('/api/users/delete-account')
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.statusCode).toEqual(200);
    expect(deleteRes.body.msg).toEqual('Cuenta eliminada exitosamente.');

    // Opcional: Intenta buscar al usuario eliminado para confirmar que ya no existe
    const deletedUser = await User.findOne({ email: 'delete@example.com' });
    expect(deletedUser).toBeNull();
  });
});