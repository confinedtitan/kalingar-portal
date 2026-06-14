# Data migration to rename existing KTT- prefixed member IDs to KT-
from django.db import migrations


def rename_ktt_to_kt(apps, schema_editor):
    Member = apps.get_model('members', 'Member')
    for member in Member.objects.filter(member_id__startswith='KTT-'):
        member.member_id = member.member_id.replace('KTT-', 'KT-', 1)
        member.save(update_fields=['member_id'])


class Migration(migrations.Migration):

    dependencies = [
        ('members', '0005_member_member_id'),
    ]

    operations = [
        migrations.RunPython(rename_ktt_to_kt, migrations.RunPython.noop),
    ]
