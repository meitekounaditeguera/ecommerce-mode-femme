"""ajout contrainte unicite avis v2

Revision ID: 4e985d600690
Revises: 930ef95ee8ae
Create Date: 2026-08-27 12:36:16.019986

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4e985d600690'
down_revision: Union[str, Sequence[str], None] = '930ef95ee8ae'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('avis', recreate='always') as batch_op:
        batch_op.create_unique_constraint(
            'uq_avis_produit_user_commande',
            ['produit_id', 'utilisateur_id', 'commande_id'],
        )


def downgrade() -> None:
    with op.batch_alter_table('avis', recreate='always') as batch_op:
        batch_op.drop_constraint('uq_avis_produit_user_commande', type_='unique')