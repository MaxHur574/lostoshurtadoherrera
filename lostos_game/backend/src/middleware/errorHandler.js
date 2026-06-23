export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);
  
  // Auth0 error
  if (err.status === 401) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  // Error genérico
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
};