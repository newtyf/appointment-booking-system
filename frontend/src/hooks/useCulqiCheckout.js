import { useCallback, useRef, useState } from "react";
import { processPayment } from "../services/paymentService";

/**
 * Custom Hook para manejar pagos con Culqi Checkout
 *
 * @returns {Object} Funciones y estado para manejar pagos
 *
 * @example
 * const { openCheckout, isProcessing, error } = useCulqiCheckout({
 *   onSuccess: (response) => console.log('Pago exitoso', response),
 *   onError: (error) => console.error('Error', error)
 * });
 *
 * // Abrir checkout
 * openCheckout({
 *   amount: 10000,
 *   currency: 'PEN',
 *   description: 'Pago de reserva',
 *   email: 'cliente@example.com'
 * });
 */
export const useCulqiCheckout = ({ onSuccess, onError } = {}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const culqiInstanceRef = useRef(null);

  /**
   * Inicializa y abre el checkout de Culqi
   *
   * @param {Object} paymentData - Datos del pago
   * @param {number} paymentData.amount - Monto en centavos (ej: 10000 = 100.00 PEN)
   * @param {string} paymentData.currency - Código de moneda (PEN, USD, etc.)
   * @param {string} paymentData.description - Descripción del pago
   * @param {string} paymentData.email - Email del cliente
   * @param {string} [paymentData.title] - Título del checkout
   * @param {Object} [paymentData.metadata] - Metadata adicional
   * @param {Object} [paymentData.customOptions] - Opciones personalizadas de Culqi
   */
  const openCheckout = useCallback(
    (paymentData) => {
      // Verificar que el script de Culqi esté cargado
      if (!window.CulqiCheckout) {
        const errorMsg =
          "Culqi Checkout script no está cargado. Verifica que el script esté en index.html";
        console.error(errorMsg);
        setError(errorMsg);
        if (onError) onError(errorMsg);
        return;
      }
      const publicKey = "pk_test_hHLhxW8EA9aDclMl";

      // Validar datos requeridos
      if (!paymentData.amount || paymentData.amount <= 0) {
        const errorMsg = "El monto debe ser mayor a 0";
        setError(errorMsg);
        if (onError) onError(errorMsg);
        return;
      }

      if (!paymentData.email) {
        const errorMsg = "El email es requerido";
        setError(errorMsg);
        if (onError) onError(errorMsg);
        return;
      }

      // Reset error state
      setError(null);

      // Configuración del checkout
      const settings = {
        title: paymentData.title || "Sistema de Reservas",
        currency: paymentData.currency || "PEN",
        amount: paymentData.amount,
      };

      const defaultPaymentMethods = {
        tarjeta: true,
        yape: true,
        billetera: false,
        bancaMovil: false,
        agente: false,
        cuotealo: false,
      };

      const defaultOptions = {
        lang: "es",
        installments: false,
        modal: true,
        paymentMethods:
          paymentData.customOptions?.paymentMethods || defaultPaymentMethods,
        paymentMethodsSort: Object.keys(
          paymentData.customOptions?.paymentMethods || defaultPaymentMethods
        ),
      };

      const client = {
        email: paymentData.email,
      };

      const defaultAppearance = {
        theme: "default",
        hiddenCulqiLogo: false,
        hiddenBannerContent: false,
        hiddenBanner: false,
        hiddenToolBarAmount: false,
        menuType: "sidebar",
        buttonCardPayText: "Pagar",
        logo: null,
        defaultStyle: {
          bannerColor: "#1a73e8",
          buttonBackground: "#1a73e8",
          menuColor: "#1a73e8",
          linksColor: "#1a73e8",
          buttonTextColor: "#ffffff",
          priceColor: "#1a73e8",
        },
      };

      const config = {
        settings,
        client,
        options: { ...defaultOptions, ...paymentData.customOptions?.options },
        appearance: {
          ...defaultAppearance,
          ...paymentData.customOptions?.appearance,
        },
      };

      // Handler para procesar la respuesta de Culqi
      const handleCulqiAction = async () => {
        const Culqi = culqiInstanceRef.current;

        if (Culqi.token) {
          setIsProcessing(true);
          const token = Culqi.token.id;
          Culqi.close();

          try {
            // Enviar el token al backend para crear el cargo
            const response = await processPayment({
              token_id: token,
              amount: paymentData.amount,
              currency: paymentData.currency || "PEN",
              description: paymentData.description || "Pago de reserva",
              email: paymentData.email,
              metadata: paymentData.metadata || {},
            });

            setIsProcessing(false);
            if (onSuccess) {
              onSuccess(response);
            }
          } catch (err) {
            console.error("Error al procesar el pago:", err);
            const errorMessage =
              err.response?.data?.detail || "Error al procesar el pago";
            setError(errorMessage);
            setIsProcessing(false);
            if (onError) {
              onError(errorMessage);
            }
          }
        } else if (Culqi.order) {
          const order = Culqi.order;
          console.log("Se ha creado el objeto Order:", order);
          Culqi.close();

          if (onSuccess) {
            onSuccess({ type: "order", data: order });
          }
        } else {
          console.error("Error de Culqi:", Culqi.error);
          const errorMessage =
            Culqi.error.user_message || "Error en el proceso de pago";
          setError(errorMessage);
          Culqi.close();

          if (onError) {
            onError(errorMessage);
          }
        }
      };

      // Crear instancia de Culqi
      const Culqi = new window.CulqiCheckout(publicKey, config);
      Culqi.culqi = handleCulqiAction;
      culqiInstanceRef.current = Culqi;

      // Abrir el checkout
      Culqi.open();
    },
    [onSuccess, onError]
  );

  /**
   * Cierra el checkout si está abierto
   */
  const closeCheckout = useCallback(() => {
    if (culqiInstanceRef.current) {
      culqiInstanceRef.current.close();
    }
  }, []);

  /**
   * Reset del estado de error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    openCheckout,
    closeCheckout,
    isProcessing,
    errorCheckout: error,
    clearError,
  };
};
