"""ajout couleur et variantes produit

Revision ID: 100fc8f49cf6
Revises: 4e985d600690
Create Date: 2026-08-28 16:45:25.128308

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '100fc8f49cf6'
down_revision: Union[str, Sequence[str], None] = '4e985d600690'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None
def upgrade() -> None:
    op.execute("DELETE FROM lignes_commande")
    op.execute("DELETE FROM avis")

    op.create_table(
        'couleurs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nom', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('nom'),
    )
    op.create_index(op.f('ix_couleurs_id'), 'couleurs', ['id'])

    op.create_table(
        'produits_variantes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('produit_id', sa.Integer(), nullable=False),
        sa.Column('couleur_id', sa.Integer(), nullable=False),
        sa.Column('taille_id', sa.Integer(), nullable=False),
        sa.Column('stock', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['produit_id'], ['produits.id']),
        sa.ForeignKeyConstraint(['couleur_id'], ['couleurs.id']),
        sa.ForeignKeyConstraint(['taille_id'], ['tailles.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('produit_id', 'couleur_id', 'taille_id', name='uq_produit_couleur_taille'),
    )
    op.create_index(op.f('ix_produits_variantes_id'), 'produits_variantes', ['id'])

    # lignes_commande traité AVANT de supprimer produits_tailles
    with op.batch_alter_table('lignes_commande', recreate='always') as batch_op:
        batch_op.add_column(sa.Column('produit_variante_id', sa.Integer(), nullable=False))
        batch_op.create_foreign_key(
            'fk_lignes_commande_produit_variante',
            'produits_variantes', ['produit_variante_id'], ['id']
        )
        batch_op.drop_column('produit_taille_id')

    # Suppression de l'ancienne table, maintenant que plus rien n'y fait référence
    op.drop_index('ix_produits_tailles_id', table_name='produits_tailles')
    op.drop_table('produits_tailles')

    op.add_column('images_produit', sa.Column('couleur_id', sa.Integer(), nullable=True))
    with op.batch_alter_table('images_produit', recreate='always') as batch_op:
        batch_op.create_foreign_key('fk_images_produit_couleur', 'couleurs', ['couleur_id'], ['id'])


def downgrade() -> None:
    with op.batch_alter_table('lignes_commande', recreate='always') as batch_op:
        batch_op.add_column(sa.Column('produit_taille_id', sa.Integer(), nullable=True))
        batch_op.drop_column('produit_variante_id')

    with op.batch_alter_table('images_produit', recreate='always') as batch_op:
        batch_op.drop_column('couleur_id')

    op.create_table(
        'produits_tailles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('produit_id', sa.Integer(), nullable=False),
        sa.Column('taille_id', sa.Integer(), nullable=False),
        sa.Column('stock', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['produit_id'], ['produits.id']),
        sa.ForeignKeyConstraint(['taille_id'], ['tailles.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.drop_table('produits_variantes')
    op.drop_table('couleurs')