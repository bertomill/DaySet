"""Add timestamp to JournalEntry model

Revision ID: 959a260a3c3b
Revises: 
Create Date: 2024-09-02 10:02:41.093460

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '959a260a3c3b'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('journal_prompt')
    with op.batch_alter_table('journal_entry', schema=None) as batch_op:
        batch_op.add_column(sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('journal_entry', schema=None) as batch_op:
        batch_op.drop_column('timestamp')

    op.create_table('journal_prompt',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('title', sa.VARCHAR(length=200), autoincrement=False, nullable=False),
    sa.Column('description', sa.TEXT(), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint('id', name='journal_prompt_pkey')
    )
    # ### end Alembic commands ###
