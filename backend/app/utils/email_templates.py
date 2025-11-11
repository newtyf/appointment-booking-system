# app/utils/email_templates.py
from datetime import datetime


def generate_appointment_email_html(
    user_name: str,
    notification_type: str,
    appointment_data: dict
) -> str:
    """
    Genera el HTML del correo con estilos similares al frontend.

    Args:
        user_name: Nombre del usuario destinatario
        notification_type: Tipo de notificación (confirmacion, cancelacion, recordatorio)
        appointment_data: Diccionario con los datos de la cita:
            - service_name: Nombre del servicio
            - stylist_name: Nombre del estilista
            - date: Fecha de la cita (datetime o string)

    Returns:
        String con el HTML formateado del email
    """

    # Determinar el color y título según el tipo de notificación
    type_config = {
        "reservado": {
            "color": "#f59e0b",  # Amber-500
            "bg_color": "#fef3c7",  # Amber-100
            "icon": "📝",
            "title": "Cita Reservada",
            "message": "Tu cita ha sido reservada exitosamente. Pronto un miembro de nuestro equipo la confirmará."
        },
        "confirmado": {
            "color": "#ec4899",  # Pink-500
            "bg_color": "#fce7f3",  # Pink-100
            "icon": "✓",
            "title": "Cita Confirmada",
            "message": "¡Excelente noticia! Tu cita ha sido confirmada y te esperamos con los brazos abiertos para brindarte nuestros mejores servicios."
        },
        "cancelado": {
            "color": "#ef4444",  # Red-500
            "bg_color": "#fee2e2",  # Red-100
            "icon": "✗",
            "title": "Cita Cancelada",
            "message": "Lamentamos informarte que en esta ocasión no podremos brindarte nuestros servicios para la fecha seleccionada. Esperamos poder atenderte pronto en otra oportunidad."
        },
        "recordatorio": {
            "color": "#3b82f6",  # Blue-500
            "bg_color": "#dbeafe",  # Blue-100
            "icon": "🔔",
            "title": "Recordatorio de Cita",
            "message": "Te recordamos tu próxima cita. ¡Nos vemos pronto!"
        }
    }

    config = type_config.get(notification_type, type_config["reservado"])

    # Mensajes adicionales personalizados según el tipo
    additional_message = {
        "reservado": "Un miembro de nuestro equipo revisará tu solicitud y pronto recibirás la confirmación.",
        "confirmado": "Estamos emocionados de verte. Por favor, llega 10 minutos antes de tu cita.",
        "cancelado": "Si deseas reprogramar tu cita, por favor contáctanos. Estaremos encantados de atenderte en otra fecha.",
        "recordatorio": "Si tienes alguna pregunta o necesitas hacer cambios, no dudes en contactarnos."
    }

    # Formatear la fecha
    try:
        if isinstance(appointment_data["date"], str):
            date_obj = datetime.fromisoformat(
                appointment_data["date"].replace('Z', '+00:00'))
        else:
            date_obj = appointment_data["date"]

        formatted_date = date_obj.strftime("%d de %B de %Y")
        formatted_time = date_obj.strftime("%I:%M %p")
    except:
        formatted_date = str(appointment_data.get("date", ""))
        formatted_time = ""

    html = f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{config['title']}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, {config['color']} 0%, #db2777 100%); padding: 40px 30px; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                                    Monarca Beauty Salon
                                </h1>
                                <div style="margin-top: 20px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; display: inline-flex; align-items: center; justify-content: center; font-size: 40px;">
                                    {config['icon']}
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 24px; font-weight: bold;">
                                    ¡Hola {user_name}!
                                </h2>
                                <p style="margin: 0 0 30px 0; color: #6b7280; font-size: 16px; line-height: 1.5;">
                                    {config['message']}
                                </p>
                                
                                <!-- Appointment Details Card -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: {config['bg_color']}; border-radius: 8px; border-left: 4px solid {config['color']}; margin-bottom: 30px;">
                                    <tr>
                                        <td style="padding: 24px;">
                                            <h3 style="margin: 0 0 20px 0; color: {config['color']}; font-size: 18px; font-weight: bold;">
                                                Detalles de tu Cita
                                            </h3>
                                            
                                            <!-- Service -->
                                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                                                <tr>
                                                    <td style="padding: 8px 0;">
                                                        <div style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">
                                                            ✂️ Servicio
                                                        </div>
                                                        <div style="color: #1f2937; font-size: 16px; font-weight: 600;">
                                                            {appointment_data.get('service_name', 'N/A')}
                                                        </div>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            <!-- Stylist -->
                                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                                                <tr>
                                                    <td style="padding: 8px 0;">
                                                        <div style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">
                                                            👤 Estilista
                                                        </div>
                                                        <div style="color: #1f2937; font-size: 16px; font-weight: 600;">
                                                            {appointment_data.get('stylist_name', 'N/A')}
                                                        </div>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            <!-- Date -->
                                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                                                <tr>
                                                    <td style="padding: 8px 0;">
                                                        <div style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">
                                                            📅 Fecha
                                                        </div>
                                                        <div style="color: #1f2937; font-size: 16px; font-weight: 600;">
                                                            {formatted_date}
                                                        </div>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            <!-- Time -->
                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="padding: 8px 0;">
                                                        <div style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">
                                                            🕐 Hora
                                                        </div>
                                                        <div style="color: #1f2937; font-size: 16px; font-weight: 600;">
                                                            {formatted_time}
                                                        </div>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                                
                                <!-- Additional Info -->
                                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                    {additional_message.get(notification_type, "Si tienes alguna pregunta o necesitas hacer cambios, no dudes en contactarnos.")}
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                                <p style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                                    Monarca Beauty Salon
                                </p>
                                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                                    Tu belleza, nuestra pasión ✨
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

    return html
