"""add services price column

Revision ID: a21e6561f6e2
Revises: 35627b999f1a
Create Date: 2025-10-20 07:54:53.503976

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a21e6561f6e2'
down_revision: Union[str, Sequence[str], None] = '35627b999f1a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('services', sa.Column('price', sa.Float(2), nullable=False, server_default='0'))
    pass


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('services', 'price')
    pass
