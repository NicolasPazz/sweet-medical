export const generateBasicAuthHeader = (email, password) => {
  // 1. Juntas las credenciales con ":"
  const credentials = `${email}:${password}`;

  // 2. Lo conviertes a Base64 de forma nativa
  const base64Credentials = btoa(credentials);

  // 3. Así lo mandas en tu fetch o axios
  return `Basic ${base64Credentials}`;
};
