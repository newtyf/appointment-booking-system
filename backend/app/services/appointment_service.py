from app.models.appointment import Appointment
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate, AppointmentInDB
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

class AppointmentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_appointments(self):
        result = await self.db.execute(select(Appointment))
        appointments = result.scalars().all()
        return appointments

    async def list_user_appointments(self):
        result = await self.db.execute(select(Appointment))
        appointments = result.scalars().all()
        return appointments

    async def get_appointment(self, appointment_id: int):
        result = await self.db.execute(select(Appointment).where(Appointment.id == appointment_id))
        appointment = result.scalar_one_or_none()
        return appointment

    async def create_appointment(self, appointment_create: AppointmentCreate):
        appointment = Appointment(**appointment_create.model_dump())
        self.db.add(appointment)
        await self.db.commit()
        await self.db.refresh(appointment)
        return appointment

    async def update_appointment(self, appointment_id: int, appointment_update: AppointmentUpdate):
        appointment = await self.get_appointment(appointment_id)
        if not appointment:
            return None
        for field, value in appointment_update.model_dump(exclude_unset=True).items():
            setattr(appointment, field, value)
        await self.db.commit()
        await self.db.refresh(appointment)
        return appointment

    async def delete_appointment(self, appointment_id: int):
        appointment = await self.get_appointment(appointment_id)
        if not appointment:
            return None
        await self.db.delete(appointment)
        await self.db.commit()
        return appointment

    def appointment_to_appointment_in_db_schema(self, appointment: Appointment) -> AppointmentInDB:
        return AppointmentInDB.model_validate(appointment)
