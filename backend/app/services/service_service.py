from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceUpdate, ServiceInDB
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

class ServiceService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_services(self):
        result = await self.db.execute(select(Service))
        services = result.scalars().all()
        return services

    async def get_service(self, service_id: int):
        result = await self.db.execute(select(Service).where(Service.id == service_id))
        service = result.scalar_one_or_none()
        return service

    async def create_service(self, service_create: ServiceCreate):
        service = Service(**service_create.model_dump())
        self.db.add(service)
        await self.db.commit()
        await self.db.refresh(service)
        return service

    async def update_service(self, service_id: int, service_update: ServiceUpdate):
        service = await self.get_service(service_id)
        if not service:
            return None
        for field, value in service_update.model_dump(exclude_unset=True).items():
            setattr(service, field, value)
        await self.db.commit()
        await self.db.refresh(service)
        return service

    async def delete_service(self, service_id: int):
        service = await self.get_service(service_id)
        if not service:
            return None
        await self.db.delete(service)
        await self.db.commit()
        return service

    def service_to_service_in_db_schema(self, service: Service) -> ServiceInDB:
        return ServiceInDB.model_validate(service)
