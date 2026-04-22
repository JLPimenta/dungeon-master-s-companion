/**
 * Sanitizes API error messages before displaying them to the user.
 *
 * Prevents internal server details (stack traces, class names, SQL errors)
 * from leaking to the UI while allowing controlled validation messages
 * from the backend (e.g., "Email já cadastrado") to pass through.
 */

const FRIENDLY_MESSAGES: Record<number, string> = {
  400: 'Requisição inválida. Verifique os dados informados.',
  401: 'Credenciais inválidas ou sessão expirada.',
  403: 'Você não tem permissão para realizar esta ação.',
  404: 'Recurso não encontrado.',
  409: 'Conflito: este recurso já existe.',
  413: 'Os dados enviados excedem o limite permitido.',
  422: 'Dados inválidos. Verifique os campos preenchidos.',
  429: 'Muitas tentativas. Aguarde antes de tentar novamente.',
  500: 'Erro interno do servidor. Tente novamente mais tarde.',
  502: 'Serviço temporariamente indisponível.',
  503: 'Serviço em manutenção. Tente novamente em alguns minutos.',
};

/**
 * Patterns that indicate internal server details that should NOT be shown.
 * Case-insensitive matching.
 */
const INTERNAL_PATTERNS = [
  /stack\s*trace/i,
  /at\s+\w+\.\w+\s+\(/i,       // "at ClassName.method ("
  /QueryFailedError/i,
  /TypeORMError/i,
  /EntityNotFoundError/i,
  /ECONNREFUSED/i,
  /ETIMEDOUT/i,
  /MongoServerError/i,
  /PrismaClient/i,
  /Internal\s+server\s+error/i,
  /\.ts:\d+:\d+/i,              // file.ts:123:45
  /\.js:\d+:\d+/i,              // file.js:123:45
  /node_modules/i,
  /Cannot\s+(?:read|set)\s+propert/i, // JS runtime errors
];

function isInternalMessage(message: string): boolean {
  return INTERNAL_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Returns a safe, user-friendly error message.
 *
 * @param status - HTTP status code from the response
 * @param rawMessage - Raw message from the API response body
 * @returns A sanitized message safe to display in the UI
 */
export function sanitizeApiError(status: number, rawMessage?: string): string {
  // If no message, use the status-based friendly message
  if (!rawMessage) {
    return FRIENDLY_MESSAGES[status] ?? `Erro inesperado (código ${status}).`;
  }

  // If the message contains internal patterns, replace with friendly one
  if (isInternalMessage(rawMessage)) {
    return FRIENDLY_MESSAGES[status] ?? 'Ocorreu um erro inesperado. Tente novamente.';
  }

  // Otherwise, the message is likely a controlled validation message — allow it
  return rawMessage;
}
