from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Generar hashes para los 4 usuarios
admin_hash = pwd_context.hash("admin123")
receptionist_hash = pwd_context.hash("recep123")
stylist_hash = pwd_context.hash("stylist123")
client_hash = pwd_context.hash("client123")

print("\n=== HASHES GENERADOS ===\n")
print(f"Admin hash:\n{admin_hash}\n")
print(f"Receptionist hash:\n{receptionist_hash}\n")
print(f"Stylist hash:\n{stylist_hash}\n")
print(f"Client hash:\n{client_hash}\n")
print("========================\n")