import api from "./api";

/**
 * Procesar un pago con Culqi
 * Envía el token generado por Culqi al backend para crear el cargo
 *
 * @param {Object} paymentData - Datos del pago
 * @param {string} paymentData.token_id - ID del token generado por Culqi
 * @param {number} paymentData.amount - Monto en centavos
 * @param {string} paymentData.currency - Moneda (PEN, USD, etc.)
 * @param {string} paymentData.description - Descripción del pago
 * @param {string} paymentData.email - Email del cliente
 * @param {Object} paymentData.metadata - Metadata adicional
 * @returns {Promise} Respuesta del servidor
 */
export const processPayment = async (paymentData) => {
  try {
    const response = await api.post("/payments/charge", paymentData);
    return response.data;
  } catch (error) {
    console.error("Error al procesar el pago:", error);
    throw error;
  }
};

/**
 * Obtener el historial de pagos
 * @returns {Promise} Lista de pagos
 */
export const getPaymentHistory = async () => {
  try {
    const response = await api.get("/payments/history");
    return response.data;
  } catch (error) {
    console.error("Error al obtener el historial de pagos:", error);
    throw error;
  }
};

/**
 * Obtener detalles de un pago específico
 * @param {string} chargeId - ID del cargo
 * @returns {Promise} Detalles del pago
 */
export const getPaymentDetails = async (chargeId) => {
  try {
    const response = await api.get(`/payments/${chargeId}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener los detalles del pago:", error);
    throw error;
  }
};

/**
 * Configuración de ejemplo para Culqi Checkout
 * Estos valores pueden ser personalizados según las necesidades del proyecto
 */
export const culqiConfig = {
  settings: {
    title: "Sistema de Reservas",
    currency: "PEN",
  },
  paymentMethods: {
    tarjeta: true,
    yape: true,
    billetera: false,
    bancaMovil: false,
    agente: false,
    cuotealo: false,
  },
  options: {
    lang: "es",
    installments: false,
    modal: true,
  },
  appearance: {
    theme: "default",
    hiddenCulqiLogo: false,
    menuType: "sidebar",
    defaultStyle: {
      bannerColor: "#1a73e8",
      buttonBackground: "#1a73e8",
      buttonTextColor: "#ffffff",
    },
  },
};
