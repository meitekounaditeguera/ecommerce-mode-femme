"""lignecommande reference produit_taille

Revision ID: a841ef592977
Revises: d47fadef6a8b
Create Date: 2026-08-27 00:01:47.818517

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a841ef592977'
down_revision: Union[str, Sequence[str], None] = 'd47fadef6a8b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.execute("DELETE FROM lignes_commande")

    with op.batch_alter_table('lignes_commande', recreate='always') as batch_op:
        batch_op.add_column(sa.Column('produit_taille_id', sa.Integer(), nullable=False))
        batch_op.create_foreign_key(
            'fk_lignes_commande_produit_taille_id_produits_tailles',
            'produits_tailles', ['produit_taille_id'], ['id']
        )
        batch_op.drop_column('produit_id')

def downgrade() -> None:
    with op.batch_alter_table('lignes_commande', recreate='always') as batch_op:
        batch_op.add_column(sa.Column('produit_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            'fk_lignes_commande_produit_id_produits',
            'produits', ['produit_id'], ['id']
        )
        batch_op.drop_column('produit_taille_id')
